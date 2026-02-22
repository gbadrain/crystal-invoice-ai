/**
 * buildWelcomeEmailHTML
 *
 * Generates a branded welcome email for new Crystal Invoice AI sign-ups.
 * All CSS is inline for maximum email-client compatibility (Gmail, Outlook, iOS Mail).
 */

export function buildWelcomeEmailHTML(email: string, appUrl: string): string {
  const dashboardUrl = `${appUrl}/dashboard`
  const featuresUrl  = `${appUrl}/#features`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Welcome to Crystal Invoice AI</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr>
      <td align="center">

        <table width="560" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">

          <!-- Header: purple brand bar -->
          <tr>
            <td style="background:#6d5fd4;padding:32px 40px 28px;">
              <span style="font-size:22px;font-weight:800;letter-spacing:-0.5px;">
                <span style="color:#c4b5fd;">Crystal</span>
                <span style="color:#ffffff;"> Invoice AI</span>
              </span>
            </td>
          </tr>

          <!-- Hero row -->
          <tr>
            <td style="background:#ede9fe;padding:28px 40px;">
              <h1 style="margin:0;font-size:24px;font-weight:700;color:#4c1d95;letter-spacing:-0.5px;">
                Welcome aboard! 🎉
              </h1>
              <p style="margin:8px 0 0;font-size:15px;color:#5b21b6;line-height:1.5;">
                Your account for <strong>${email}</strong> is ready.
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 28px;">
              <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7;">
                Crystal Invoice AI lets you create professional invoices in seconds using AI.
                Just describe the job in plain English and watch the form fill itself.
              </p>

              <!-- Feature pills -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:6px 14px;background:#f0fdf4;border-radius:20px;font-size:13px;color:#15803d;font-weight:600;margin-right:8px;">✓ AI invoice generation</td>
                  <td style="width:8px;"></td>
                  <td style="padding:6px 14px;background:#f0fdf4;border-radius:20px;font-size:13px;color:#15803d;font-weight:600;">✓ PDF export</td>
                </tr>
              </table>
              <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
                <tr>
                  <td style="padding:6px 14px;background:#f0fdf4;border-radius:20px;font-size:13px;color:#15803d;font-weight:600;margin-right:8px;">✓ Email to client</td>
                  <td style="width:8px;"></td>
                  <td style="padding:6px 14px;background:#f0fdf4;border-radius:20px;font-size:13px;color:#15803d;font-weight:600;">✓ Payment tracking</td>
                </tr>
              </table>

              <!-- CTA button -->
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:#6d5fd4;border-radius:10px;">
                    <a href="${dashboardUrl}"
                       style="display:inline-block;padding:14px 36px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.2px;">
                      Go to Dashboard →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;font-size:13px;color:#94a3b8;line-height:1.6;">
                Or <a href="${featuresUrl}" style="color:#6d5fd4;text-decoration:none;">explore all features</a> on the homepage.
              </p>
            </td>
          </tr>

          <!-- Quick-start steps -->
          <tr>
            <td style="padding:0 40px 28px;">
              <div style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;padding:20px 24px;">
                <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#94a3b8;margin-bottom:14px;">
                  Get started in 3 steps
                </div>
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding:0 0 10px;">
                      <span style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;background:#6d5fd4;color:#ffffff;border-radius:50%;font-size:12px;font-weight:700;margin-right:10px;vertical-align:middle;">1</span>
                      <span style="font-size:14px;color:#1e293b;vertical-align:middle;">Click <strong>New Invoice</strong> on your dashboard</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 0 10px;">
                      <span style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;background:#6d5fd4;color:#ffffff;border-radius:50%;font-size:12px;font-weight:700;margin-right:10px;vertical-align:middle;">2</span>
                      <span style="font-size:14px;color:#1e293b;vertical-align:middle;">Describe the job — AI fills in the details</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;background:#6d5fd4;color:#ffffff;border-radius:50%;font-size:12px;font-weight:700;margin-right:10px;vertical-align:middle;">3</span>
                      <span style="font-size:14px;color:#1e293b;vertical-align:middle;">Download PDF or email directly to your client</span>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;">
              <div style="font-size:13px;font-weight:700;letter-spacing:-0.3px;margin-bottom:4px;">
                <span style="color:#6d5fd4;">Crystal</span><span style="color:#0f172a;"> Invoice AI</span>
              </div>
              <div style="font-size:11px;color:#94a3b8;">
                Questions? Reply to this email or visit
                <a href="${appUrl}" style="color:#6d5fd4;text-decoration:none;">${appUrl.replace(/^https?:\/\//, '')}</a>
              </div>
              <div style="font-size:11px;color:#cbd5e1;margin-top:8px;">
                You received this because you signed up for Crystal Invoice AI.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`
}
