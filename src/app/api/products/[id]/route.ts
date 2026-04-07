export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import Product from "../../../../lib/models/Product";
import { requireAdmin } from "@/lib/adminAuth";
import { getProductStock, normalizeProductVariants } from "@/lib/productVariants";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    await dbConnect();
    const { id } = await params;
    const doc = await Product.findById(id);
    if (!doc) return NextResponse.json({ ok: false, error: "No encontrado" }, { status: 404 });

    if (!doc.isActive) {
      const unauthorized = await requireAdmin(req);
      if (unauthorized) {
        return NextResponse.json({ ok: false, error: "No encontrado" }, { status: 404 });
      }
    }

    return NextResponse.json({ ok: true, product: doc });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const unauthorized = await requireAdmin(req);
  if (unauthorized) return unauthorized;

  try {
    await dbConnect();
    const { id } = await params;
    const data = await req.json();
    const variants = normalizeProductVariants(data.variants);

    const doc = await Product.findByIdAndUpdate(
      id,
      {
        nombre: data.nombre,
        descripcion: data.descripcion,
        precio: Number(data.precio),
        imagenUrl: data.imagenUrl ?? "",
        stock: getProductStock(variants, data.stock),
        minStock: Number(data.minStock ?? 5),
        coleccion: data.coleccion,
        sku: data.sku || undefined,
        isActive: data.isActive ?? true,
        tags: Array.isArray(data.tags) ? data.tags : [],
        variants,
      },
      { new: true, runValidators: true }
    );

    if (!doc) return NextResponse.json({ ok: false, error: "Producto no encontrado" }, { status: 404 });
    return NextResponse.json({ ok: true, product: doc });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const unauthorized = await requireAdmin(req);
  if (unauthorized) return unauthorized;

  try {
    await dbConnect();
    const { id } = await params;
    const doc = await Product.findByIdAndDelete(id);
    if (!doc) return NextResponse.json({ ok: false, error: "Producto no encontrado" }, { status: 404 });
    return NextResponse.json({ ok: true, deletedId: id });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
