export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { randomInt } from "crypto";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { Environment, IntegrationApiKeys, IntegrationCommerceCodes, Options, WebpayPlus } from "transbank-sdk";
import dbConnect from "@/lib/dbConnect";
import { validateDiscountCode } from "@/lib/discounts";
import Order from "@/lib/models/Order";
import Product from "@/lib/models/Product";
import { buildVariantKey, findProductVariant, hasProductVariants } from "@/lib/productVariants";

const SHIPPING_COST = 3990;
const FREE_SHIPPING_THRESHOLD = 60000;

type CheckoutItemInput = {
  productId?: string;
  cantidad?: number;
  talla?: string;
  color?: string;
};

function generateOrderNumber() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = randomInt(0, 36 ** 6).toString(36).toUpperCase().padStart(6, "0");
  return `ORD-${date}-${rand}`;
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

function getBaseUrl(req: NextRequest) {
  return (process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin).replace(/\/$/, "");
}

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    const customer = {
      nombre: cleanText(body?.customer?.nombre, 120),
      email: cleanText(body?.customer?.email, 160).toLowerCase(),
      telefono: cleanText(body?.customer?.telefono, 40),
    };

    const address = {
      region: cleanText(body?.address?.region, 120),
      ciudad: cleanText(body?.address?.ciudad, 120),
      comuna: cleanText(body?.address?.comuna, 120),
      calle: cleanText(body?.address?.calle, 160),
      numero: cleanText(body?.address?.numero, 40),
      depto: cleanText(body?.address?.depto, 80),
    };

    const notes = cleanText(body?.notes, 500);
    const rawItems = Array.isArray(body?.items) ? (body.items as CheckoutItemInput[]) : [];

    if (!customer.nombre || !customer.email || !customer.telefono) {
      return NextResponse.json({ ok: false, error: "Datos del cliente incompletos" }, { status: 400 });
    }

    if (!isValidEmail(customer.email)) {
      return NextResponse.json({ ok: false, error: "Correo electronico invalido" }, { status: 400 });
    }

    if (!address.region || !address.ciudad || !address.comuna || !address.calle || !address.numero) {
      return NextResponse.json({ ok: false, error: "Direccion incompleta" }, { status: 400 });
    }

    if (!rawItems.length) {
      return NextResponse.json({ ok: false, error: "El carrito esta vacio" }, { status: 400 });
    }

    const invalidId = rawItems.some((item) => !isValidObjectId(String(item?.productId || "").trim()));
    if (invalidId) {
      return NextResponse.json({ ok: false, error: "Hay productos invalidos en el carrito" }, { status: 400 });
    }

    const requestedItems = rawItems.map((item) => ({
      productId: String(item.productId || "").trim(),
      cantidad: Math.floor(Number(item.cantidad || 0)),
      talla: cleanText(item.talla, 40),
      color: cleanText(item.color, 40),
    }));

    if (requestedItems.some((item) => !Number.isFinite(item.cantidad) || item.cantidad < 1)) {
      return NextResponse.json({ ok: false, error: "Cantidad invalida en el carrito" }, { status: 400 });
    }

    const requestedQtyBySelection = new Map<string, { productId: string; cantidad: number; talla: string; color: string }>();
    requestedItems.forEach((item) => {
      const key = `${item.productId}__${buildVariantKey(item)}`;
      const previous = requestedQtyBySelection.get(key);
      requestedQtyBySelection.set(key, {
        productId: item.productId,
        cantidad: (previous?.cantidad ?? 0) + item.cantidad,
        talla: item.talla,
        color: item.color,
      });
    });

    const productIds = [...new Set(requestedItems.map((item) => item.productId))];
    const products = await Product.find({ _id: { $in: productIds }, isActive: true }).lean();
    const productsById = new Map(products.map((product) => [String(product._id), product]));

    const missingProduct = productIds.find((productId) => !productsById.has(productId));
    if (missingProduct) {
      return NextResponse.json({ ok: false, error: "Uno de los productos ya no esta disponible" }, { status: 400 });
    }

    for (const request of requestedQtyBySelection.values()) {
      const product = productsById.get(request.productId);
      if (!product) {
        return NextResponse.json({ ok: false, error: "Uno de los productos ya no esta disponible" }, { status: 400 });
      }

      if (hasProductVariants(product.variants)) {
        const variant = findProductVariant(product.variants, request);
        const label = [request.talla, request.color].filter(Boolean).join(" / ");

        if (!variant) {
          return NextResponse.json(
            { ok: false, error: `La variante seleccionada ya no esta disponible para ${product.nombre}` },
            { status: 400 }
          );
        }

        if (variant.stock < request.cantidad) {
          return NextResponse.json(
            { ok: false, error: `No hay stock suficiente para ${product.nombre}${label ? ` (${label})` : ""}` },
            { status: 400 }
          );
        }

        continue;
      }

      if (Number(product.stock) < request.cantidad) {
        return NextResponse.json(
          { ok: false, error: `No hay stock suficiente para ${product.nombre}` },
          { status: 400 }
        );
      }
    }

    const items = requestedItems.map((item) => {
      const product = productsById.get(item.productId)!;

      return {
        productId: item.productId,
        nombre: product.nombre,
        precio: Number(product.precio),
        cantidad: item.cantidad,
        imagenUrl: product.imagenUrl || "",
        coleccion: product.coleccion || "",
        talla: item.talla,
        color: item.color,
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;

    let discount = 0;
    let couponCode = "";
    const requestedCouponCode = cleanText(body?.couponCode, 40).toUpperCase();

    if (requestedCouponCode) {
      const discountResult = await validateDiscountCode({
        code: requestedCouponCode,
        amount: subtotal,
        items: items.map((item) => ({
          productId: item.productId,
          coleccion: item.coleccion,
        })),
      });

      if (!discountResult.valid) {
        return NextResponse.json(
          { ok: false, error: discountResult.message || "Cupon no valido" },
          { status: 400 }
        );
      }

      discount = Math.round(discountResult.discountAmount || 0);
      couponCode = requestedCouponCode;
    }

    const total = Math.max(0, subtotal - discount + shippingCost);
    if (total <= 0) {
      return NextResponse.json({ ok: false, error: "El total del pedido debe ser mayor a 0" }, { status: 400 });
    }

    const orderNumber = generateOrderNumber();
    const order = await Order.create({
      orderNumber,
      customer,
      address,
      items,
      notes,
      subtotal,
      shippingCost,
      discount,
      couponCode,
      total,
      status: "pending_payment",
    });

    const returnUrl = `${getBaseUrl(req)}/api/checkout/confirm`;
    const tx = getTx();
    const response = await tx.create(orderNumber, order._id.toString(), total, returnUrl);

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
