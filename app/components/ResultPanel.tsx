"use client";

import { useState } from "react";
import type { GeneratedResult } from "@/lib/generator";

interface CopyButtonProps {
  text: string;
}

function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <button
      onClick={handleCopy}
      className="text-[11px] px-2 py-1 rounded border transition-colors cursor-pointer"
      style={{
        borderColor: "var(--dark-border)",
        color: copied ? "var(--gold)" : "var(--text-muted)",
        background: "transparent",
      }}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

interface SectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  copyText?: string;
  accentColor?: string;
}

function Section({ title, icon, children, copyText, accentColor = "var(--gold)" }: SectionProps) {
  return (
    <div
      className="rounded-lg p-4"
      style={{ background: "var(--dark-surface)", border: "0.5px solid var(--dark-border)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span style={{ color: accentColor, fontSize: 14 }}>{icon}</span>
          <span
            className="text-[10px] font-medium tracking-widest uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            {title}
          </span>
        </div>
        {copyText && <CopyButton text={copyText} />}
      </div>
      {children}
    </div>
  );
}

interface ChecklistProps {
  items: string[];
  iconColor: string;
  icon: string;
}

function Checklist({ items, iconColor, icon }: ChecklistProps) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-[13px]" style={{ color: "var(--text-secondary)" }}>
          <span className="mt-0.5 shrink-0" style={{ color: iconColor, fontSize: 13 }}>
            {icon}
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

interface Props {
  result: GeneratedResult;
}

export default function ResultPanel({ result }: Props) {
  const {
    customerReply,
    internalNote,
    escalationChecklist,
    recommendedStatus,
    assignedTeam,
    canSay,
    cannotPromise,
    whenToEscalate,
    recommendedNextAction,
    warningMessage,
  } = result;

  return (
    <div className="flex flex-col gap-3">
      {warningMessage && (
        <div
          className="rounded-lg px-4 py-3 text-[13px] flex items-start gap-3"
          style={{ background: "rgba(163,45,45,0.15)", border: "0.5px solid #A32D2D", color: "#F09595" }}
        >
          <span className="shrink-0 mt-0.5">⚠</span>
          <span>{warningMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: "Recommended status", value: recommendedStatus, gold: true },
          { label: "Assigned team", value: assignedTeam, gold: false },
          { label: "Priority", value: result.warningMessage ? "High" : "Normal", gold: false },
        ].map(({ label, value, gold }) => (
          <div
            key={label}
            className="rounded-md p-3"
            style={{ background: "var(--dark-card)", border: "0.5px solid var(--dark-border)" }}
          >
            <div className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: "var(--text-muted)" }}>
              {label}
            </div>
            <div
              className="text-[13px] font-medium"
              style={{ color: gold ? "var(--gold)" : "var(--text-primary)" }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>

      <Section title="Customer reply" icon="✉" copyText={customerReply}>
        <pre
          className="text-[13px] whitespace-pre-wrap leading-relaxed"
          style={{ color: "var(--text-secondary)", borderLeft: "2px solid var(--gold)", paddingLeft: 12 }}
        >
          {customerReply}
        </pre>
      </Section>

      <Section title="Internal note" icon="🔒" copyText={internalNote}>
        <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {internalNote}
        </p>
      </Section>

      <div className="grid grid-cols-2 gap-2.5">
        <Section title="What support can say" icon="✓" accentColor="#97C459">
          <Checklist items={canSay} iconColor="#97C459" icon="✓" />
        </Section>
        <Section title="What not to promise" icon="✗" accentColor="#F09595">
          <Checklist items={cannotPromise} iconColor="#F09595" icon="✗" />
        </Section>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <Section title="When to escalate" icon="↑" accentColor="#378ADD">
          <Checklist items={whenToEscalate} iconColor="#378ADD" icon="▸" />
        </Section>
        <Section title="Recommended next action" icon="→" accentColor="var(--gold)">
          <Checklist items={recommendedNextAction} iconColor="var(--gold)" icon="→" />
        </Section>
      </div>

      <Section title="Escalation checklist" icon="☑" accentColor="#EF9F27">
        <Checklist items={escalationChecklist} iconColor="#EF9F27" icon="☐" />
      </Section>
    </div>
  );
}
