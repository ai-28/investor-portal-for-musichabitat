"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/admin/AdminShell";
import { Btn } from "@/portal/ui/Button";
import { C } from "@/portal/tokens";
import type { PaymentTransactionRow } from "@/lib/payments/types";

type AdminPaymentRow = PaymentTransactionRow & {
  investor_email: string;
  investor_name: string | null;
};

function formatAmount(cents: number) {
  return `$${Math.round(cents / 100).toLocaleString()}`;
}

function statusColor(status: string) {
  switch (status) {
    case "succeeded":
      return C.green;
    case "failed":
    case "returned":
      return C.red;
    case "processing":
      return C.amber;
    default:
      return C.textDim;
  }
}

export function AdminPaymentsClient() {
  const [rows, setRows] = useState<AdminPaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch("/api/admin/payments");
    if (!res.ok) throw new Error("Could not load payments.");
    const data = (await res.json()) as { transactions: AdminPaymentRow[] };
    setRows(data.transactions);
  };

  useEffect(() => {
    load()
      .catch((e) => setErr(e instanceof Error ? e.message : "Failed to load."))
      .finally(() => setLoading(false));
  }, []);

  const confirm = async (id: string) => {
    if (!window.confirm("Confirm that funds have been received for this payment?")) return;
    setBusyId(id);
    setErr("");
    try {
      const res = await fetch(`/api/admin/payments/${id}/confirm`, { method: "POST" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Confirm failed.");
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Confirm failed.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminShell title="Payments">
      {loading ? <p style={{ color: C.textDim }}>Loading…</p> : null}
      {err ? <p style={{ color: C.red }}>{err}</p> : null}

      {!loading && rows.length === 0 ? (
        <p style={{ color: C.textDim }}>No payment transactions yet.</p>
      ) : null}

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
        {rows.map((tx) => (
          <div
            key={tx.id}
            style={{
              background: C.card,
              border: `1px solid ${C.line}`,
              borderRadius: 10,
              padding: "14px 16px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  {tx.investor_name || tx.investor_email}
                </div>
                <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>
                  {tx.method.toUpperCase()} · {tx.track === "private" ? "Private" : "F&F"} ·{" "}
                  {formatAmount(tx.amount_cents)}
                </div>
                {tx.wire_reference ? (
                  <div style={{ fontSize: 11, color: C.textFaint, marginTop: 4 }}>
                    Ref: {tx.wire_reference}
                  </div>
                ) : null}
                {tx.processor_id ? (
                  <div style={{ fontSize: 11, color: C.textFaint, marginTop: 2 }}>
                    Stripe: {tx.processor_id}
                  </div>
                ) : null}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: statusColor(tx.status) }}>
                  {tx.status}
                </div>
                <div style={{ fontSize: 11, color: C.textFaint, marginTop: 4 }}>
                  {new Date(tx.created_at).toLocaleString()}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 12,
                flexWrap: "wrap",
              }}
            >
              <Link
                href={`/admin/investors/${tx.investor_id}`}
                style={{ fontSize: 12, color: C.textDim, textDecoration: "none" }}
              >
                View investor →
              </Link>
              {(tx.method === "wire" || tx.method === "check") && tx.status === "pending" ? (
                <Btn
                  variant="amber"
                  disabled={busyId === tx.id}
                  onClick={() => confirm(tx.id)}
                  style={{ padding: "6px 12px", fontSize: 12 }}
                >
                  {busyId === tx.id ? "Confirming…" : "Confirm received"}
                </Btn>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
