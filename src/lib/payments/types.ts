import type { OfferingType } from "@/lib/portal/db-types";

export type PaymentMethod = "ach" | "wire" | "check";
export type PaymentProcessor = "stripe" | "manual";
export type TransactionStatus =
  | "pending"
  | "processing"
  | "succeeded"
  | "failed"
  | "returned";

export type PaymentTrack = OfferingType;

export interface PaymentTransactionRow {
  id: string;
  investor_id: string;
  track: PaymentTrack;
  method: PaymentMethod;
  amount_cents: number;
  currency: string;
  status: TransactionStatus;
  processor: PaymentProcessor;
  processor_id: string | null;
  wire_reference: string | null;
  mandate_accepted_at: string | null;
  failure_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface WireInstructions {
  beneficiary: string;
  bankName: string;
  routingNumber: string;
  accountNumber: string;
  address: string;
  amountCents: number;
  wireReference: string;
  transactionId: string;
}
