"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Coleccion {
  nombre: string;
  total: number;
}

export default function ColeccionesPage() {
  const [colecciones, setColecciones] = useState<Coleccion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        const list: any[] = Array.isArray(data) ? data : (data.items ?? []);
        const map = new Map<string, number>();
        for (const p of list) {
          const sec: string = p.seccion ?? p.coleccion ?? "Sin colección";
          map.set(sec, (map.get(sec) ?? 0) + 1);
        }
        const sorted = Array.from(map.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([nombre, total]) => ({ nombre, total }));
        setColecciones(sorted);
      })
      .catch(() => setColecciones([]))
      .finally(() => setLoading(false));
  }, []);

  const GRADIENTS = [
    "from-[#32e1c0] to-[#3bb1e6]",
    "from-[#3bb1e6] to-[#a572e1]",
    "from-[#a572e1] to-[#32e1c0]",
    "from-[#32e1c0] to-[#a572e1]",
    "from-[#3bb1e6] to-[#32e1c0]",
    "from-[#a572e1] to-[#3bb1e6]",
  ];

  return (
    <main className="max-w-7xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-extrabold text-center text-[#1a4876] mb-2">Colecciones</h1>
      <p className="text-center text-neutral-500 mb-10">Explora todos nuestros productos por categoría</p>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-slate-200 animate-pulse h-32" />
          ))}
        </div>
      ) : colecciones.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-neutral-500 mb-4">Aún no hay colecciones cargadas.</p>
          <Link href="/catalogo" className="text-[#3bb1e6] font-semibold hover:underline">
            Ver todos los productos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {colecciones.map((col, i) => (
            <Link
              key={col.nombre}
              href={`/catalogo?coleccion=${encodeURIComponent(col.nombre)}`}
              className={`
                relative rounded-2xl p-px overflow-hidden
                bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]}
                hover:scale-[1.03] transition-transform shadow-sm
              `}
            >
              <div className="bg-white rounded-2xl h-full flex flex-col items-center justify-center py-8 px-4 text-center gap-2">
                <span className={`text-4xl font-extrabold bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} bg-clip-text text-transparent`}>
                  {col.nombre.charAt(0).toUpperCase()}
                </span>
                <p className="font-bold text-[#1a4876]">{col.nombre}</p>
                <p className="text-xs text-neutral-400">{col.total} producto{col.total !== 1 ? "s" : ""}</p>
              </div>
            </Link>
          ))}

          {/* Tarjeta "Ver todo" */}
          <Link
            href="/catalogo"
            className="rounded-2xl p-px bg-gradient-to-br from-[#32e1c0] via-[#3bb1e6] to-[#a572e1] hover:scale-[1.03] transition-transform"
          >
            <div className="bg-white rounded-2xl h-full flex flex-col items-center justify-center py-8 px-4 text-center gap-2">
              <span className="text-4xl font-extrabold text-[#3bb1e6]">✦</span>
              <p className="font-bold text-[#1a4876]">Ver todo</p>
              <p className="text-xs text-neutral-400">Todos los productos</p>
            </div>
          </Link>
        </div>
      )}
    </main>
  );
}
