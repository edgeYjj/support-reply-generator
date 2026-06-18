import type { CaseInput } from "./generator";

export const SAMPLE_CASES: CaseInput[] = [
  {
    caseId: "CS-20240618",
    customerRef: "CUS-00412",
    issueType: "Payment Status Inquiry",
    caseDetails:
      "Customer reports their deposit of $250 made on June 15 is not reflected in their account. Transaction ID provided: TXN-884412. Customer is frustrated and requesting urgent resolution.",
    amountInvolved: "$250.00",
    language: "English",
    replyTone: "Professional",
    riskLevel: "Low",
  },
  {
    caseId: "CS-20240619",
    customerRef: "CUS-00887",
    issueType: "Account Verification Issue",
    caseDetails:
      "Customer submitted ID documents three days ago but account remains locked. They have been unable to access their funds and are threatening to escalate to the regulator.",
    amountInvolved: "$1,500.00",
    language: "English",
    replyTone: "Professional",
    riskLevel: "High",
  },
  {
    caseId: "CS-20240620",
    customerRef: "CUS-01133",
    issueType: "Promotion or Bonus Dispute",
    caseDetails:
      "Customer claims they opted in to the 50% deposit bonus during last week's promotion but no bonus was credited after their $100 deposit. They have a screenshot of the promotion page.",
    amountInvolved: "$50.00",
    language: "English",
    replyTone: "Friendly",
    riskLevel: "Low",
  },
  {
    caseId: "CS-20240621",
    customerRef: "CUS-00201",
    issueType: "Account Access Problem",
    caseDetails:
      "Customer reports being locked out after several failed login attempts. They suspect unauthorised access and are concerned about fraudulent transactions on the account.",
    amountInvolved: "$800.00",
    language: "English",
    replyTone: "Firm and Policy-Based",
    riskLevel: "High",
  },
  {
    caseId: "CS-20240622",
    customerRef: "CUS-00654",
    issueType: "Missing Payment Record",
    caseDetails:
      "Customer made a withdrawal request of $320 five days ago. Payment has not arrived and the transaction no longer appears in their account history.",
    amountInvolved: "$320.00",
    language: "English",
    replyTone: "Professional",
    riskLevel: "Medium",
  },
];

let sampleIndex = 0;

export function nextSample(): CaseInput {
  const sample = SAMPLE_CASES[sampleIndex % SAMPLE_CASES.length];
  sampleIndex++;
  return { ...sample };
}
