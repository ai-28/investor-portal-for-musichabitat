import type Stripe from "stripe";
import {
  getTransactionByProcessorId,
  syncProfilePaymentStatus,
  updateTransactionStatus,
} from "@/lib/payments/transactions";
import type { PaymentTrack, TransactionStatus } from "@/lib/payments/types";

function trackFromMetadata(metadata: Stripe.Metadata | null): PaymentTrack | null {
  const track = metadata?.track;
  if (track === "friends_family" || track === "private") return track;
  return null;
}

function statusFromIntent(status: Stripe.PaymentIntent.Status): TransactionStatus | null {
  switch (status) {
    case "processing":
    case "requires_action":
    case "requires_confirmation":
      return "processing";
    case "succeeded":
      return "succeeded";
    case "canceled":
      return "failed";
    default:
      return null;
  }
}

export async function handlePaymentIntentEvent(
  intent: Stripe.PaymentIntent,
  eventType: string,
): Promise<void> {
  const tx = await getTransactionByProcessorId(intent.id);
  if (!tx) return;

  const track =
    trackFromMetadata(intent.metadata) ?? (tx.track as PaymentTrack);
  const investorId = intent.metadata.investor_id ?? tx.investor_id;

  if (eventType === "payment_intent.payment_failed") {
    const reason =
      intent.last_payment_error?.message ?? "Payment failed.";
    await updateTransactionStatus(tx.id, "failed", { failureReason: reason });
    await syncProfilePaymentStatus(investorId, track, "failed");
    return;
  }

  const nextStatus = statusFromIntent(intent.status);
  if (!nextStatus) return;

  await updateTransactionStatus(tx.id, nextStatus);
  await syncProfilePaymentStatus(investorId, track, nextStatus);
}
