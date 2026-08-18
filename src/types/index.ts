// Core domain types for FraudShield AI.
//
// TransactionInput mirrors the exact 19-field request contract of the
// deployed fraud detection backend (POST /api/predict). The frontend
// never derives, filters, or engineers features itself — it only
// collects these raw inputs and sends them through unchanged.
//
// PredictionResponse mirrors the backend's exact response envelope. The
// frontend never computes or fabricates a prediction — it only formats
// and displays what the backend returns.

export type TransactionType = "DEBIT" | "CREDIT";
export type Channel = "ATM" | "BRANCH" | "ONLINE";
export type CustomerOccupation = "Doctor" | "Student" | "Engineer" | "Retired";

/**
 * The exact 19 raw fields collected from the analyst on the Manual form
 * and sent as-is (as JSON) to POST /api/predict. Date/time fields are
 * kept in native <input> value format here (e.g. "YYYY-MM-DDTHH:mm" for
 * datetime-local, "YYYY-MM-DD" for date) — the API service layer is
 * responsible for converting them to the backend's expected string
 * format at the point the request is sent.
 */
export interface TransactionInput {
  TransactionID: string;
  AccountID: string;
  TransactionDate: string;
  PreviousTransactionDate: string;
  LoginAttempts: number;
  UserName: string;
  Email: string;
  DateOfBirth: string;
  DeviceID: string;
  TransactionAmount: number;
  TransactionType: TransactionType;
  Location: string;
  Channel: Channel;
  CustomerAge: number;
  CustomerOccupation: CustomerOccupation;
  AccountBalance: number;
  AnnualIncome: number;
  CurrentAddressMonthCount: number;
  PreviousAddressMonthCount: number;
}

/** The `data` object inside the backend's POST /api/predict response. */
export interface PredictionResult {
  fraud_percentage: number; // 0-100
  fraud_probability: number; // 0-1
  prediction: 0 | 1; // 1 = fraud, 0 = legitimate
  result: string; // backend's own human-readable verdict string
}

/** The full response envelope returned by POST /api/predict. */
export interface PredictionResponse {
  data: PredictionResult;
  status: string;
}

/**
 * Not currently returned by the backend's /api/predict response. Kept so
 * ExplainabilitySection stays wired up and can be populated later if the
 * backend adds a feature-explainability field, without further UI changes.
 */
export interface FeatureContribution {
  feature: string;
  description: string;
  impact: number; // 0-1, relative contribution magnitude
  direction: "increases_risk" | "decreases_risk";
}

export interface APIError {
  code:
    | "NETWORK_ERROR"
    | "SERVICE_UNAVAILABLE"
    | "VALIDATION_ERROR"
    | "PREDICTION_FAILED"
    | "UNKNOWN";
  message: string;
  details?: string;
}

export interface DashboardStats {
  transactionsAnalyzed: number;
  fraudDetected: number;
  legitimateTransactions: number;
  averageFraudProbability: number; // 0-1
}
