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

export function mergeBooleanFlags(
  server: ReadMap,
  local: ReadMap,
): ReadMap {
  const merged = { ...server };
  for (const [key, value] of Object.entries(local)) {
    if (value) merged[key] = true;
  }
  return merged;
}

export function defaultRouteForOffering(offeringType: OfferingType | null): string {
  if (offeringType === "private") return "pp_welcome_ceo";
  return "page2";
}

const PRIVATE_PROGRESS_ROUTES = new Set([
  "pp_welcome_ceo",
  "pp_overview",
  "pp_docs",
  "pp_qa",
  "pp_apply",
  "pp_reserve",
  "pp_ack",
  "pp_sign",
  "pp_fund",
  "pp_welcome",
  "pp_call",
]);

/** Ordered routes — investors may not skip ahead via URL past their saved progress. */
export const FF_ROUTE_ORDER: string[] = [
  "nda_ff",
  "page2",
  "page3",
  "page4",
  "page5",
  "page6",
  "page7",
  "page8",
  "page9",
  "page10",
  "page11",
  "page12",
  "page13",
];

export const PRIVATE_ROUTE_ORDER: string[] = [
  "nda_private",
  "pp_welcome_ceo",
  "pp_overview",
  "pp_docs",
  "pp_qa",
  "pp_apply",
  "pp_reserve",
  "pp_ack",
  "pp_sign",
  "pp_fund",
  "pp_welcome",
  "pp_call",
];

export function routeOrderIndex(
  track: OfferingType,
  route: string,
): number | null {
  const order = track === "private" ? PRIVATE_ROUTE_ORDER : FF_ROUTE_ORDER;
  const idx = order.indexOf(route);
  return idx >= 0 ? idx : null;
}

/** Furthest route the investor has earned (saved progress). */
export function maxProgressRouteForTrack(
  track: OfferingType,
  ndaSignedFf: boolean,
  ndaSignedPrivate: boolean,
  ffRoute: string | null,
  privateRoute: string | null,
): string {
  if (track === "private") {
    if (!ndaSignedPrivate) return "nda_private";
    return privateRoute ?? "pp_welcome_ceo";
  }
  if (!ndaSignedFf) return "nda_ff";
  return ffRoute ?? "page2";
}

export function isTrackGatedRoute(route: string): boolean {
  return (
    routeOrderIndex("friends_family", route) != null ||
    routeOrderIndex("private", route) != null
  );
}

/** URL route is the saved route or a later step (forward navigation, not browser back). */
export function isRouteAtOrAheadOfProgress(
  track: OfferingType,
  urlRoute: string,
  savedRoute: string | null,
): boolean {
  if (!savedRoute) return true;
  const urlIdx = routeOrderIndex(track, urlRoute);
  const savedIdx = routeOrderIndex(track, savedRoute);
  if (urlIdx == null || savedIdx == null) return urlRoute === savedRoute;
  return urlIdx >= savedIdx;
}

/** Pick the furthest route between two saved progress markers. */
export function furthestRoute(
  track: OfferingType,
  a: string | null,
  b: string | null,
): string | null {
  if (!a) return b;
  if (!b) return a;
  const aIdx = routeOrderIndex(track, a);
  const bIdx = routeOrderIndex(track, b);
  if (aIdx == null) return b;
  if (bIdx == null) return a;
  return aIdx >= bIdx ? a : b;
}

/** True when target route is later than the furthest route the user has earned. */
export function isRouteAheadOfAllowed(
  track: OfferingType,
  targetRoute: string,
  allowedRoute: string,
): boolean {
  const targetIdx = routeOrderIndex(track, targetRoute);
  const allowedIdx = routeOrderIndex(track, allowedRoute);
  if (targetIdx == null || allowedIdx == null) return false;
  return targetIdx > allowedIdx;
}

export function routeToTrack(route: string): OfferingType | null {
  if (PRIVATE_PROGRESS_ROUTES.has(route) || route === "nda_private" || route === "gate_private") {
    return "private";
  }
  if (route === "nda_ff" || route === "gate_ff") return "friends_family";
  if (routeToStep(route) != null) return "friends_family";
  return null;
}

export function isFfProgressRoute(route: string | null): route is string {
  return Boolean(route && routeToStep(route) != null);
}

export function isPrivateProgressRoute(route: string | null): route is string {
  return Boolean(route && PRIVATE_PROGRESS_ROUTES.has(route));
}

export function trackProgressFromProfile(
  profile: InvestorProfileRow,
  track: OfferingType,
): { route: string | null; step: number } {
  if (track === "private") {
    return {
      route: profile.private_current_route,
      step: profile.private_current_step ?? 2,
    };
  }
  return {
    route: profile.ff_current_route,
    step: profile.ff_current_step ?? 2,
  };
}

