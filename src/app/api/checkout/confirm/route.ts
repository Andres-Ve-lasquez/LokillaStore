export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { WebpayPlus, Options, Environment, IntegrationCommerceCodes, IntegrationApiKeys } from "transbank-sdk";
import dbConnect from "@/lib/dbConnect";
import Order from "@/lib/models/Order";
import Product from "@/lib/models/Product";
import { sendOrderConfirmation, sendNewOrderNotification } from "@/lib/mail";

async function decrementStock(items: { productId: string; cantidad: number }[]) {
  await Promise.all(
    items.map((it) =>
      Product.findByIdAndUpdate(it.productId, {
        $inc: { stock: -it.cantidad },
      })
    )
  );
}

function getTx() {
  const isProduction = process.env.NODE_ENV === "production" && process.env.TBK_COMMERCE_CODE;
  if (isProduction) {
    return new WebpayPlus.Transaction(
      new Options(process.env.TBK_COMMERCE_CODE!, process.env.TBK_API_KEY!, Environment.Production)
    );
  }
  return new WebpayPlus.Transaction(
    new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration)
  );
}

// WebPay redirige aquí con POST (token_ws en el body)
export async function POST(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  try {
    const formData = await req.formData();
    const token = formData.get("token_ws") as string;

    if (!token) {
      return NextResponse.redirect(`${baseUrl}/checkout/error?reason=no_token`);
    }

    await dbConnect();
    const tx = getTx();
    const result = await tx.commit(token);

    // response_code 0 = aprobado
    if (result.response_code !== 0) {
      return NextResponse.redirect(`${baseUrl}/checkout/error?reason=rejected`);
    }

    const order = await Order.findOneAndUpdate(
      { "payment.token": token },
      {
        status: "paid",
        "payment.transactionId": result.transaction_date,
        "payment.authorizationCode": result.authorization_code,
        "payment.amount": result.amount,
        "payment.paidAt": new Date(),
      },
      { new: true }
    );

    if (!order) {
      return NextResponse.redirect(`${baseUrl}/checkout/error?reason=order_not_found`);
    }

    try { await decrementStock(order.items); } catch (e) { console.error("[stock POST]", e); }

    try {
      await Promise.all([
        sendOrderConfirmation(order),
        sendNewOrderNotification(order),
      ]);
    } catch (mailErr) {
      console.error("[mail]", mailErr);
    }

    return NextResponse.redirect(`${baseUrl}/checkout/success?order=${order.orderNumber}`);
  } catch (e: any) {
    console.error("[checkout/confirm]", e);
    return NextResponse.redirect(`${baseUrl}/checkout/error?reason=server_error`);
  }
}

// WebPay redirige via GET: con token_ws (pago ok) o TBK_TOKEN (cancelado)
export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token_ws");
  const tbkToken = searchParams.get("TBK_TOKEN");

  if (tbkToken) {
    return NextResponse.redirect(`${baseUrl}/checkout/error?reason=cancelled`);
  }

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/checkout/error?reason=no_token`);
  }

  try {
    await dbConnect();
    const tx = getTx();
    const result = await tx.commit(token);

    if (result.response_code !== 0) {
      return NextResponse.redirect(`${baseUrl}/checkout/error?reason=rejected`);
    }

    const order = await Order.findOneAndUpdate(
      { "payment.token": token },
      {
        status: "paid",
        "payment.transactionId": result.transaction_date,
        "payment.authorizationCode": result.authorization_code,
        "payment.amount": result.amount,
        "payment.paidAt": new Date(),
      },
      { new: true }
    );

    if (!order) {
      return NextResponse.redirect(`${baseUrl}/checkout/error?reason=order_not_found`);
    }

    try { await decrementStock(order.items); } catch (e) { console.error("[stock GET]", e); }

    try {
      await Promise.all([
        sendOrderConfirmation(order),
        sendNewOrderNotification(order),
      ]);
    } catch (mailErr) {
      console.error("[mail]", mailErr);
    }

    return NextResponse.redirect(`${baseUrl}/checkout/success?order=${order.orderNumber}`);
  } catch (e: any) {
    console.error("[checkout/confirm GET]", e);
    return NextResponse.redirect(`${baseUrl}/checkout/error?reason=server_error`);
  }
}
