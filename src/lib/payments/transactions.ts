import { getSql } from "@/lib/db/client";
import type { PaymentStatus } from "@/lib/portal/db-types";
import type {
  PaymentMethod,
  PaymentProcessor,
  PaymentTrack,
  PaymentTransactionRow,
  TransactionStatus,
} from "@/lib/payments/types";

function mapRow(row: Record<string, unknown>): PaymentTransactionRow {
  return row as unknown as PaymentTransactionRow;
}

export function wireReferenceForInvestor(investorId: string): string {
  return `MH-${investorId.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

export async function getTransactionById(
  id: string,
): Promise<PaymentTransactionRow | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM payment_transactions WHERE id = ${id} LIMIT 1
  `;
  return rows[0] ? mapRow(rows[0] as Record<string, unknown>) : null;
}

export async function getTransactionByProcessorId(
  processorId: string,
): Promise<PaymentTransactionRow | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM payment_transactions
    WHERE processor_id = ${processorId}
    LIMIT 1
  `;
  return rows[0] ? mapRow(rows[0] as Record<string, unknown>) : null;
}

export async function findOpenAchTransaction(
  investorId: string,
  track: PaymentTrack,
  amountCents: number,
): Promise<PaymentTransactionRow | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM payment_transactions
    WHERE investor_id = ${investorId}
      AND track = ${track}
      AND method = 'ach'
      AND amount_cents = ${amountCents}
      AND status IN ('pending', 'processing')
    ORDER BY created_at DESC
    LIMIT 1
  `;
  return rows[0] ? mapRow(rows[0] as Record<string, unknown>) : null;
}

export async function findPendingWireTransaction(
  investorId: string,
  track: PaymentTrack,
  amountCents: number,
): Promise<PaymentTransactionRow | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM payment_transactions
    WHERE investor_id = ${investorId}
      AND track = ${track}
      AND method = 'wire'
      AND amount_cents = ${amountCents}
      AND status = 'pending'
    ORDER BY created_at DESC
    LIMIT 1
  `;
  return rows[0] ? mapRow(rows[0] as Record<string, unknown>) : null;
}

export async function createTransaction(input: {
  investorId: string;
  track: PaymentTrack;
  method: PaymentMethod;
  amountCents: number;
  processor?: PaymentProcessor;
  processorId?: string | null;
  wireReference?: string | null;
  status?: TransactionStatus;
  mandateAcceptedAt?: string | null;
}): Promise<PaymentTransactionRow> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO payment_transactions (
      investor_id,
      track,
      method,
      amount_cents,
      processor,
      processor_id,
      wire_reference,
      status,
      mandate_accepted_at
    ) VALUES (
      ${input.investorId},
      ${input.track},
      ${input.method},
      ${input.amountCents},
      ${input.processor ?? "manual"},
      ${input.processorId ?? null},
      ${input.wireReference ?? null},
      ${input.status ?? "pending"},
      ${input.mandateAcceptedAt ?? null}
    )
    RETURNING *
  `;
  return mapRow(rows[0] as Record<string, unknown>);
}

export async function updateTransactionStatus(
  id: string,
  status: TransactionStatus,
  extra?: { failureReason?: string | null; processorId?: string | null },
): Promise<PaymentTransactionRow | null> {
  const sql = getSql();
  const rows = await sql`
    UPDATE payment_transactions SET
      status = ${status},
      failure_reason = COALESCE(${extra?.failureReason ?? null}, failure_reason),
      processor_id = COALESCE(${extra?.processorId ?? null}, processor_id)
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0] ? mapRow(rows[0] as Record<string, unknown>) : null;
}

export async function listTransactionsForInvestor(
  investorId: string,
): Promise<PaymentTransactionRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM payment_transactions
    WHERE investor_id = ${investorId}
    ORDER BY created_at DESC
  `;
  return rows.map((r) => mapRow(r as Record<string, unknown>));
}

export async function listAllTransactions(): Promise<
  (PaymentTransactionRow & { investor_email: string; investor_name: string | null })[]
> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      t.*,
      u.email AS investor_email,
      p.full_name AS investor_name
    FROM payment_transactions t
    JOIN portal_users u ON u.id = t.investor_id
    LEFT JOIN investor_profiles p ON p.id = t.investor_id
    ORDER BY t.created_at DESC
  `;
  return rows.map((r) => {
    const row = r as Record<string, unknown>;
    return {
      ...mapRow(row),
      investor_email: row.investor_email as string,
      investor_name: (row.investor_name as string | null) ?? null,
    };
  });
}

function paymentStatusForTransaction(
  status: TransactionStatus,
): PaymentStatus | null {
  switch (status) {
    case "pending":
      return "pending";
    case "processing":
      return "authorized";
    case "succeeded":
      return "cleared";
    case "failed":
    case "returned":
      return "failed";
    default:
      return null;
  }
}

export async function syncProfilePaymentStatus(
  investorId: string,
  track: PaymentTrack,
  transactionStatus: TransactionStatus,
): Promise<void> {
  const paymentStatus = paymentStatusForTransaction(transactionStatus);
  if (!paymentStatus) return;

  const sql = getSql();
  const funded = paymentStatus === "cleared";

  if (track === "private") {
    await sql`
      UPDATE investor_profiles SET
        private_payment_status = ${paymentStatus},
        private_application_status = CASE
          WHEN ${funded} THEN 'funded'
          ELSE private_application_status
        END
      WHERE id = ${investorId}
    `;
  } else {
    await sql`
      UPDATE investor_profiles SET
        payment_status = ${paymentStatus},
        application_status = CASE
          WHEN ${funded} THEN 'funded'
          ELSE application_status
        END
      WHERE id = ${investorId}
    `;
  }
}
