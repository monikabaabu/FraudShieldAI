import type { APIError, PredictionResponse, TransactionInput } from "../types";
import type { DatasetAnalysisResponse } from "../types/upload";
import type { MongoUploadHistory } from "../types/history";
import { toBackendDate, toBackendDateTime } from "../utils/backendFormat";

/**
 * FraudShield AI — API service layer.
 *
 * This is the ONLY module that should ever talk to the backend. UI
 * components must never call fetch() directly — they call the functions
 * exported here.
 *
 *   predictTransaction(input)  → POST the manual 19-field form as JSON
 *                                 to the single-transaction model.
 *   analyzeDataset(file)       → POST an uploaded CSV as multipart/form-data
 *                                 to the batch dataset model.
 *
 * Neither function computes, adjusts, or fabricates a prediction itself —
 * each only forwards the request and returns exactly what its backend
 * responds with.
 */

// Manual single-transaction endpoint.
const PREDICT_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ||
  "https://bank-fraud-manual.onrender.com/api/predict";

// CSV batch-analysis endpoint. Deliberately a separate service/URL from
// PREDICT_URL above — the two are different deployments.
const UPLOAD_PREDICT_URL =
  (import.meta.env.VITE_UPLOAD_API_URL as string | undefined) ||
  "https://bank-fraud-db.onrender.com/api/predict";

class FraudApiError extends Error implements APIError {
  code: APIError["code"];
  details?: string;
  constructor(code: APIError["code"], message: string, details?: string) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

async function safeJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Builds the exact JSON payload the manual backend expects from the
 * form's raw TransactionInput. All 19 fields are always included,
 * unfiltered — the only transformation applied is converting the three
 * date/time fields from native <input> value format into the backend's
 * "DD-MM-YYYY[ HH:mm]" string format.
 */
function toBackendPayload(input: TransactionInput) {
  return {
    TransactionID: input.TransactionID,
    AccountID: input.AccountID,
    TransactionDate: toBackendDateTime(input.TransactionDate),
    PreviousTransactionDate: toBackendDateTime(input.PreviousTransactionDate),
    LoginAttempts: input.LoginAttempts,
    UserName: input.UserName,
    Email: input.Email,
    DateOfBirth: toBackendDate(input.DateOfBirth),
    DeviceID: input.DeviceID,
    TransactionAmount: input.TransactionAmount,
    TransactionType: input.TransactionType,
    Location: input.Location,
    Channel: input.Channel,
    CustomerAge: input.CustomerAge,
    CustomerOccupation: input.CustomerOccupation,
    AccountBalance: input.AccountBalance,
    AnnualIncome: input.AnnualIncome,
    CurrentAddressMonthCount: input.CurrentAddressMonthCount,
    PreviousAddressMonthCount: input.PreviousAddressMonthCount,
  };
}

/**
 * Sends a single transaction to the deployed manual-prediction backend
 * and returns its response unchanged.
 */
export async function predictTransaction(
  input: TransactionInput
): Promise<PredictionResponse> {
  let response: Response;
  try {
    response = await fetch(PREDICT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toBackendPayload(input)),
    });
  } catch {
    throw new FraudApiError(
      "NETWORK_ERROR",
      "Unable to reach the detection service.",
      "The request failed before receiving a response. This can also happen if the backend's CORS configuration doesn't allow this origin, or if the service is asleep and slow to wake (Render free tier)."
    );
  }

  if (response.status === 422 || response.status === 400) {
    const body = await safeJson(response);
    throw new FraudApiError(
      "VALIDATION_ERROR",
      body?.message ?? "The backend rejected one or more input values.",
      body?.details
    );
  }

  if (response.status === 503) {
    throw new FraudApiError(
      "SERVICE_UNAVAILABLE",
      "The detection service is temporarily unavailable.",
      "The ML model service returned a 503. Try again shortly."
    );
  }

  if (!response.ok) {
    throw new FraudApiError(
      "PREDICTION_FAILED",
      "The detection service could not complete this prediction.",
      `HTTP ${response.status}`
    );
  }

  const body = (await safeJson(response)) as PredictionResponse | null;
  if (!body || !body.data || (body.data.prediction !== 0 && body.data.prediction !== 1)) {
    throw new FraudApiError(
      "PREDICTION_FAILED",
      "The detection service returned an unexpected response."
    );
  }
  return body;
}

/**
 * Sends an uploaded CSV to the deployed batch-analysis backend exactly
 * as a file (multipart/form-data, field name "file") and returns its
 * response unchanged. Never converts the CSV to JSON, never drops
 * columns before sending, and never computes fraud predictions locally.
 */
export async function analyzeDataset(file: File): Promise<DatasetAnalysisResponse> {
  const formData = new FormData();
  formData.append("file", file);

  let response: Response;
  try {
    response = await fetch(UPLOAD_PREDICT_URL, {
      method: "POST",
      // No Content-Type header — the browser sets the multipart boundary
      // automatically. Setting it manually breaks the upload.
      body: formData,
    });
  } catch {
    throw new FraudApiError(
      "NETWORK_ERROR",
      "Unable to reach the detection service.",
      "The request failed before receiving a response. This can also happen if the backend's CORS configuration doesn't allow this origin, or if the service is asleep and slow to wake (Render free tier)."
    );
  }

  if (response.status === 422 || response.status === 400) {
    const body = await safeJson(response);
    throw new FraudApiError(
      "VALIDATION_ERROR",
      body?.message ?? "The uploaded file was rejected by the detection service.",
      body?.details
    );
  }

  if (response.status === 503) {
    throw new FraudApiError(
      "SERVICE_UNAVAILABLE",
      "The detection service is temporarily unavailable.",
      "The dataset analysis service returned a 503. Try again shortly."
    );
  }

  if (!response.ok) {
    throw new FraudApiError(
      "PREDICTION_FAILED",
      "The detection service could not analyze this dataset.",
      `HTTP ${response.status}`
    );
  }

  const data = await safeJson(response);
  if (!data || typeof data !== "object") {
    throw new FraudApiError(
      "PREDICTION_FAILED",
      "The detection service returned an unexpected response."
    );
  }

  // Intentionally NOT validating fraud_accounts is present/non-empty here —
  // an empty or missing fraud_accounts list is a legitimate "no fraud
  // found" result, not an error. Callers render that case explicitly.
  return data as DatasetAnalysisResponse;
}

export async function getUploadHistory(): Promise<MongoUploadHistory[]> {
  let response: Response;

  try {
    response = await fetch(
      "https://bank-fraud-db.onrender.com/api/history",
      {
        method: "GET",
      }
    );
  } catch {
    throw new FraudApiError(
      "NETWORK_ERROR",
      "Unable to reach the history service.",
      "The request failed before receiving a response."
    );
  }

  if (!response.ok) {
    throw new FraudApiError(
      "PREDICTION_FAILED",
      "Unable to load detection history.",
      `HTTP ${response.status}`
    );
  }

  const data = await safeJson(response);

  if (!data || data.success !== true || !Array.isArray(data.history)) {
    throw new FraudApiError(
      "PREDICTION_FAILED",
      "The history service returned an unexpected response."
    );
  }

  return data.history as MongoUploadHistory[];
}

export function isApiError(err: unknown): err is APIError {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    "message" in err
  );
}
