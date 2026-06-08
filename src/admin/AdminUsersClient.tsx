"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/admin/AdminShell";
import type { AdminUserRow } from "@/lib/admin/admins";
import { C, FONT_DISPLAY } from "@/portal/tokens";
import { Field } from "@/portal/ui/Field";
import { Btn } from "@/portal/ui/Button";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString();
}

export function AdminUsersClient() {
  const [admins, setAdmins] = useState<AdminUserRow[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adding, setAdding] = useState(false);
  const [addErr, setAddErr] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr("");
    const [usersRes, meRes] = await Promise.all([
      fetch("/api/admin/users"),
      fetch("/api/admin/me"),
    ]);
    if (!usersRes.ok) throw new Error("Could not load admin users.");
    const usersData = (await usersRes.json()) as { admins: AdminUserRow[] };
    setAdmins(usersData.admins);
    if (meRes.ok) {
      const me = (await meRes.json()) as { id: string };
      setCurrentId(me.id);
    }
  }, []);

  useEffect(() => {
    load()
      .catch((e) => setErr(e instanceof Error ? e.message : "Failed to load."))
      .finally(() => setLoading(false));
  }, [load]);

  const closeModal = () => {
    if (adding) return;
    setShowModal(false);
    setEmail("");
    setPassword("");
    setAddErr("");
  };

  const handleAdd = async () => {
    setAdding(true);
    setAddErr("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Could not add admin.");
      setEmail("");
      setPassword("");
      setShowModal(false);
      await load();
    } catch (e) {
      setAddErr(e instanceof Error ? e.message : "Failed to add admin.");
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Remove this admin? They will lose ops access.")) return;
    setRemovingId(id);
    setErr("");
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Could not remove admin.");
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to remove admin.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <AdminShell
      title="Admin users"
      actions={
        <button
          type="button"
          onClick={() => setShowModal(true)}
          style={{
            background: C.amber,
            color: "#1A1206",
            border: "none",
            borderRadius: 8,
            padding: "10px 16px",
            fontSize: 12,
            fontFamily: FONT_DISPLAY,
            fontWeight: 600,
            letterSpacing: 0.8,
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          Add admin
        </button>
      }
    >
      {showModal ? (
        <div
          role="presentation"
          onClick={closeModal}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 100,
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-admin-title"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 420,
              background: C.card,
              border: `1px solid ${C.line}`,
              borderRadius: 12,
              padding: "24px 22px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 18,
              }}
            >
              <h2
                id="add-admin-title"
                style={{
                  margin: 0,
                  fontFamily: FONT_DISPLAY,
                  fontSize: 14,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                Add admin
              </h2>
              <button
                type="button"
                onClick={closeModal}
                disabled={adding}
                aria-label="Close"
                style={{
                  background: "transparent",
                  border: "none",
                  color: C.textDim,
                  fontSize: 20,
                  lineHeight: 1,
                  cursor: adding ? "not-allowed" : "pointer",
                  padding: 4,
                }}
              >
                ×
              </button>
            </div>

            <Field
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="admin@musichabitat.com"
            />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Min. 8 characters"
            />
            {addErr ? (
              <p style={{ color: C.red, fontSize: 13, margin: "0 0 8px" }}>{addErr}</p>
            ) : null}
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <Btn
                variant="ghost"
                disabled={adding}
                onClick={closeModal}
                style={{ flex: 1, marginTop: 0 }}
              >
                Cancel
              </Btn>
              <Btn
                variant="amber"
                disabled={adding || !email.trim() || password.length < 8}
                onClick={handleAdd}
                style={{ flex: 1, marginTop: 0 }}
              >
                {adding ? "Adding…" : "Add admin"}
              </Btn>
            </div>
          </div>
        </div>
      ) : null}

      {loading ? <p style={{ color: C.textDim }}>Loading…</p> : null}
      {err ? <p style={{ color: C.red }}>{err}</p> : null}

      {!loading ? (
        <div style={{ overflowX: "auto", border: `1px solid ${C.line}`, borderRadius: 10 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.card, textAlign: "left" }}>
                {["Email", "Added", "Access", ""].map((h) => (
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
                ))}
              </tr>
            </thead>
            <tbody>
              {admins.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: 16, color: C.textDim }}>
                    No admins found.
                  </td>
                </tr>
              ) : (
                admins.map((admin) => {
                  const isSelf = admin.id === currentId;
                  const accessLabel = admin.managed_in_portal
                    ? admin.in_env
                      ? "Portal + .env"
                      : "Portal"
                    : ".env only";
                  return (
                    <tr key={admin.id} style={{ borderBottom: `1px solid ${C.line}` }}>
                      <td style={{ padding: "10px 12px" }}>
                        {admin.email}
                        {isSelf ? (
                          <span style={{ color: C.textFaint, fontSize: 11, marginLeft: 8 }}>(you)</span>
                        ) : null}
                      </td>
                      <td style={{ padding: "10px 12px", color: C.textDim }}>
                        {formatDate(admin.created_at)}
                      </td>
                      <td style={{ padding: "10px 12px", color: C.textDim }}>{accessLabel}</td>
                      <td style={{ padding: "10px 12px" }}>
                        {!admin.managed_in_portal ? (
                          <span style={{ color: C.textFaint, fontSize: 12 }}>Managed in .env</span>
                        ) : (
                          <button
                            type="button"
                            disabled={isSelf || removingId === admin.id}
                            onClick={() => handleRemove(admin.id)}
                            style={{
                              background: "transparent",
                              border: `1px solid ${C.line}`,
                              color: isSelf ? C.textFaint : C.red,
                              borderRadius: 6,
                              padding: "6px 10px",
                              fontSize: 11,
                              cursor: isSelf ? "not-allowed" : "pointer",
                            }}
                          >
                            {removingId === admin.id ? "Removing…" : "Remove"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : null}
    </AdminShell>
  );
}
