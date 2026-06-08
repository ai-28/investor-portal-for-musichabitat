"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { C, FONT_DISPLAY } from "@/portal/tokens";
import { Shell } from "@/portal/ui/Shell";
import { H, Kicker } from "@/portal/ui/Typography";
import { Btn } from "@/portal/ui/Button";
import { Field } from "@/portal/ui/Field";
import { usePortal } from "@/portal/PortalProvider";
import { patchPortalState } from "@/lib/portal/sync-client";
import { resumeRouteFromProfile } from "@/lib/portal/state";
import type { AuthMode, GatePageProps } from "@/portal/types";

const MODE_LABELS: Record<AuthMode, string> = {
  signin: "Sign in",
  signup: "Create account",
};

export function GatePage({
  title,
  accent,
  offeringType,
  onBack,
}: GatePageProps) {
  const { user, authLoading, hydrated, signOut, refreshState, go } = usePortal();

  const [mode, setMode] = useState<AuthMode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user?.email]);

  const finishAuth = async () => {
    setBusy(true);
    setErr("");
    try {
      const state = await patchPortalState({ offering_type: offeringType });
      await refreshState();
      const nextRoute = resumeRouteFromProfile(
        state.offeringType ?? offeringType,
        state.currentRoute,
        state.ndaSignedFf,
        state.ndaSignedPrivate,
        state.currentStep,
      );
      go(nextRoute);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save your profile.");
    } finally {
      setBusy(false);
    }
  };

  const credentialsSignIn = async () => {
    const result = await signIn("credentials", {
      email: email.trim(),
      password,
      redirect: false,
    });
    if (result?.error) {
      throw new Error("Invalid email or password.");
    }
    if (result?.ok === false) {
      throw new Error("Sign in failed.");
    }
    await finishAuth();
  };

  const handleSignUp = async () => {
    setBusy(true);
    setErr("");
    setInfo("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          offering_type: offeringType,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Sign up failed.");
      }
      await credentialsSignIn();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Sign up failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleSignIn = async () => {
    setBusy(true);
    setErr("");
    setInfo("");
    try {
      await credentialsSignIn();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Sign in failed.");
    } finally {
      setBusy(false);
    }
  };

  const submit = () => {
    if (mode === "signup") handleSignUp();
    else handleSignIn();
  };

  if (!mounted || authLoading || (user && !hydrated)) {
    return (
      <Shell onBack={onBack}>
        <div style={{ paddingTop: 80, textAlign: "center", color: C.textDim }}>
          Loading…
        </div>
      </Shell>
    );
  }

  if (user) {
    return (
      <Shell onBack={onBack}>
        <div style={{ paddingTop: 40, textAlign: "center" }}>
          <div style={{ fontSize: 34 }}>✓</div>
          <Kicker color={accent}>Signed in</Kicker>
          <H size={28}>Welcome back</H>
          <p style={{ color: C.textDim, fontSize: 14, margin: "8px 0 28px" }}>
            {user.email}
          </p>
        </div>
        {err ? (
          <div style={{ color: C.red, fontSize: 13, marginBottom: 10, textAlign: "center" }}>
            {err}
          </div>
        ) : null}
        <Btn variant="amber" onClick={finishAuth} disabled={busy}>
          {busy ? "Please wait…" : `Continue to ${title}`}
        </Btn>
        <Btn variant="ghost" onClick={() => signOut()} disabled={busy}>
          Sign out
        </Btn>
        <p style={{ textAlign: "center", color: C.textFaint, fontSize: 12, marginTop: 12 }}>
          You can pick up where you left off.
        </p>
      </Shell>
    );
  }

  return (
    <Shell onBack={onBack}>
      <div style={{ paddingTop: 40, textAlign: "center" }}>
        <div style={{ fontSize: 34 }}>🔒</div>
        <Kicker color={accent}>Investor access</Kicker>
        <H size={28}>{title}</H>
        <p style={{ color: C.textDim, fontSize: 14, margin: "8px 0 28px" }}>
          Create an account or sign in with email and password. No confirmation email required.
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {(["signup", "signin"] as AuthMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setErr("");
              setInfo("");
            }}
            style={{
              flex: 1,
              padding: "10px 8px",
              borderRadius: 8,
              cursor: "pointer",
              fontFamily: FONT_DISPLAY,
              fontSize: 11,
              letterSpacing: 0.5,
              textTransform: "uppercase",
              background: mode === m ? accent : C.card,
              color: mode === m ? "#1A1206" : C.textDim,
              border: `1px solid ${mode === m ? accent : C.line}`,
            }}
          >
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>

      <Field
        label="Email"
        value={email}
        onChange={setEmail}
        type="email"
        placeholder="you@email.com"
      />
      <Field
        label="Password"
        value={password}
        onChange={setPassword}
        type="password"
        placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
      />

      {err && (
        <div style={{ color: C.red, fontSize: 13, marginBottom: 10 }}>{err}</div>
      )}
      {info && (
        <div style={{ color: C.teal, fontSize: 13, marginBottom: 10, lineHeight: 1.5 }}>
          {info}
        </div>
      )}

      <Btn variant="amber" onClick={submit} disabled={busy || !email.trim() || !password}>
        {busy
          ? "Please wait…"
          : mode === "signup"
            ? "Create account & continue"
            : "Sign in"}
      </Btn>

      <p style={{ textAlign: "center", color: C.textFaint, fontSize: 12, marginTop: 16 }}>
        {mode === "signup"
          ? "By continuing you agree to review the offering documents before investing."
          : "Use the email and password you registered with."}
      </p>
    </Shell>
  );
}
