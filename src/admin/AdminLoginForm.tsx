"use client";

import { useState } from "react";
import { signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { C, FONT_BODY, FONT_DISPLAY } from "@/portal/tokens";
import { Field } from "@/portal/ui/Field";
import { Btn } from "@/portal/ui/Button";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    setBusy(true);
    setErr("");
    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });
      if (result?.error || result?.ok === false) {
        throw new Error("Invalid email or password.");
      }

      const me = await fetch("/api/admin/me");
      if (!me.ok) {
        await signOut({ redirect: false });
        throw new Error("This account is not authorized for admin access.");
      }

      router.push("/admin/investors");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Sign in failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        fontFamily: FONT_BODY,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: C.card,
          border: `1px solid ${C.line}`,
          borderRadius: 12,
          padding: "28px 24px",
        }}
      >
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 12,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            color: C.textDim,
            marginBottom: 8,
          }}
        >
          Music Habitat
        </div>
        <h1 style={{ margin: "0 0 6px", fontFamily: FONT_DISPLAY, fontSize: 24 }}>Ops sign in</h1>
        <p style={{ margin: "0 0 20px", color: C.textDim, fontSize: 13, lineHeight: 1.5 }}>
          Internal access for investor management. Not part of the public investor portal.
        </p>

        <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@musichabitat.com" />
        <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />

        {err ? (
          <p style={{ color: C.red, fontSize: 13, margin: "0 0 12px" }}>{err}</p>
        ) : null}

        <Btn variant="amber" disabled={busy || !email.trim() || !password} onClick={submit}>
          {busy ? "Signing in…" : "Sign in"}
        </Btn>
      </div>
    </div>
  );
}
