export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import DiscountCode from "../../../../lib/models/DiscountCode";

type Resp = {
  ok: boolean;
  valid: boolean;
  message?: string;
  discountAmount?: number;
  finalAmount?: number;
};

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code")?.toUpperCase();
  const amount = Number(url.searchParams.get("amount") || 0);
  const productId = url.searchParams.get("productId") || null;
  const coleccion = url.searchParams.get("coleccion") || null;

  if (!code) return NextResponse.json<Resp>({ ok: true, valid: false, message: "Falta code" }, { status: 400 });
  if (Number.isNaN(amount) || amount <= 0)
    return NextResponse.json<Resp>({ ok: true, valid: false, message: "Monto inválido" }, { status: 400 });

  try {
    await dbConnect();
    const d = await DiscountCode.findOne({ code });
    if (!d || !d.isActive) {
      return NextResponse.json<Resp>({ ok: true, valid: false, message: "Cupón inválido o inactivo" }, { status: 200 });
    }

    const now = new Date();
    if (d.startAt && now < d.startAt) return NextResponse.json<Resp>({ ok: true, valid: false, message: "Cupón aún no disponible" }, { status: 200 });
    if (d.endAt && now > d.endAt) return NextResponse.json<Resp>({ ok: true, valid: false, message: "Cupón expirado" }, { status: 200 });
    if (d.usageLimit && d.usedCount >= d.usageLimit) return NextResponse.json<Resp>({ ok: true, valid: false, message: "Cupón sin cupos" }, { status: 200 });
    if (d.minOrderAmount && amount < d.minOrderAmount) return NextResponse.json<Resp>({ ok: true, valid: false, message: "No cumple mínimo" }, { status: 200 });

    if (d.appliesTo === "product" && productId) {
      const okProduct = d.productIds?.some((id: any) => String(id) === String(productId));
      if (!okProduct) return NextResponse.json<Resp>({ ok: true, valid: false, message: "Cupón no aplica a este producto" }, { status: 200 });
    } else if (d.appliesTo === "coleccion" && coleccion) {
      if (!d.colecciones?.includes(coleccion))
        return NextResponse.json<Resp>({ ok: true, valid: false, message: "Cupón no aplica a esta colección" }, { status: 200 });
    } else if (d.appliesTo !== "order" && !productId && !coleccion) {
      return NextResponse.json<Resp>({ ok: true, valid: false, message: "Faltan datos de producto/colección" }, { status: 200 });
    }

    let discountAmount = d.type === "percentage" ? (amount * d.value) / 100 : d.value;
    discountAmount = Math.min(discountAmount, amount);
    const finalAmount = Math.max(0, amount - discountAmount);

    return NextResponse.json<Resp>({ ok: true, valid: true, discountAmount, finalAmount }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json<Resp>({ ok: false, valid: false, message: e.message }, { status: 500 });
  }
}
