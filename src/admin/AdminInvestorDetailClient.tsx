"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/admin/AdminShell";
import type { AdminInvestorRow } from "@/lib/admin/investors";
import type { PaymentTransactionRow } from "@/lib/payments/types";
import { guardianSerialToRoman } from "@/lib/portal/guardian-serial-format";
import { Btn } from "@/portal/ui/Button";
import { C } from "@/portal/tokens";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        padding: "10px 0",
        borderBottom: `1px solid ${C.line}`,
        fontSize: 13,
      }}
    >
      <span style={{ color: C.textDim }}>{label}</span>
      <span style={{ textAlign: "right" }}>{value}</span>
    </div>
  );
}

export function AdminInvestorDetailClient({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [investor, setInvestor] = useState<AdminInvestorRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  const [payments, setPayments] = useState<PaymentTransactionRow[]>([]);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const load = async () => {
    const [invRes, payRes] = await Promise.all([
      fetch(`/api/admin/investors/${id}`),
      fetch(`/api/admin/investors/${id}/payments`),
    ]);
    if (!invRes.ok) throw new Error("Could not load investor.");
    const invData = (await invRes.json()) as { investor: AdminInvestorRow };
    setInvestor(invData.investor);
    if (payRes.ok) {
      const payData = (await payRes.json()) as { transactions: PaymentTransactionRow[] };
      setPayments(payData.transactions);
    }
  };

  const confirmPayment = async (txId: string) => {
    if (!window.confirm("Confirm that funds have been received?")) return;
    setConfirmingId(txId);
    setErr("");
    try {
      const res = await fetch(`/api/admin/payments/${txId}/confirm`, { method: "POST" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Confirm failed.");
      setActionMsg("Payment confirmed.");
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Confirm failed.");
    } finally {
      setConfirmingId(null);
    }
  };

  useEffect(() => {
    load()
      .catch((e) => setErr(e instanceof Error ? e.message : "Failed to load."))
      .finally(() => setLoading(false));
  }, [id]);

  const closeInvestor = async () => {
    if (!investor) return;
    if (
      !window.confirm(
        `Close ${investor.full_name || investor.email} and assign the next Guardian serial?`,
      )
    ) {
      return;
    }
    setBusy(true);
    setActionMsg("");
    setErr("");
    try {
      const res = await fetch(`/api/admin/investors/${id}/close`, { method: "POST" });
      const data = (await res.json()) as { error?: string; guardian_serial_roman?: string };
      if (!res.ok) throw new Error(data.error || "Close failed.");
      setActionMsg(`Assigned Guardian № ${data.guardian_serial_roman}.`);
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Close failed.");
    } finally {
      setBusy(false);
    }
  };

  const amount =
    investor?.amount_cents != null
      ? `$${Math.round(investor.amount_cents / 100).toLocaleString()}`
      : "—";

  const canClose =
    investor?.offering_type === "friends_family" && investor.guardian_serial == null;

  return (
    <AdminShell title="Investor detail">
      <Link href="/admin/investors" style={{ color: C.textDim, fontSize: 13, textDecoration: "none" }}>
        ← Back to list
      </Link>

      {loading ? <p style={{ color: C.textDim, marginTop: 16 }}>Loading…</p> : null}
      {err ? <p style={{ color: C.red, marginTop: 16 }}>{err}</p> : null}
      {actionMsg ? <p style={{ color: C.green, marginTop: 16 }}>{actionMsg}</p> : null}

      {investor ? (
        <div
          style={{
            marginTop: 20,
            background: C.card,
            border: `1px solid ${C.line}`,
            borderRadius: 10,
            padding: "8px 16px 16px",
          }}
        >
          <DetailRow label="Name" value={investor.full_name || "—"} />
          <DetailRow label="Email" value={investor.email} />
          <DetailRow label="Phone" value={investor.phone || "—"} />
          <DetailRow
            label="Track"
            value={
              investor.offering_type === "friends_family"
                ? "Friends & Family"
                : investor.offering_type === "private"
                  ? "Private"
                  : "—"
            }
          />
          <DetailRow label="Amount" value={amount} />
          <DetailRow
            label="F&F progress"
            value={
              investor.ff_current_route
                ? `${investor.ff_current_route}${investor.ff_current_step != null ? ` (step ${investor.ff_current_step})` : ""}`
                : investor.nda_signed_ff
                  ? "NDA signed — not started"
                  : "—"
            }
          />
          <DetailRow
            label="Private progress"
            value={
              investor.private_current_route
                ? investor.private_current_route
                : investor.nda_signed_private
                  ? "NDA signed — not started"
                  : "—"
            }
          />
          <DetailRow label="Application status" value={investor.application_status || "—"} />
          <DetailRow
            label="Payment status"
            value={
              investor.offering_type === "private"
                ? investor.private_payment_status || "—"
                : investor.payment_status || "—"
            }
          />
          <DetailRow
            label="Guardian serial"
            value={
              investor.guardian_serial != null
                ? `№ ${guardianSerialToRoman(investor.guardian_serial)} (${investor.guardian_serial})`
                : "Not assigned"
            }
          />
          <DetailRow label="NDA (F&F)" value={investor.nda_signed_ff ? "Yes" : "No"} />
          <DetailRow label="NDA (Private)" value={investor.nda_signed_private ? "Yes" : "No"} />
          <DetailRow
            label="Signed up"
            value={new Date(investor.user_created_at).toLocaleString()}
          />
        </div>
      ) : null}

      {payments.length > 0 ? (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 15, marginBottom: 10 }}>Payment history</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {payments.map((tx) => (
              <div
                key={tx.id}
                style={{
                  background: C.card,
                  border: `1px solid ${C.line}`,
                  borderRadius: 10,
                  padding: "12px 14px",
                  fontSize: 13,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <span>
                    {tx.method.toUpperCase()} · $
                    {Math.round(tx.amount_cents / 100).toLocaleString()}
                  </span>
                  <span style={{ color: tx.status === "succeeded" ? C.green : C.textDim }}>
                    {tx.status}
                  </span>
                </div>
                {tx.wire_reference ? (
                  <div style={{ fontSize: 11, color: C.textFaint, marginTop: 4 }}>
                    Ref: {tx.wire_reference}
                  </div>
                ) : null}
                {tx.processor_id ? (
                  <div style={{ fontSize: 11, color: C.textFaint, marginTop: 2 }}>
                    {tx.processor_id}
                  </div>
                ) : null}
                {(tx.method === "wire" || tx.method === "check") && tx.status === "pending" ? (
                  <Btn
                    variant="amber"
                    disabled={confirmingId === tx.id}
                    onClick={() => confirmPayment(tx.id)}
                    style={{ marginTop: 10, padding: "6px 12px", fontSize: 12 }}
                  >
                    {confirmingId === tx.id ? "Confirming…" : "Confirm funds received"}
                  </Btn>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {canClose ? (
        <div style={{ marginTop: 20 }}>
          <Btn variant="amber" disabled={busy} onClick={closeInvestor}>
            {busy ? "Closing…" : "Close & assign Guardian serial"}
          </Btn>
          <p style={{ color: C.textFaint, fontSize: 12, marginTop: 10, lineHeight: 1.5 }}>
            Marks the investor complete, sets payment to cleared (if unset), and assigns the next
            available Circle 35 serial (1–35).
          </p>
        </div>
      ) : null}
    </AdminShell>
  );
}
