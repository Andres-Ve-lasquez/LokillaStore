import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import SiteConfig from "@/lib/models/SiteConfig";

const DEFAULT_BANNERS = [
  { image: "/banners/foto1.jpg", title: "Lazos y accesorios que encantan", subtitle: "Nueva temporada", ctaLabel: "Ver tienda", ctaHref: "/catalogo" },
  { image: "/banners/foto2.jpg", title: "Colores que brillan", subtitle: "Edición limitada", ctaLabel: "Colecciones", ctaHref: "/colecciones" },
  { image: "/banners/foto3.jpg", title: "Hecho con cariño ✨", subtitle: "Producción local", ctaLabel: "Conoce más", ctaHref: "/informativo" },
];

export async function GET() {
  await dbConnect();
  let config = await SiteConfig.findOne({ key: "main" }).lean();
  if (!config) {
    config = await SiteConfig.create({ key: "main", banners: DEFAULT_BANNERS });
  }
  return NextResponse.json({ ok: true, config });
}

export async function PUT(req: NextRequest) {
  await dbConnect();
  const body = await req.json();
  const config = await SiteConfig.findOneAndUpdate(
    { key: "main" },
    { ...body, updatedAt: new Date() },
    { upsert: true, new: true }
  );
  return NextResponse.json({ ok: true, config });
}
