"use client";

import { useState } from "react";
import type { GeneratedResult } from "@/lib/generator";
import type { CaseInput } from "@/lib/generator";
import type { EscalationPayload } from "@/app/api/send-escalation/route";

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
          <span className="text-[10px] font-medium tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
            {title}
          </span>
        </div>
        {copyText && <CopyButton text={copyText} />}
      </div>
      {children}
    </div>
  );
}

function Checklist({ items, iconColor, icon }: { items: string[]; iconColor: string; icon: string }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-[13px]" style={{ color: "var(--text-secondary)" }}>
          <span className="mt-0.5 shrink-0" style={{ color: iconColor, fontSize: 13 }}>{icon}</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

type SendState = "idle" | "sending" | "sent" | "error";

interface Props {
  result: GeneratedResult;
  input: CaseInput;
}

export default function ResultPanel({ result, input }: Props) {
  const {
    customerReply, internalNote, escalationChecklist,
    recommendedStatus, assignedTeam, canSay, cannotPromise,
    whenToEscalate, recommendedNextAction, warningMessage,
  } = result;

  const [sendState, setSendState] = useState<SendState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const isUrgent =
    input.riskLevel === "High" ||
    /urgent|escalat|hold/i.test(recommendedStatus);

  async function handleSendEscalation() {
    setSendState("sending");
    setErrorMsg("");
    try {
      const payload: EscalationPayload = {
        caseId: input.caseId,
        customerRef: input.customerRef,
        issueType: input.issueType,
        riskLevel: input.riskLevel,
        assignedTeam,
        recommendedStatus,
        internalNote,
        escalationChecklist,
        recommendedNextAction,
      };
      const res = await fetch("/api/send-escalation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to send");
      setSendState("sent");
      setTimeout(() => setSendState("idle"), 4000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
      setSendState("error");
      setTimeout(() => setSendState("idle"), 5000);
    }
  }

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
          { label: "Priority", value: warningMessage ? "High" : "Normal", gold: false },
        ].map(({ label, value, gold }) => (
          <div
            key={label}
            className="rounded-md p-3"
            style={{ background: "var(--dark-card)", border: "0.5px solid var(--dark-border)" }}
          >
            <div className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: "var(--text-muted)" }}>
              {label}
            </div>
            <div className="text-[13px] font-medium" style={{ color: gold ? "var(--gold)" : "var(--text-primary)" }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {isUrgent && (
        <div
          className="rounded-lg px-4 py-3 flex items-center justify-between gap-3"
          style={{ background: "rgba(163,45,45,0.1)", border: "0.5px solid #7a3030" }}
        >
          <div>
            <p className="text-[13px] font-medium" style={{ color: "#F09595" }}>
              This case requires manager attention
            </p>
            <p className="text-[12px] mt-0.5" style={{ color: "#9a9490" }}>
              Send an escalation email to notify the manager immediately.
            </p>
          </div>
          <button
            onClick={handleSendEscalation}
            disabled={sendState === "sending" || sendState === "sent"}
            className="shrink-0 px-4 py-2 rounded-md text-[12px] font-medium cursor-pointer disabled:opacity-60 transition-colors whitespace-nowrap"
            style={{
              background: sendState === "sent" ? "rgba(99,153,34,0.2)" : "rgba(163,45,45,0.3)",
              border: `0.5px solid ${sendState === "sent" ? "#3B6D11" : "#A32D2D"}`,
              color: sendState === "sent" ? "#97C459" : "#F09595",
            }}
          >
            {sendState === "sending" && "Sending…"}
            {sendState === "sent" && "✓ Email sent"}
            {sendState === "error" && "✗ Failed — retry"}
            {sendState === "idle" && "Send Escalation Email"}
          </button>
        </div>
      )}

      {sendState === "error" && errorMsg && (
        <p className="text-[12px] px-1" style={{ color: "#F09595" }}>Error: {errorMsg}</p>
      )}

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
