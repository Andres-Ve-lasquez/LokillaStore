import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, verifyAdminSessionToken } from "@/lib/adminAuth";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/gestion-lk-2024") && pathname !== "/gestion-lk-2024/login") {
    const token = req.cookies.get(ADMIN_COOKIE)?.value;
    const isValid = await verifyAdminSessionToken(token);

    if (!isValid) {
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
