"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/admin/AdminShell";
import type { AdminInvestorRow } from "@/lib/admin/investors";
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

  const load = async () => {
    const res = await fetch(`/api/admin/investors/${id}`);
    if (!res.ok) throw new Error("Could not load investor.");
    const data = (await res.json()) as { investor: AdminInvestorRow };
    setInvestor(data.investor);
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
          <DetailRow label="Step" value={investor.current_step != null ? String(investor.current_step) : "—"} />
          <DetailRow label="Route" value={investor.current_route || "—"} />
          <DetailRow label="Application status" value={investor.application_status || "—"} />
          <DetailRow label="Payment status" value={investor.payment_status || "—"} />
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
