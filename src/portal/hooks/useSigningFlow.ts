"use client";

import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type { OfferingType } from "@/lib/portal/db-types";
import type { SignedMap } from "@/portal/types";

export type SigningStatus =
  | "pending"
  | "sent"
  | "investor_signed"
  | "completed"
  | "declined"
  | "voided";

function statusLabel(status: SigningStatus | undefined, enabled: boolean): string {
  if (!enabled) return "Awaiting signature";
  switch (status) {
    case "completed":
      return "Signed";
    case "investor_signed":
      return "You signed — awaiting CEO";
    case "sent":
      return "Awaiting your signature";
    case "declined":
      return "Declined";
    case "voided":
      return "Voided";
    default:
      return "Awaiting signature";
  }
}

export function useSigningFlow(params: {
  track: OfferingType;
  signed: SignedMap;
  setSigned: Dispatch<SetStateAction<SignedMap>>;
  investor?: { fullName?: string; email?: string };
  /** When set, only these doc ids are loaded (e.g. `["nda"]` on the NDA gate). */
  docIds?: string[];
}) {
  const { track, signed, setSigned, investor, docIds } = params;
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [statuses, setStatuses] = useState<Record<string, SigningStatus>>({});

  const docIdsKey = docIds?.length ? docIds.join(",") : "";

  const refreshStatus = useCallback(async (sync = false) => {
    try {
      const docIdsQuery = docIdsKey
        ? `&docIds=${encodeURIComponent(docIdsKey)}`
        : "";
      const url = `/api/docusign/status?track=${track}${sync ? "&sync=1" : ""}${docIdsQuery}`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      setEnabled(Boolean(data.enabled));
      if (data.signed) setSigned((prev) => ({ ...prev, ...data.signed }));
      if (data.statuses) setStatuses(data.statuses);
    } catch {
      /* ignore polling errors */
    }
  }, [track, setSigned, docIdsKey]);

  useEffect(() => {
    refreshStatus(false);
    const id = window.setInterval(() => refreshStatus(false), 30000);
    return () => window.clearInterval(id);
  }, [track, docIdsKey, refreshStatus]);

  useEffect(() => {
    const needsSync = Object.values(statuses).some(
      (s) => s === "investor_signed" || s === "sent",
    );
    if (!needsSync) return;
    const id = window.setInterval(() => refreshStatus(true), 5000);
    return () => window.clearInterval(id);
  }, [statuses, refreshStatus]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("docusign") !== "done") return;

    const docId = params.get("doc")?.trim();
    const event = params.get("event");

    if (event === "viewing_complete") {
      setError(
        "You left DocuSign before clicking Finish. Open Sign again, complete your fields on the Signature Page, then click Finish.",
      );
      refreshStatus(true);
      return;
    }

    if (event && event !== "signing_complete") {
      refreshStatus(true);
      return;
    }

    const run = async () => {
      await refreshStatus(true);
      if (!docId) return;

      await sleep(2000);

      try {
        const res = await fetch("/api/docusign/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ track, docId }),
        });
        const data = await res.json().catch(() => ({}));
        if (data.message && !data.notified) {
          setError(data.message);
        }
        await refreshStatus(true);
      } catch {
        /* ignore */
      }
    };

    run();
  }, [track, refreshStatus]);

  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const downloadDoc = async (docId: string) => {
    setError("");
    try {
      const res = await fetch(
        `/api/docusign/document?track=${track}&docId=${encodeURIComponent(docId)}`,
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Download failed.");
      }
      const blob = await res.blob();
      const disposition = res.headers.get("content-disposition") ?? "";
      const nameMatch = disposition.match(/filename="?([^";\n]+)"?/i);
      const filename = nameMatch?.[1]?.trim() || `${docId}-signed.pdf`;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed.");
    }
  };

  const signOne = async (docId: string) => {
    setBusy(docId);
    setError("");
    try {
      if (!enabled) {
        setSigned((s) => ({ ...s, [docId]: true }));
        return;
      }

      const res = await fetch("/api/docusign/envelope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docId, track, investor }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start signing.");

      if (data.status === "completed") {
        setSigned((s) => ({ ...s, [docId]: true }));
        await refreshStatus(true);
        return;
      }

      if (!data.url) {
        throw new Error(
          "DocuSign did not return a signing URL. Check server configuration.",
        );
      }

      const popup = window.open(data.url, "_blank", "noopener,noreferrer");
      if (!popup) {
        window.location.assign(data.url);
      }
      await refreshStatus(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signing failed.");
    } finally {
      setBusy(null);
    }
  };

  return {
    enabled,
    busy,
    error,
    statuses,
    signOne,
    downloadDoc,
    statusLabel,
    refreshStatus,
  };
}
