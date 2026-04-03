export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import DiscountCode from "../../../lib/models/DiscountCode";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const data = await req.json();

    const required = ["code", "type", "value", "appliesTo"];
    for (const f of required) {
      if (!data[f] && data[f] !== 0) {
        return NextResponse.json({ ok: false, error: `Falta ${f}` }, { status: 400 });
      }
    }

    const doc = await DiscountCode.create({
      code: String(data.code).toUpperCase(),
      type: data.type,
      value: Number(data.value),
      appliesTo: data.appliesTo,
      productIds: data.productIds || [],
      colecciones: data.colecciones || [],
      minOrderAmount: Number(data.minOrderAmount || 0),
      startAt: data.startAt ? new Date(data.startAt) : undefined,
      endAt: data.endAt ? new Date(data.endAt) : undefined,
      usageLimit: data.usageLimit ? Number(data.usageLimit) : undefined,
      isActive: data.isActive ?? true,
    });

    return NextResponse.json({ ok: true, discount: doc }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const list = await DiscountCode.find({}).sort({ createdAt: -1 }).limit(100);
    return NextResponse.json({ ok: true, items: list }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
