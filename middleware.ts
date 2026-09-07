import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionCookieEdge } from "@/lib/auth-edge";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Allow login page & its API through
  if (pathname === "/admin/login" || pathname === "/admin/logout") {
    return NextResponse.next();
  }
  if (pathname.startsWith("/admin")) {
    const cookie = req.cookies.get("admin_session")?.value;
    const valid = await verifySessionCookieEdge(cookie);
    if (!valid) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      if (pathname !== "/admin") url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
