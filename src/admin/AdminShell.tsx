"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Logo } from "@/portal/ui/Logo";
import { C, FONT_BODY, FONT_DISPLAY } from "@/portal/tokens";

const NAV = [
  { href: "/admin/investors", label: "Investors" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/users", label: "Admin users" },
  { href: "/admin/profile", label: "Profile" },
] as const;

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      style={{
        display: "block",
        padding: "10px 14px",
        borderRadius: 8,
        fontSize: 13,
        textDecoration: "none",
        color: active ? C.text : C.textDim,
        background: active ? C.cardHi : "transparent",
        border: `1px solid ${active ? C.line : "transparent"}`,
        fontFamily: FONT_BODY,
      }}
    >
      {label}
    </Link>
  );
}

export function AdminShell({
  children,
  title,
  actions,
  centerContent = false,
}: {
  children: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
  centerContent?: boolean;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        fontFamily: FONT_BODY,
        display: "flex",
      }}
    >
      <aside
        style={{
          width: 232,
          flexShrink: 0,
          borderRight: `1px solid ${C.line}`,
          padding: "20px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          position: "sticky",
          top: 0,
          alignSelf: "flex-start",
          minHeight: "100vh",
          boxSizing: "border-box",
        }}
      >
        <Link
          href="/admin/investors"
          style={{
            textDecoration: "none",
            padding: "4px 8px 8px",
            display: "block",
          }}
        >
          <Logo size={22} center />
        </Link>

        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {NAV.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          style={{
            marginTop: "auto",
            background: "transparent",
            border: `1px solid ${C.line}`,
            color: C.textDim,
            borderRadius: 8,
            padding: "10px 14px",
            fontSize: 12,
            cursor: "pointer",
            textAlign: "left",
            width: "100%",
          }}
        >
          Sign out
        </button>
      </aside>

      <div style={{ flex: 1, minWidth: 0 }}>
        <main
          style={{
            maxWidth: centerContent ? 480 : 1100,
            margin: "0 auto",
            padding: "48px 28px 48px",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {title ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                marginBottom: 20,
              }}
            >
              <h1
                style={{
                  margin: 0,
                  fontFamily: FONT_DISPLAY,
                  fontSize: 22,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                }}
              >
                {title}
              </h1>
              {actions ? <div style={{ flexShrink: 0 }}>{actions}</div> : null}
            </div>
          ) : null}
          <div
            style={
              centerContent
                ? { display: "flex", justifyContent: "center", width: "100%" }
                : undefined
            }
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
