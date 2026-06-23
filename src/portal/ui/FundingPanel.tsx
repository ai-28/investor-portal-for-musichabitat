"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { C, FONT_BODY, FONT_DISPLAY } from "@/portal/tokens";
import { Card } from "@/portal/ui/Card";
import { FUNDING } from "@/portal/data/doc-config";
import { usePortal } from "@/portal/PortalProvider";
import type { PaymentStatus } from "@/lib/portal/db-types";
import type { PaymentTrack } from "@/lib/payments/types";

type Accent = "amber" | "teal";

interface FundingPanelProps {
  track: PaymentTrack;
  amount: number;
  accent: Accent;
  investorName?: string;
  onReadyToContinue?: () => void;
}

interface PaymentConfig {
  achEnabled: boolean;
  publishableKey: string | null;
}

const accentColor = (accent: Accent) => (accent === "teal" ? C.teal : C.amber);

const stripePromises = new Map<string, ReturnType<typeof loadStripe>>();

function getStripePromise(publishableKey: string) {
  let promise = stripePromises.get(publishableKey);
  if (!promise) {
    promise = loadStripe(publishableKey);
    stripePromises.set(publishableKey, promise);
  }
  return promise;
}

type AchIntentResponse = {
  clientSecret?: string;
  transactionId?: string;
  alreadyCompleted?: boolean;
  error?: string;
};

type FundingStatusResponse = {
  paymentStatus: PaymentStatus | null;
  achComplete: boolean;
  checkMailed: boolean;
};

const achIntentInflight = new Map<PaymentTrack, Promise<AchIntentResponse>>();
const achIntentCache = new Map<PaymentTrack, AchIntentResponse>();

function isTrackFundingComplete(
  track: PaymentTrack,
  paymentStatus: PaymentStatus | null,
  privatePaymentStatus: PaymentStatus | null,
): boolean {
  const status = track === "private" ? privatePaymentStatus : paymentStatus;
  return status === "cleared" || status === "authorized";
}

function markAchCompleted(track: PaymentTrack, transactionId = "") {
  achIntentCache.set(track, { transactionId, alreadyCompleted: true });
}

async function fetchAchIntent(track: PaymentTrack): Promise<AchIntentResponse> {
  const cached = achIntentCache.get(track);
  if (cached?.alreadyCompleted) return cached;

  const inflight = achIntentInflight.get(track);
  if (inflight) return inflight;

  const promise = (async () => {
    const res = await fetch("/api/payments/ach/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ track }),
    });
    const data = (await res.json()) as AchIntentResponse;
    if (!res.ok) throw new Error(data.error || "Could not start ACH payment.");
    if (data.alreadyCompleted) {
      achIntentCache.set(track, data);
    }
    return data;
  })();

  achIntentInflight.set(track, promise);
  try {
    return await promise;
  } finally {
    achIntentInflight.delete(track);
  }
}

function AchCheckoutForm({
  amount,
  accent,
  onSuccess,
}: {
  amount: number;
  accent: Accent;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [elementReady, setElementReady] = useState(false);
  const [elementLoadFailed, setElementLoadFailed] = useState(false);

  const submit = async () => {
    if (!stripe || !elements || !elementReady) return;
    setBusy(true);
    setErr("");
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });
      if (error) {
        setErr(error.message ?? "Payment failed.");
        return;
      }
      if (
        paymentIntent?.status === "succeeded" ||
        paymentIntent?.status === "processing" ||
        paymentIntent?.status === "requires_action"
      ) {
        onSuccess();
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Payment failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div
        style={{
          minHeight: elementLoadFailed ? 0 : 120,
          marginBottom: 4,
        }}
      >
        {elementLoadFailed ? null : (
          <PaymentElement
            onReady={() => setElementReady(true)}
            onLoadError={(event) => {
              setElementLoadFailed(true);
              setElementReady(false);
              setErr(
                event.error?.message ??
                  "Could not load the bank form. Refresh the page or reset your test payment and try again.",
              );
            }}
            options={{
              layout: "accordion",
              wallets: {
                applePay: "never",
                googlePay: "never",
              },
            }}
          />
        )}
      </div>
      {!elementReady && !elementLoadFailed ? (
        <p style={{ fontSize: 12, color: C.textDim, marginBottom: 8 }}>
          Loading secure bank form…
        </p>
      ) : null}
      <p
        style={{
          fontSize: 11,
          color: C.textFaint,
          lineHeight: 1.5,
          margin: "12px 0 0",
        }}
      >
        By continuing, you authorize Music Habitat, Inc. to electronically debit $
        {amount.toLocaleString()} from your linked bank account via ACH. This is a
        one-time debit. Funds typically settle in 1–4 business days.
      </p>
      {err ? (
        <p style={{ fontSize: 12, color: C.red, marginTop: 10 }}>{err}</p>
      ) : null}
      <button
        type="button"
        onClick={submit}
        disabled={!stripe || busy || !elementReady || elementLoadFailed}
        style={{
          width: "100%",
          marginTop: 12,
          padding: "13px 0",
          borderRadius: 10,
          background: accentColor(accent),
          color: accent === "amber" ? "#1A1206" : "#fff",
          border: "none",
          fontWeight: 700,
          fontSize: 14,
          cursor: busy ? "default" : "pointer",
          opacity: busy ? 0.6 : 1,
          fontFamily: FONT_DISPLAY,
        }}
      >
        {busy ? "Processing…" : "Authorize ACH Debit"}
      </button>
    </div>
  );
}

