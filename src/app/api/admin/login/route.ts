export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  createAdminSessionToken,
  getAdminSessionMaxAge,
} from "@/lib/adminAuth";
import { applyRateLimit } from "@/lib/rateLimit";

const IS_PROD = process.env.NODE_ENV === "production";

export async function POST(req: NextRequest) {
  const limited = applyRateLimit(req, {
    key: "admin-login",
    max: 10,
    windowMs: 10 * 60 * 1000,
    message: "Demasiados intentos de acceso. Intenta de nuevo en unos minutos.",
  });
  if (limited) return limited;

  const { password } = await req.json();

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false, error: "Contraseña incorrecta" }, { status: 401 });
  }

  const sessionToken = await createAdminSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, sessionToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "lax",
    maxAge: getAdminSessionMaxAge(),
    path: "/",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { maxAge: 0, path: "/" });
  return res;
}
