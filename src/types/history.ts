import type { PredictionResult } from "./index";
import type { DatasetAnalysisResponse, DatasetAnalysisSummary } from "./upload";

/**
 * A completed Manual analysis. Deliberately stores only the fields the
 * product calls out as useful history info (Transaction ID, Account ID,
 * date/time, amount, prediction, fraud probability) rather than the full
 * 19-field form — the rest (Email, DeviceID, DateOfBirth, ...) never gets
 * written to localStorage.
 */
export interface ManualHistoryRecord {
  kind: "manual";
  id: string;
  analyzedAt: string; // ISO 8601
  transactionId: string;
  accountId: string;
  transactionAmount: number;
  transactionType: string;
  channel: string;
  prediction: PredictionResult["prediction"];
  fraudProbability: number;
  fraudPercentage: number;
  resultLabel: string;
}

/** A completed CSV batch analysis. Stores the API response so results can be revisited later. */
export interface UploadHistoryRecord {
  kind: "upload";
  id: string;
  analyzedAt: string; // ISO 8601
  fileName: string;
  fileSize: number;
  response: DatasetAnalysisResponse;
  summary: DatasetAnalysisSummary;
}
export interface MongoUploadHistory {
  upload_id: string;
  upload_time: string;
  file_name: string;
  total_transactions: number;
  predicted_fraud: number;
  predicted_nonfraud: number;
  fraud_accounts: DatasetAnalysisResponse["fraud_accounts"];
}

export type HistoryRecord = ManualHistoryRecord | UploadHistoryRecord;
