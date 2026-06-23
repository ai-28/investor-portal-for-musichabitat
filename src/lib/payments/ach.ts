import { randomUUID } from "crypto";
import type Stripe from "stripe";
import { getProfile } from "@/lib/portal/profile";
import { amountCentsForTrack } from "@/lib/portal/state";
import { getStripe } from "@/lib/payments/stripe";
import {
  createTransaction,
  findOpenAchTransaction,
  findSucceededAchTransaction,
  syncProfilePaymentStatus,
  updateTransactionStatus,
} from "@/lib/payments/transactions";
import type { PaymentTrack, TransactionStatus } from "@/lib/payments/types";

const REUSABLE_INTENT_STATUSES: Stripe.PaymentIntent.Status[] = [
  "requires_payment_method",
  "requires_confirmation",
  "requires_action",
  "processing",
];

function transactionStatusFromIntent(
  status: Stripe.PaymentIntent.Status,
): TransactionStatus | null {
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

async function syncOpenTransactionFromIntent(
  txId: string,
  intent: Stripe.PaymentIntent,
  investorId: string,
  track: PaymentTrack,
): Promise<TransactionStatus | null> {
  const mapped = transactionStatusFromIntent(intent.status);
  if (!mapped) return null;

  await updateTransactionStatus(txId, mapped, {
    failureReason:
      mapped === "failed"
        ? (intent.last_payment_error?.message ?? "Payment canceled or failed.")
        : null,
  });
  await syncProfilePaymentStatus(investorId, track, mapped);
  return mapped;
}

export type AchPaymentIntentResult = {
  clientSecret?: string;
  transactionId: string;
  alreadyCompleted?: boolean;
};

export async function createAchPaymentIntent(
  investorId: string,
  track: PaymentTrack,
): Promise<AchPaymentIntentResult> {
  const profile = await getProfile(investorId);
  if (!profile) throw new Error("Investor profile not found.");

  const amountCents = amountCentsForTrack(profile, track);
  if (!amountCents || amountCents <= 0) {
    throw new Error("Investment amount is not set.");
  }

  const trackPaymentStatus =
    track === "private" ? profile.private_payment_status : profile.payment_status;
  if (trackPaymentStatus === "cleared") {
    const succeeded =
      await findSucceededAchTransaction(investorId, track, amountCents);
    return {
      transactionId: succeeded?.id ?? "",
      alreadyCompleted: true,
    };
  }

  const stripe = getStripe();
  const existing = await findOpenAchTransaction(investorId, track, amountCents);
  if (existing?.processor_id) {
    const intent = await stripe.paymentIntents.retrieve(existing.processor_id);
    if (
      intent.client_secret &&
      REUSABLE_INTENT_STATUSES.includes(intent.status)
    ) {
      return { clientSecret: intent.client_secret, transactionId: existing.id };
    }

    const synced = await syncOpenTransactionFromIntent(
      existing.id,
      intent,
      investorId,
      track,
    );
    if (synced === "succeeded") {
      return { transactionId: existing.id, alreadyCompleted: true };
    }
    // Terminal failed/canceled — fall through and create a fresh PaymentIntent.
  }

  const idempotencyKey = `ach-${investorId}-${track}-${amountCents}-${randomUUID()}`;

  const paymentIntent = await stripe.paymentIntents.create(
    {
      amount: amountCents,
      currency: "usd",
      payment_method_types: ["us_bank_account"],
      payment_method_options: {
        us_bank_account: {
          financial_connections: {
            permissions: ["payment_method"],
          },
          verification_method: "automatic",
        },
      },
      metadata: {
        investor_id: investorId,
        track,
        transaction_type: "investment_funding",
      },
      description: `Music Habitat investment — ${track === "private" ? "Private" : "Friends & Family"}`,
    },
    { idempotencyKey },
  );

  if (!paymentIntent.client_secret) {
    throw new Error("Stripe did not return a client secret.");
  }

  const tx = await createTransaction({
    investorId,
    track,
    method: "ach",
    amountCents,
    processor: "stripe",
    processorId: paymentIntent.id,
    status: "pending",
    mandateAcceptedAt: new Date().toISOString(),
  });

  await syncProfilePaymentStatus(investorId, track, "pending");

  return { clientSecret: paymentIntent.client_secret, transactionId: tx.id };
}
