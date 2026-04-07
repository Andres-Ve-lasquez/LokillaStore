import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import dbConnect from "@/lib/dbConnect";
import Order from "@/lib/models/Order";
import Product from "@/lib/models/Product";
import { sendOrderConfirmation, sendNewOrderNotification } from "@/lib/mail";

async function decrementStock(items: { productId: string; cantidad: number }[]) {
  await Promise.all(
    items.map((it) =>
      Product.findByIdAndUpdate(it.productId, { $inc: { stock: -it.cantidad } })
    )
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (type !== "payment" || !data?.id) {
      return NextResponse.json({ ok: true });
    }

    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) return NextResponse.json({ ok: true });

    const client = new MercadoPagoConfig({ accessToken });
    const paymentApi = new Payment(client);
    const payment = await paymentApi.get({ id: data.id });

    if (payment.status !== "approved") {
      return NextResponse.json({ ok: true });
    }

    await dbConnect();
    const orderId = payment.external_reference;
    const order = await Order.findById(orderId);

    if (!order || order.status === "paid") {
      return NextResponse.json({ ok: true });
    }

    order.status = "paid";
    order.payment = {
      method: "mercadopago",
      transactionId: String(payment.id),
      paidAt: new Date(),
    };
    await order.save();

    await decrementStock(order.items);
    await sendOrderConfirmation(order);
    await sendNewOrderNotification(order);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("MP webhook error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
