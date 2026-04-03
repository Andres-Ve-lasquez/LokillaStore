export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import Product from "../../../../lib/models/Product";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    await dbConnect();
    const { id } = await params;
    const doc = await Product.findById(id);
    if (!doc) return NextResponse.json({ ok: false, error: "No encontrado" }, { status: 404 });
    return NextResponse.json({ ok: true, product: doc });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    await dbConnect();
    const { id } = await params;
    const data = await req.json();

    const doc = await Product.findByIdAndUpdate(
      id,
      {
        nombre: data.nombre,
        descripcion: data.descripcion,
        precio: Number(data.precio),
        imagenUrl: data.imagenUrl ?? "",
        stock: Number(data.stock),
        minStock: Number(data.minStock ?? 5),
        coleccion: data.coleccion,
        sku: data.sku || undefined,
        isActive: data.isActive ?? true,
      },
      { new: true, runValidators: true }
    );

    if (!doc) return NextResponse.json({ ok: false, error: "Producto no encontrado" }, { status: 404 });
    return NextResponse.json({ ok: true, product: doc });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
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
