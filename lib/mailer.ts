/**
 * Envio de email via Resend (igual ao funil spy). Usado pra entregar o acesso
 * ao app após a compra aprovada.
 *
 * Envs (Render):
 *   RESEND_API_KEY   chave da API do Resend
 *   RESEND_FROM      remetente verificado, ex.: "Cash Club <access@cashclub.site>"
 */

const APP_LOGIN = "https://cashclub.site/app/login";

export function accessEmailHtml(firstName?: string): string {
  const hi = firstName ? `Hi ${firstName},` : "Hi,";
  return `<!doctype html><html><body style="margin:0;background:#090909;font-family:Arial,Helvetica,sans-serif;color:#eaeaea">
  <div style="max-width:520px;margin:0 auto;padding:32px 22px">
    <div style="text-align:center;margin-bottom:22px">
      <span style="display:inline-block;background:#a8ff16;color:#090909;font-weight:900;font-size:18px;padding:10px 16px;border-radius:12px">Cash Club</span>
    </div>
    <div style="background:#111;border:1px solid #262626;border-radius:18px;padding:26px 22px">
      <h1 style="color:#fff;font-size:21px;margin:0 0 10px">✅ Your access is ready</h1>
      <p style="color:#b8b8b8;font-size:14px;line-height:1.6;margin:0 0 18px">${hi}<br>Your purchase is confirmed and your Cash Club account is active. Tap below to open your app and start using the AI.</p>
      <a href="${APP_LOGIN}" style="display:block;text-align:center;background:#a8ff16;color:#090909;font-weight:800;font-size:16px;text-decoration:none;padding:15px;border-radius:14px;margin:0 0 16px">Access my account →</a>
      <p style="color:#888;font-size:13px;line-height:1.6;margin:0">Sign in with <b style="color:#eaeaea">the same e-mail you used at checkout</b>. No password needed.</p>
      <div style="border-top:1px solid #262626;margin:20px 0 0;padding-top:16px">
        <p style="color:#666;font-size:12px;line-height:1.6;margin:0">Or copy this link:<br><span style="color:#a8ff16;word-break:break-all">${APP_LOGIN}</span></p>
      </div>
    </div>
    <p style="color:#555;font-size:11px;text-align:center;margin:18px 0 0">You received this because you purchased Cash Club AI.</p>
  </div></body></html>`;
}

/** Envia o email de acesso. Retorna {sent, reason?}. No-op se Resend não configurado. */
export async function sendAccessEmail(to: string, firstName?: string): Promise<{ sent: boolean; reason?: string }> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || "Cash Club <onboarding@resend.dev>";
  if (!key) return { sent: false, reason: "resend_not_configured" };
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,24}$/i.test(to)) return { sent: false, reason: "invalid_email" };
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        subject: "✅ Your Cash Club access is ready",
        html: accessEmailHtml(firstName),
      }),
    });
    if (r.ok) return { sent: true };
    const err = await r.text().catch(() => "");
    return { sent: false, reason: `resend_${r.status}: ${err.slice(0, 120)}` };
  } catch (e) {
    return { sent: false, reason: (e as Error).message };
  }
}
