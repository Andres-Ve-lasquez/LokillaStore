"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";

type Product = {
  _id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenUrl: string;
  stock: number;
  coleccion: string;
  sku?: string;
  tags?: string[];
};

function moneyCLP(n: number) {
  return n.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
}

export default function ProductoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addItem, setOpen } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((j) => { if (j.ok) setProduct(j.product); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = () => {
    if (!product || product.stock === 0) return;
    addItem({
      productId: product._id,
      nombre: product.nombre,
      precio: product.precio,
      imagenUrl: product.imagenUrl,
      cantidad: qty,
    });
    setAdded(true);
    setOpen(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-10 animate-pulse">
          <div className="aspect-square rounded-3xl bg-slate-200" />
          <div className="space-y-4 pt-4">
            <div className="h-4 w-1/3 bg-slate-200 rounded" />
            <div className="h-8 w-2/3 bg-slate-200 rounded" />
            <div className="h-6 w-1/4 bg-slate-200 rounded" />
            <div className="h-24 bg-slate-200 rounded" />
            <div className="h-12 bg-slate-200 rounded-full" />
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-xl font-semibold text-slate-600">Producto no encontrado.</p>
        <Link href="/catalogo" className="mt-4 inline-block underline text-[#3bb1e6]">Volver al catálogo</Link>
      </main>
    );
  }

  const agotado = product.stock === 0;
  const stockBajo = product.stock > 0 && product.stock <= 5;

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-400 mb-8 flex items-center gap-2">
        <Link href="/inicio" className="hover:text-[#3bb1e6]">Inicio</Link>
        <span>/</span>
        <Link href="/catalogo" className="hover:text-[#3bb1e6]">Catálogo</Link>
        <span>/</span>
        <span className="text-slate-600 truncate">{product.nombre}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Imagen */}
        <div className="
          bg-gradient-to-tr from-[#32e1c0] via-[#3bb1e6] to-[#a572e1]
          p-[3px] rounded-3xl
        ">
          <div className="bg-white rounded-3xl aspect-square overflow-hidden flex items-center justify-center p-6">
            {product.imagenUrl ? (
              <img src={product.imagenUrl} alt={product.nombre} className="w-full h-full object-contain" />
            ) : (
              <div className="text-slate-300 text-sm">Sin imagen</div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center space-y-5">
          {/* Colección */}
          <span className="uppercase text-xs tracking-widest text-[#3bb1e6] font-semibold">
            {product.coleccion}
          </span>

          <h1 className="text-3xl md:text-4xl font-extrabold text-[#1a4876] leading-tight">
            {product.nombre}
          </h1>

          <p className="text-3xl font-bold text-[#19243b]">
            {moneyCLP(product.precio)}
          </p>

          {/* Stock */}
          {agotado ? (
            <span className="inline-flex items-center gap-2 text-sm font-medium text-red-600 bg-red-50 px-3 py-1.5 rounded-full w-fit">
              ⚠️ Agotado
            </span>
          ) : stockBajo ? (
            <span className="inline-flex items-center gap-2 text-sm font-medium text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full w-fit">
              🔥 Últimas {product.stock} unidades
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full w-fit">
              ✅ En stock
            </span>
          )}

          {/* Descripción */}
          <p className="text-slate-600 leading-relaxed">{product.descripcion}</p>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((t) => (
                <span key={t} className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full">{t}</span>
              ))}
            </div>
          )}

          {/* Cantidad + Agregar */}
          {!agotado && (
            <div className="flex items-center gap-4 pt-2">
              <div className="inline-flex items-center border-2 border-slate-200 rounded-full overflow-hidden">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-4 py-2 text-lg hover:bg-slate-100 transition">−</button>
                <span className="px-4 py-2 font-semibold min-w-[2rem] text-center">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  className="px-4 py-2 text-lg hover:bg-slate-100 transition">+</button>
              </div>
              <button onClick={handleAdd}
                className={`flex-1 py-3 rounded-full font-bold text-white transition ${
                  added ? "bg-emerald-500" : "bg-[#32e1c0] hover:bg-[#a572e1]"
                }`}>
                {added ? "¡Agregado! ✓" : "Agregar al carrito"}
              </button>
            </div>
          )}

          {agotado && (
            <button disabled className="w-full py-3 rounded-full border-2 border-[#a572e1] text-[#a572e1] font-bold opacity-60">
              Agotado
            </button>
          )}

          {/* Ir al carrito */}
          <button onClick={() => router.push("/checkout")}
            className="w-full py-3 rounded-full border-2 border-[#1a4876] text-[#1a4876] font-bold hover:bg-[#1a4876] hover:text-white transition">
            Comprar ahora
          </button>

          {product.sku && (
            <p className="text-xs text-slate-400">SKU: {product.sku}</p>
          )}
        </div>
      </div>

      {/* Volver */}
      <div className="mt-12 border-t pt-6">
        <Link href="/catalogo" className="text-sm text-[#3bb1e6] hover:underline">
          ← Volver al catálogo
        </Link>
      </div>
    </main>
  );
}
