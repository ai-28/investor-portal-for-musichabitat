"use client";

import { useState, useEffect, useRef } from "react";
import { C, FONT_DISPLAY, FONT_BODY } from "@/portal/tokens";
import { Shell } from "@/portal/ui/Shell";
import { H, Kicker } from "@/portal/ui/Typography";
import { Btn } from "@/portal/ui/Button";
import { Card } from "@/portal/ui/Card";
import { Field } from "@/portal/ui/Field";
import { Countdown } from "@/portal/ui/Countdown";
import { BadgeMark } from "@/portal/ui/BadgeMark";
import { Avatar } from "@/portal/ui/Avatar";
import { StepNav } from "@/portal/ui/StepNav";
import { DocuSignMark } from "@/portal/ui/DocuSignMark";
import { GuardianBadge } from "@/portal/ui/GuardianBadge";
import { BrandonSignature } from "@/portal/ui/BrandonSignature";
import { EXEC_SUMMARY, REFERRERS, DOC_CENTER, QA } from "@/portal/data/content";
import { PHOTO_MAP, BRANDON_PHOTO } from "@/portal/data/photos";
import { CEO_VIDEO_URL, CEO_VIDEO_KIND, WELCOME_BG } from "@/portal/data/media";
import { DOCUSIGN, FUNDING, CALENDLY_URL } from "@/portal/data/doc-config";
import { STOCK_CERT_IMG } from "@/portal/data/photos";
import { achInput } from "@/portal/lib/ach";
import { achLabel, achErr } from "@/portal/data/ach-labels";

import { usePortal } from "@/portal/PortalProvider";

export function Page2({ go, onBack }) {
  const { saveReferrer } = usePortal();
  const [picked, setPicked] = useState(null);
  const [stopped, setStopped] = useState(false);
  const [busy, setBusy] = useState(false);

  const rejectReferrer = () => {
    setStopped(true);
    saveReferrer(null, true);
  };

  const continueWithReferrer = async () => {
    if (!picked || busy) return;
    setBusy(true);
    try {
      await saveReferrer(picked);
      await go("page3");
    } finally {
      setBusy(false);
    }
  };

  if (stopped) {
    return (
      <Shell step={2} onBack={() => setStopped(false)}>
        <div style={{ paddingTop: 60, textAlign: "center" }}>
          <div style={{ fontSize: 40 }}>🚫</div>
          <H size={24} accent={C.amber}>Our Apologies</H>
          <p style={{ color: C.textDim, fontSize: 15, lineHeight: 1.6, margin: "14px 0 26px" }}>
            Only personal friends &amp; family of our team members can invest in this
            particular offering. Please refer to our other two offerings.
          </p>
          <Btn variant="teal" onClick={() => go("page1")}>Back to Offerings</Btn>
        </div>
      </Shell>
    );
  }

  return (
    <Shell step={2} onBack={onBack}>
      <div style={{ paddingTop: 18, textAlign: "center" }}>
        <Kicker>The Circle 35</Kicker>
        <H size={26}>Who Introduced You<br/>to Music Habitat?</H>
        <p style={{ color: C.textDim, fontSize: 13, margin: "8px 0 22px" }}>
          Select the team member who personally referred you.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {REFERRERS.map((m) => {
          const sel = picked === m.id;
          return (
            <div key={m.id} onClick={() => setPicked(m.id)} style={{
              background: sel ? C.cardHi : C.card,
              border: `1px solid ${sel ? C.amber : C.line}`, borderRadius: 12,
              padding: "16px 10px", textAlign: "center", cursor: "pointer",
            }}>
              <Avatar name={m.name} img={m.img} selected={sel} />
              <div style={{ fontSize: 13, fontWeight: 600 }}>{m.name}</div>
              <div style={{ fontSize: 10, color: C.textFaint, marginTop: 2,
                textTransform: "uppercase", letterSpacing: 0.5 }}>{m.role}</div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 18 }}>
        <Card onClick={rejectReferrer} style={{ textAlign: "center", marginBottom: 16 }}>
          <span style={{ color: C.textDim, fontSize: 14 }}>Someone else referred me</span>
        </Card>
        {!picked && (
          <p style={{ textAlign: "center", color: C.textFaint, fontSize: 12, margin: 0 }}>
            Tap a team member above, then confirm below to continue.
          </p>
        )}
      </div>

      {picked && (
        <Card style={{ borderColor: C.amber }}>
          <p style={{ fontSize: 14, lineHeight: 1.5, margin: "0 0 14px" }}>
            I attest that I personally know{" "}
            <strong style={{ color: C.amber }}>
              {REFERRERS.find((m) => m.id === picked).name}
            </strong>.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn variant="amber" disabled={busy} onClick={() => void continueWithReferrer()}>
              {busy ? "Saving…" : "Yes — Continue"}
            </Btn>
            <Btn variant="ghost" onClick={rejectReferrer}>No</Btn>
          </div>
        </Card>
      )}
    </Shell>
  );
}

// =============================================================================
// PAGE 3 — CEO landing (Brandon Beard) video + continue
// Matches the 14-page layout (screenshot "Welcome From …"), rebuilt for Brandon.
// =============================================================================

// BACKEND HOOK: set to Brandon's promo video. Supports a hosted MP4 (plays inline)
// or a YouTube/Vimeo embed URL (rendered in an iframe). Leave "" to show the poster.
