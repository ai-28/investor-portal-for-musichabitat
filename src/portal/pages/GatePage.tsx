"use client";

import { useCallback, useEffect, useState } from "react";
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
  const { user, authLoading, signOut, refreshState, go } = usePortal();

  const [mode, setMode] = useState<AuthMode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formBusy, setFormBusy] = useState(false);
  const [err, setErr] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
      setMode("signin");
    }
  }, [user?.email]);

  const continueIntoTrack = useCallback(async () => {
    const state = await patchPortalState({ offering_type: offeringType });
    await refreshState();
    const track = state.offeringType ?? offeringType;
    const trackRoute =
      track === "private" ? state.privateCurrentRoute : state.ffCurrentRoute;
    const trackStep =
      track === "private" ? state.privateCurrentStep : state.ffCurrentStep;
    const nextRoute = resumeRouteFromProfile(
      track,
      trackRoute,
      state.ndaSignedFf,
      state.ndaSignedPrivate,
      trackStep,
    );
      go(nextRoute, { replace: true });
  }, [go, offeringType, refreshState]);

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
  };

  const handleSignUp = async () => {
    setFormBusy(true);
    setErr("");
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
      await continueIntoTrack();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Sign up failed.");
    } finally {
      setFormBusy(false);
    }
  };

  const handleSignIn = async () => {
    setFormBusy(true);
    setErr("");
    try {
      await credentialsSignIn();
      await continueIntoTrack();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Sign in failed.");
    } finally {
      setFormBusy(false);
    }
  };

  const submit = () => {
    if (mode === "signup") void handleSignUp();
    else void handleSignIn();
  };

  if (!mounted || authLoading) {
    return (
      <Shell onBack={onBack}>
        <div style={{ paddingTop: 80, textAlign: "center", color: C.textDim }}>
          Loading…
        </div>
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

      {user ? (
        <div
          style={{
            marginBottom: 16,
            padding: "12px 14px",
            borderRadius: 8,
            background: C.cardHi,
            border: `1px solid ${C.line}`,
            fontSize: 13,
            color: C.textDim,
            lineHeight: 1.5,
          }}
        >
          Signed in as <strong style={{ color: C.text }}>{user.email}</strong>.
          Enter your password below to continue, or{" "}
          <button
            type="button"
            onClick={() => void signOut()}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              color: accent,
              cursor: "pointer",
              fontFamily: FONT_DISPLAY,
              fontSize: 13,
              textDecoration: "underline",
            }}
          >
            sign out
          </button>{" "}
          to use a different account.
        </div>
      ) : null}

      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {(["signup", "signin"] as AuthMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setErr("");
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

      {err ? (
        <div style={{ color: C.red, fontSize: 13, marginBottom: 10 }}>{err}</div>
      ) : null}

      <Btn variant="amber" onClick={submit} disabled={formBusy || !email.trim() || !password}>
        {formBusy
          ? "Please wait…"
          : mode === "signup"
            ? "Create account & continue"
            : "Sign in & continue"}
      </Btn>

      <p style={{ textAlign: "center", color: C.textFaint, fontSize: 12, marginTop: 16 }}>
        {mode === "signup"
          ? "By continuing you agree to review the offering documents before investing."
          : "Use the email and password you registered with."}
      </p>
    </Shell>
  );
}
