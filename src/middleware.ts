import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin/admins";

const PROTECTED_PREFIXES = ["/step/", "/docs/", "/nda/", "/private/"];

export default withAuth(
  async function middleware(req) {
    const pathname = req.nextUrl.pathname;
    const token = req.nextauth.token;
    const email = token?.email as string | undefined;
    const userId = (token?.id ?? token?.sub) as string | undefined;

    if (pathname.startsWith("/admin")) {
      const isLogin = pathname === "/admin/login";

      if (isLogin) {
        if (token && userId && email && (await isAdminUser(userId, email))) {
          const url = req.nextUrl.clone();
          url.pathname = "/admin/investors";
          return NextResponse.redirect(url);
        }
        return NextResponse.next();
      }

      if (!token || !userId || !email || !(await isAdminUser(userId, email))) {
        const url = req.nextUrl.clone();
        url.pathname = "/admin/login";
        return NextResponse.redirect(url);
      }

      return NextResponse.next();
    }

    const isProtected = PROTECTED_PREFIXES.some((prefix) =>
      pathname.startsWith(prefix),
    );

    if (isProtected && !token) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/";
      redirectUrl.searchParams.set("auth", "required");
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const pathname = req.nextUrl.pathname;

        if (pathname.startsWith("/admin")) {
          if (pathname === "/admin/login") return true;
          return !!token;
        }

        const isProtected = PROTECTED_PREFIXES.some((prefix) =>
          pathname.startsWith(prefix),
        );
        if (!isProtected) return true;
        return !!token;
      },
    },
  },
);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
