"use client";

import { useCallback, useEffect, useState } from "react";
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
  wireEnabled: boolean;
  publishableKey: string | null;
}

interface WireData {
  beneficiary: string;
  bankName: string;
  routingNumber: string;
  accountNumber: string;
  address: string;
  amountCents: number;
  wireReference: string;
  transactionId: string;
}

const accentColor = (accent: Accent) => (accent === "teal" ? C.teal : C.amber);

function CopyButton({ text, accent }: { text: string; accent: Accent }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      style={{
        marginLeft: 8,
        padding: "2px 8px",
        fontSize: 10,
        borderRadius: 6,
        border: `1px solid ${C.line}`,
        background: "transparent",
        color: copied ? C.green : accentColor(accent),
        cursor: "pointer",
        fontFamily: FONT_BODY,
      }}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function WireRow({
  label,
  value,
  accent,
  copyValue,
}: {
  label: string;
  value: string;
  accent: Accent;
  copyValue?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        padding: "8px 0",
        borderBottom: `1px solid ${C.line}`,
        fontSize: 13,
      }}
    >
      <span style={{ color: C.textFaint, flexShrink: 0 }}>{label}</span>
      <span style={{ color: C.text, textAlign: "right", wordBreak: "break-all" }}>
        {value}
        {copyValue ? <CopyButton text={copyValue} accent={accent} /> : null}
      </span>
    </div>
  );
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

  const submit = async () => {
    if (!stripe || !elements) return;
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
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />
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
        disabled={!stripe || busy}
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

function AchSection({
  track,
  amount,
  accent,
  publishableKey,
  onSuccess,
}: {
  track: PaymentTrack;
  amount: number;
  accent: Accent;
  publishableKey: string;
  onSuccess: () => void;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/payments/ach/intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ track }),
        });
        const data = (await res.json()) as { clientSecret?: string; error?: string };
        if (!res.ok) throw new Error(data.error || "Could not start ACH payment.");
        if (!cancelled) setClientSecret(data.clientSecret ?? null);
      } catch (e) {
        if (!cancelled) {
          setErr(e instanceof Error ? e.message : "Could not start ACH payment.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [track]);

  if (loading) {
    return <p style={{ fontSize: 13, color: C.textDim }}>Preparing secure checkout…</p>;
  }
  if (err || !clientSecret) {
    return <p style={{ fontSize: 13, color: C.red }}>{err || "ACH unavailable."}</p>;
  }

  const stripePromise = loadStripe(publishableKey);

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
  const [method, setMethod] = useState<"wire" | "ach" | "check">("wire");
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [wire, setWire] = useState<WireData | null>(null);
  const [wireLoading, setWireLoading] = useState(false);
  const [wireErr, setWireErr] = useState("");
  const [achDone, setAchDone] = useState(false);
  const [checkPending, setCheckPending] = useState(false);

  const color = accentColor(accent);

  useEffect(() => {
    fetch("/api/payments/config")
      .then((r) => r.json())
      .then((data: PaymentConfig) => setConfig(data))
      .catch(() =>
        setConfig({ achEnabled: false, wireEnabled: false, publishableKey: null }),
      );
  }, []);

  const loadWire = useCallback(async () => {
    setWireLoading(true);
    setWireErr("");
    try {
      const res = await fetch(`/api/payments/wire/instructions?track=${track}`);
      const data = (await res.json()) as WireData & { error?: string };
      if (!res.ok) throw new Error(data.error || "Could not load wire instructions.");
      setWire(data);
      onReadyToContinue?.();
    } catch (e) {
      setWireErr(e instanceof Error ? e.message : "Could not load wire instructions.");
    } finally {
      setWireLoading(false);
    }
  }, [track, onReadyToContinue]);

  useEffect(() => {
    if (method === "wire" && config?.wireEnabled) {
      loadWire();
    }
  }, [method, config?.wireEnabled, loadWire]);

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
      id: "wire" as const,
      icon: "🏦",
      label: "Wire Transfer",
      sub: config?.wireEnabled ? "Same-day · include reference" : "Unavailable",
      disabled: !config?.wireEnabled,
    },
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
              onClick={() => !m.disabled && setMethod(m.id)}
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
        {method === "wire" && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color, marginBottom: 10 }}>
              Wire Instructions
            </div>
            {wireLoading ? (
              <p style={{ fontSize: 13, color: C.textDim }}>Loading wire details…</p>
            ) : wireErr ? (
              <p style={{ fontSize: 13, color: C.red }}>{wireErr}</p>
            ) : wire ? (
              <>
                <WireRow
                  label="Reference (required)"
                  value={wire.wireReference}
                  copyValue={wire.wireReference}
                  accent={accent}
                />
                <WireRow
                  label="Beneficiary"
                  value={wire.beneficiary}
                  copyValue={wire.beneficiary}
                  accent={accent}
                />
                <WireRow
                  label="Bank"
                  value={wire.bankName}
                  copyValue={wire.bankName}
                  accent={accent}
                />
                <WireRow
                  label="Routing"
                  value={wire.routingNumber}
                  copyValue={wire.routingNumber}
                  accent={accent}
                />
                <WireRow
                  label="Account"
                  value={wire.accountNumber}
                  copyValue={wire.accountNumber}
                  accent={accent}
                />
                {wire.address ? (
                  <WireRow
                    label="Address"
                    value={wire.address}
                    copyValue={wire.address}
                    accent={accent}
                  />
                ) : null}
                <WireRow
                  label="Amount"
                  value={`$${(wire.amountCents / 100).toLocaleString()}`}
                  accent={accent}
                />
                <p
                  style={{
                    fontSize: 11,
                    color: C.textFaint,
                    lineHeight: 1.5,
                    marginTop: 12,
                  }}
                >
                  Include the reference code in your wire memo so we can match your
                  payment. Never wire based on emailed instructions alone — verify
                  details by phone if needed.
                </p>
              </>
            ) : null}
          </div>
        )}

        {method === "ach" && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color, marginBottom: 4 }}>
              ACH Bank Transfer
            </div>
            {achDone ? (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <div style={{ fontSize: 30, marginBottom: 8 }}>✓</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.green }}>
                  ACH authorization submitted
                </div>
                <p
                  style={{
                    fontSize: 12.5,
                    color: C.textDim,
                    lineHeight: 1.5,
                    margin: "8px 0 0",
                  }}
                >
                  Your debit of ${amount.toLocaleString()} is processing. You'll be
                  notified once funds clear (typically 1–4 business days).
                </p>
              </div>
            ) : config?.achEnabled && config.publishableKey ? (
              <>
                <p
                  style={{
                    fontSize: 12,
                    color: C.textFaint,
                    lineHeight: 1.5,
                    margin: "0 0 14px",
                  }}
                >
                  Link your bank account securely. Your account details are tokenized by
                  Stripe — Music Habitat never stores raw account numbers.
                </p>
                <AchSection
                  track={track}
                  amount={amount}
                  accent={accent}
                  publishableKey={config.publishableKey}
                  onSuccess={() => {
                    setAchDone(true);
                    onReadyToContinue?.();
                  }}
                />
              </>
            ) : (
              <p style={{ fontSize: 13, color: C.textDim }}>
                ACH is not available yet. Use wire transfer or contact us.
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
              <p style={{ fontSize: 12, color: C.green, marginTop: 12 }}>
                Check payment recorded as pending. We'll confirm once it clears.
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
