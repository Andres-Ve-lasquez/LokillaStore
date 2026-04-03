"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import HeroCarousel from "@/components/home/HeroCarousel";
import ProductCard, { Product } from "@/components/ProductCard";

// acepta múltiples shapes de API
type AnyList =
  | Product[]
  | { items?: any[]; products?: any[]; data?: any[] }
  | undefined
  | null;

function toProduct(p: any): Product {
  return {
    _id: String(p._id ?? p.id ?? crypto.randomUUID()),
    nombre: p.nombre ?? p.name ?? "Sin nombre",
    descripcion: p.descripcion ?? p.description ?? "",
    precio: Number(p.precio ?? p.price ?? 0),
    imagenUrl: p.imagenUrl ?? p.image ?? p.images?.[0] || undefined,
    stock: typeof p.stock === "number" ? p.stock : Number(p.stock ?? 0),
    // tu card suele aceptar 'seccion' para colección
    seccion: p.seccion ?? p.coleccion ?? p.collection ?? "",
  } as Product;
}

function pickList(payload: AnyList): any[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.items)) return payload.items;     // <-- /api/products actual
  if (Array.isArray(payload.products)) return payload.products;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
}

export default function InicioPage() {
  const [nuevos, setNuevos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        const payload: AnyList = res.ok ? await res.json() : [];
        const list = pickList(payload).map(toProduct);
        // últimos 8
        const last8 = list.slice(-8).reverse();
        if (alive) setNuevos(last8);
      } catch {
        if (alive) setNuevos([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const slides = [
    {
      image: "/banners/foto1.jpg",
      title: "Lazos y accesorios que encantan",
      subtitle: "Nueva temporada",
      cta: { label: "Ver tienda", href: "/catalogo" },
    },
    {
      image: "/banners/foto2.jpg",
      title: "Colores que brillan",
      subtitle: "Edición limitada",
      cta: { label: "Colecciones", href: "/colecciones" },
    },
    {
      image: "/banners/foto3.jpg",
      title: "Hecho con cariño ✨",
      subtitle: "Producción local",
      cta: { label: "Conoce más", href: "/informativo" },
    },
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 pt-6 pb-16">
      {/* HERO */}
      <HeroCarousel slides={slides} />

      {/* NUEVOS LLEGADOS */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1a4876]">
            ¡Nuevos Llegados!
          </h2>
          <Link href="/catalogo" className="text-[#3bb1e6] font-semibold hover:underline">
            Ver todo
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-3xl bg-white p-4 animate-pulse">
                <div className="w-full aspect-[1/1] rounded-2xl bg-slate-200" />
                <div className="h-3 w-2/3 bg-slate-200 rounded mt-4" />
                <div className="h-3 w-1/3 bg-slate-200 rounded mt-2" />
                <div className="h-9 w-full bg-slate-200 rounded-full mt-4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
            {nuevos.map((p) => (
              <ProductCard key={p._id} p={p} />
            ))}
          </div>
        )}
      </section>

      {/* BADGES */}
      <section className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl p-5 bg-white shadow-sm text-center">
          <p className="text-xl font-bold text-[#1a4876]">Envíos a todo Chile</p>
          <p className="text-sm text-neutral-600 mt-1">Despachamos rápido y con seguimiento.</p>
        </div>
        <div className="rounded-2xl p-5 bg-white shadow-sm text-center">
          <p className="text-xl font-bold text-[#1a4876]">Pagos 100% seguros</p>
          <p className="text-sm text-neutral-600 mt-1">Transbank / Mercado Pago.</p>
        </div>
        <div className="rounded-2xl p-5 bg-white shadow-sm text-center">
          <p className="text-xl font-bold text-[#1a4876]">Cambios sin drama</p>
          <p className="text-sm text-neutral-600 mt-1">Tienes 10 días para cambios.</p>
        </div>
      </section>

      {/* CTA inferior */}
      <section className="mt-14">
        <div className="
          rounded-3xl px-6 py-8 text-white text-center
          bg-gradient-to-r from-[#32e1c0] via-[#3bb1e6] to-[#a572e1] shadow
        ">
          <h3 className="text-2xl md:text-3xl font-extrabold">
            ¿Buscas un regalo? 🎁
          </h3>
          <p className="mt-1 opacity-95">
            Tenemos gift cards y combos listos para sorprender.
          </p>
          <div className="mt-4">
            <Link
              href="/colecciones"
              className="inline-block rounded-full bg-white/95 text-black font-semibold px-6 py-2 hover:bg-white"
            >
              Ver colecciones
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
