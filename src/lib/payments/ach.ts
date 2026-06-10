import { getProfile } from "@/lib/portal/profile";
import { amountCentsForTrack } from "@/lib/portal/state";
import { getStripe } from "@/lib/payments/stripe";
import {
  createTransaction,
  findOpenAchTransaction,
  syncProfilePaymentStatus,
} from "@/lib/payments/transactions";
import type { PaymentTrack } from "@/lib/payments/types";

export async function createAchPaymentIntent(
  investorId: string,
  track: PaymentTrack,
): Promise<{ clientSecret: string; transactionId: string }> {
  const profile = await getProfile(investorId);
  if (!profile) throw new Error("Investor profile not found.");

  const amountCents = amountCentsForTrack(profile, track);
  if (!amountCents || amountCents <= 0) {
    throw new Error("Investment amount is not set.");
  }

  const existing = await findOpenAchTransaction(investorId, track, amountCents);
  if (existing?.processor_id) {
    const stripe = getStripe();
    const intent = await stripe.paymentIntents.retrieve(existing.processor_id);
    if (
      intent.client_secret &&
      ["requires_payment_method", "requires_confirmation", "requires_action", "processing"].includes(
        intent.status,
      )
    ) {
      return { clientSecret: intent.client_secret, transactionId: existing.id };
    }
  }

  const stripe = getStripe();
  const idempotencyKey = `ach-${investorId}-${track}-${amountCents}`;

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
