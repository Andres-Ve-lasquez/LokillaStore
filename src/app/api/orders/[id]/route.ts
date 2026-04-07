export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/lib/models/Order";
import { requireAdmin } from "@/lib/adminAuth";

const VALID_STATUSES = ["pending_payment", "paid", "preparing", "shipped", "delivered", "cancelled"];

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const order = await Order.findById(id).select("orderNumber status total createdAt").lean();
    if (!order) return NextResponse.json({ ok: false, error: "No encontrada" }, { status: 404 });
    return NextResponse.json({ ok: true, order });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdmin(req);
  if (unauthorized) return unauthorized;

  try {
    await dbConnect();
    const { id } = await params;
    const { status } = await req.json();

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ ok: false, error: "Estado inválido" }, { status: 400 });
    }

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) return NextResponse.json({ ok: false, error: "Orden no encontrada" }, { status: 404 });

    return NextResponse.json({ ok: true, order });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
