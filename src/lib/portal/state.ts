import type { AckMap, InvestorApp, PrivateApp, ReadMap, SignedMap } from "@/portal/types";
import { emptyPrivateApp } from "@/portal/types";
import type {
  InvestorProfileRow,
  OfferingType,
  PortalStatePatch,
  PortalStatePayload,
} from "@/lib/portal/db-types";

export const emptyApp: InvestorApp = {
  fullName: "",
  email: "",
  phone: "",
  amount: "",
  accredited: false,
};

export function defaultRouteForOffering(offeringType: OfferingType | null): string {
  if (offeringType === "private") return "pp_welcome_ceo";
  return "page2";
}

/** Entry/auth screens — never treat these as the user's furthest progress. */
const NON_PROGRESS_ROUTES = new Set([
  "page1",
  "gate_ff",
  "gate_private",
  "nda_ff",
  "nda_private",
]);

function isProgressRoute(route: string | null): route is string {
  return Boolean(route && !NON_PROGRESS_ROUTES.has(route));
}

export function resumeRouteFromProfile(
  offeringType: OfferingType | null,
  currentRoute: string | null,
  ndaSignedFf: boolean,
  ndaSignedPrivate: boolean,
  currentStep = 2,
): string {
  if (offeringType === "private") {
    if (!ndaSignedPrivate) return "nda_private";
    if (isProgressRoute(currentRoute)) return currentRoute;
    return "pp_welcome_ceo";
  }

  if (offeringType === "friends_family") {
    if (!ndaSignedFf) return "nda_ff";
    if (isProgressRoute(currentRoute)) return currentRoute;
    if (currentStep >= 2 && currentStep <= 13) return `page${currentStep}`;
    return "page2";
  }

  // Track not chosen yet — stay on the gate if that's where they are.
  if (currentRoute === "gate_private") return "nda_private";
  if (currentRoute === "gate_ff") return "nda_ff";
  if (isProgressRoute(currentRoute)) return currentRoute;
  return "page2";
}

export function routeToStep(route: string): number | null {
  const match = route.match(/^page(\d+)$/);
  if (!match) return null;
  const step = Number(match[1]);
  return step >= 2 && step <= 13 ? step : null;
}

export function centsToAmountString(cents: number | null): string {
  if (cents == null || cents <= 0) return "";
  return String(Math.round(cents / 100));
}

export function amountStringToCents(amount: string): number | null {
  const digits = amount.replace(/[^0-9]/g, "");
  if (!digits) return null;
  const dollars = Number(digits);
  if (!Number.isFinite(dollars) || dollars <= 0) return null;
  return dollars * 100;
}

function parsePrivateApp(raw: unknown): PrivateApp {
  if (!raw || typeof raw !== "object") return { ...emptyPrivateApp };
  const o = raw as Partial<PrivateApp>;
  return {
    fullName: o.fullName ?? "",
    email: o.email ?? "",
    phone: o.phone ?? "",
    amount: o.amount ?? "",
    accreditedBasis: Array.isArray(o.accreditedBasis) ? o.accreditedBasis : [],
    verifyMethod: o.verifyMethod ?? "",
  };
}

export function profileToPortalState(
  profile: InvestorProfileRow | null,
  userEmail?: string,
): PortalStatePayload {
  if (!profile) {
    return {
      profile: null,
      app: { ...emptyApp, email: userEmail ?? "" },
      papp: { ...emptyPrivateApp, email: userEmail ?? "" },
      read: {},
      acks: {},
      signed: {},
      packs: {},
      psigned: {},
      currentStep: 2,
      currentRoute: null,
      offeringType: null,
      ndaSignedFf: false,
      ndaSignedPrivate: false,
    };
  }

  const papp = parsePrivateApp(profile.private_app);

  return {
    profile,
    app: {
      fullName: profile.full_name ?? "",
      email: profile.email || userEmail || "",
      phone: profile.phone ?? "",
      amount: centsToAmountString(profile.amount_cents),
      accredited: profile.accredited_confirmed,
    },
    papp: {
      ...papp,
      email: papp.email || profile.email || userEmail || "",
      fullName: papp.fullName || profile.full_name || "",
    },
    read: (profile.read_docs ?? {}) as ReadMap,
    acks: (profile.acknowledgments ?? {}) as AckMap,
    signed: (profile.signed_docs ?? {}) as SignedMap,
    packs: (profile.private_acks ?? {}) as AckMap,
    psigned: (profile.private_signed ?? {}) as SignedMap,
    currentStep: profile.current_step,
    currentRoute: profile.current_route,
    offeringType: profile.offering_type,
    ndaSignedFf: profile.nda_signed_ff,
    ndaSignedPrivate: profile.nda_signed_private,
  };
}

