export type IssueType =
  | "Payment Status Inquiry"
  | "Missing Payment Record"
  | "Account Verification Issue"
  | "Promotion or Bonus Dispute"
  | "Account Access Problem";

export type ReplyTone = "Professional" | "Friendly" | "Firm and Policy-Based";
export type RiskLevel = "Low" | "Medium" | "High";

export interface CaseInput {
  caseId: string;
  customerRef: string;
  issueType: IssueType;
  caseDetails: string;
  amountInvolved: string;
  language: string;
  replyTone: ReplyTone;
  riskLevel: RiskLevel;
}

export interface GeneratedResult {
  customerReply: string;
  internalNote: string;
  escalationChecklist: string[];
  recommendedStatus: string;
  assignedTeam: string;
  canSay: string[];
  cannotPromise: string[];
  whenToEscalate: string[];
  recommendedNextAction: string[];
  warningMessage: string | null;
}

const TEAM_MAP: Record<IssueType, string> = {
  "Payment Status Inquiry": "Payments & Reconciliation",
  "Missing Payment Record": "Payments & Reconciliation",
  "Account Verification Issue": "KYC & Compliance",
  "Promotion or Bonus Dispute": "Promotions & Adjustments",
  "Account Access Problem": "Account Security",
};

const STATUS_MAP: Record<IssueType, Record<RiskLevel, string>> = {
  "Payment Status Inquiry": {
    Low: "Pending Investigation",
    Medium: "Under Review",
    High: "Urgent Review",
  },
  "Missing Payment Record": {
    Low: "In Review",
    Medium: "Escalated to Finance",
    High: "Urgent Escalation",
  },
  "Account Verification Issue": {
    Low: "Pending Verification",
    Medium: "Verification On Hold",
    High: "Compliance Hold",
  },
  "Promotion or Bonus Dispute": {
    Low: "Under Review",
    Medium: "Awaiting Approval",
    High: "Escalated — Manager Required",
  },
  "Account Access Problem": {
    Low: "Access Issue Logged",
    Medium: "Security Review",
    High: "Security Hold — Urgent",
  },
};

function parseAmount(raw: string): number {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  return parseFloat(cleaned) || 0;
}

function toneGreeting(tone: ReplyTone): string {
  if (tone === "Friendly") return "Hi there,";
  if (tone === "Firm and Policy-Based") return "Dear Valued Customer,";
  return "Dear Customer,";
}

function toneClosing(tone: ReplyTone): string {
  if (tone === "Friendly") return "Thanks for your patience — we're on it!\n\nWarm regards,\nSupport Team";
  if (tone === "Firm and Policy-Based")
    return "Please be advised that all actions taken are in accordance with our terms and conditions.\n\nYours sincerely,\nSupport Team";
  return "We appreciate your patience and will keep you informed.\n\nKind regards,\nSupport Team";
}

function buildCustomerReply(input: CaseInput): string {
  const { caseId, issueType, amountInvolved, replyTone, riskLevel } = input;
  const greeting = toneGreeting(replyTone);
  const closing = toneClosing(replyTone);
  const amount = amountInvolved ? ` of ${amountInvolved}` : "";

  const bodies: Record<IssueType, string> = {
    "Payment Status Inquiry": `We have received your inquiry regarding case ${caseId} and are looking into the payment${amount} you referenced.\n\nOur payments team is currently reviewing this and will provide a full update within 1–2 business days.`,
    "Missing Payment Record": `We have logged your case ${caseId} and are investigating the missing payment record${amount}.\n\nOur reconciliation team will trace the transaction and update you within 2 business days. We apologise for any inconvenience caused.`,
    "Account Verification Issue": `Thank you for your patience regarding your account verification (case ${caseId}).\n\nOur compliance team is currently reviewing your submitted documents. Please ensure all documents are valid and unexpired. We will notify you of the outcome within 3 business days.`,
    "Promotion or Bonus Dispute": `We have received your query regarding case ${caseId} and are reviewing your account against the applicable promotion terms${amount ? ` involving ${amountInvolved}` : ""}.\n\nOur promotions team will confirm eligibility and respond within 2 business days.`,
    "Account Access Problem": `We have received your report regarding difficulty accessing your account (case ${caseId}).\n\nFor your security, our team is reviewing this issue now. If you attempted multiple logins, your account may be temporarily locked as a precaution. We will update you within 1 business day.`,
  };

  let urgencyLine = "";
  if (riskLevel === "High") {
    urgencyLine = "\n\nGiven the nature of this case, it has been flagged as a priority and assigned to our senior team.";
  }

  return `${greeting}\n\n${bodies[issueType]}${urgencyLine}\n\n${closing}`;
}

