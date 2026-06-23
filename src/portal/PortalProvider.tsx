"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut as nextAuthSignOut, useSession } from "next-auth/react";
import { pathToRoute, routeToPath } from "@/portal/navigation";
import type {
  AckMap,
  InvestorApp,
  PortalContextValue,
  PortalUser,
  PrivateApp,
  ReadMap,
  SignedMap,
} from "@/portal/types";
import { emptyPrivateApp } from "@/portal/types";
import type { OfferingType, PaymentStatus } from "@/lib/portal/db-types";
import {
  applicationPatchForTrack,
  emptyApp,
  isFfProgressRoute,
  isPrivateProgressRoute,
  isTrackGatedRoute,
  isRouteAheadOfAllowed,
  maxProgressRouteForTrack,
  profileToPortalState,
  resumeRouteFromProfile,
  routeToStep,
  routeToTrack,
  trackRoutePatch,
} from "@/lib/portal/state";
import { fetchPortalState, patchPortalState, PortalSessionInvalidError } from "@/lib/portal/sync-client";

const PortalContext = createContext<PortalContextValue | null>(null);

export function PortalProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const route = pathToRoute(pathname);
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const userEmail = session?.user?.email;
  const user = useMemo(() => {
    if (!userId || !userEmail) return null;
    return { id: userId, email: userEmail };
  }, [userId, userEmail]);
  const authLoading = status === "loading";

  const [hydrated, setHydrated] = useState(false);
  const [currentStep, setCurrentStep] = useState(2);
  const [currentRoute, setCurrentRoute] = useState<string | null>(null);
  const [ffCurrentStep, setFfCurrentStep] = useState(2);
  const [ffCurrentRoute, setFfCurrentRoute] = useState<string | null>(null);
  const [privateCurrentStep, setPrivateCurrentStep] = useState(2);
  const [privateCurrentRoute, setPrivateCurrentRoute] = useState<string | null>(null);
  const [offeringType, setOfferingType] = useState<OfferingType | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [privatePaymentStatus, setPrivatePaymentStatus] = useState<PaymentStatus | null>(
    null,
  );
  const [ndaSignedFf, setNdaSignedFf] = useState(false);
  const [ndaSignedPrivate, setNdaSignedPrivate] = useState(false);

  const [read, setRead] = useState<ReadMap>({});
  const [app, setApp] = useState<InvestorApp>(emptyApp);
  const [acks, setAcks] = useState<AckMap>({});
  const [signed, setSigned] = useState<SignedMap>({});
  const [papp, setPapp] = useState<PrivateApp>({ ...emptyPrivateApp });
  const [packs, setPacks] = useState<AckMap>({});
  const [psigned, setPsigned] = useState<SignedMap>({});

  const skipSyncRef = useRef(true);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydratedUserIdRef = useRef<string | null>(null);

  const applyPortalState = useCallback(
    (state: ReturnType<typeof profileToPortalState>) => {
      skipSyncRef.current = true;
      setApp(state.app);
      setPapp(state.papp);
      setRead(state.read);
      setAcks(state.acks);
      setSigned(state.signed);
      setPacks(state.packs);
      setPsigned(state.psigned);
      setCurrentStep(state.currentStep);
      setCurrentRoute(state.currentRoute);
      setFfCurrentStep(state.ffCurrentStep);
      setFfCurrentRoute(state.ffCurrentRoute);
      setPrivateCurrentStep(state.privateCurrentStep);
      setPrivateCurrentRoute(state.privateCurrentRoute);
      setOfferingType(state.offeringType);
      setPaymentStatus(state.profile?.payment_status ?? null);
      setPrivatePaymentStatus(state.profile?.private_payment_status ?? null);
      setNdaSignedFf(state.ndaSignedFf);
      setNdaSignedPrivate(state.ndaSignedPrivate);
      requestAnimationFrame(() => {
        skipSyncRef.current = false;
      });
    },
    [],
  );

  const hydrateFromServer = useCallback(async () => {
    try {
      const state = await fetchPortalState();
      if (state) applyPortalState(state);
    } catch (err) {
      if (err instanceof PortalSessionInvalidError) {
        await nextAuthSignOut({ redirect: false });
        router.push("/");
        return;
      }
      console.error("Failed to hydrate portal state", err);
    } finally {
      setHydrated(true);
    }
  }, [applyPortalState, router]);

  useEffect(() => {
    if (authLoading) return;

    if (!userId) {
      hydratedUserIdRef.current = null;
      skipSyncRef.current = true;
      setHydrated(true);
      setApp(emptyApp);
      setPapp({ ...emptyPrivateApp });
      setRead({});
      setAcks({});
      setSigned({});
      setPacks({});
      setPsigned({});
      setCurrentStep(2);
      setCurrentRoute(null);
      setFfCurrentStep(2);
      setFfCurrentRoute(null);
      setPrivateCurrentStep(2);
      setPrivateCurrentRoute(null);
      setOfferingType(null);
      setPaymentStatus(null);
      setPrivatePaymentStatus(null);
      setNdaSignedFf(false);
      setNdaSignedPrivate(false);
      return;
    }

    if (hydratedUserIdRef.current === userId) return;

    hydratedUserIdRef.current = userId;
    setHydrated(false);
    hydrateFromServer();
  }, [userId, authLoading, hydrateFromServer]);

  const queueFullSync = useCallback(() => {
    if (!user || skipSyncRef.current) return;

    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(async () => {
      try {
        await patchPortalState({
          ...applicationPatchForTrack(offeringType, app, papp),
          read,
          acks,
          signed,
          packs,
          psigned,
          ff_current_route: ffCurrentRoute ?? undefined,
          ff_current_step: ffCurrentStep,
          private_current_route: privateCurrentRoute ?? undefined,
          private_current_step: privateCurrentStep,
        });
      } catch (err) {
        if (err instanceof PortalSessionInvalidError) {
          await nextAuthSignOut({ redirect: false });
          router.push("/");
          return;
        }
        console.error("Failed to sync portal state", err);
      }
    }, 500);
  }, [
    user,
    app,
    papp,
    read,
    acks,
    signed,
    packs,
    psigned,
    ffCurrentStep,
    ffCurrentRoute,
    privateCurrentStep,
    privateCurrentRoute,
    offeringType,
    router,
  ]);

  useEffect(() => {
    queueFullSync();
  }, [app, papp, read, acks, signed, packs, psigned, queueFullSync]);

  /** Block skipping ahead by typing URLs; only saved progress routes are reachable. */
  useEffect(() => {
    if (!hydrated || skipSyncRef.current || !user) return;

    const track = routeToTrack(route);
    if (!track || !isTrackGatedRoute(route)) return;

    const trackRoute =
      track === "private" ? privateCurrentRoute : ffCurrentRoute;
    const trackStep =
      track === "private" ? privateCurrentStep : ffCurrentStep;
    const allowedRoute = maxProgressRouteForTrack(
      track,
      ndaSignedFf,
      ndaSignedPrivate,
      ffCurrentRoute,
      privateCurrentRoute,
    );

    if (isRouteAheadOfAllowed(track, route, allowedRoute)) {
      router.replace(routeToPath(allowedRoute));
    }
  }, [
    route,
    hydrated,
    user,
    ffCurrentRoute,
    ffCurrentStep,
    privateCurrentRoute,
    privateCurrentStep,
    ndaSignedFf,
    ndaSignedPrivate,
    router,
  ]);

  /** Keep active track aligned with URL; block cross-track browser history leaks. */
  useEffect(() => {
    if (!hydrated || skipSyncRef.current) return;

    const urlTrack = routeToTrack(route);

    if (
      urlTrack === "friends_family" &&
      (isFfProgressRoute(route) || route === "nda_ff")
    ) {
      if (offeringType === "private") {
        router.replace(
          routeToPath(privateCurrentRoute ?? "pp_welcome_ceo"),
        );
        return;
      }
      setOfferingType("friends_family");
      const step = routeToStep(route);
      const allowedRoute = maxProgressRouteForTrack(
        "friends_family",
        ndaSignedFf,
        ndaSignedPrivate,
        ffCurrentRoute,
        privateCurrentRoute,
      );
      if (isRouteAheadOfAllowed("friends_family", route, allowedRoute)) {
        return;
      }
      setCurrentRoute(route);
      if (step) setCurrentStep(step);
      if (ffCurrentRoute !== route) {
        setFfCurrentRoute(route);
        if (step) setFfCurrentStep(step);
        if (user) {
          patchPortalState({
            offering_type: "friends_family",
            ff_current_route: route,
            ...(step != null ? { ff_current_step: step } : {}),
          }).catch((err) => console.error("Failed to save F&F route", err));
        }
      }
      return;
    }

    if (
      urlTrack === "private" &&
      (isPrivateProgressRoute(route) || route === "nda_private")
    ) {
      if (offeringType === "friends_family") {
        router.replace(routeToPath(ffCurrentRoute ?? "page2"));
        return;
      }
      setOfferingType("private");
      const allowedRoute = maxProgressRouteForTrack(
        "private",
        ndaSignedFf,
        ndaSignedPrivate,
        ffCurrentRoute,
        privateCurrentRoute,
      );
      if (isRouteAheadOfAllowed("private", route, allowedRoute)) {
        return;
      }
      setCurrentRoute(route);
      if (privateCurrentRoute !== route) {
        setPrivateCurrentRoute(route);
        if (user) {
          patchPortalState({
            offering_type: "private",
            private_current_route: route,
          }).catch((err) => console.error("Failed to save private route", err));
        }
      }
    }
  }, [
    route,
    hydrated,
    user,
    offeringType,
    ffCurrentRoute,
    privateCurrentRoute,
    router,
  ]);

  const go = useCallback(
    async (nextRoute: string, options?: { replace?: boolean }) => {
      const step = routeToStep(nextRoute);
      const track = routeToTrack(nextRoute);

      setCurrentRoute(nextRoute);
      if (step) setCurrentStep(step);

      if (track === "friends_family") {
        setFfCurrentRoute(nextRoute);
        if (step) setFfCurrentStep(step);
        setOfferingType("friends_family");
      } else if (track === "private") {
        setPrivateCurrentRoute(nextRoute);
        if (step) setPrivateCurrentStep(step);
        setOfferingType("private");
      }

      if (user && !skipSyncRef.current) {
        try {
          const state = await patchPortalState({
            ...trackRoutePatch(nextRoute, step),
            ...(track ? { offering_type: track } : {}),
          });
          applyPortalState(state);
        } catch (err) {
          console.error("Failed to save route", err);
        }
      }

      const path = routeToPath(nextRoute);
      if (options?.replace) router.replace(path);
      else router.push(path);
      if (typeof window !== "undefined") window.scrollTo(0, 0);
    },
    [router, user, applyPortalState],
  );

  const markRead = useCallback((id: string) => {
    setRead((r) => ({ ...r, [id]: true }));
  }, []);

  const signOut = useCallback(async () => {
    await nextAuthSignOut({ redirect: false });
    router.push("/");
  }, [router]);

  const saveReferrer = useCallback(
    async (referrerId: string | null, rejected = false) => {
      if (!user) return;
      try {
        const state = await patchPortalState({
          referrer_id: referrerId,
          referrer_rejected: rejected,
        });
        applyPortalState(state);
      } catch (err) {
        console.error("Failed to save referrer", err);
      }
    },
    [user, applyPortalState],
  );

  const resumeRoute = useCallback(() => {
    const track = offeringType;
    if (!track) return "page2";

    const progress =
      track === "private"
        ? { route: privateCurrentRoute, step: privateCurrentStep }
        : { route: ffCurrentRoute, step: ffCurrentStep };

    return resumeRouteFromProfile(
      track,
      progress.route,
      ndaSignedFf,
      ndaSignedPrivate,
      progress.step,
    );
  }, [
    offeringType,
    ffCurrentRoute,
    ffCurrentStep,
    privateCurrentRoute,
    privateCurrentStep,
    ndaSignedFf,
    ndaSignedPrivate,
  ]);

  const refreshState = useCallback(async () => {
    if (!userId) return;
    setHydrated(false);
    await hydrateFromServer();
  }, [userId, hydrateFromServer]);

  const continueAfterNda = useCallback(
    async (track: OfferingType) => {
      const firstRoute = track === "private" ? "pp_welcome_ceo" : "page2";
      const now = new Date().toISOString();
      const ndaPatch =
        track === "private"
          ? { nda_signed_private: true, nda_signed_private_at: now }
          : { nda_signed_ff: true, nda_signed_ff_at: now };

      setOfferingType(track);
      setCurrentRoute(firstRoute);
      if (track === "private") {
        setPrivateCurrentRoute(firstRoute);
      } else {
        setFfCurrentRoute(firstRoute);
        setFfCurrentStep(2);
      }

      if (!user) {
        go(firstRoute);
        return;
      }
      try {
        const state = await patchPortalState({
          offering_type: track,
          ...ndaPatch,
          ...trackRoutePatch(firstRoute, track === "friends_family" ? 2 : null),
        });
        applyPortalState(state);
        go(firstRoute);
      } catch (err) {
        console.error("Failed to continue after NDA", err);
      }
    },
    [user, applyPortalState, go],
  );

  const acceptNda = useCallback(
    async (track: OfferingType, signerName?: string) => {
      await continueAfterNda(track);
    },
    [continueAfterNda],
  );

  const markApplicationSubmitted = useCallback(async () => {
    if (!user) return;
    try {
      const state = await patchPortalState({ application_status: "submitted" });
      applyPortalState(state);
    } catch (err) {
      console.error("Failed to mark application submitted", err);
    }
  }, [user, applyPortalState]);

  const finishFounderCallStep = useCallback(
    async (track: OfferingType) => {
      const completionRoute = track === "private" ? "pp_welcome" : "page12";
      const completionStep = track === "private" ? 11 : 13;

      setCurrentRoute(completionRoute);
      setCurrentStep(completionStep);
      setOfferingType(track);

      if (track === "private") {
        setPrivateCurrentRoute(completionRoute);
        setPrivateCurrentStep(completionStep);
      } else {
        setFfCurrentRoute(completionRoute);
        setFfCurrentStep(completionStep);
      }

      if (user && !skipSyncRef.current) {
        try {
          await patchPortalState({
            offering_type: track,
            ...(track === "private"
              ? {
                  private_current_route: completionRoute,
                  private_current_step: completionStep,
                }
              : {
                  ff_current_route: completionRoute,
                  ff_current_step: completionStep,
                }),
          });
        } catch (err) {
          console.error("Failed to save founder call step", err);
        }
      }

      router.replace(routeToPath(completionRoute));
      if (typeof window !== "undefined") window.scrollTo(0, 0);
    },
    [router, user],
  );

  const recordPaymentStatus = useCallback(
    async (
      status: "pending" | "authorized" | "cleared" | "failed",
      track: OfferingType = offeringType ?? "friends_family",
    ) => {
      if (!user) return;
      try {
        const funded = status === "cleared" || status === "authorized";
        const patch =
          track === "private"
            ? {
                private_payment_status: status,
                private_application_status: funded ? ("funded" as const) : undefined,
              }
            : {
                payment_status: status,
                application_status: funded ? ("funded" as const) : undefined,
              };
        const state = await patchPortalState(patch);
        applyPortalState(state);
      } catch (err) {
        console.error("Failed to record payment status", err);
      }
    },
    [user, applyPortalState, offeringType],
  );

  const value = useMemo<PortalContextValue>(
    () => ({
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
      currentRoute,
      user,
      authLoading,
      hydrated,
      currentStep,
      offeringType,
      paymentStatus,
      privatePaymentStatus,
      signOut,
      saveReferrer,
      resumeRoute,
      refreshState,
      acceptNda,
      continueAfterNda,
      markApplicationSubmitted,
      recordPaymentStatus,
      finishFounderCallStep,
      ffCurrentStep,
      privateCurrentStep,
    }),
    [
      route,
      go,
      read,
      markRead,
      app,
      acks,
      signed,
      papp,
      packs,
      psigned,
      currentRoute,
      user,
      authLoading,
      hydrated,
      currentStep,
      offeringType,
      paymentStatus,
      privatePaymentStatus,
      signOut,
      saveReferrer,
      resumeRoute,
      refreshState,
      acceptNda,
      continueAfterNda,
      markApplicationSubmitted,
      recordPaymentStatus,
      finishFounderCallStep,
      ffCurrentStep,
      privateCurrentStep,
    ],
  );

  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
}

export function usePortal(): PortalContextValue {
  const ctx = useContext(PortalContext);
  if (!ctx) throw new Error("usePortal must be used within PortalProvider");
  return ctx;
}
