/** Optional transactional email via Resend (https://resend.com). */
export async function sendTransactionalEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return false;

  const from =
    process.env.EMAIL_FROM?.trim() ||
    "Music Habitat <onboarding@resend.dev>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: params.to,
        subject: params.subject,
        html: params.html,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Resend email failed:", res.status, text.slice(0, 300));
      return false;
    }

    console.info("App email sent to:", params.to);
    return true;
  } catch (err) {
    console.error("Resend email error:", err);
    return false;
  }
}

export async function sendNdaCountersignEmails(params: {
  investorEmail?: string;
  ceoEmail: string;
  ceoSignUrl: string;
  docLabel: string;
  portalUrl: string;
}): Promise<{ investor: boolean; ceo: boolean }> {
  const ceoHtml = `
    <p>An investor has signed the <strong>${params.docLabel}</strong>.</p>
    <p><a href="${params.ceoSignUrl}">Countersign ${params.docLabel} in DocuSign</a></p>
    <p>This link stays valid until you countersign. Go to the last page, use Add Fields to place Signature / Date / Text on the Music Habitat column (left), then Finish.</p>
  `;

  const ceoSent = await sendTransactionalEmail({
    to: params.ceoEmail,
    subject: `Countersign required — ${params.docLabel}`,
    html: ceoHtml,
  });

  let investorSent = false;
  if (params.investorEmail) {
    investorSent = await sendTransactionalEmail({
      to: params.investorEmail,
      subject: `You signed — ${params.docLabel}`,
      html: `
        <p>Thank you for signing the ${params.docLabel}.</p>
        <p>The CEO will countersign shortly. You can return to the portal to download the current PDF:</p>
        <p><a href="${params.portalUrl}">${params.portalUrl}</a></p>
      `,
    });
  }

  return { investor: investorSent, ceo: ceoSent };
}