function buildInternalNote(input: CaseInput): string {
  const { caseId, customerRef, issueType, caseDetails, amountInvolved, riskLevel, replyTone } = input;
  const amount = amountInvolved ? ` Amount involved: ${amountInvolved}.` : "";
  const shortDetail = caseDetails.length > 120 ? caseDetails.slice(0, 120) + "…" : caseDetails;

  return `Case ${caseId} | Customer: ${customerRef} | Issue: ${issueType} | Risk: ${riskLevel} | Tone: ${replyTone}\n\nSummary: ${shortDetail}${amount}\n\nAssigned to: ${TEAM_MAP[issueType]}. Customer reply sent. Status set to: ${STATUS_MAP[issueType][riskLevel]}. Monitor for SLA compliance.`;
}

const RULE_SETS: Record<
  IssueType,
  { canSay: string[]; cannotPromise: string[]; whenToEscalate: string[]; nextAction: string[] }
> = {
  "Payment Status Inquiry": {
    canSay: [
      "We have received your inquiry and are actively investigating.",
      "Our team will provide an update within 1–2 business days.",
      "Please retain your transaction reference for follow-up.",
    ],
    cannotPromise: [
      "Do not confirm a refund or credit before verification is complete.",
      "Do not specify an exact resolution time beyond the stated SLA.",
      "Do not confirm transaction success without system validation.",
    ],
    whenToEscalate: [
      "No transaction record is found after 48 hours.",
      "Customer provides conflicting transaction details.",
      "Amount exceeds the internal review threshold.",
    ],
    nextAction: [
      "Verify the transaction ID in the payment gateway.",
      "Cross-check the settlement report for the reported date.",
      "Log the outcome in CRM once resolved.",
    ],
  },
  "Missing Payment Record": {
    canSay: [
      "We are actively investigating the missing record.",
      "Our team will trace the transaction on your behalf.",
      "You will receive a written update within 2 business days.",
    ],
    cannotPromise: [
      "Do not confirm the payment was received without verification.",
      "Do not promise a re-credit before reconciliation is complete.",
      "Do not suggest a system error as the cause prematurely.",
    ],
    whenToEscalate: [
      "Transaction cannot be traced after full reconciliation.",
      "Customer reports multiple missing records.",
      "Bank confirmation conflicts with internal records.",
    ],
    nextAction: [
      "Search payment logs by customer ID and date range.",
      "Check for reversed or duplicate transactions.",
      "Escalate to finance team if unresolved after 48 hours.",
    ],
  },
  "Account Verification Issue": {
    canSay: [
      "Your documents are under review by our compliance team.",
      "The process typically takes up to 3 business days.",
      "You will be notified by email once verification is complete.",
    ],
    cannotPromise: [
      "Do not guarantee approval of submitted documents.",
      "Do not confirm account will be unlocked by a specific date.",
      "Do not advise the customer on how to alter or resubmit documents.",
    ],
    whenToEscalate: [
      "Documents appear altered, inconsistent, or illegible.",
      "Customer has been pending verification for over 5 business days.",
      "Compliance team flags the case for enhanced due diligence.",
    ],
    nextAction: [
      "Confirm document submission completeness in the KYC system.",
      "Check for document expiry or legibility issues.",
      "Set a follow-up reminder for 3 business days.",
    ],
  },
  "Promotion or Bonus Dispute": {
    canSay: [
      "We are reviewing your account against the promotion terms.",
      "Our team will confirm eligibility and respond within 2 business days.",
      "All promotions are subject to our standard terms and conditions.",
    ],
    cannotPromise: [
      "Do not confirm the bonus will be credited before eligibility is verified.",
      "Do not interpret promotion terms loosely or make verbal exceptions.",
      "Do not discuss outcomes of other customers' promotions.",
    ],
    whenToEscalate: [
      "Promotion terms are ambiguous or disputed internally.",
      "Customer formally requests a written response.",
      "Amount involved exceeds the standard adjustment threshold.",
    ],
    nextAction: [
      "Pull the promotion terms applicable at the time of opt-in.",
      "Verify account activity meets all eligibility criteria.",
      "Document findings and respond to customer within SLA.",
    ],
  },
  "Account Access Problem": {
    canSay: [
      "We have received your report and are investigating.",
      "Your account security is our top priority.",
      "We will provide an update within 1 business day.",
    ],
    cannotPromise: [
      "Do not share or confirm credentials or reset links via chat.",
      "Do not confirm whether the account is locked without system verification.",
      "Do not rule out unauthorised access without completing a security check.",
    ],
    whenToEscalate: [
      "Signs of unauthorised access or suspicious login attempts are detected.",
      "Customer reports transactions they did not authorise.",
      "Account remains locked for more than 24 hours without resolution.",
    ],
    nextAction: [
      "Check login attempt logs and flag any anomalies.",
      "Initiate a security review with the Account Security team.",
      "Send access recovery instructions via verified email only.",
    ],
  },
};

