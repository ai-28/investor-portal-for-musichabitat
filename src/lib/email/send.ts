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
