"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { FiFilter } from "react-icons/fi";

/* ===== Tipos ===== */
interface Product {
  _id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  imagenUrl: string;
  stock: number;
  seccion?: string; // colección (mapeada)
}
type SortKey = "none" | "precio-asc" | "precio-desc";

/* ===== Helpers ===== */
function normalize(s: string) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

// Convierte un objeto cualquiera desde la API a tu interfaz Product
function toProduct(p: any): Product {
  return {
    _id: String(p._id ?? p.id ?? crypto.randomUUID()),
    nombre: p.nombre ?? p.name ?? "Sin nombre",
    descripcion: p.descripcion ?? p.description ?? "",
    precio: Number(p.precio ?? p.price ?? 0),
    imagenUrl: (p.imagenUrl ?? p.image ?? p.images?.[0]) || undefined,
    stock: typeof p.stock === "number" ? p.stock : Number(p.stock ?? 0),
    // Mapeamos distintos nombres usados en DB a tu 'seccion'
    seccion: p.seccion ?? p.coleccion ?? p.collection ?? p.category ?? "",
  };
}

// Extrae la lista de productos independiente del shape de la API
function extractList(payload: any): any[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.items)) return payload.items;     // <-- tu API actual
  if (Array.isArray(payload.products)) return payload.products;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
}

/* ===== Card de producto (estilizada) ===== */
function ProductCard({ p, onAdd }: { p: Product; onAdd: () => void }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="
        bg-gradient-to-tr from-[#32e1c0] via-[#3bb1e6] to-[#a572e1]
        p-[2.5px] rounded-3xl hover:shadow-2xl transition
        hover:from-[#a572e1] hover:via-[#32e1c0] hover:to-[#3bb1e6]
      "
    >
      <div
        className="
          bg-white rounded-3xl px-4 pt-4 pb-6 flex flex-col items-center
          transition-transform duration-300 hover:scale-[1.02]
        "
      >
        {/* Imagen + nombre clicables → detalle */}
        <Link href={`/producto/${p._id}`} className="w-full flex flex-col items-center">
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#f7faff]">
            {p.imagenUrl && !imgError ? (
              <img
                src={p.imagenUrl}
                alt={p.nombre}
                className="w-full h-full object-contain"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full grid place-items-center text-sm text-neutral-400">
                Imagen no disponible
              </div>
            )}
          </div>

          {/* Colección */}
          <span className="uppercase text-[11px] tracking-widest text-[#3bb1e6] mt-4">
            {p.seccion || "Colección"}
          </span>

          {/* Nombre del producto */}
          <h3 className="text-lg font-bold text-[#1a4876] mt-1 text-center line-clamp-2">
            {p.nombre}
          </h3>
        </Link>

        {/* Precio */}
        <p className="text-[#19243b] font-extrabold mt-1">
          ${p.precio.toLocaleString("es-CL")} CLP
        </p>

        {/* Botón */}
        {p.stock > 0 ? (
          <button
            onClick={onAdd}
            className="
              mt-3 w-full rounded-full bg-[#32e1c0] hover:bg-[#a572e1]
              text-white font-semibold py-2.5 shadow transition
            "
          >
            Agregar al carrito
          </button>
        ) : (
          <span
            className="
              mt-3 w-full text-center rounded-full border-2 border-[#a572e1]
              text-[#a572e1] font-semibold py-2.5
            "
          >
            Agotado :(
          </span>
        )}
      </div>
    </div>
  );
}

/* ===== Página ===== */
export default function CatalogoPage() {
  const searchParams = useSearchParams();
  const [productos, setProductos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros / UI
  const [showFilters, setShowFilters] = useState(true);
  const [q, setQ] = useState(""); // búsqueda por nombre
  const [coleccion, setColeccion] = useState<string>(
    searchParams.get("coleccion") ?? "__todas__"
  );
  const [sort, setSort] = useState<SortKey>("none");

  const { addItem } = useCart();

  // Cargar productos
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        const payload = res.ok ? await res.json() : [];
        const raw = extractList(payload);
        const mapped = raw.map(toProduct);
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

  // Colecciones únicas
  const colecciones = useMemo(() => {
    const set = new Set<string>();
    productos.forEach((p) => p.seccion && set.add(p.seccion));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [productos]);

  // Aplicar filtros + orden
  const filtrados = useMemo(() => {
    const nq = normalize(q);

    let list = productos.filter((p) => {
      const okNombre = nq ? normalize(p.nombre).includes(nq) : true;
      const okColeccion =
        coleccion === "__todas__" ? true : (p.seccion || "") === coleccion;
      return okNombre && okColeccion;
    });

    if (sort === "precio-asc") list = [...list].sort((a, b) => a.precio - b.precio);
    if (sort === "precio-desc") list = [...list].sort((a, b) => b.precio - a.precio);

    return list;
  }, [productos, q, coleccion, sort]);

  const limpiar = () => {
    setQ("");
    setColeccion("__todas__");
    setSort("none");
  };

  return (
    <main className="max-w-7xl mx-auto pt-8 px-4">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="
              flex items-center gap-2 rounded-full px-6 py-2 text-lg font-semibold
              border-2 border-[#32e1c0] text-[#32e1c0] bg-white shadow
              hover:bg-[#32e1c0] hover:text-white transition
            "
          >
            <FiFilter size={22} />
            {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
          </button>
          <span className="text-sm text-neutral-600">
            {filtrados.length} resultado{filtrados.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-sm text-neutral-600">
            Ordenar:
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-full border px-4 py-2 bg-white"
          >
            <option value="none">Relevancia</option>
            <option value="precio-asc">Precio: menor a mayor</option>
            <option value="precio-desc">Precio: mayor a menor</option>
          </select>
        </div>
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-[#1a4876] mb-1">
              Buscar por nombre
            </label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ej: lazo azul"
              className="rounded-xl border px-4 py-2 bg-white outline-none focus:ring-2 focus:ring-[#3bb1e6]"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-[#1a4876] mb-1">
              Colección
            </label>
            <select
              value={coleccion}
              onChange={(e) => setColeccion(e.target.value)}
              className="rounded-xl border px-4 py-2 bg-white outline-none focus:ring-2 focus:ring-[#3bb1e6]"
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
              className="w-full md:w-auto rounded-full border px-6 py-2 font-semibold bg-white hover:bg-neutral-50"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-x-8 md:gap-y-16">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-3xl bg-white p-4 animate-pulse">
              <div className="w-full aspect-[4/3] rounded-2xl bg-slate-200" />
              <div className="h-3 w-2/3 bg-slate-200 rounded mt-4" />
              <div className="h-3 w-1/3 bg-slate-200 rounded mt-2" />
              <div className="h-9 w-full bg-slate-200 rounded-full mt-4" />
            </div>
          ))}
        </div>
      ) : filtrados.length === 0 ? (
        <div className="text-center text-neutral-600 py-16">
          No encontramos productos con esos filtros.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-x-8 md:gap-y-16">
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
