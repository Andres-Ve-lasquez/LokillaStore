import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE = "admin_auth";
const SESSION_TOKEN = "lokilla-admin-ok";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/gestion-lk-2024") && pathname !== "/gestion-lk-2024/login") {
    const token = req.cookies.get(ADMIN_COOKIE)?.value;
    if (!token || token !== SESSION_TOKEN) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/gestion-lk-2024/login";
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/gestion-lk-2024/:path*"],
};
