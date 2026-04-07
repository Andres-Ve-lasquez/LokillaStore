export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { Environment, IntegrationApiKeys, IntegrationCommerceCodes, Options, WebpayPlus } from "transbank-sdk";
import dbConnect from "@/lib/dbConnect";
import DiscountCode from "@/lib/models/DiscountCode";
import Order from "@/lib/models/Order";
import Product from "@/lib/models/Product";
import { sendNewOrderNotification, sendOrderConfirmation } from "@/lib/mail";
import { buildVariantKey, findProductVariant, getProductStock, hasProductVariants, normalizeProductVariants } from "@/lib/productVariants";

type PaymentResult = {
  amount: number;
  authorization_code: string;
  buy_order: string;
  response_code: number;
  transaction_date: string;
};

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

function getBaseUrl(req: NextRequest) {
  return (process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin).replace(/\/$/, "");
}

async function decrementStock(items: { productId: string; cantidad: number; talla?: string; color?: string }[]) {
  const requestedQtyBySelection = new Map<string, { productId: string; cantidad: number; talla: string; color: string }>();

  items.forEach((item) => {
    const talla = typeof item.talla === "string" ? item.talla.trim() : "";
    const color = typeof item.color === "string" ? item.color.trim() : "";
    const key = `${item.productId}__${buildVariantKey({ talla, color })}`;
    const previous = requestedQtyBySelection.get(key);

    requestedQtyBySelection.set(key, {
      productId: item.productId,
      cantidad: (previous?.cantidad ?? 0) + item.cantidad,
      talla,
      color,
    });
  });

  const productIds = [...new Set(items.map((item) => item.productId))];
  const products = await Product.find({ _id: { $in: productIds } });
  const productsById = new Map(products.map((product) => [String(product._id), product]));

  for (const request of requestedQtyBySelection.values()) {
    const product = productsById.get(request.productId);
    if (!product) {
      throw new Error(`Stock insuficiente para ${request.productId}`);
    }

    if (hasProductVariants(product.variants)) {
      const variant = findProductVariant(product.variants, request);
      if (!variant || variant.stock < request.cantidad) {
        throw new Error(`Stock insuficiente para ${request.productId}`);
      }
      continue;
    }

    if (Number(product.stock) < request.cantidad) {
      throw new Error(`Stock insuficiente para ${request.productId}`);
    }
  }

  for (const product of products) {
    const productId = String(product._id);
    const requests = [...requestedQtyBySelection.values()].filter((request) => request.productId === productId);
    if (!requests.length) continue;

    if (hasProductVariants(product.variants)) {
      const nextVariants = normalizeProductVariants(product.variants).map((variant) => {
        const request = requests.find((entry) => buildVariantKey(entry) === buildVariantKey(variant));
        if (!request) return variant;

        return {
          ...variant,
          stock: Math.max(0, variant.stock - request.cantidad),
        };
      });

      product.set("variants", nextVariants);
      product.set("stock", getProductStock(nextVariants, product.stock));
    } else {
      const quantity = requests.reduce((sum, request) => sum + request.cantidad, 0);
      product.set("stock", Math.max(0, Number(product.stock) - quantity));
    }

    await product.save();
  }
}

async function finalizePaidOrder(token: string, result: PaymentResult) {
  const alreadyPaidOrder = await Order.findOne({ "payment.token": token, status: "paid" });
  if (alreadyPaidOrder) {
    return alreadyPaidOrder;
  }

  const order = await Order.findOneAndUpdate(
    { "payment.token": token, status: { $ne: "paid" } },
    {
      status: "paid",
      "payment.transactionId": result.buy_order || token,
      "payment.authorizationCode": result.authorization_code,
      "payment.amount": result.amount,
      "payment.paidAt": new Date(),
    },
    { new: true }
  );

  if (!order) {
    return Order.findOne({ "payment.token": token, status: "paid" });
  }

  try {
    await decrementStock(order.items);
  } catch (stockErr) {
    console.error("[stock]", stockErr);
  }

  if (order.couponCode) {
    try {
      await DiscountCode.findOneAndUpdate(
        { code: order.couponCode, isActive: true },
        { $inc: { usedCount: 1 } }
      );
    } catch (couponErr) {
      console.error("[coupon]", couponErr);
    }
  }

  try {
    await Promise.all([
      sendOrderConfirmation(order),
      sendNewOrderNotification(order),
    ]);
  } catch (mailErr) {
    console.error("[mail]", mailErr);
  }

  return order;
}

async function handleApprovedPayment(req: NextRequest, token: string) {
  const baseUrl = getBaseUrl(req);

  try {
    await dbConnect();

    const existingOrder = await Order.findOne({ "payment.token": token }).select({ status: 1, orderNumber: 1 });
    if (existingOrder?.status === "paid") {
      return NextResponse.redirect(`${baseUrl}/checkout/success?order=${existingOrder.orderNumber}`);
    }

    const tx = getTx();
    const result = await tx.commit(token);

    if (result.response_code !== 0) {
      return NextResponse.redirect(`${baseUrl}/checkout/error?reason=rejected`);
    }

    const order = await finalizePaidOrder(token, result as PaymentResult);

    if (!order) {
      return NextResponse.redirect(`${baseUrl}/checkout/error?reason=order_not_found`);
    }

    return NextResponse.redirect(`${baseUrl}/checkout/success?order=${order.orderNumber}`);
  } catch (e: any) {
    console.error("[checkout/confirm]", e);
    return NextResponse.redirect(`${baseUrl}/checkout/error?reason=server_error`);
  }
}

export async function POST(req: NextRequest) {
  const baseUrl = getBaseUrl(req);

  try {
    const formData = await req.formData();
    const token = formData.get("token_ws") as string;

    if (!token) {
      return NextResponse.redirect(`${baseUrl}/checkout/error?reason=no_token`);
    }

    return handleApprovedPayment(req, token);
  } catch (e: any) {
    console.error("[checkout/confirm POST]", e);
    return NextResponse.redirect(`${baseUrl}/checkout/error?reason=server_error`);
  }
}

export async function GET(req: NextRequest) {
  const baseUrl = getBaseUrl(req);
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token_ws");
  const tbkToken = searchParams.get("TBK_TOKEN");

  if (tbkToken) {
    return NextResponse.redirect(`${baseUrl}/checkout/error?reason=cancelled`);
  }

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/checkout/error?reason=no_token`);
  }

  return handleApprovedPayment(req, token);
}
