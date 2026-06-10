import Link from "next/link";

type SearchParams = {
  code?: string;
  error?: string;
  error_description?: string;
};

export default async function DocuSignOAuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams> | SearchParams;
}) {
  const params = await Promise.resolve(searchParams);
  const ok = Boolean(params.code);
  const error = params.error_description || params.error;

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
          border: "1px solid #2a2a35",
          borderRadius: 12,
          padding: "28px 24px",
        }}
      >
        <h1 style={{ fontSize: 22, margin: "0 0 10px" }}>
          {ok ? "DocuSign consent granted" : "DocuSign consent failed"}
        </h1>
        <p style={{ color: "#b8b8c2", lineHeight: 1.55, margin: "0 0 16px" }}>
          {ok
            ? "JWT impersonation consent is set for this integration. You can close this tab and test signing on Step 10."
            : error ||
              "DocuSign did not return an authorization code. Open the consent link from /api/docusign/config while logged in as the API user."}
        </p>
        {!ok && (
          <p style={{ color: "#888", fontSize: 13, lineHeight: 1.5, margin: "0 0 16px" }}>
            Already consented on Music Habitat? Check{" "}
            <Link href="/api/docusign/test" style={{ color: "#00A9BD" }}>
              /api/docusign/test
            </Link>{" "}
            — if JWT auth succeeds, skip consent and go straight to Step 10.
          </p>
        )}
        <Link
          href="/step/10"
          style={{
            display: "inline-block",
            padding: "10px 16px",
            borderRadius: 8,
            background: "#00A9BD",
            color: "#04252A",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          Back to signing
        </Link>
      </div>
    </main>
  );
}
