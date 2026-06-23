import { getProfile } from "@/lib/portal/profile";
import type { PaymentStatus } from "@/lib/portal/db-types";
import { getSql } from "@/lib/db/client";
import type { PaymentMethod, PaymentTrack, TransactionStatus } from "@/lib/payments/types";

export interface FundingStatus {
  paymentStatus: PaymentStatus | null;
  /** ACH submitted or funds cleared (Stripe or profile). */
  achComplete: boolean;
  /** Investor marked certified check as mailed; awaiting admin deposit. */
  checkMailed: boolean;
  /** Wire instructions issued; awaiting incoming wire + admin confirm. */
  wirePending: boolean;
  openMethod: PaymentMethod | null;
  openTransactionStatus: TransactionStatus | null;
}

const OPEN_STATUSES: TransactionStatus[] = ["pending", "processing"];

export async function getFundingStatusForTrack(
  investorId: string,
  track: PaymentTrack,
): Promise<FundingStatus> {
  const profile = await getProfile(investorId);
  const paymentStatus =
    track === "private"
      ? (profile?.private_payment_status ?? null)
      : (profile?.payment_status ?? null);

  const sql = getSql();
  const rows = await sql`
    SELECT method, status
    FROM payment_transactions
    WHERE investor_id = ${investorId}
      AND track = ${track}
    ORDER BY created_at DESC
    LIMIT 10
  `;

  let openMethod: PaymentMethod | null = null;
  let openTransactionStatus: TransactionStatus | null = null;
  let checkMailed = false;
  let wirePending = false;
  let achSucceeded = false;

  for (const row of rows) {
    const method = row.method as PaymentMethod;
    const status = row.status as TransactionStatus;

    if (status === "succeeded" && method === "ach") {
      achSucceeded = true;
    }

    if (OPEN_STATUSES.includes(status)) {
      if (!openMethod) {
        openMethod = method;
        openTransactionStatus = status;
      }
      if (method === "check") checkMailed = true;
      if (method === "wire") wirePending = true;
    }
  }

  const achComplete =
    paymentStatus === "cleared" ||
    paymentStatus === "authorized" ||
    achSucceeded;

  return {
    paymentStatus,
    achComplete,
    checkMailed,
    wirePending,
    openMethod,
    openTransactionStatus,
  };
}
