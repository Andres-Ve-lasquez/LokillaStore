import { NextRequest, NextResponse } from "next/server";

type Bucket = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  key: string;
  windowMs: number;
  max: number;
  message?: string;
};

type GlobalWithRateLimit = typeof globalThis & {
  __lookillaRateLimitStore?: Map<string, Bucket>;
};

function getStore() {
  const globalState = globalThis as GlobalWithRateLimit;
  if (!globalState.__lookillaRateLimitStore) {
    globalState.__lookillaRateLimitStore = new Map<string, Bucket>();
  }
  return globalState.__lookillaRateLimitStore;
}

function getClientIp(req: NextRequest) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return req.headers.get("x-real-ip") || "unknown";
}

export function applyRateLimit(req: NextRequest, options: RateLimitOptions) {
  const store = getStore();
  const now = Date.now();
  const clientKey = `${options.key}:${getClientIp(req)}`;
  const current = store.get(clientKey);

  if (!current || current.resetAt <= now) {
    store.set(clientKey, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    return null;
  }

  current.count += 1;
  store.set(clientKey, current);

  if (current.count > options.max) {
    const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    return NextResponse.json(
      { ok: false, error: options.message ?? "Demasiadas solicitudes" },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSeconds),
        },
      }
    );
  }

  return null;
}
