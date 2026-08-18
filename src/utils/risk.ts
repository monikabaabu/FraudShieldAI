/**
 * Single source of truth for turning a fraud probability into a visual
 * risk band. Used by RiskGauge (manual result) and the CSV upload results
 * UI (ProbabilityBar, FraudTransactionTable filters) so the thresholds
 * and colors never drift apart between the two.
 *
 * IMPORTANT: this is a frontend-only visual grouping for readability. It
 * is not a category the model itself returns — UI copy should always
 * make that distinction clear.
 */
export type RiskTier = "low" | "moderate" | "high";

export interface RiskBand {
  tier: RiskTier;
  label: string;
  color: string;
  track: string;
}

export function riskBand(p: number): RiskBand {
  if (p < 0.3) return { tier: "low", label: "Low Risk", color: "var(--color-teal-400)", track: "rgba(61, 217, 199, 0.15)" };
  if (p < 0.7) return { tier: "moderate", label: "Moderate Risk", color: "var(--color-amber-400)", track: "rgba(245, 181, 77, 0.15)" };
  return { tier: "high", label: "High Risk", color: "var(--color-red-400)", track: "rgba(233, 124, 112, 0.15)" };
}
