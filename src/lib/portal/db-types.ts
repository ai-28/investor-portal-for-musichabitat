import type { AckMap, InvestorApp, PrivateApp, ReadMap, SignedMap } from "@/portal/types";

export type OfferingType = "friends_family" | "private";

export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "signed"
  | "funded"
  | "complete";

export type PaymentStatus = "pending" | "authorized" | "cleared" | "failed";

export interface InvestorProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  offering_type: OfferingType | null;
  referrer_id: string | null;
  referrer_rejected: boolean;
  current_step: number;
  current_route: string | null;
  ff_current_step: number;
  ff_current_route: string | null;
  private_current_step: number;
  private_current_route: string | null;
  amount_cents: number | null;
  accredited_confirmed: boolean;
  application_status: ApplicationStatus;
  read_docs: ReadMap;
  acknowledgments: AckMap;
  signed_docs: SignedMap;
  private_app: PrivateApp;
  private_acks: AckMap;
  private_signed: SignedMap;
  nda_signed_ff: boolean;
  nda_signed_private: boolean;
  nda_signer_name: string | null;
  nda_signed_ff_at: string | null;
  nda_signed_private_at: string | null;
  private_application_status: ApplicationStatus;
  private_payment_status: PaymentStatus | null;
  payment_status: PaymentStatus | null;
  guardian_serial: number | null;
  created_at: string;
  updated_at: string;
}

export interface PortalStatePayload {
  profile: InvestorProfileRow | null;
  app: InvestorApp;
  papp: PrivateApp;
  read: ReadMap;
  acks: AckMap;
  signed: SignedMap;
  packs: AckMap;
  psigned: SignedMap;
  currentStep: number;
  currentRoute: string | null;
  ffCurrentStep: number;
  ffCurrentRoute: string | null;
  privateCurrentStep: number;
  privateCurrentRoute: string | null;
  offeringType: OfferingType | null;
  ndaSignedFf: boolean;
  ndaSignedPrivate: boolean;
}

export interface PortalStatePatch {
  offering_type?: OfferingType;
  referrer_id?: string | null;
  referrer_rejected?: boolean;
  current_step?: number;
  current_route?: string;
  ff_current_step?: number;
  ff_current_route?: string;
  private_current_step?: number;
  private_current_route?: string;
  full_name?: string;
  phone?: string;
  email?: string;
  amount?: string;
  accredited?: boolean;
  read?: ReadMap;
  acks?: AckMap;
  signed?: SignedMap;
  papp?: Partial<PrivateApp>;
  packs?: AckMap;
  psigned?: SignedMap;
  nda_signed_ff?: boolean;
  nda_signed_private?: boolean;
  nda_signer_name?: string;
  nda_signed_ff_at?: string;
  nda_signed_private_at?: string;
  private_application_status?: ApplicationStatus;
  private_payment_status?: PaymentStatus | null;
  application_status?: ApplicationStatus;
  payment_status?: PaymentStatus | null;
}
