import { BrainCircuit, Database, GitBranch, ShieldCheck, Info } from "lucide-react";
import { PageContainer } from "../components/layout/PageContainer";
import { Card, CardHeader } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

const PIPELINE_STEPS = [
  {
    title: "Categorical Encoding",
    description: "Transaction type, channel, location, and occupation are encoded using the same encoders fit during training.",
  },
  {
    title: "Date Feature Extraction",
    description: "TransactionDate and PreviousTransactionDate are decomposed into year, month, day, and weekday components.",
  },
  {
    title: "DaysSincePreviousTxn Calculation",
    description: "The interval between the current and previous transaction is derived server-side, not entered by the analyst.",
  },
  {
    title: "Model Prediction",
    description: "The preprocessed feature vector is passed to the trained model to produce a fraud prediction.",
  },
];

const INPUT_FIELDS = [
  "TransactionID", "AccountID", "TransactionDate", "PreviousTransactionDate", "LoginAttempts",
  "UserName", "Email", "DateOfBirth", "DeviceID", "TransactionAmount", "TransactionType",
  "Location", "Channel", "CustomerAge", "CustomerOccupation", "AccountBalance", "AnnualIncome",
  "CurrentAddressMonthCount", "PreviousAddressMonthCount",
];

const EXCLUDED_FIELDS = ["RiskScore", "RiskProbability", "RiskLevel"];

export function ModelInfo() {
  return (
    <PageContainer>
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-500/10 text-accent-400">
          <BrainCircuit size={22} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-100">Model Info</h1>
          <p className="mt-0.5 text-sm text-ink-400">How FraudShield AI's detection engine works</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-1">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={18} className="text-teal-400" />
            <span className="font-display text-[15px] font-semibold text-ink-100">Model Status</span>
          </div>
          <div className="mt-4">
            <Badge tone="teal" dot>
              Model Online
            </Badge>
          </div>
          <dl className="mt-6 flex flex-col gap-4">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-400">Prediction Target</dt>
              <dd className="font-mono-data mt-1 text-sm text-ink-100">IsFraud</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-400">Serving Endpoint</dt>
              <dd className="font-mono-data mt-1 text-sm text-ink-100">POST /predict</dd>
            </div>
          </dl>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader icon={<GitBranch size={17} />} title="Preprocessing & Prediction Pipeline" subtitle="Executed entirely on the backend" />
          <div className="flex flex-col gap-5 p-5 sm:p-6">
            {PIPELINE_STEPS.map((step, i) => (
              <div key={step.title} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-500/10 text-xs font-semibold text-accent-400">
                    {i + 1}
                  </div>
                  {i < PIPELINE_STEPS.length - 1 && <div className="mt-1 w-px flex-1 bg-ink-700" />}
                </div>
                <div className="pb-1">
                  <p className="text-sm font-medium text-ink-100">{step.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-ink-400">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader icon={<Database size={17} />} title="Feature Inputs" subtitle="Raw fields collected from the analyst and sent to the backend" />
          <div className="flex flex-col gap-5 p-5 sm:p-6">
            <div>
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-ink-300">Collected & Sent to Model</p>
              <div className="flex flex-wrap gap-2">
                {INPUT_FIELDS.map((f) => (
                  <span key={f} className="font-mono-data rounded-md border border-ink-600 bg-ink-900/60 px-2.5 py-1 text-xs text-ink-200">
                    {f}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-ink-300">Never Collected as Input (leakage-prone or generated)</p>
              <div className="flex flex-wrap gap-2">
                {EXCLUDED_FIELDS.map((f) => (
                  <span key={f} className="font-mono-data rounded-md border border-red-500/25 bg-red-500/5 px-2.5 py-1 text-xs text-red-300/80">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-3">
          <div className="flex items-start gap-3 p-5 sm:p-6">
            <Info size={17} className="mt-0.5 shrink-0 text-ink-400" />
            <p className="text-xs leading-relaxed text-ink-400">
              FraudShield AI supports human review by surfacing model predictions and, where available, the
              probability and contributing factors behind them. It is a decision-support tool, not a
              substitute for an analyst's judgment, and no fraud detection system can guarantee a
              particular outcome.
            </p>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
