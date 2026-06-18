"use client";

import type { CaseInput, IssueType, ReplyTone, RiskLevel } from "@/lib/generator";

const ISSUE_TYPES: IssueType[] = [
  "Payment Status Inquiry",
  "Missing Payment Record",
  "Account Verification Issue",
  "Promotion or Bonus Dispute",
  "Account Access Problem",
];

const TONES: ReplyTone[] = ["Professional", "Friendly", "Firm and Policy-Based"];
const RISK_LEVELS: RiskLevel[] = ["Low", "Medium", "High"];
const LANGUAGES = ["English", "Spanish", "French", "Portuguese", "Mandarin"];

const RISK_STYLES: Record<RiskLevel, string> = {
  Low: "bg-green-900/20 border-green-800 text-green-400",
  Medium: "bg-amber-900/20 border-amber-800 text-amber-400",
  High: "bg-red-900/20 border-red-800 text-red-400",
};

interface Props {
  form: CaseInput;
  onChange: (form: CaseInput) => void;
  onGenerate: () => void;
  onClear: () => void;
  onSample: () => void;
  loading: boolean;
}

export default function CaseForm({ form, onChange, onGenerate, onClear, onSample, loading }: Props) {
  function set<K extends keyof CaseInput>(key: K, value: CaseInput[K]) {
    onChange({ ...form, [key]: value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onGenerate();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-medium tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
          Case details
        </p>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={onSample}
            className="text-[11px] px-2.5 py-1 rounded border cursor-pointer transition-colors"
            style={{ borderColor: "var(--dark-border)", color: "var(--text-secondary)", background: "transparent" }}
          >
            Sample
          </button>
          <button
            type="button"
            onClick={onClear}
            className="text-[11px] px-2.5 py-1 rounded border cursor-pointer transition-colors"
            style={{ borderColor: "var(--dark-border)", color: "var(--text-muted)", background: "transparent" }}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="field-label">Case ID</label>
          <input
            type="text"
            placeholder="CS-20240618"
            value={form.caseId}
            onChange={(e) => set("caseId", e.target.value)}
          />
        </div>
        <div>
          <label className="field-label">Customer ref.</label>
          <input
            type="text"
            placeholder="CUS-00412"
            value={form.customerRef}
            onChange={(e) => set("customerRef", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="field-label">Issue type</label>
        <select value={form.issueType} onChange={(e) => set("issueType", e.target.value as IssueType)}>
          {ISSUE_TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="field-label">Case details</label>
        <textarea
          rows={4}
          placeholder="Describe the customer's issue…"
          value={form.caseDetails}
          onChange={(e) => set("caseDetails", e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="field-label">Amount involved</label>
          <input
            type="text"
            placeholder="e.g. $250.00"
            value={form.amountInvolved}
            onChange={(e) => set("amountInvolved", e.target.value)}
          />
        </div>
        <div>
          <label className="field-label">Language</label>
          <select value={form.language} onChange={(e) => set("language", e.target.value)}>
            {LANGUAGES.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="field-label">Reply tone</label>
        <select value={form.replyTone} onChange={(e) => set("replyTone", e.target.value as ReplyTone)}>
          {TONES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="field-label">Risk level</label>
        <div className="flex gap-2 mt-1">
          {RISK_LEVELS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => set("riskLevel", r)}
              className={`text-[11px] px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                form.riskLevel === r
                  ? RISK_STYLES[r]
                  : "border-[var(--dark-border)] text-[var(--text-secondary)] bg-[var(--dark-card)]"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !form.caseDetails.trim()}
        className="mt-2 w-full py-2.5 rounded-md text-[13px] font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-40 cursor-pointer"
        style={{ background: "var(--gold)", color: "#1a1a1a" }}
      >
        {loading ? "Generating…" : "Generate reply"}
      </button>
    </form>
  );
}
