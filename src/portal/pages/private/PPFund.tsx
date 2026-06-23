"use client";

import { useState } from "react";
import { C } from "@/portal/tokens";
import { Shell } from "@/portal/ui/Shell";
import { H, Kicker } from "@/portal/ui/Typography";
import { Btn } from "@/portal/ui/Button";
import { PRIVATE } from "@/portal/data/private-offering";
import { PPStep } from "@/portal/ui/PPStep";
import { FundingPanel } from "@/portal/ui/FundingPanel";

import { skipProgressGates } from "@/portal/lib/demo";

export function PPFund({ go, onBack, papp }) {
  const amt = Number(papp.amount || PRIVATE.minInvestment);
  const [canContinue, setCanContinue] = useState(false);
  const fundingOk = skipProgressGates() || canContinue;

  return (
    <Shell onBack={onBack}>
      <PPStep step={9} />
      <div style={{ paddingTop: 12 }}>
        <Kicker color={C.teal}>Final Step</Kicker>
        <H size={26}>Fund Your Investment</H>
        <p style={{ color: C.textDim, fontSize: 13, margin: "6px 0 16px" }}>
          Funding ${amt.toLocaleString()} for your {PRIVATE.shareClass} purchase.
        </p>
      </div>

      <FundingPanel
        track="private"
        amount={amt}
        accent="teal"
        investorName={papp.fullName}
        onReadyToContinue={() => setCanContinue(true)}
      />

      <Btn
        variant="teal"
        disabled={!fundingOk}
        onClick={() => go("pp_welcome")}
        style={{ marginTop: 14 }}
      >
        I've Initiated Funding
      </Btn>
      <p style={{ textAlign: "center", color: C.textFaint, fontSize: 12, marginTop: 8 }}>
        Your position is confirmed once funds clear and the Company accepts your subscription.
        {fundingOk
          ? ""
          : " Complete ACH authorization or mark your check as mailed above to continue."}
      </p>
    </Shell>
  );
}
