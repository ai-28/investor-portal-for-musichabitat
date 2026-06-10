"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/admin/AdminShell";
import type { AdminInvestorRow } from "@/lib/admin/investors";
import { guardianSerialToRoman } from "@/lib/portal/guardian-serial-format";
import { C, FONT_DISPLAY } from "@/portal/tokens";

function trackLabel(track: AdminInvestorRow["offering_type"]) {
  if (track === "friends_family") return "F&F";
  if (track === "private") return "Private";
  return "—";
}

function progressLabel(inv: AdminInvestorRow): string {
  const parts: string[] = [];
  if (inv.ff_current_route) {
    parts.push(`F&F step ${inv.ff_current_step ?? "—"}`);
  }
  if (inv.private_current_route) {
    parts.push(`Private: ${inv.private_current_route}`);
  }
  return parts.length ? parts.join(" · ") : "—";
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString();
}

export function AdminInvestorsClient() {
  const [investors, setInvestors] = useState<AdminInvestorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/api/admin/investors")
      .then(async (res) => {
        if (!res.ok) throw new Error("Could not load investors.");
        const data = (await res.json()) as { investors: AdminInvestorRow[] };
        setInvestors(data.investors);
      })
      .catch((e) => setErr(e instanceof Error ? e.message : "Failed to load."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminShell title="Investors">
      {loading ? <p style={{ color: C.textDim }}>Loading…</p> : null}
      {err ? <p style={{ color: C.red }}>{err}</p> : null}
      {!loading && !err ? (
        <div style={{ overflowX: "auto", border: `1px solid ${C.line}`, borderRadius: 10 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.card, textAlign: "left" }}>
                {["Name", "Email", "Last track", "Progress", "Status", "Payment", "Guardian №", "Joined", ""].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 12px",
                        color: C.textDim,
                        fontFamily: FONT_DISPLAY,
                        fontSize: 10,
                        letterSpacing: 1,
                        textTransform: "uppercase",
                        borderBottom: `1px solid ${C.line}`,
                      }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {investors.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: 16, color: C.textDim }}>
                    No investors yet.
                  </td>
                </tr>
              ) : (
                investors.map((inv) => (
                  <tr key={inv.id} style={{ borderBottom: `1px solid ${C.line}` }}>
                    <td style={{ padding: "10px 12px" }}>{inv.full_name || "—"}</td>
                    <td style={{ padding: "10px 12px", color: C.textDim }}>{inv.email}</td>
                    <td style={{ padding: "10px 12px" }}>{trackLabel(inv.offering_type)}</td>
                    <td style={{ padding: "10px 12px" }}>{progressLabel(inv)}</td>
                    <td style={{ padding: "10px 12px" }}>{inv.application_status ?? "—"}</td>
                    <td style={{ padding: "10px 12px" }}>{inv.payment_status ?? "—"}</td>
                    <td style={{ padding: "10px 12px" }}>
                      {inv.guardian_serial != null
                        ? guardianSerialToRoman(inv.guardian_serial)
                        : "—"}
                    </td>
                    <td style={{ padding: "10px 12px", color: C.textDim }}>
                      {formatDate(inv.user_created_at)}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <Link href={`/admin/investors/${inv.id}`} style={{ color: C.amber, fontSize: 12 }}>
                        View →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}
      {!loading && investors.length > 0 ? (
        <p style={{ color: C.textFaint, fontSize: 12, marginTop: 12 }}>
          Amounts and close actions are on each investor detail page.
        </p>
      ) : null}
    </AdminShell>
  );
}
