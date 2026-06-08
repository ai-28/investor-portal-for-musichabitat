import { AuthSessionProvider } from "@/components/AuthSessionProvider";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Music Habitat — Ops",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AuthSessionProvider>{children}</AuthSessionProvider>;
}
