export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { WebpayPlus, Options, Environment, IntegrationCommerceCodes, IntegrationApiKeys } from "transbank-sdk";
import dbConnect from "@/lib/dbConnect";
import Order from "@/lib/models/Order";

function generateOrderNumber() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${date}-${rand}`;
}

function getTx() {
  const isProduction = process.env.NODE_ENV === "production" && process.env.TBK_COMMERCE_CODE;

  if (isProduction) {
    return new WebpayPlus.Transaction(
      new Options(process.env.TBK_COMMERCE_CODE!, process.env.TBK_API_KEY!, Environment.Production)
    );
  }
  // Ambiente de integración/testing (no requiere credenciales reales)
  return new WebpayPlus.Transaction(
    new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration)
  );
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    const { customer, address, items, subtotal, shippingCost, discount, couponCode, notes } = body;

    if (!customer?.nombre || !customer?.email || !customer?.telefono) {
      return NextResponse.json({ ok: false, error: "Datos del cliente incompletos" }, { status: 400 });
    }
    if (!address?.region || !address?.ciudad || !address?.calle || !address?.numero) {
      return NextResponse.json({ ok: false, error: "Dirección incompleta" }, { status: 400 });
    }
    if (!items?.length) {
      return NextResponse.json({ ok: false, error: "El carrito está vacío" }, { status: 400 });
    }

    const total = Math.round(subtotal - (discount ?? 0) + (shippingCost ?? 0));
    const orderNumber = generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      customer,
      address,
      items,
      notes: notes ?? "",
      subtotal,
      shippingCost: shippingCost ?? 0,
      discount: discount ?? 0,
      couponCode: couponCode ?? "",
      total,
      status: "pending_payment",
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? `http://localhost:3000`;
    const returnUrl = `${baseUrl}/api/checkout/confirm`;

    const tx = getTx();
    const response = await tx.create(orderNumber, order._id.toString(), total, returnUrl);

    // Guardar token de WebPay en la orden
    await Order.findByIdAndUpdate(order._id, { "payment.token": response.token });

    return NextResponse.json({
      ok: true,
      url: response.url,
      token: response.token,
      orderId: order._id,
    });
  } catch (e: any) {
    console.error("[checkout/create]", e);
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
