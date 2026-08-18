import type { ReactNode } from "react";
import { Button } from "../ui/Button";

/**
 * Shared "run analysis" CTA so Manual and Upload modes stay visually and
 * behaviorally consistent. Deliberately dumb — it just renders a button
 * with a loading label swap. All mock-vs-real submission logic lives in
 * the parent (ManualTransactionForm / DatasetUpload), not here, so this
 * component doesn't need to change when the real API is wired in.
 */
export function AnalysisButton({
  label,
  loadingLabel,
  loading,
  disabled,
  icon,
  onClick,
  type = "button",
  size = "lg",
}: {
  label: string;
  loadingLabel: string;
  loading: boolean;
  disabled?: boolean;
  icon: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  size?: "sm" | "md" | "lg";
}) {
  return (
    <Button type={type} size={size} icon={icon} loading={loading} disabled={disabled || loading} onClick={onClick}>
      {loading ? loadingLabel : label}
    </Button>
  );
}
