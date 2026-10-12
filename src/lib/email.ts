// ============================================================
// KoraStay - Abstraction email
// En dev : log console. En prod : Resend si RESEND_API_KEY.
// ============================================================

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const EMAIL_FROM = process.env.EMAIL_FROM ?? "KoraStay <contact@korastay.com>";

export async function sendEmail(input: SendEmailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // Mode developpement : pas de cle, on logge.
    console.log("\n========== [EMAIL simule] ==========");
    console.log(`De      : ${EMAIL_FROM}`);
    console.log(`A       : ${input.to}`);
    console.log(`Sujet   : ${input.subject}`);
    console.log(`Texte   : ${input.text ?? "(html)"}`);
    console.log("====================================\n");
    return;
  }

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });
  } catch (err) {
    console.error("[email] échec d'envoi:", err);
  }
}

// ------------------------------------------------------------
// Gabarit HTML minimal de marque
// ------------------------------------------------------------
export function emailLayout(
  title: string,
  body: string,
  footer = "KoraStay &middot; Réservez votre séjour, vivez l'Afrique de l'Ouest."
): string {
  return `
  <div style="background:#F8F5EF;padding:32px 0;font-family:Helvetica,Arial,sans-serif;">
    <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;border:1px solid #E6DCCB;">
      <div style="background:#12343B;padding:24px 28px;">
        <span style="color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">Kora<span style="color:#F2A23A;">Stay</span></span>
      </div>
      <div style="height:6px;background:#B9562F;"></div>
      <div style="padding:28px;">
        <h1 style="font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:24px;color:#1A1D1A;margin:0 0 16px;">${title}</h1>
        <div style="font-size:15px;line-height:1.6;color:#3a4744;">${body}</div>
      </div>
      <div style="padding:18px 28px;background:#F3EDE2;font-size:12px;color:#6A6259;">
        ${footer}
      </div>
    </div>
  </div>`;
}

export function emailButton(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:#0F6B4F;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:600;font-size:15px;margin:8px 0;">${label}</a>`;
}
