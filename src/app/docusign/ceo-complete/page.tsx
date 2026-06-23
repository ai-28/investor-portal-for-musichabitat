import Link from "next/link";
import type { OfferingType } from "@/lib/portal/db-types";

type SearchParams = {
  track?: string;
  event?: string;
};

function messageForEvent(event: string | undefined): {
  title: string;
  body: string;
  ok: boolean;
} {
  switch (event) {
    case "signing_complete":
      return {
        ok: true,
        title: "NDA countersigned",
        body:
          "Thank you — your signature was recorded. The investor portal will update automatically. You can close this tab.",
      };
    case "ttl_expired":
      return {
        ok: false,
        title: "DocuSign session expired",
        body:
          "That DocuSign session timed out. Click the countersign link in your email again — each click opens a fresh session.",
      };
    case "recipient_mismatch":
      return {
        ok: false,
        title: "Countersign link out of date",
        body:
          "This NDA was signed before the latest portal update. Ask the investor to click Sign NDA again and finish signing, then use the new countersign link from email or the NDA page.",
      };
    case "session_failed":
      return {
        ok: false,
        title: "Could not open DocuSign",
        body:
          "DocuSign could not start a signing session. Try the countersign link again in a few seconds. If it keeps failing, ask the investor to sign the NDA again for a fresh envelope.",
      };
    case "viewing_complete":
      return {
        ok: false,
        title: "Signing not finished",
        body:
          "You left DocuSign before clicking Finish. Open a new countersign link, use Add Fields on the Music Habitat column (left), then click Finish.",
      };
    case "cancel":
    case "decline":
      return {
        ok: false,
        title: "Signing cancelled",
        body: "The countersign session was cancelled. Use a new link from the investor when you are ready to sign.",
      };
    default:
      return {
        ok: true,
        title: "DocuSign session ended",
        body:
          "If you completed signing, the investor can continue in the portal. Otherwise request a new countersign link.",
      };
  }
}

export default async function DocuSignCeoCompletePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams> | SearchParams;
}) {
  const params = await Promise.resolve(searchParams);
  const track = params.track as OfferingType | undefined;
  const { title, body, ok } = messageForEvent(params.event);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "system-ui, sans-serif",
        background: "#0b0b0f",
        color: "#f5f5f5",
      }}
    >
      <div
        style={{
          maxWidth: 520,
          width: "100%",
          background: "#15151c",
          border: `1px solid ${ok ? "#1e4d3a" : "#4d1e1e"}`,
          borderRadius: 12,
          padding: "28px 24px",
        }}
      >
        <h1 style={{ fontSize: 22, margin: "0 0 10px" }}>{title}</h1>
        <p style={{ color: "#b8b8c2", lineHeight: 1.55, margin: "0 0 16px" }}>
          {body}
        </p>
        {track === "private" || track === "friends_family" ? (
          <p style={{ color: "#888", fontSize: 12, margin: "0 0 16px" }}>
            Track: {track === "private" ? "Private offering" : "Friends & Family"}
          </p>
        ) : null}
        <Link
          href="/"
          style={{
            display: "inline-block",
            padding: "10px 16px",
            borderRadius: 8,
            background: "#C9A84C",
            color: "#1A1206",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          Music Habitat home
        </Link>
      </div>
    </main>
  );
}
