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
}) {
  const { track, signed, setSigned, investor } = params;
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [statuses, setStatuses] = useState<Record<string, SigningStatus>>({});

  const refreshStatus = useCallback(async (sync = false) => {
    try {
      const url = `/api/docusign/status?track=${track}${sync ? "&sync=1" : ""}`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      setEnabled(Boolean(data.enabled));
      if (data.signed) setSigned((prev) => ({ ...prev, ...data.signed }));
      if (data.statuses) setStatuses(data.statuses);
    } catch {
      /* ignore polling errors */
    }
  }, [track, setSigned]);

  useEffect(() => {
    refreshStatus(false);
    const id = window.setInterval(() => refreshStatus(false), 30000);
    return () => window.clearInterval(id);
  }, [refreshStatus]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("docusign") === "done") refreshStatus(true);
  }, [refreshStatus]);

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
