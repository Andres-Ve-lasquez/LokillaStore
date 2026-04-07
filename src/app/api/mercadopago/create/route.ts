import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import dbConnect from "@/lib/dbConnect";
import Order from "@/lib/models/Order";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer, address, items, subtotal, shippingCost, discount, couponCode, total } = body;

    if (!customer?.nombre || !customer?.email || !items?.length) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    await dbConnect();

    // Crear orden en estado pendiente
    const order = await Order.create({
      customer,
      address,
      items,
      subtotal,
      shippingCost: shippingCost ?? 0,
      discount: discount ?? 0,
      couponCode: couponCode ?? "",
      total,
      status: "pending_payment",
      payment: { method: "mercadopago" },
    });

    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json({ error: "Mercado Pago no configurado" }, { status: 500 });
    }

    const client = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(client);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://lookilla-store.vercel.app";

    const mpItems = items.map((it: any) => ({
      id: it.productId,
      title: it.nombre,
      quantity: it.cantidad,
      unit_price: it.precio,
      currency_id: "CLP",
    }));

    // Si hay envío, lo agregamos como ítem adicional
    if (shippingCost > 0) {
      mpItems.push({
        id: "shipping",
        title: "Costo de envío",
        quantity: 1,
        unit_price: shippingCost,
        currency_id: "CLP",
      });
    }

    const result = await preference.create({
      body: {
        items: mpItems,
        payer: {
          name: customer.nombre,
          email: customer.email,
          phone: { number: customer.telefono ?? "" },
        },
        back_urls: {
          success: `${baseUrl}/checkout/mp-success?orderId=${order._id}`,
          failure: `${baseUrl}/checkout/error?reason=rejected`,
          pending: `${baseUrl}/checkout/mp-success?orderId=${order._id}&status=pending`,
        },
        auto_return: "approved",
        external_reference: String(order._id),
        notification_url: `${baseUrl}/api/mercadopago/webhook`,
      },
    });

    return NextResponse.json({
      ok: true,
      orderId: order._id,
      preferenceId: result.id,
      initPoint: result.init_point,        // producción
      sandboxInitPoint: result.sandbox_init_point, // sandbox
    });
  } catch (err: any) {
    console.error("MP create error:", err);
    return NextResponse.json({ error: err.message ?? "Error" }, { status: 500 });
  }
}
