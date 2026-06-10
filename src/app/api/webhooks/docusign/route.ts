import { NextResponse } from "next/server";
import {
  handleDocuSignWebhookPayload,
  verifyDocuSignWebhook,
} from "@/lib/docusign/webhook";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature =
    request.headers.get("x-docusign-signature-1") ??
    request.headers.get("X-DocuSign-Signature-1");

  if (!verifyDocuSignWebhook(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  try {
    await handleDocuSignWebhookPayload(payload);
  } catch (err) {
    console.error("DocuSign webhook handler error", err);
    return NextResponse.json({ error: "Webhook handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
