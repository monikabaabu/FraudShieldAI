import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";

export function Field({
  label,
  htmlFor,
  helperText,
  error,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[13px] font-medium text-ink-200">
        {label}
        {required && <span className="ml-0.5 text-accent-400">*</span>}
      </label>
      {children}
      {error ? (
        <p className="flex items-center gap-1 text-xs text-red-400">
          <AlertCircle size={12} className="shrink-0" />
          {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-ink-400">{helperText}</p>
      ) : null}
    </div>
  );
}