export function resumeRouteFromProfile(
  offeringType: OfferingType | null,
  trackRoute: string | null,
  ndaSignedFf: boolean,
  ndaSignedPrivate: boolean,
  trackStep = 2,
): string {
  if (offeringType === "private") {
    if (!ndaSignedPrivate) return "nda_private";
    if (isPrivateProgressRoute(trackRoute)) return trackRoute;
    return "pp_welcome_ceo";
  }

  if (offeringType === "friends_family") {
    if (!ndaSignedFf) return "nda_ff";
    if (isFfProgressRoute(trackRoute)) return trackRoute;
    if (trackStep >= 2 && trackStep <= 13) return `page${trackStep}`;
    return "page2";
  }

  if (trackRoute === "gate_private") return "nda_private";
  if (trackRoute === "gate_ff") return "nda_ff";
  if (isPrivateProgressRoute(trackRoute)) return trackRoute;
  if (isFfProgressRoute(trackRoute)) return trackRoute;
  return "page2";
}

/** Build a portal patch that saves route/step only to the matching track columns. */
export function trackRoutePatch(
  route: string,
  step: number | null,
): PortalStatePatch {
  const track = routeToTrack(route);
  const patch: PortalStatePatch = {};

  if (track === "friends_family") {
    patch.ff_current_route = route;
    if (step != null) patch.ff_current_step = step;
  } else if (track === "private") {
    patch.private_current_route = route;
    if (step != null) patch.private_current_step = step;
  }

  return patch;
}

/** Investment amount for payments — each track uses its own storage. */
export function amountCentsForTrack(
  profile: InvestorProfileRow,
  track: OfferingType,
): number | null {
  if (track === "private") {
    return amountStringToValidCents(parsePrivateApp(profile.private_app).amount, "private");
  }
  return profile.amount_cents;
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

const MIN_AMOUNT_CENTS: Record<OfferingType, number> = {
  friends_family: 50000,
  private: 250000,
};

/** Returns cents only when amount meets track minimum; otherwise null (draft/in-progress). */
export function amountStringToValidCents(
  amount: string,
  offeringType: OfferingType | null | undefined,
): number | null {
  const cents = amountStringToCents(amount);
  if (cents == null) return null;
  const min =
    offeringType === "private"
      ? MIN_AMOUNT_CENTS.private
      : MIN_AMOUNT_CENTS.friends_family;
  return cents >= min ? cents : null;
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
      ffCurrentStep: 2,
      ffCurrentRoute: null,
      privateCurrentStep: 2,
      privateCurrentRoute: null,
      offeringType: null,
      ndaSignedFf: false,
      ndaSignedPrivate: false,
    };
  }

  const papp = parsePrivateApp(profile.private_app);
  const ffProgress = trackProgressFromProfile(profile, "friends_family");
  const privateProgress = trackProgressFromProfile(profile, "private");
  const activeTrack = profile.offering_type;
  const activeProgress =
    activeTrack === "private"
      ? privateProgress
      : activeTrack === "friends_family"
        ? ffProgress
        : { route: null as string | null, step: 2 };

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
      fullName: papp.fullName ?? "",
    },
    read: (profile.read_docs ?? {}) as ReadMap,
    acks: (profile.acknowledgments ?? {}) as AckMap,
    signed: (profile.signed_docs ?? {}) as SignedMap,
    packs: (profile.private_acks ?? {}) as AckMap,
    psigned: (profile.private_signed ?? {}) as SignedMap,
    currentStep: activeProgress.step,
    currentRoute: activeProgress.route,
    ffCurrentStep: ffProgress.step,
    ffCurrentRoute: ffProgress.route,
    privateCurrentStep: privateProgress.step,
    privateCurrentRoute: privateProgress.route,
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
  if (patch.ff_current_step !== undefined) update.ff_current_step = patch.ff_current_step;
  if (patch.ff_current_route !== undefined) update.ff_current_route = patch.ff_current_route;
  if (patch.private_current_step !== undefined) {
    update.private_current_step = patch.private_current_step;
  }
  if (patch.private_current_route !== undefined) {
    update.private_current_route = patch.private_current_route;
  }
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
    const track = patch.offering_type ?? existing?.offering_type ?? null;
    update.amount_cents = amountStringToValidCents(patch.amount, track);
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

/** Persist application fields for the active track without touching the other track. */
export function applicationPatchForTrack(
  offeringType: OfferingType | null,
  app: InvestorApp,
  papp: PrivateApp,
): PortalStatePatch {
  if (offeringType === "private") {
    return { papp };
  }
  if (offeringType === "friends_family") {
    return appToPatch(app);
  }
  return {};
}
