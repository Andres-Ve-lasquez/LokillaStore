export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";

export async function GET() {
  try {
    await dbConnect();
    return NextResponse.json({ ok: true, status: "up" }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, status: "down", error: e.message }, { status: 500 });
  }
}