export function patchToRowUpdate(
  patch: PortalStatePatch,
  existing?: InvestorProfileRow | null,
): Partial<InvestorProfileRow> {
  const update: Partial<InvestorProfileRow> = {};

  if (patch.offering_type !== undefined) update.offering_type = patch.offering_type;
  if (patch.referrer_id !== undefined) update.referrer_id = patch.referrer_id;
  if (patch.referrer_rejected !== undefined) {
    update.referrer_rejected = patch.referrer_rejected;
  }
  if (patch.current_step !== undefined) update.current_step = patch.current_step;
  if (patch.current_route !== undefined) update.current_route = patch.current_route;
  if (patch.full_name !== undefined) update.full_name = patch.full_name || null;
  if (patch.phone !== undefined) update.phone = patch.phone || null;
  if (patch.email !== undefined) update.email = patch.email;
  if (patch.accredited !== undefined) update.accredited_confirmed = patch.accredited;
  if (patch.nda_signed_ff !== undefined) update.nda_signed_ff = patch.nda_signed_ff;
  if (patch.nda_signed_private !== undefined) {
    update.nda_signed_private = patch.nda_signed_private;
  }
  if (patch.nda_signer_name !== undefined) {
    update.nda_signer_name = patch.nda_signer_name;
  }
  if (patch.nda_signed_ff_at !== undefined) {
    update.nda_signed_ff_at = patch.nda_signed_ff_at;
  }
  if (patch.nda_signed_private_at !== undefined) {
    update.nda_signed_private_at = patch.nda_signed_private_at;
  }
  if (patch.private_application_status !== undefined) {
    update.private_application_status = patch.private_application_status;
  }
  if (patch.private_payment_status !== undefined) {
    update.private_payment_status = patch.private_payment_status;
  }
  if (patch.application_status !== undefined) {
    update.application_status = patch.application_status;
  }
  if (patch.payment_status !== undefined) update.payment_status = patch.payment_status;

  if (patch.amount !== undefined) {
    update.amount_cents = amountStringToCents(patch.amount);
  }

  if (patch.read !== undefined) {
    update.read_docs = { ...(existing?.read_docs ?? {}), ...patch.read };
  }
  if (patch.acks !== undefined) {
    update.acknowledgments = { ...(existing?.acknowledgments ?? {}), ...patch.acks };
  }
  if (patch.signed !== undefined) {
    update.signed_docs = { ...(existing?.signed_docs ?? {}), ...patch.signed };
  }
  if (patch.papp !== undefined) {
    update.private_app = {
      ...parsePrivateApp(existing?.private_app),
      ...patch.papp,
    };
  }
  if (patch.packs !== undefined) {
    update.private_acks = { ...(existing?.private_acks ?? {}), ...patch.packs };
  }
  if (patch.psigned !== undefined) {
    update.private_signed = { ...(existing?.private_signed ?? {}), ...patch.psigned };
  }

  return update;
}

export function appToPatch(app: InvestorApp): PortalStatePatch {
  return {
    full_name: app.fullName,
    email: app.email,
    phone: app.phone,
    amount: app.amount,
    accredited: app.accredited,
  };
}

export function privateAppToPatch(papp: PrivateApp): PortalStatePatch {
  return { papp };
}

/** Scalar application fields for the active track only. */
export function applicationPatchForTrack(
  offeringType: OfferingType | null,
  app: InvestorApp,
  papp: PrivateApp,
): PortalStatePatch {
  if (offeringType === "private") {
    return {
      papp,
      full_name: papp.fullName,
      email: papp.email,
      phone: papp.phone,
      amount: papp.amount,
    };
  }
  return { ...appToPatch(app), papp };
}
