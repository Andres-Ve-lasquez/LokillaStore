export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ ok: false, error: "No encontrado" }, { status: 404 });
  }

  const unauthorized = await requireAdmin(req);
  if (unauthorized) return unauthorized;

  try {
    const conn = await dbConnect();
    const col = conn.connection.db.collection("products");
    const count = await col.countDocuments();
    const sample = await col.find({}).limit(10).toArray();
    const keys = sample[0] ? Object.keys(sample[0]) : [];

    return NextResponse.json({ ok: true, db: conn.connection.name, count, keys, sample });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
