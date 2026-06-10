import { getProfile } from "@/lib/portal/profile";
import { amountCentsForTrack } from "@/lib/portal/state";
import { getWireConfig, isWireConfigured } from "@/lib/payments/config";
import {
  createTransaction,
  findPendingWireTransaction,
  syncProfilePaymentStatus,
  wireReferenceForInvestor,
} from "@/lib/payments/transactions";
import type { PaymentTrack, WireInstructions } from "@/lib/payments/types";

export async function getOrCreateWireInstructions(
  investorId: string,
  track: PaymentTrack,
): Promise<WireInstructions> {
  if (!isWireConfigured()) {
    throw new Error(
      "Wire transfer is not configured. Set WIRE_BANK_NAME, WIRE_ROUTING_NUMBER, and WIRE_ACCOUNT_NUMBER.",
    );
  }

  const profile = await getProfile(investorId);
  if (!profile) throw new Error("Investor profile not found.");

  const amountCents = amountCentsForTrack(profile, track);
  if (!amountCents || amountCents <= 0) {
    throw new Error("Investment amount is not set.");
  }

  const wire = getWireConfig();
  const reference = wireReferenceForInvestor(investorId);

  let tx = await findPendingWireTransaction(investorId, track, amountCents);
  if (!tx) {
    tx = await createTransaction({
      investorId,
      track,
      method: "wire",
      amountCents,
      processor: "manual",
      wireReference: reference,
      status: "pending",
    });
    await syncProfilePaymentStatus(investorId, track, "pending");
  }

  return {
    beneficiary: wire.beneficiary,
    bankName: wire.bankName,
    routingNumber: wire.routingNumber,
    accountNumber: wire.accountNumber,
    address: wire.address,
    amountCents,
    wireReference: tx.wire_reference ?? reference,
    transactionId: tx.id,
  };
}
