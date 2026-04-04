export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import { validateDiscountCode } from "@/lib/discounts";

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

  if (!code) {
    return NextResponse.json<Resp>({ ok: true, valid: false, message: "Falta code" }, { status: 400 });
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json<Resp>({ ok: true, valid: false, message: "Monto inválido" }, { status: 400 });
  }

  try {
    await dbConnect();

    const result = await validateDiscountCode({
      code,
      amount,
      items: [{ productId: productId || undefined, coleccion: coleccion || undefined }],
    });

    return NextResponse.json<Resp>({ ok: true, ...result }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json<Resp>({ ok: false, valid: false, message: e.message }, { status: 500 });
  }
}
