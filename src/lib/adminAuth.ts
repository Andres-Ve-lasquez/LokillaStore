import { NextRequest, NextResponse } from "next/server";

export const ADMIN_COOKIE = "admin_auth";

const SESSION_TTL_SECONDS = 60 * 60 * 8;
const SESSION_TTL_MS = SESSION_TTL_SECONDS * 1000;

function getAdminSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error("Missing ADMIN_PASSWORD or ADMIN_SESSION_SECRET");
  }
  return secret;
}

function toBase64Url(bytes: Uint8Array) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
  }

  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

async function signValue(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getAdminSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return toBase64Url(new Uint8Array(signature));
}

export async function createAdminSessionToken() {
  const expiresAt = String(Date.now() + SESSION_TTL_MS);
  const signature = await signValue(expiresAt);
  return `${expiresAt}.${signature}`;
}

export async function verifyAdminSessionToken(token?: string | null) {
  if (!token) return false;

  const [expiresAt, signature] = token.split(".");
  if (!expiresAt || !signature) return false;

  const expiration = Number(expiresAt);
  if (!Number.isFinite(expiration) || expiration <= Date.now()) return false;

  const expectedSignature = await signValue(expiresAt);
  return signature === expectedSignature;
}

export function getAdminSessionMaxAge() {
  return SESSION_TTL_SECONDS;
}

function isAllowedOrigin(req: NextRequest) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return true;

  const origin = req.headers.get("origin");
  if (!origin) return true;

  return origin === new URL(req.url).origin;
}

export async function requireAdmin(req: NextRequest) {
  if (!isAllowedOrigin(req)) {
    return NextResponse.json({ ok: false, error: "Origen no permitido" }, { status: 403 });
  }

  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  const isValid = await verifyAdminSessionToken(token);

  if (!isValid) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  return null;
}
