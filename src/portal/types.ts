import type { CSSProperties, Dispatch, ReactNode, SetStateAction } from "react";
import type { OfferingType, PaymentStatus } from "@/lib/portal/db-types";

/** Internal route key (legacy) or doc_view:id */
export type RouteKey = string;

export type GoFn = (
  route: RouteKey,
  options?: { replace?: boolean },
) => Promise<void>;

export type AuthMode = "signin" | "signup";

export interface PortalUser {
  id: string;
  email: string;
}

export interface InvestorApp {
  fullName: string;
  email: string;
  phone: string;
  amount: string;
  accredited: boolean;
}

export type ReadMap = Record<string, boolean>;
export type AckMap = Record<string, boolean>;
export type SignedMap = Record<string, boolean>;

export interface PrivateApp {
  fullName: string;
  email: string;
  phone: string;
  amount: string;
  accreditedBasis: string[];
  verifyMethod: string;
}

export const emptyPrivateApp: PrivateApp = {
  fullName: "",
  email: "",
  phone: "",
  amount: "",
  accreditedBasis: [],
  verifyMethod: "",
};

export interface PortalContextValue {
  route: RouteKey;
  go: GoFn;
  read: ReadMap;
  markRead: (id: string) => void;
  app: InvestorApp;
  setApp: Dispatch<SetStateAction<InvestorApp>>;
  acks: AckMap;
  setAcks: Dispatch<SetStateAction<AckMap>>;
  signed: SignedMap;
  setSigned: Dispatch<SetStateAction<SignedMap>>;
  papp: PrivateApp;
  setPapp: Dispatch<SetStateAction<PrivateApp>>;
  packs: AckMap;
  setPacks: Dispatch<SetStateAction<AckMap>>;
  psigned: SignedMap;
  setPsigned: Dispatch<SetStateAction<SignedMap>>;
  currentRoute: string | null;
  user: PortalUser | null;
  authLoading: boolean;
  hydrated: boolean;
  currentStep: number;
  ffCurrentStep: number;
  privateCurrentStep: number;
  offeringType: OfferingType | null;
  paymentStatus: PaymentStatus | null;
  privatePaymentStatus: PaymentStatus | null;
  signOut: () => Promise<void>;
  saveReferrer: (referrerId: string | null, rejected?: boolean) => Promise<void>;
  resumeRoute: () => string;
  refreshState: () => Promise<void>;
  markApplicationSubmitted: () => Promise<void>;
  recordPaymentStatus: (
    status: "pending" | "authorized" | "cleared" | "failed",
    track?: OfferingType,
  ) => Promise<void>;
  acceptNda: (track: OfferingType, signerName?: string) => Promise<void>;
  /** Advance past NDA after DocuSign shows fully executed mutual NDA. */
  continueAfterNda: (track: OfferingType) => Promise<void>;
  /** Skip founder call scheduling — return to completion screen, not portal home. */
  finishFounderCallStep: (track: OfferingType) => Promise<void>;
}

export interface NDAGateProps extends BackProps {
  track: OfferingType;
  accent?: string;
}

export interface BackProps {
  onBack: () => void;
}

export interface FlowProps extends BackProps {
  go: GoFn;
}

export interface Page1Props {
  go: GoFn;
  openExecSummary: () => void;
}

export interface GatePageProps extends BackProps {
  title: string;
  accent: string;
  offeringType: OfferingType;
}

export interface Page5Props extends FlowProps {
  read: ReadMap;
  markRead: (id: string) => void;
}

export interface Page7Props extends FlowProps {
  app: InvestorApp;
  setApp: Dispatch<SetStateAction<InvestorApp>>;
}

export interface Page8Props extends FlowProps {
  app: InvestorApp;
}

export interface Page9Props extends FlowProps {
  acks: AckMap;
  setAcks: Dispatch<SetStateAction<AckMap>>;
}

export interface Page10Props extends FlowProps {
  signed: SignedMap;
  setSigned: Dispatch<SetStateAction<SignedMap>>;
  app: InvestorApp;
}

export interface Page11Props extends FlowProps {
  app: InvestorApp;
}

export interface Page12Props extends FlowProps {
  app: InvestorApp;
}

export interface Page13Props extends FlowProps {
  app: InvestorApp;
}

export interface DocViewerProps extends BackProps {
  docId: string;
}

export interface ShellProps {
  children: ReactNode;
  step?: number;
  total?: number;
  onBack?: () => void;
}

export interface TopBarProps {
  step?: number;
  total?: number;
  onBack?: () => void;
}

export type BtnVariant = "amber" | "teal" | "ghost";

export interface BtnProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: BtnVariant;
  full?: boolean;
  disabled?: boolean;
  style?: CSSProperties;
}

export interface CardProps {
  children: ReactNode;
  style?: CSSProperties;
  onClick?: () => void;
  accent?: string;
}

export interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}

export interface TypographyProps {
  children: ReactNode;
  accent?: string;
  size?: number;
  style?: CSSProperties;
}

export interface KickerProps {
  children: ReactNode;
  color?: string;
}

export interface LogoProps {
  size?: number;
  center?: boolean;
}

export interface AvatarProps {
  name: string;
  img?: string;
  selected?: boolean;
  size?: number;
  flat?: boolean;
}

export interface CountdownProps {
  target?: string;
}

export interface StepNavProps {
  step?: number;
}

export interface SizeProps {
  size?: number;
}

export interface GuardianBadgeProps extends SizeProps {
  serial?: string;
}
