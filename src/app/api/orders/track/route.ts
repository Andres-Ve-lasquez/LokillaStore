export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/lib/models/Order";
import { applyRateLimit } from "@/lib/rateLimit";

export async function GET(req: NextRequest) {
  const limited = applyRateLimit(req, {
    key: "order-track",
    max: 30,
    windowMs: 10 * 60 * 1000,
    message: "Demasiadas búsquedas. Espera un momento antes de intentar de nuevo.",
  });
  if (limited) return limited;

  const { searchParams } = new URL(req.url);
  const orderNumber = searchParams.get("order")?.trim().toUpperCase();

  if (!orderNumber) {
    return NextResponse.json({ ok: false, error: "Falta el número de orden" }, { status: 400 });
  }

  try {
    await dbConnect();
    const order = await Order.findOne({ orderNumber }).lean() as any;

    if (!order) {
      return NextResponse.json({ ok: false, error: "Orden no encontrada" }, { status: 404 });
    }

    // Solo exponemos los campos necesarios (sin datos sensibles completos)
    return NextResponse.json({
      ok: true,
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        createdAt: order.createdAt,
        paidAt: order.payment?.paidAt ?? null,
        customer: { nombre: order.customer.nombre },
        address: { region: order.address.region, ciudad: order.address.ciudad },
        items: order.items.map((it: any) => ({
          nombre: it.nombre,
          cantidad: it.cantidad,
          precio: it.precio,
          talla: it.talla,
          color: it.color,
          imagenUrl: it.imagenUrl,
        })),
        total: order.total,
        shippingCost: order.shippingCost,
        discount: order.discount,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
