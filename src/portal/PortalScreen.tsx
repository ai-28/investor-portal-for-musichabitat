"use client";

import { C } from "@/portal/tokens";
import { usePortal } from "@/portal/PortalProvider";
import { Page1 } from "@/portal/pages/Page1";
import { GatePage } from "@/portal/pages/GatePage";
import { NDAGate } from "@/portal/pages/NDAGate";
import { Page2 } from "@/portal/pages/Page2";
import { Page3 } from "@/portal/pages/Page3";
import { Page4 } from "@/portal/pages/Page4";
import { Page5 } from "@/portal/pages/Page5";
import { Page6 } from "@/portal/pages/Page6";
import { Page7 } from "@/portal/pages/Page7";
import { Page8 } from "@/portal/pages/Page8";
import { Page9 } from "@/portal/pages/Page9";
import { Page10 } from "@/portal/pages/Page10";
import { Page11 } from "@/portal/pages/Page11";
import { Page12 } from "@/portal/pages/Page12";
import { Page13 } from "@/portal/pages/Page13";
import { PPWelcomeCEO } from "@/portal/pages/private/PPWelcomeCEO";
import { PPOverview } from "@/portal/pages/private/PPOverview";
import { PPDocs } from "@/portal/pages/private/PPDocs";
import { PPQA } from "@/portal/pages/private/PPQA";
import { PPApply } from "@/portal/pages/private/PPApply";
import { PPReserve } from "@/portal/pages/private/PPReserve";
import { PPAck } from "@/portal/pages/private/PPAck";
import { PPSign } from "@/portal/pages/private/PPSign";
import { PPFund } from "@/portal/pages/private/PPFund";
import { PPWelcome } from "@/portal/pages/private/PPWelcome";
import { PPCall } from "@/portal/pages/private/PPCall";
import { ExecSummaryView } from "@/portal/views/ExecSummaryView";
import { DocViewer } from "@/portal/views/DocViewer";

export function PortalScreen() {
  const {
    route,
    go,
    read,
    markRead,
    app,
    setApp,
    acks,
    setAcks,
    signed,
    setSigned,
    papp,
    setPapp,
    packs,
    setPacks,
    psigned,
    setPsigned,
    acceptNda,
    offeringType,
  } = usePortal();

  const docTrack: "friends_family" | "private" =
    offeringType === "private" ? "private" : "friends_family";
  const docBackRoute = docTrack === "private" ? "pp_docs" : "page5";

  if (route === "execsum_reader") {
    return <ExecSummaryView onBack={() => go("page1")} />;
  }

  if (route.startsWith("doc_view:")) {
    const docId = route.slice("doc_view:".length);
    return (
      <DocViewer docId={docId} track={docTrack} onBack={() => go(docBackRoute)} />
    );
  }

  switch (route) {
    case "page1":
      return <Page1 go={go} openExecSummary={() => go("execsum_reader")} />;
    case "gate_ff":
      return (
        <GatePage
          title="Friends & Family"
          accent={C.amber}
          offeringType="friends_family"
          onBack={() => go("page1")}
        />
      );
    case "gate_private":
      return (
        <GatePage
          title="Private Offering"
          accent={C.teal}
          offeringType="private"
          onBack={() => go("page1")}
        />
      );
    case "nda_ff":
      return (
        <NDAGate
          accent={C.amber}
          trackLabel="the Circle 35 Friends & Family offering"
          onAccept={(signerName) => {
            void acceptNda("friends_family", signerName);
          }}
          onBack={() => go("gate_ff")}
        />
      );
    case "nda_private":
      return (
        <NDAGate
          accent={C.teal}
          trackLabel="the Music Habitat Private Offering"
          onAccept={(signerName) => {
            void acceptNda("private", signerName);
          }}
          onBack={() => go("gate_private")}
        />
      );
    case "pp_welcome_ceo":
      return <PPWelcomeCEO go={go} onBack={() => go("page1")} />;
    case "pp_overview":
      return <PPOverview go={go} onBack={() => go("pp_welcome_ceo")} />;
    case "pp_docs":
      return (
        <PPDocs go={go} onBack={() => go("pp_overview")} read={read} markRead={markRead} />
      );
    case "pp_qa":
      return <PPQA go={go} onBack={() => go("pp_docs")} />;
    case "pp_apply":
      return <PPApply go={go} onBack={() => go("pp_qa")} papp={papp} setPapp={setPapp} />;
    case "pp_reserve":
      return <PPReserve go={go} onBack={() => go("pp_apply")} papp={papp} />;
    case "pp_ack":
      return (
        <PPAck go={go} onBack={() => go("pp_reserve")} packs={packs} setPacks={setPacks} />
      );
    case "pp_sign":
      return (
        <PPSign
          go={go}
          onBack={() => go("pp_ack")}
          psigned={psigned}
          setPsigned={setPsigned}
          papp={papp}
        />
      );
    case "pp_fund":
      return <PPFund go={go} onBack={() => go("pp_sign")} papp={papp} />;
    case "pp_welcome":
      return <PPWelcome go={go} onBack={() => go("pp_fund")} papp={papp} />;
    case "pp_call":
      return <PPCall go={go} onBack={() => go("pp_welcome")} papp={papp} />;
    case "page2":
      return <Page2 go={go} onBack={() => go("page1")} />;
    case "page3":
      return <Page3 go={go} onBack={() => go("page2")} />;
    case "page4":
      return <Page4 go={go} onBack={() => go("page3")} />;
    case "page5":
      return <Page5 go={go} onBack={() => go("page4")} read={read} markRead={markRead} />;
    case "page6":
      return <Page6 go={go} onBack={() => go("page5")} />;
    case "page7":
      return <Page7 go={go} onBack={() => go("page6")} app={app} setApp={setApp} />;
    case "page8":
      return <Page8 go={go} onBack={() => go("page7")} app={app} />;
    case "page9":
      return <Page9 go={go} onBack={() => go("page8")} acks={acks} setAcks={setAcks} />;
    case "page10":
      return (
        <Page10
          go={go}
          onBack={() => go("page9")}
          signed={signed}
          setSigned={setSigned}
          app={app}
        />
      );
    case "page11":
      return <Page11 go={go} onBack={() => go("page10")} app={app} />;
    case "page12":
      return <Page12 go={go} onBack={() => go("page11")} app={app} />;
    case "page13":
      return <Page13 go={go} onBack={() => go("page12")} app={app} />;
    default:
      return <Page1 go={go} openExecSummary={() => go("execsum_reader")} />;
  }
}
