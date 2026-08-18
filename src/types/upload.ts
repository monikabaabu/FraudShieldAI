// Types for the CSV batch-analysis workflow (POST /api/predict, multipart).
//
// The exact response shape isn't fully confirmed by the backend team, so
// every field is optional here and every consumer must render
// defensively (fall back to "N/A", skip missing sections) rather than
// assume a field is present.

export interface FraudTransactionApiItem {
  fraud_probability?: number;
  transaction_date?: string;
  transaction_id?: string;
  [key: string]: unknown;
}

export interface FraudAccountApiItem {
  account_id?: string;
  email?: string;
  account_balance?: number;
  total_transactions?: number;
  fraud_transactions?: FraudTransactionApiItem[];
  [key: string]: unknown;
}

/** Raw shape returned by POST /api/predict for a CSV upload. May contain more than this. */
export interface DatasetAnalysisResponse {
  fraud_accounts?: FraudAccountApiItem[];
  [key: string]: unknown;
}

/** A single fraudulent transaction, flattened with its parent account — used to drive the results table. */
export interface FraudTransactionRow {
  accountId: string;
  email: string;
  accountBalance: number | null;
  transactionId: string;
  transactionDate: string;
  fraudProbability: number | null;
}

/** Numbers we can safely derive from the response without inventing anything. */
export interface DatasetAnalysisSummary {
  fraudulentAccounts: number;
  fraudulentTransactions: number;
  /** Average fraud_probability across all fraud_transactions, if any were numeric. */
  averageFraudProbability: number | null;
  /** Sum of each account's total_transactions, only when the API provided that field. */
  totalTransactionsAcrossFlaggedAccounts: number | null;
}

/**
 * Flattens the nested API response into summary numbers and a row list.
 * The single place this shape-normalization happens — components should
 * call this rather than reaching into `fraud_accounts` themselves.
 */
export function summarizeDatasetAnalysis(response: DatasetAnalysisResponse): {
  summary: DatasetAnalysisSummary;
  rows: FraudTransactionRow[];
} {
  const accounts = Array.isArray(response.fraud_accounts) ? response.fraud_accounts : [];

  const rows: FraudTransactionRow[] = accounts.flatMap((account) => {
    const transactions = Array.isArray(account.fraud_transactions) ? account.fraud_transactions : [];
    if (transactions.length === 0) {
      return [
        {
          accountId: account.account_id ?? "N/A",
          email: account.email ?? "N/A",
          accountBalance: typeof account.account_balance === "number" ? account.account_balance : null,
          transactionId: "N/A",
          transactionDate: "N/A",
          fraudProbability: null,
        },
      ];
    }
    return transactions.map((t) => ({
      accountId: account.account_id ?? "N/A",
      email: account.email ?? "N/A",
      accountBalance: typeof account.account_balance === "number" ? account.account_balance : null,
      transactionId: t.transaction_id ?? "N/A",
      transactionDate: t.transaction_date ?? "N/A",
      fraudProbability: typeof t.fraud_probability === "number" ? t.fraud_probability : null,
    }));
  });

  const probabilities = rows.map((r) => r.fraudProbability).filter((p): p is number => p !== null);

  const totalsKnown = accounts.every((a) => typeof a.total_transactions === "number");
  const totalTransactionsAcrossFlaggedAccounts = totalsKnown
    ? accounts.reduce((sum, a) => sum + (a.total_transactions as number), 0)
    : null;

  return {
    summary: {
      fraudulentAccounts: accounts.length,
      fraudulentTransactions: rows.filter((r) => r.transactionId !== "N/A").length,
      averageFraudProbability: probabilities.length
        ? probabilities.reduce((a, b) => a + b, 0) / probabilities.length
        : null,
      totalTransactionsAcrossFlaggedAccounts,
    },
    rows,
  };
}
