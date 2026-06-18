"use client";

import { useState } from "react";
import CaseForm from "./components/CaseForm";
import ResultPanel from "./components/ResultPanel";
import HistoryPanel from "./components/HistoryPanel";
import { generateResult } from "@/lib/generator";
import { useHistory } from "@/lib/useHistory";
import { nextSample } from "@/lib/samples";
import type { CaseInput, GeneratedResult } from "@/lib/generator";
import type { HistoryEntry } from "@/lib/useHistory";

const EMPTY_FORM: CaseInput = {
  caseId: "",
  customerRef: "",
  issueType: "Payment Status Inquiry",
  caseDetails: "",
  amountInvolved: "",
  language: "English",
  replyTone: "Professional",
  riskLevel: "Low",
};

export default function Home() {
  const [form, setForm] = useState<CaseInput>(EMPTY_FORM);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { history, addEntry, clearHistory } = useHistory();

  function handleGenerate() {
    setLoading(true);
    setTimeout(() => {
      const generated = generateResult(form);
      setResult(generated);
      addEntry(form, generated);
      setLoading(false);
    }, 300);
  }

  function handleClear() {
    setForm(EMPTY_FORM);
    setResult(null);
  }

  function handleSample() {
    setForm(nextSample());
    setResult(null);
  }

  function handleLoadHistory(entry: HistoryEntry) {
    setForm(entry.input);
    setResult(entry.result);
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--dark-bg)" }}>
      <header
        className="flex items-center justify-between px-6 py-3 shrink-0"
        style={{ background: "var(--dark-surface)", borderBottom: "0.5px solid var(--dark-border)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded flex items-center justify-center text-[14px] font-bold shrink-0"
            style={{ background: "var(--gold)", color: "#1a1a1a" }}
          >
            S
          </div>
          <div>
            <div className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>
              Support Reply Generator
            </div>
            <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              Internal case tool
            </div>
          </div>
        </div>
        <span
          className="text-[11px] px-3 py-1 rounded-full border"
          style={{
            background: "rgba(201,168,76,0.12)",
            color: "var(--gold)",
            borderColor: "var(--gold-dim)",
          }}
        >
          Support Team
        </span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside
          className="w-[340px] shrink-0 overflow-y-auto p-5"
          style={{ background: "var(--dark-surface)", borderRight: "0.5px solid var(--dark-border)" }}
        >
          <CaseForm
            form={form}
            onChange={setForm}
            onGenerate={handleGenerate}
            onClear={handleClear}
            onSample={handleSample}
            loading={loading}
          />
          <HistoryPanel
            history={history}
            onLoad={handleLoadHistory}
            onClear={clearHistory}
          />
        </aside>

        <main className="flex-1 overflow-y-auto p-5">
          {result ? (
            <ResultPanel result={result} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <div className="text-4xl" style={{ color: "var(--dark-border)" }}>☰</div>
              <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
                Fill in the case details and click{" "}
                <span style={{ color: "var(--gold)" }}>Generate reply</span> to see results here.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
