"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import HeroCarousel from "@/components/home/HeroCarousel";
import ProductCard, { Product } from "@/components/ProductCard";

type RawItem = Record<string, unknown>;
type AnyList =
  | RawItem[]
  | { items?: RawItem[]; products?: RawItem[]; data?: RawItem[] }
  | undefined
  | null;

function toProduct(p: RawItem): Product {
  return {
    _id: String(p._id ?? p.id ?? crypto.randomUUID()),
    nombre: String(p.nombre ?? p.name ?? "Sin nombre"),
    descripcion: String(p.descripcion ?? p.description ?? ""),
    precio: Number(p.precio ?? p.price ?? 0),
    imagenUrl: String((p.imagenUrl ?? p.image ?? (Array.isArray(p.images) ? p.images[0] : "")) || ""),
    stock: typeof p.stock === "number" ? p.stock : Number(p.stock ?? 0),
    seccion: String(p.seccion ?? p.coleccion ?? p.collection ?? ""),
  };
}

function pickList(payload: AnyList): RawItem[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.products)) return payload.products;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
}

const DEFAULT_SLIDES = [
  { image: "/banners/foto1.jpg", title: "Lazos y accesorios que encantan", subtitle: "Nueva temporada", cta: { label: "Ver tienda", href: "/catalogo" } },
  { image: "/banners/foto2.jpg", title: "Colores que brillan", subtitle: "Edición limitada", cta: { label: "Colecciones", href: "/colecciones" } },
  { image: "/banners/foto3.jpg", title: "Hecho con cariño ✨", subtitle: "Producción local", cta: { label: "Conoce más", href: "/informativo" } },
];

export default function InicioPage() {
  const [nuevos, setNuevos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [slides, setSlides] = useState(DEFAULT_SLIDES);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const [prodRes, configRes] = await Promise.all([
          fetch("/api/products", { cache: "no-store" }),
          fetch("/api/site-config", { cache: "no-store" }),
        ]);
        const payload: AnyList = prodRes.ok ? await prodRes.json() : [];
        const list = pickList(payload).map(toProduct);
        const last8 = list.slice(-8).reverse();
        if (alive) setNuevos(last8);

        if (configRes.ok) {
          const { config } = await configRes.json();
          if (config?.banners?.length) {
            setSlides(config.banners.map((b: RawItem) => ({
              image: b.image,
              title: b.title,
              subtitle: b.subtitle,
              cta: { label: b.ctaLabel, href: b.ctaHref },
            })));
          }
        }
      } catch {
        if (alive) setNuevos([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-4 md:pt-6">
      <HeroCarousel slides={slides} />

      <section className="mt-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-extrabold text-[#1a4876] md:text-3xl">
            Nuevos Llegados
          </h2>
          <Link href="/catalogo" className="font-semibold text-[#3bb1e6] hover:underline">
            Ver todo
          </Link>
        </div>

        {loading ? (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-3xl bg-white p-4 animate-pulse">
                <div className="aspect-square w-full rounded-2xl bg-slate-200" />
                <div className="mt-4 h-3 w-2/3 rounded bg-slate-200" />
                <div className="mt-2 h-3 w-1/3 rounded bg-slate-200" />
                <div className="mt-4 h-9 w-full rounded-full bg-slate-200" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {nuevos.map((p) => (
              <ProductCard key={p._id} p={p} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
          <p className="text-lg font-bold text-[#1a4876] sm:text-xl">Envios a todo Chile</p>
          <p className="mt-1 text-sm text-neutral-600">Despachamos rapido y con seguimiento.</p>
        </div>
        <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
          <p className="text-lg font-bold text-[#1a4876] sm:text-xl">Pagos 100% seguros</p>
          <p className="mt-1 text-sm text-neutral-600">Transbank / Mercado Pago.</p>
        </div>
        <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
          <p className="text-lg font-bold text-[#1a4876] sm:text-xl">Cambios sin drama</p>
          <p className="mt-1 text-sm text-neutral-600">Tienes 10 dias para cambios.</p>
        </div>
      </section>

      <section className="mt-14">
        <div className="rounded-3xl bg-gradient-to-r from-[#32e1c0] via-[#3bb1e6] to-[#a572e1] px-5 py-7 text-center text-white shadow sm:px-6 sm:py-8">
          <h3 className="text-2xl font-extrabold sm:text-3xl">
            Buscas un regalo?
          </h3>
          <p className="mt-2 opacity-95">
            Tenemos gift cards y combos listos para sorprender.
          </p>
          <div className="mt-5">
            <Link
              href="/colecciones"
              className="inline-block rounded-full bg-white/95 px-6 py-2.5 font-semibold text-black hover:bg-white"
            >
              Ver colecciones
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
