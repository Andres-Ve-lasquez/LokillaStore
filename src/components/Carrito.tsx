"use client";
import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";

export default function Carrito() {
  const { items, removeItem, clear, subtotal, moneyCLP } = useCart();

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-xl p-6 rounded-xl w-80">
      <h2 className="text-lg font-bold mb-2">Carrito de compras</h2>

      <ul className="max-h-64 overflow-auto pr-2">
        {items.map((it) => (
          <li key={it.key} className="mb-2 flex justify-between items-center text-sm">
            <span className="mr-2 truncate">
              {it.nombre} × {it.cantidad}
            </span>
            <button
              className="text-red-600 font-bold ml-2 hover:underline"
              onClick={() => removeItem(it.key)}
            >
              Quitar
            </button>
          </li>
        ))}
      </ul>

      <div className="font-bold my-3 flex items-center justify-between">
        <span>Total:</span>
        <span>{moneyCLP(subtotal)}</span>
      </div>

      <div className="flex gap-2">
        <button
          className="flex-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-900 px-3 py-2 rounded"
          onClick={clear}
        >
          Vaciar
        </button>
        <Link
          href="/carrito"
          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-center"
        >
          Ver carrito
        </Link>
      </div>
    </div>
  );
}
