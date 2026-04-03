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
    <div className="
      bg-gradient-to-tr from-[#32e1c0] via-[#3bb1e6] to-[#a572e1]
      p-[2.5px] rounded-3xl hover:shadow-2xl transition
      hover:from-[#a572e1] hover:via-[#32e1c0] hover:to-[#3bb1e6]
    ">
      <div className="bg-white rounded-3xl p-4 pb-6 flex flex-col items-center">
        <div className="relative w-full aspect-[1/1] rounded-2xl overflow-hidden bg-[#f7faff]">
          {/* usa <img> para no depender de next/image domains */}
          <img
            src={p.imagenUrl}
            alt={p.nombre}
            className="w-full h-full object-contain"
          />
        </div>

        <span className="uppercase text-xs text-[#3bb1e6] tracking-wider mt-4">
          {p.seccion || "Colección"}
        </span>

        <h3 className="text-lg font-bold text-[#1a4876] text-center mt-1 line-clamp-2">
          {p.nombre}
        </h3>

        <p className="text-[#19243b] font-semibold mt-1">
          ${p.precio.toLocaleString("es-CL")} CLP
        </p>

        {p.stock > 0 ? (
          <button
            onClick={add}
            className="mt-3 w-full rounded-full bg-[#32e1c0] hover:bg-[#a572e1] text-white font-semibold py-2.5 transition"
          >
            Agregar al carrito
          </button>
        ) : (
          <span className="mt-3 w-full text-center rounded-full border-2 border-[#a572e1] text-[#a572e1] font-semibold py-2.5">
            Agotado :(
          </span>
        )}
      </div>
    </div>
  );
}
