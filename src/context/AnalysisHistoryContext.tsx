import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { PredictionResult, TransactionInput } from "../types";
import type { DatasetAnalysisResponse } from "../types/upload";
import { summarizeDatasetAnalysis } from "../types/upload";
import type { HistoryRecord, ManualHistoryRecord, UploadHistoryRecord } from "../types/history";

/**
 * Single shared data flow for the app:
 *
 *   API SUCCESS → addManualRecord() / addUploadRecord() → localStorage
 *        ↓                  ↓                 ↓
 *    Dashboard          History          (result screen already
 *                                          has its own copy in memory)
 *
 * Nothing else should maintain its own separate copy of "what's been
 * analyzed" — Dashboard and Detection History both read from this
 * context so they can never drift out of sync with each other.
 *
 * There's no history/list backend endpoint yet, so this persists to
 * localStorage as a prototype-level substitute. Only real, successful
 * API responses are ever written here — never mock or fabricated data.
 */

const STORAGE_KEY = "fraudshield.history.v1";

interface StoredState {
  manualRecords: ManualHistoryRecord[];
  uploadRecords: UploadHistoryRecord[];
}

function loadFromStorage(): StoredState {
  if (typeof window === "undefined") return { manualRecords: [], uploadRecords: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { manualRecords: [], uploadRecords: [] };
    const parsed = JSON.parse(raw);
    return {
      manualRecords: Array.isArray(parsed?.manualRecords) ? parsed.manualRecords : [],
      uploadRecords: Array.isArray(parsed?.uploadRecords) ? parsed.uploadRecords : [],
    };
  } catch {
    return { manualRecords: [], uploadRecords: [] };
  }
}

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

interface AnalysisHistoryContextValue {
  manualRecords: ManualHistoryRecord[];
  uploadRecords: UploadHistoryRecord[];
  allRecords: HistoryRecord[];
  addManualRecord: (transaction: TransactionInput, result: PredictionResult) => void;
  addUploadRecord: (file: File, response: DatasetAnalysisResponse) => UploadHistoryRecord;
  clearHistory: () => void;
}

const AnalysisHistoryContext = createContext<AnalysisHistoryContextValue | null>(null);

export function AnalysisHistoryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoredState>(() => loadFromStorage());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage can fail (quota, private browsing) — history just won't
      // persist across reloads in that case; the current session is
      // unaffected since state is still held in memory.
    }
  }, [state]);

  function addManualRecord(transaction: TransactionInput, result: PredictionResult) {
    const record: ManualHistoryRecord = {
      kind: "manual",
      id: makeId(),
      analyzedAt: new Date().toISOString(),
      transactionId: transaction.TransactionID,
      accountId: transaction.AccountID,
      transactionAmount: transaction.TransactionAmount,
      transactionType: transaction.TransactionType,
      channel: transaction.Channel,
      prediction: result.prediction,
      fraudProbability: result.fraud_probability,
      fraudPercentage: result.fraud_percentage,
      resultLabel: result.result,
    };
    setState((prev) => ({ ...prev, manualRecords: [record, ...prev.manualRecords] }));
  }

  function addUploadRecord(file: File, response: DatasetAnalysisResponse): UploadHistoryRecord {
    const { summary } = summarizeDatasetAnalysis(response);
    const record: UploadHistoryRecord = {
      kind: "upload",
      id: makeId(),
      analyzedAt: new Date().toISOString(),
      fileName: file.name,
      fileSize: file.size,
      response,
      summary,
    };
    setState((prev) => ({ ...prev, uploadRecords: [record, ...prev.uploadRecords] }));
    return record;
  }

  function clearHistory() {
    setState({ manualRecords: [], uploadRecords: [] });
  }

  const allRecords = useMemo<HistoryRecord[]>(
    () =>
      [...state.manualRecords, ...state.uploadRecords].sort(
        (a, b) => new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime()
      ),
    [state]
  );

  return (
    <AnalysisHistoryContext.Provider
      value={{
        manualRecords: state.manualRecords,
        uploadRecords: state.uploadRecords,
        allRecords,
        addManualRecord,
        addUploadRecord,
        clearHistory,
      }}
    >
      {children}
    </AnalysisHistoryContext.Provider>
  );
}

export function useAnalysisHistory(): AnalysisHistoryContextValue {
  const ctx = useContext(AnalysisHistoryContext);
  if (!ctx) throw new Error("useAnalysisHistory must be used within an AnalysisHistoryProvider");
  return ctx;
}
