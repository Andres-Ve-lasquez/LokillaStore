"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { FaSearch } from "react-icons/fa";
import { useCart } from "@/components/cart/CartProvider";

interface Product {
  _id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  imagenUrl?: string;
  stock: number;
  seccion?: string;
}

function normalize(s: string) {
  return (s || "").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function toProduct(p: any): Product {
  return {
    _id: String(p._id ?? p.id ?? ""),
    nombre: p.nombre ?? p.name ?? "Sin nombre",
    descripcion: p.descripcion ?? p.description ?? "",
    precio: Number(p.precio ?? p.price ?? 0),
    imagenUrl: (p.imagenUrl ?? p.image ?? p.images?.[0]) || undefined,
    stock: Number(p.stock ?? 0),
    seccion: p.seccion ?? p.coleccion ?? "",
  };
}

export default function BuscarPage() {
  const [q, setQ] = useState("");
  const [todos, setTodos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.items ?? []);
        setTodos(list.map(toProduct));
      })
      .catch(() => setTodos([]))
      .finally(() => setLoading(false));
  }, []);

  const resultados = useMemo(() => {
    const nq = normalize(q);
    if (!nq) return [];
    return todos.filter((p) =>
      normalize(p.nombre).includes(nq) ||
      normalize(p.descripcion ?? "").includes(nq) ||
      normalize(p.seccion ?? "").includes(nq)
    );
  }, [q, todos]);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-extrabold text-[#1a4876] mb-6">Buscar productos</h1>

      {/* Campo de búsqueda */}
      <div className="relative mb-8">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3bb1e6]" size={18} />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre, colección..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-[#3bb1e6] outline-none focus:border-[#a572e1] text-base bg-white shadow-sm"
        />
      </div>

      {loading ? (
        <p className="text-neutral-500">Cargando productos...</p>
      ) : q.length === 0 ? (
        <p className="text-neutral-400 text-center py-10">Escribe algo para buscar...</p>
      ) : resultados.length === 0 ? (
        <p className="text-neutral-500 text-center py-10">
          No encontramos resultados para <strong>&ldquo;{q}&rdquo;</strong>
        </p>
      ) : (
        <>
          <p className="text-sm text-neutral-500 mb-4">
            {resultados.length} resultado{resultados.length !== 1 ? "s" : ""} para &ldquo;{q}&rdquo;
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {resultados.map((p) => (
              <div
                key={p._id}
                className="bg-gradient-to-tr from-[#32e1c0] via-[#3bb1e6] to-[#a572e1] p-[2px] rounded-2xl"
              >
                <div className="bg-white rounded-2xl p-3 flex flex-col h-full">
                  <Link href={`/producto/${p._id}`}>
                    <div className="w-full aspect-square rounded-xl overflow-hidden bg-[#f7faff] mb-2">
                      {p.imagenUrl ? (
                        <img src={p.imagenUrl} alt={p.nombre} className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full grid place-items-center text-xs text-neutral-400">Sin imagen</div>
                      )}
                    </div>
                    <p className="text-xs uppercase tracking-widest text-[#3bb1e6]">{p.seccion}</p>
                    <h3 className="font-bold text-[#1a4876] text-sm line-clamp-2 mt-0.5">{p.nombre}</h3>
                  </Link>
                  <p className="font-extrabold text-[#19243b] mt-1 text-sm">
                    ${p.precio.toLocaleString("es-CL")} CLP
                  </p>
                  {p.stock > 0 ? (
                    <button
                      onClick={() => addItem({ productId: p._id, nombre: p.nombre, precio: p.precio, imagenUrl: p.imagenUrl, cantidad: 1 })}
                      className="mt-2 w-full rounded-full bg-[#32e1c0] hover:bg-[#a572e1] text-white text-sm font-semibold py-2 transition"
                    >
                      Agregar al carrito
                    </button>
                  ) : (
                    <span className="mt-2 w-full text-center rounded-full border-2 border-[#a572e1] text-[#a572e1] text-sm font-semibold py-2">
                      Agotado
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
