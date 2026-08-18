import { ShieldAlert } from "lucide-react";
import type { FraudAccountApiItem } from "../../types/upload";
import { Card } from "../ui/Card";
import { ProbabilityBar } from "./ProbabilityBar";
import { formatCurrency } from "../../utils/format";

export function FraudAccountCard({ account }: { account: FraudAccountApiItem }) {
  const transactions = Array.isArray(account.fraud_transactions) ? account.fraud_transactions : [];

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-ink-700 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
            <ShieldAlert size={18} />
          </div>
          <div className="min-w-0">
            <p className="font-mono-data truncate text-sm font-semibold text-ink-100">
              {account.account_id ?? "N/A"}
            </p>
            <p className="truncate text-xs text-ink-400">{account.email ?? "N/A"}</p>
          </div>
        </div>
        <div className="flex shrink-0 gap-6 text-right">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">Balance</p>
            <p className="font-mono-data mt-0.5 text-sm text-ink-100">
              {typeof account.account_balance === "number" ? formatCurrency(account.account_balance) : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">Total Txns</p>
            <p className="font-mono-data mt-0.5 text-sm text-ink-100">
              {typeof account.total_transactions === "number" ? account.total_transactions : "N/A"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col divide-y divide-ink-750">
        {transactions.length === 0 ? (
          <p className="p-4 text-xs text-ink-400">No transaction-level detail was provided for this account.</p>
        ) : (
          transactions.map((t, i) => (
            <div
              key={t.transaction_id ?? i}
              className="flex flex-col gap-2.5 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-mono-data text-xs text-ink-200">{t.transaction_id ?? "N/A"}</p>
                <p className="mt-0.5 text-xs text-ink-400">{t.transaction_date ?? "N/A"}</p>
              </div>
              <div className="sm:w-64">
                <ProbabilityBar probability={typeof t.fraud_probability === "number" ? t.fraud_probability : null} />
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
