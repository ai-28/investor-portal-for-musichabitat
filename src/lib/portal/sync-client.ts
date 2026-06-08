import type { PortalStatePatch, PortalStatePayload } from "@/lib/portal/db-types";

export async function fetchPortalState(): Promise<PortalStatePayload | null> {
  const res = await fetch("/api/portal/state", { cache: "no-store" });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error("Failed to load portal state");
  return res.json() as Promise<PortalStatePayload>;
}

export async function patchPortalState(
  patch: PortalStatePatch,
): Promise<PortalStatePayload> {
  const res = await fetch("/api/portal/state", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error("Failed to save portal state");
  return res.json() as Promise<PortalStatePayload>;
}
