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
import type { OfferingType } from "@/lib/portal/db-types";
import {
  applicationPatchForTrack,
  emptyApp,
  profileToPortalState,
  resumeRouteFromProfile,
  routeToStep,
} from "@/lib/portal/state";
import { fetchPortalState, patchPortalState } from "@/lib/portal/sync-client";

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
  const [offeringType, setOfferingType] = useState<OfferingType | null>(null);
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
      setOfferingType(state.offeringType);
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
      console.error("Failed to hydrate portal state", err);
    } finally {
      setHydrated(true);
    }
  }, [applyPortalState]);

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
      setOfferingType(null);
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
          current_step: currentStep,
          current_route: currentRoute ?? undefined,
        });
      } catch (err) {
        console.error("Failed to sync portal state", err);
      }
    }, 500);
  }, [user, app, papp, read, acks, signed, packs, psigned, currentStep, currentRoute, offeringType]);

  useEffect(() => {
    queueFullSync();
  }, [app, papp, read, acks, signed, packs, psigned, queueFullSync]);

  const go = useCallback(
    (nextRoute: string) => {
      const step = routeToStep(nextRoute);
      setCurrentRoute(nextRoute);
      if (step) setCurrentStep(step);

      if (user && !skipSyncRef.current) {
        patchPortalState({
          current_route: nextRoute,
          ...(step ? { current_step: step } : {}),
        }).catch((err) => console.error("Failed to save route", err));
      }

      router.push(routeToPath(nextRoute));
      if (typeof window !== "undefined") window.scrollTo(0, 0);
    },
    [router, user],
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
    return resumeRouteFromProfile(
      offeringType,
      currentRoute,
      ndaSignedFf,
      ndaSignedPrivate,
      currentStep,
    );
  }, [offeringType, currentRoute, ndaSignedFf, ndaSignedPrivate, currentStep]);

  const refreshState = useCallback(async () => {
    if (!userId) return;
    setHydrated(false);
    await hydrateFromServer();
  }, [userId, hydrateFromServer]);

  const acceptNda = useCallback(
    async (track: OfferingType, signerName?: string) => {
      const nextRoute = track === "private" ? "pp_welcome_ceo" : "page2";
      if (track === "private") setNdaSignedPrivate(true);
      else setNdaSignedFf(true);
      setCurrentRoute(nextRoute);

      if (!user) return;
      try {
        const now = new Date().toISOString();
        const state = await patchPortalState({
          nda_signed_ff: track === "friends_family" ? true : undefined,
          nda_signed_private: track === "private" ? true : undefined,
          nda_signer_name: signerName,
          nda_signed_ff_at: track === "friends_family" ? now : undefined,
          nda_signed_private_at: track === "private" ? now : undefined,
          current_route: nextRoute,
        });
        applyPortalState(state);
      } catch (err) {
        console.error("Failed to save NDA acceptance", err);
      }
    },
    [user, applyPortalState],
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

  const recordPaymentStatus = useCallback(
    async (status: "pending" | "authorized" | "cleared" | "failed") => {
      if (!user) return;
      try {
        const state = await patchPortalState({
          payment_status: status,
          application_status: status === "authorized" ? "funded" : undefined,
        });
        applyPortalState(state);
      } catch (err) {
        console.error("Failed to record payment status", err);
      }
    },
    [user, applyPortalState],
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
      signOut,
      saveReferrer,
      resumeRoute,
      refreshState,
      acceptNda,
      markApplicationSubmitted,
      recordPaymentStatus,
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
      signOut,
      saveReferrer,
      resumeRoute,
      refreshState,
      acceptNda,
      markApplicationSubmitted,
      recordPaymentStatus,
    ],
  );

  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
}

export function usePortal(): PortalContextValue {
  const ctx = useContext(PortalContext);
  if (!ctx) throw new Error("usePortal must be used within PortalProvider");
  return ctx;
}
