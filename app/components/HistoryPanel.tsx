"use client";

import type { HistoryEntry } from "@/lib/useHistory";

const RISK_COLORS: Record<string, string> = {
  Low: "#97C459",
  Medium: "#EF9F27",
  High: "#F09595",
};

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

interface Props {
  history: HistoryEntry[];
  onLoad: (entry: HistoryEntry) => void;
  onClear: () => void;
}

export default function HistoryPanel({ history, onLoad, onClear }: Props) {
  if (history.length === 0) return null;

  return (
    <div className="mt-5 pt-5" style={{ borderTop: "0.5px solid var(--dark-border)" }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-medium tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
          Recent cases
        </p>
        <button
          onClick={onClear}
          className="text-[10px] cursor-pointer transition-colors"
          style={{ color: "var(--text-muted)", background: "transparent", border: "none" }}
        >
          Clear all
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {history.slice(0, 5).map((entry) => (
          <button
            key={entry.id}
            onClick={() => onLoad(entry)}
            className="text-left w-full rounded-md px-3 py-2.5 cursor-pointer transition-colors"
            style={{
              background: "var(--dark-card)",
              border: "0.5px solid var(--dark-border)",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.borderColor = "var(--gold-dim)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.borderColor = "var(--dark-border)")
            }
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>
                {entry.input.caseId || "—"}
              </span>
              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                {timeAgo(entry.timestamp)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span
                className="text-[11px] truncate"
                style={{ color: "var(--text-secondary)", maxWidth: "75%" }}
              >
                {entry.input.issueType}
              </span>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full shrink-0"
                style={{
                  color: RISK_COLORS[entry.input.riskLevel] ?? "var(--text-muted)",
                  background: `${RISK_COLORS[entry.input.riskLevel] ?? "#888"}18`,
                  border: `0.5px solid ${RISK_COLORS[entry.input.riskLevel] ?? "var(--dark-border)"}40`,
                }}
              >
                {entry.input.riskLevel}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
