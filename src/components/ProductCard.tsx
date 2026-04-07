"use client";

import { useCart } from "@/components/cart/CartProvider";

export type Product = {
  _id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  imagenUrl: string;
  stock: number;
  seccion?: string;
};

export default function ProductCard({ p }: { p: Product }) {
  const { addItem } = useCart();

  const add = () =>
    addItem({
      productId: p._id,
      nombre: p.nombre,
      precio: p.precio,
      imagenUrl: p.imagenUrl,
      cantidad: 1,
    });

  return (
    <div
      className="
        h-full rounded-3xl bg-gradient-to-tr from-[#32e1c0] via-[#3bb1e6] to-[#a572e1]
        p-[2.5px] transition hover:shadow-2xl
        hover:from-[#a572e1] hover:via-[#32e1c0] hover:to-[#3bb1e6]
      "
    >
      <div className="flex h-full flex-col items-center rounded-3xl bg-white p-3.5 pb-5 sm:p-4 sm:pb-6">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#f7faff]">
          <img src={p.imagenUrl} alt={p.nombre} className="h-full w-full object-contain" />
        </div>

        <span className="mt-4 text-[11px] uppercase tracking-wider text-[#3bb1e6] sm:text-xs">
          {p.seccion || "Coleccion"}
        </span>

        <h3 className="mt-1 line-clamp-2 text-center text-base font-bold text-[#1a4876] sm:text-lg">
          {p.nombre}
        </h3>

        <p className="mt-1 text-sm font-semibold text-[#19243b] sm:text-base">
          ${p.precio.toLocaleString("es-CL")} CLP
        </p>

        {p.stock > 0 ? (
          <button
            onClick={add}
            className="mt-3 w-full rounded-full bg-[#32e1c0] py-2.5 text-sm font-semibold text-white transition hover:bg-[#a572e1] sm:text-base"
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
