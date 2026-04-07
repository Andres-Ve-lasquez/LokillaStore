"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FiFilter } from "react-icons/fi";
import { useCart } from "@/components/cart/CartProvider";

interface Product {
  _id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  imagenUrl: string;
  stock: number;
  seccion?: string;
}

type SortKey = "none" | "precio-asc" | "precio-desc";

function normalize(s: string) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function toProduct(p: Record<string, unknown>): Product {
  return {
    _id: String(p._id ?? p.id ?? crypto.randomUUID()),
    nombre: String(p.nombre ?? p.name ?? "Sin nombre"),
    descripcion: String(p.descripcion ?? p.description ?? ""),
    precio: Number(p.precio ?? p.price ?? 0),
    imagenUrl: String((p.imagenUrl ?? p.image ?? (Array.isArray(p.images) ? p.images[0] : "")) || ""),
    stock: typeof p.stock === "number" ? p.stock : Number(p.stock ?? 0),
    seccion: String(p.seccion ?? p.coleccion ?? p.collection ?? p.category ?? ""),
  };
}

function extractList(payload: unknown): Record<string, unknown>[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload as Record<string, unknown>[];
  if (typeof payload !== "object") return [];

  const data = payload as { items?: Record<string, unknown>[]; products?: Record<string, unknown>[]; data?: Record<string, unknown>[] };
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.products)) return data.products;
  if (Array.isArray(data.data)) return data.data;
  return [];
}

function ProductCard({ p, onAdd }: { p: Product; onAdd: () => void }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="
        h-full rounded-3xl bg-gradient-to-tr from-[#32e1c0] via-[#3bb1e6] to-[#a572e1]
        p-[2.5px] transition hover:shadow-2xl
        hover:from-[#a572e1] hover:via-[#32e1c0] hover:to-[#3bb1e6]
      "
    >
      <div className="flex h-full flex-col items-center rounded-3xl bg-white px-3.5 pb-5 pt-3.5 transition-transform duration-300 hover:scale-[1.02] sm:px-4 sm:pb-6 sm:pt-4">
        <Link href={`/producto/${p._id}`} className="flex w-full flex-col items-center">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#f7faff]">
            {p.imagenUrl && !imgError ? (
              <img
                src={p.imagenUrl}
                alt={p.nombre}
                className="h-full w-full object-contain"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="grid h-full w-full place-items-center text-sm text-neutral-400">
                Imagen no disponible
              </div>
            )}
          </div>

          <span className="mt-4 text-[11px] uppercase tracking-widest text-[#3bb1e6] sm:text-xs">
            {p.seccion || "Coleccion"}
          </span>

          <h3 className="mt-1 line-clamp-2 text-center text-base font-bold text-[#1a4876] sm:text-lg">
            {p.nombre}
          </h3>
        </Link>

        <p className="mt-1 text-sm font-extrabold text-[#19243b] sm:text-base">
          ${p.precio.toLocaleString("es-CL")} CLP
        </p>

        {p.stock > 0 ? (
          <button
            onClick={onAdd}
            className="mt-3 w-full rounded-full bg-[#32e1c0] py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[#a572e1] sm:text-base"
          >
            Agregar al carrito
          </button>
        ) : (
          <span className="mt-3 w-full rounded-full border-2 border-[#a572e1] py-2.5 text-center text-sm font-semibold text-[#a572e1] sm:text-base">
            Agotado :(
          </span>
        )}
      </div>
    </div>
  );
}

function CatalogoInner() {
  const searchParams = useSearchParams();
  const [productos, setProductos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [q, setQ] = useState("");
  const [coleccion, setColeccion] = useState<string>(searchParams.get("coleccion") ?? "__todas__");
  const [sort, setSort] = useState<SortKey>("none");
  const { addItem } = useCart();

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        const payload = res.ok ? await res.json() : [];
        const mapped = extractList(payload).map(toProduct);
        if (alive) setProductos(mapped);
      } catch {
        if (alive) setProductos([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const colecciones = useMemo(() => {
    const set = new Set<string>();
    productos.forEach((p) => p.seccion && set.add(p.seccion));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [productos]);

  const filtrados = useMemo(() => {
    const nq = normalize(q);

    let list = productos.filter((p) => {
      const okNombre = nq ? normalize(p.nombre).includes(nq) : true;
      const okColeccion = coleccion === "__todas__" ? true : (p.seccion || "") === coleccion;
      return okNombre && okColeccion;
    });

    if (sort === "precio-asc") list = [...list].sort((a, b) => a.precio - b.precio);
    if (sort === "precio-desc") list = [...list].sort((a, b) => b.precio - a.precio);

    return list;
  }, [coleccion, productos, q, sort]);

  const limpiar = () => {
    setQ("");
    setColeccion("__todas__");
    setSort("none");
  };

  return (
    <main className="mx-auto max-w-7xl px-4 pb-12 pt-6 md:pt-8">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="
              flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#32e1c0] bg-white px-4 py-2.5
              text-base font-semibold text-[#32e1c0] shadow transition hover:bg-[#32e1c0] hover:text-white sm:w-auto sm:px-6 md:text-lg
            "
          >
            <FiFilter size={20} />
            {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
          </button>
          <span className="text-xs text-neutral-600 sm:text-sm">
            {filtrados.length} resultado{filtrados.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 sm:w-auto sm:justify-start">
          <label htmlFor="sort" className="text-sm text-neutral-600">
            Ordenar:
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="min-w-0 flex-1 rounded-full border bg-white px-4 py-2 sm:flex-none"
          >
            <option value="none">Relevancia</option>
            <option value="precio-asc">Precio: menor a mayor</option>
            <option value="precio-desc">Precio: mayor a menor</option>
          </select>
        </div>
      </div>

      {showFilters && (
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_1fr_auto]">
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-semibold text-[#1a4876]">
              Buscar por nombre
            </label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ej: lazo azul"
              className="rounded-xl border bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#3bb1e6]"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-sm font-semibold text-[#1a4876]">
              Coleccion
            </label>
            <select
              value={coleccion}
              onChange={(e) => setColeccion(e.target.value)}
              className="rounded-xl border bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#3bb1e6]"
            >
              <option value="__todas__">Todas</option>
              {colecciones.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={limpiar}
              className="w-full rounded-full border bg-white px-6 py-2.5 font-semibold hover:bg-neutral-50 lg:w-auto"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-12">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-3xl bg-white p-4 animate-pulse">
              <div className="aspect-[4/3] w-full rounded-2xl bg-slate-200" />
              <div className="mt-4 h-3 w-2/3 rounded bg-slate-200" />
              <div className="mt-2 h-3 w-1/3 rounded bg-slate-200" />
              <div className="mt-4 h-9 w-full rounded-full bg-slate-200" />
            </div>
          ))}
        </div>
      ) : filtrados.length === 0 ? (
        <div className="py-16 text-center text-neutral-600">
          No encontramos productos con esos filtros.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-12">
          {filtrados.map((p) => (
            <ProductCard
              key={p._id}
              p={p}
              onAdd={() =>
                addItem({
                  productId: p._id,
                  nombre: p.nombre,
                  precio: p.precio,
                  imagenUrl: p.imagenUrl,
                  cantidad: 1,
                })
              }
            />
          ))}
        </div>
      )}
    </main>
  );
}

export default function CatalogoPage() {
  return (
    <Suspense fallback={null}>
      <CatalogoInner />
    </Suspense>
  );
}
