import type { OfferingType } from "@/lib/portal/db-types";
import { getProfile, updateProfile } from "@/lib/portal/profile";

/** Persist fully executed DocuSign docs (NDA + step-10 docs) on the investor profile. */
export async function applySignedDocs(
  userId: string,
  email: string,
  track: OfferingType,
  docId: string,
  completed: boolean,
): Promise<void> {
  if (!completed) return;

  if (docId === "nda") {
    const now = new Date().toISOString();
    await updateProfile(userId, email, {
      ...(track === "private"
        ? { nda_signed_private: true, nda_signed_private_at: now }
        : { nda_signed_ff: true, nda_signed_ff_at: now }),
    });
    return;
  }

  const profile = await getProfile(userId);
  const signedKey = track === "private" ? "psigned" : "signed";
  const existing =
    track === "private"
      ? ((profile?.private_signed ?? {}) as Record<string, boolean>)
      : ((profile?.signed_docs ?? {}) as Record<string, boolean>);

  const nextSigned = { ...existing, [docId]: true };
  const allDocIds = ["safe", "warrant", "subscription"];

  const allDone = allDocIds.every((id) => nextSigned[id]);

  await updateProfile(userId, email, {
    ...(signedKey === "psigned"
      ? { psigned: nextSigned }
      : { signed: nextSigned }),
    ...(allDone
      ? track === "private"
        ? { private_application_status: "signed" }
        : { application_status: "signed" }
      : {}),
  });
}