function AchStripeForm({
  clientSecret,
  publishableKey,
  amount,
  accent,
  onSuccess,
}: {
  clientSecret: string;
  publishableKey: string;
  amount: number;
  accent: Accent;
  onSuccess: () => void;
}) {
  const stripePromise = useMemo(
    () => getStripePromise(publishableKey),
    [publishableKey],
  );

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "night",
          variables: {
            colorPrimary: accentColor(accent),
            colorBackground: "#141210",
            colorText: "#F5F0E8",
            borderRadius: "10px",
          },
        },
      }}
    >
      <AchCheckoutForm amount={amount} accent={accent} onSuccess={onSuccess} />
    </Elements>
  );
}

export function FundingPanel({
  track,
  amount,
  accent,
  onReadyToContinue,
}: FundingPanelProps) {
  const { paymentStatus, privatePaymentStatus, refreshState, recordPaymentStatus } =
    usePortal();
  const [method, setMethod] = useState<"ach" | "check">("ach");
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [achDone, setAchDone] = useState(false);
  const [achClientSecret, setAchClientSecret] = useState<string | null>(null);
  const [achStarting, setAchStarting] = useState(false);
  const [achStartErr, setAchStartErr] = useState("");
  const [checkPending, setCheckPending] = useState(false);

  const handleAchSuccess = useCallback(() => {
    setAchDone(true);
    markAchCompleted(track);
    onReadyToContinue?.();
    recordPaymentStatus("authorized", track).catch(() => {});
  }, [track, onReadyToContinue, recordPaymentStatus]);

  const trackPaymentStatus =
    track === "private" ? privatePaymentStatus : paymentStatus;
  const fundingSettled = trackPaymentStatus === "cleared";

  useEffect(() => {
    refreshState();
  }, [track, refreshState]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/payments/funding-status?track=${track}`);
        if (!res.ok) return;
        const data = (await res.json()) as FundingStatusResponse;
        if (cancelled) return;
        if (data.achComplete) {
          setAchDone(true);
          markAchCompleted(track);
          onReadyToContinue?.();
        }
        if (data.checkMailed) {
          setCheckPending(true);
          onReadyToContinue?.();
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [track, onReadyToContinue]);

  useEffect(() => {
    if (isTrackFundingComplete(track, paymentStatus, privatePaymentStatus)) {
      setAchDone(true);
      markAchCompleted(track);
      onReadyToContinue?.();
    }
  }, [track, paymentStatus, privatePaymentStatus, onReadyToContinue]);

  const startAchLinking = useCallback(async () => {
    setAchStarting(true);
    setAchStartErr("");
    try {
      const data = await fetchAchIntent(track);
      if (data.alreadyCompleted) {
        handleAchSuccess();
        return;
      }
      if (!data.clientSecret) {
        throw new Error("ACH unavailable.");
      }
      setAchClientSecret(data.clientSecret);
    } catch (e) {
      setAchStartErr(
        e instanceof Error ? e.message : "Could not start ACH payment.",
      );
    } finally {
      setAchStarting(false);
    }
  }, [track, handleAchSuccess]);

  const color = accentColor(accent);

  useEffect(() => {
    fetch("/api/payments/config")
      .then((r) => r.json())
      .then((data: PaymentConfig & { wireEnabled?: boolean }) => {
        setConfig({ achEnabled: data.achEnabled, publishableKey: data.publishableKey });
        if (data.achEnabled) setMethod("ach");
      })
      .catch(() => setConfig({ achEnabled: false, publishableKey: null }));
  }, []);

  const selectMethod = (id: "ach" | "check") => {
    setMethod(id);
  };

  const markCheckPending = async () => {
    try {
      await fetch("/api/payments/check/pending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ track }),
      });
      setCheckPending(true);
      onReadyToContinue?.();
    } catch {
      /* still allow continue */
      setCheckPending(true);
      onReadyToContinue?.();
    }
  };

  const methods = [
    {
      id: "ach" as const,
      icon: "💳",
      label: "ACH Transfer",
      sub: config?.achEnabled ? "1–4 business days" : "Unavailable",
      disabled: !config?.achEnabled,
    },
    {
      id: "check" as const,
      icon: "✉️",
      label: "Certified Check",
      sub: "By mail",
      disabled: false,
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {methods.map((m) => {
          const active = method === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => !m.disabled && selectMethod(m.id)}
              style={{
                flex: 1,
                padding: "14px 6px",
                borderRadius: 12,
                cursor: m.disabled ? "default" : "pointer",
                background: active ? C.cardHi : C.card,
                border: `1px solid ${active ? color : C.line}`,
                opacity: m.disabled ? 0.45 : 1,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 20 }}>{m.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 600, marginTop: 6 }}>{m.label}</div>
              <div style={{ fontSize: 10, color: C.textFaint, marginTop: 2 }}>{m.sub}</div>
            </button>
          );
        })}
      </div>

      <Card>
        {method === "ach" && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color, marginBottom: 4 }}>
              ACH Bank Transfer
            </div>
            {achDone ? (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <div style={{ fontSize: 30, marginBottom: 8 }}>✓</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.green }}>
                  {fundingSettled
                    ? "Payment received"
                    : "ACH authorization submitted"}
                </div>
                <p
                  style={{
                    fontSize: 12.5,
                    color: C.textDim,
                    lineHeight: 1.5,
                    margin: "8px 0 0",
                  }}
                >
                  {fundingSettled
                    ? `Your $${amount.toLocaleString()} debit has cleared. We'll confirm your subscription once the Company accepts it.`
                    : `Your debit of $${amount.toLocaleString()} is processing. You'll be notified once funds clear (typically 1–4 business days).`}
                </p>
              </div>
            ) : config?.achEnabled && config.publishableKey ? (
              <>
                <p
                  style={{
                    fontSize: 12,
                    color: C.textFaint,
                    lineHeight: 1.5,
                    margin: "0 0 8px",
                  }}
                >
                  Link your bank account securely. Your account details are tokenized by
                  Stripe — Music Habitat never stores raw account numbers.
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: C.textFaint,
                    lineHeight: 1.5,
                    margin: "0 0 14px",
                    padding: "8px 10px",
                    borderRadius: 8,
                    background: C.cardHi,
                    border: `1px solid ${C.line}`,
                  }}
                >
                  <strong style={{ color: C.textDim }}>Testing:</strong> choose{" "}
                  <strong style={{ color: color }}>Test (Non-OAuth)</strong> in the bank
                  search — it stays in this page (no extra login tabs). If you use Bank
                  (OAuth), select <strong>only one</strong> account in the popup before
                  Agree and Continue.
                </p>
                {achStartErr ? (
                  <p style={{ fontSize: 12, color: C.red, marginBottom: 10 }}>{achStartErr}</p>
                ) : null}
                {!achClientSecret ? (
                  <button
                    type="button"
                    onClick={startAchLinking}
                    disabled={achStarting}
                    style={{
                      width: "100%",
                      padding: "13px 0",
                      borderRadius: 10,
                      background: color,
                      color: accent === "amber" ? "#1A1206" : "#fff",
                      border: "none",
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: achStarting ? "default" : "pointer",
                      opacity: achStarting ? 0.6 : 1,
                      fontFamily: FONT_DISPLAY,
                    }}
                  >
                    {achStarting ? "Preparing…" : "Link my bank account"}
                  </button>
                ) : (
                  <AchStripeForm
                    clientSecret={achClientSecret}
                    publishableKey={config.publishableKey}
                    amount={amount}
                    accent={accent}
                    onSuccess={handleAchSuccess}
                  />
                )}
              </>
            ) : (
              <p style={{ fontSize: 13, color: C.textDim }}>
                ACH is not available yet. Please contact us to complete funding.
              </p>
            )}
          </div>
        )}

        {method === "check" && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color, marginBottom: 10 }}>
              Mail a Certified Check
            </div>
            {[
              ["Payable to", FUNDING.checkPayee],
              ["Mail to", FUNDING.checkAddress],
              ["Amount", `$${amount.toLocaleString()}`],
            ].map(([k, v]) => (
              <div
                key={k}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: `1px solid ${C.line}`,
                  fontSize: 13,
                }}
              >
                <span style={{ color: C.textFaint }}>{k}</span>
                <span style={{ color: C.text, textAlign: "right", maxWidth: "60%" }}>
                  {v}
                </span>
              </div>
            ))}
            {!checkPending ? (
              <button
                type="button"
                onClick={markCheckPending}
                style={{
                  width: "100%",
                  marginTop: 14,
                  padding: "11px 0",
                  borderRadius: 10,
                  background: "transparent",
                  color: color,
                  border: `1px solid ${color}`,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: FONT_BODY,
                }}
              >
                I've mailed my check
              </button>
            ) : (
              <p style={{ fontSize: 12, color: C.green, marginTop: 12, lineHeight: 1.5 }}>
                Check recorded as pending. Mail your certified check to the address above.
                An admin will confirm once it is received and deposited — you are not funded
                until then.
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