function buildEscalationChecklist(input: CaseInput): string[] {
  const { issueType, riskLevel, amountInvolved } = input;
  const amount = parseAmount(amountInvolved);
  const base = [
    `Confirm case ${input.caseId} is logged and assigned to ${TEAM_MAP[issueType]}.`,
    "Verify customer identity before disclosing any account information.",
    "Ensure all case notes are saved in CRM before closing the session.",
  ];

  if (riskLevel === "High") {
    base.unshift("PRIORITY: Notify team lead immediately — high-risk case flagged.");
  }
  if (amount >= 1000) {
    base.push(`Large amount involved (${amountInvolved}) — requires senior approval before any adjustment.`);
  }
  if (issueType === "Account Access Problem" && riskLevel !== "Low") {
    base.push("Run a full login audit before restoring account access.");
  }
  if (issueType === "Account Verification Issue") {
    base.push("Do not restore account access until KYC review is fully completed.");
  }

  return base;
}

function buildWarning(input: CaseInput): string | null {
  const { riskLevel, issueType, amountInvolved, caseDetails } = input;
  const amount = parseAmount(amountInvolved);
  const detailsLower = caseDetails.toLowerCase();

  const flags: string[] = [];

  if (riskLevel === "High") flags.push("Case is flagged as high risk.");
  if (amount >= 1000) flags.push(`Large amount involved: ${amountInvolved}. Senior approval required.`);
  if (issueType === "Account Access Problem" && detailsLower.includes("unauthori"))
    flags.push("Potential unauthorised access detected in case details.");
  if (issueType === "Account Verification Issue" && riskLevel === "High")
    flags.push("Compliance hold active — do not restore access until cleared.");
  if (detailsLower.includes("fraud") || detailsLower.includes("scam") || detailsLower.includes("stolen"))
    flags.push("Fraud-related keywords detected in case details. Escalate to Risk team.");

  if (flags.length === 0) return null;
  return flags.join(" | ");
}

export function generateResult(input: CaseInput): GeneratedResult {
  const rules = RULE_SETS[input.issueType];
  return {
    customerReply: buildCustomerReply(input),
    internalNote: buildInternalNote(input),
    escalationChecklist: buildEscalationChecklist(input),
    recommendedStatus: STATUS_MAP[input.issueType][input.riskLevel],
    assignedTeam: TEAM_MAP[input.issueType],
    canSay: rules.canSay,
    cannotPromise: rules.cannotPromise,
    whenToEscalate: rules.whenToEscalate,
    recommendedNextAction: rules.nextAction,
    warningMessage: buildWarning(input),
  };
}
