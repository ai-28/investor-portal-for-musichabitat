"use client";

import { useEffect, useState } from "react";
import { signIn, signOut } from "next-auth/react";
import { AdminShell } from "@/admin/AdminShell";
import { C, FONT_DISPLAY } from "@/portal/tokens";
import { Field } from "@/portal/ui/Field";
import { Btn } from "@/portal/ui/Button";

export function AdminProfileClient() {
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    fetch("/api/admin/me")
      .then(async (res) => {
        if (!res.ok) throw new Error("Could not load profile.");
        const data = (await res.json()) as { email: string };
        setEmail(data.email);
        setNewEmail(data.email);
      })
      .catch((e) => setErr(e instanceof Error ? e.message : "Failed to load."))
      .finally(() => setLoading(false));
  }, []);

  const emailChanged = newEmail.trim().toLowerCase() !== email.trim().toLowerCase();
  const passwordChanged = newPassword.length > 0;
  const canSave =
    (emailChanged || passwordChanged) &&
    currentPassword.length > 0 &&
    (!passwordChanged || (newPassword.length >= 8 && newPassword === confirmPassword));

  const handleSave = async () => {
    setSaving(true);
    setErr("");
    setInfo("");
    try {
      if (passwordChanged && newPassword !== confirmPassword) {
        throw new Error("New passwords do not match.");
      }

      const body: { email?: string; password?: string; currentPassword: string } = {
        currentPassword,
      };
      if (emailChanged) body.email = newEmail.trim();
      if (passwordChanged) body.password = newPassword;

      const res = await fetch("/api/admin/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { error?: string; email?: string };
      if (!res.ok) throw new Error(data.error || "Could not update profile.");

      const updatedEmail = data.email ?? newEmail.trim();
      setEmail(updatedEmail);
      setNewEmail(updatedEmail);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setInfo("Profile updated.");

      if (emailChanged) {
        await signOut({ redirect: false });
        const result = await signIn("credentials", {
          email: updatedEmail,
          password: passwordChanged ? newPassword : currentPassword,
          redirect: false,
        });
        if (result?.error) {
          setInfo("Profile updated. Please sign in again with your new credentials.");
        }
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell title="Profile" centerContent>
      {loading ? <p style={{ color: C.textDim, textAlign: "center" }}>Loading…</p> : null}

      {!loading ? (
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            background: C.card,
            border: `1px solid ${C.line}`,
            borderRadius: 10,
            padding: "20px 18px",
          }}
        >
          <h2
            style={{
              margin: "0 0 14px",
              fontFamily: FONT_DISPLAY,
              fontSize: 12,
              letterSpacing: 1,
              textTransform: "uppercase",
              color: C.textDim,
            }}
          >
            Account
          </h2>

          <Field label="Email" type="email" value={newEmail} onChange={setNewEmail} placeholder={email} />
          <Field
            label="New password"
            type="password"
            value={newPassword}
            onChange={setNewPassword}
            placeholder="Leave blank to keep current"
          />
          <Field
            label="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Repeat new password"
          />
          <Field
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={setCurrentPassword}
            placeholder="Required to save changes"
          />

          {err ? <p style={{ color: C.red, fontSize: 13, margin: "0 0 8px" }}>{err}</p> : null}
          {info ? <p style={{ color: C.teal, fontSize: 13, margin: "0 0 8px" }}>{info}</p> : null}

          <Btn variant="amber" disabled={saving || !canSave} onClick={handleSave}>
            {saving ? "Saving…" : "Save changes"}
          </Btn>
        </div>
      ) : null}
    </AdminShell>
  );
}
