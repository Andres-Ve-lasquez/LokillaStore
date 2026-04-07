export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import Product from "../../../lib/models/Product";
import { requireAdmin } from "@/lib/adminAuth";
import { getProductStock, normalizeProductVariants } from "@/lib/productVariants";

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdmin(req);
  if (unauthorized) return unauthorized;

  try {
    await dbConnect();
    const data = await req.json();

    const required = ["nombre", "descripcion", "precio", "stock", "coleccion"];
    for (const f of required) {
      if (data[f] === undefined || data[f] === null || data[f] === "") {
        return NextResponse.json({ ok: false, error: `Falta ${f}` }, { status: 400 });
      }
    }

    const variants = normalizeProductVariants(data.variants);

    const doc = await Product.create({
      nombre: data.nombre,
      descripcion: data.descripcion,
      precio: Number(data.precio),
      imagenUrl: data.imagenUrl || "",
      stock: getProductStock(variants, data.stock),
      minStock: Number(data.minStock ?? 5),
      coleccion: data.coleccion,
      sku: data.sku || undefined,
      tags: Array.isArray(data.tags) ? data.tags : [],
      variants,
    });

    return NextResponse.json({ ok: true, product: doc }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const lowStock = searchParams.get("lowStock") === "true";
    const threshold = searchParams.get("threshold");
    const includeInactive = searchParams.get("includeInactive") === "true";

    let filter: any = {};
    if (lowStock) {
      const unauthorized = await requireAdmin(req);
      if (unauthorized) return unauthorized;

      filter = threshold
        ? { stock: { $lte: Number(threshold) } }
        : { $expr: { $lte: ["$stock", "$minStock"] } };
    }

    if (includeInactive) {
      const unauthorized = await requireAdmin(req);
      if (unauthorized) return unauthorized;
    } else if (!lowStock) {
      filter.isActive = true;
    }

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Product.find(filter).sort({ stock: 1 }).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);

    return NextResponse.json({ ok: true, items, total, page, limit }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
