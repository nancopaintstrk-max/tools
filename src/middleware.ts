import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect /admin routes (not /admin/login or /api/admin/login)
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";
  const isLoginApi = pathname.startsWith("/api/admin");

  if (isLoginPage || isLoginApi) {
    return NextResponse.next();
  }

  if (isAdminRoute) {
    const authCookie = req.cookies.get("admin_auth");
    const secret = process.env.ADMIN_SECRET || "crafter_secret";

    if (!authCookie || authCookie.value !== secret) {
      // Redirect to login page
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
