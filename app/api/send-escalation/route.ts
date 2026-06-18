import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EscalationPayload {
  caseId: string;
  customerRef: string;
  issueType: string;
  riskLevel: string;
  assignedTeam: string;
  recommendedStatus: string;
  internalNote: string;
  escalationChecklist: string[];
  recommendedNextAction: string[];
}

function buildEmailHtml(p: EscalationPayload): string {
  const riskColor =
    p.riskLevel === "High" ? "#F09595" : p.riskLevel === "Medium" ? "#EF9F27" : "#97C459";

  const checklistRows = p.escalationChecklist
    .map(
      (item) => `
      <tr>
        <td style="padding:6px 0;border-bottom:1px solid #2e2e2e;font-size:13px;color:#9a9490;">
          &#9744; ${item}
        </td>
      </tr>`
    )
    .join("");

  const actionRows = p.recommendedNextAction
    .map(
      (item) => `
      <tr>
        <td style="padding:6px 0;border-bottom:1px solid #2e2e2e;font-size:13px;color:#9a9490;">
          &rarr; ${item}
        </td>
      </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" /></head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:10px;border:1px solid #2e2e2e;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background:#1a1a1a;border-bottom:1px solid #2e2e2e;padding:20px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <span style="display:inline-block;background:#c9a84c;color:#1a1a1a;font-weight:700;font-size:14px;width:28px;height:28px;line-height:28px;text-align:center;border-radius:4px;">S</span>
                  <span style="margin-left:10px;font-size:14px;font-weight:500;color:#f0ede6;vertical-align:middle;">Support Reply Generator</span>
                </td>
                <td align="right">
                  <span style="background:rgba(163,45,45,0.2);color:#F09595;border:1px solid #A32D2D;font-size:11px;padding:4px 12px;border-radius:20px;">
                    Escalation Alert
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:28px;">

            <p style="margin:0 0 20px;font-size:13px;color:#9a9490;">
              A case has been flagged for manager review. Details are below.
            </p>

            <!-- Case summary chips -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              <tr>
                <td width="33%" style="padding-right:8px;">
                  <div style="background:#222;border:1px solid #2e2e2e;border-radius:6px;padding:10px 12px;">
                    <div style="font-size:10px;color:#5a5754;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:4px;">Case ID</div>
                    <div style="font-size:13px;font-weight:500;color:#c9a84c;">${p.caseId || "—"}</div>
                  </div>
                </td>
                <td width="33%" style="padding-right:8px;">
                  <div style="background:#222;border:1px solid #2e2e2e;border-radius:6px;padding:10px 12px;">
                    <div style="font-size:10px;color:#5a5754;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:4px;">Customer Ref.</div>
                    <div style="font-size:13px;font-weight:500;color:#f0ede6;">${p.customerRef || "—"}</div>
                  </div>
                </td>
                <td width="33%">
                  <div style="background:#222;border:1px solid #2e2e2e;border-radius:6px;padding:10px 12px;">
                    <div style="font-size:10px;color:#5a5754;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:4px;">Risk Level</div>
                    <div style="font-size:13px;font-weight:500;color:${riskColor};">${p.riskLevel}</div>
                  </div>
                </td>
              </tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              <tr>
                <td width="50%" style="padding-right:8px;">
                  <div style="background:#222;border:1px solid #2e2e2e;border-radius:6px;padding:10px 12px;">
                    <div style="font-size:10px;color:#5a5754;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:4px;">Issue Type</div>
                    <div style="font-size:13px;font-weight:500;color:#f0ede6;">${p.issueType}</div>
                  </div>
                </td>
                <td width="50%">
                  <div style="background:#222;border:1px solid #2e2e2e;border-radius:6px;padding:10px 12px;">
                    <div style="font-size:10px;color:#5a5754;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:4px;">Assigned Team</div>
                    <div style="font-size:13px;font-weight:500;color:#f0ede6;">${p.assignedTeam}</div>
                  </div>
                </td>
              </tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              <tr>
                <td>
                  <div style="background:#222;border:1px solid #2e2e2e;border-radius:6px;padding:10px 12px;">
                    <div style="font-size:10px;color:#5a5754;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:4px;">Current Status</div>
                    <div style="font-size:13px;font-weight:500;color:#c9a84c;">${p.recommendedStatus}</div>
                  </div>
                </td>
              </tr>
            </table>

            <!-- Internal note -->
            <div style="margin-bottom:20px;">
              <div style="font-size:10px;color:#5a5754;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:8px;">Internal Note</div>
              <div style="border-left:2px solid #c9a84c;padding-left:12px;font-size:13px;color:#9a9490;line-height:1.65;">
                ${p.internalNote}
              </div>
            </div>

            <!-- Escalation checklist -->
            <div style="margin-bottom:20px;">
              <div style="font-size:10px;color:#5a5754;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:8px;">Escalation Checklist</div>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${checklistRows}
              </table>
            </div>

            <!-- Recommended next action -->
            <div style="margin-bottom:8px;">
              <div style="font-size:10px;color:#5a5754;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:8px;">Recommended Manager Action</div>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${actionRows}
              </table>
            </div>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="border-top:1px solid #2e2e2e;padding:16px 28px;">
            <p style="margin:0;font-size:11px;color:#5a5754;">
              This is an internal escalation alert from Support Reply Generator. Do not forward to customers.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST(req: Request) {
  try {
    const payload: EscalationPayload = await req.json();

    const managerEmail = process.env.MANAGER_EMAIL;
    if (!managerEmail) {
      return NextResponse.json({ error: "MANAGER_EMAIL not configured" }, { status: 500 });
    }

    const { data, error } = await resend.emails.send({
      from: "Support Tool <onboarding@resend.dev>",
      to: [managerEmail],
      subject: `[Escalation] ${payload.issueType} — ${payload.caseId || "No Case ID"} (${payload.riskLevel} Risk)`,
      html: buildEmailHtml(payload),
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    console.error("Send escalation error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
