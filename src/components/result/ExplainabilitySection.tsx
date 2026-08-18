import { useState } from "react";
import { ChevronDown, TrendingUp } from "lucide-react";
import type { FeatureContribution } from "../../types";
import { Card } from "../ui/Card";

export function ExplainabilitySection({ contributions }: { contributions?: FeatureContribution[] }) {
  const [open, setOpen] = useState(true);

  return (
    <Card>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left sm:px-6"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-500/10 text-accent-400">
            <TrendingUp size={17} />
          </div>
          <h3 className="font-display text-[15px] font-semibold text-ink-100">Why was this transaction flagged?</h3>
        </div>
        <ChevronDown size={18} className={`text-ink-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="border-t border-ink-700 px-5 py-4 sm:px-6">
          {!contributions || contributions.length === 0 ? (
            <p className="text-sm text-ink-400">Detailed explanation is not available for this prediction.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {contributions.map((c) => (
                <div key={c.feature}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-ink-200">{c.description}</span>
                    <span className="font-mono-data text-ink-400">{Math.round(c.impact * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-700">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{ width: `${Math.round(c.impact * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
