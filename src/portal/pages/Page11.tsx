"use client";

import { useState } from "react";
import { C } from "@/portal/tokens";
import { Shell } from "@/portal/ui/Shell";
import { H, Kicker } from "@/portal/ui/Typography";
import { Btn } from "@/portal/ui/Button";
import { FundingPanel } from "@/portal/ui/FundingPanel";

export function Page11({ go, onBack, app }) {
  const amt = Number(app.amount || 1000);
  const [canContinue, setCanContinue] = useState(false);

  return (
    <Shell step={11} onBack={onBack}>
      <div style={{ paddingTop: 18 }}>
        <Kicker>Final Step</Kicker>
        <H size={26}>Fund Your Investment</H>
        <p style={{ color: C.textDim, fontSize: 13, margin: "6px 0 16px" }}>
          Funding <strong style={{ color: C.amber }}>${amt.toLocaleString()}</strong> to
          complete your subscription.
        </p>
      </div>

      <FundingPanel
        track="friends_family"
        amount={amt}
        accent="amber"
        investorName={app.fullName}
        onReadyToContinue={() => setCanContinue(true)}
      />

      <Btn variant="amber" onClick={() => go("page12")} style={{ marginTop: 14 }}>
        I've Initiated Funding
      </Btn>
      <p style={{ textAlign: "center", color: C.textFaint, fontSize: 12, marginTop: 8 }}>
        Your position is confirmed once funds clear and the Company accepts your subscription.
        {canContinue ? "" : " Select a funding method above to get started."}
      </p>
    </Shell>
  );
}
