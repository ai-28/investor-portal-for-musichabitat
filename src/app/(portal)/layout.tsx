import { AuthSessionProvider } from "@/components/AuthSessionProvider";
import { PortalProvider } from "@/portal/PortalProvider";

export const dynamic = "force-dynamic";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthSessionProvider>
      <PortalProvider>{children}</PortalProvider>
    </AuthSessionProvider>
  );
}
