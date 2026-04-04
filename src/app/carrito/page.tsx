"use client";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";

export default function CarritoPage() {
  const { items, subtotal, setQty, removeItem, moneyCLP, FREE_SHIPPING_THRESHOLD } = useCart();
  const faltante = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progreso = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-8">Contenido del carrito</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Lista */}
        <div className="lg:col-span-2">
          {items.length === 0 ? (
            <div className="text-neutral-600">
              <p>Tu carrito está vacío.</p>
              <Link href="/catalogo" className="underline">Seguir comprando</Link>
            </div>
          ) : (
            <ul className="divide-y">
              {items.map((it) => (
                <li key={it.key} className="py-6 grid grid-cols-[80px_1fr_auto] md:grid-cols-[100px_1fr_auto] gap-4 md:gap-6 items-start">
                  <div className="relative w-20 h-20 md:w-24 md:h-24 rounded overflow-hidden bg-neutral-100">
                    {it.imagenUrl && (
                      <Image
                        src={it.imagenUrl}
                        alt={it.nombre}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-neutral-500">Anime Streetwear</p>
                    <h3 className="font-medium">{it.nombre}</h3>
                    <p className="text-sm text-neutral-500">
                      {it.color ? `Color ${it.color}` : null} {it.talla ? `· ${it.talla}` : null}
                    </p>

                    <div className="mt-3 flex items-center gap-4">
                      <div className="inline-flex items-center border rounded-lg">
                        <button className="px-3 py-1" onClick={() => setQty(it.key, it.cantidad - 1)}>-</button>
                        <span className="px-4">{it.cantidad}</span>
                        <button className="px-3 py-1" onClick={() => setQty(it.key, it.cantidad + 1)}>+</button>
                      </div>

                      <button className="text-sm underline" onClick={() => removeItem(it.key)}>
                        Quitar
                      </button>
                    </div>
                  </div>

                  <div className="text-right font-medium">{moneyCLP(it.precio)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Resumen */}
        <aside className="lg:col-span-1">
          <div className="sticky top-6 rounded-2xl border p-6 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">Subtotal</span>
              <span className="text-2xl font-semibold">{moneyCLP(subtotal)}</span>
            </div>

            <p className="text-sm text-neutral-500 mt-2">
              El valor de tu envío se calculará en el checkout
            </p>

            <div className="mt-5 rounded-xl border bg-neutral-50 p-4">
              {faltante > 0 ? (
                <>
                  <p className="text-sm">
                    ¡Te faltan <strong>{moneyCLP(faltante)}</strong> para conseguir envío gratis!
                  </p>
                  <div className="h-2 w-full bg-neutral-200 rounded mt-2">
                    <div className="h-2 bg-black rounded" style={{ width: `${progreso}%` }} />
                  </div>
                </>
              ) : (
                <p className="text-sm font-medium text-emerald-600">¡Ya tienes envío gratis! 🎉</p>
              )}
            </div>

            <label className="mt-6 block text-sm font-medium">¿Algo para que tengamos en cuenta?</label>
            <textarea
              className="mt-1 w-full rounded-xl border p-3"
              placeholder="Indicaciones para la entrega del pedido"
              rows={3}
            />

            <div className="mt-6 flex items-start gap-2">
              <input id="acepto" type="checkbox" className="mt-1" />
              <label htmlFor="acepto" className="text-sm text-neutral-600">
                Acepto los tiempos de producción claramente especificados y la política de cambios del sitio.
              </label>
            </div>

            <a
              href="/checkout"
              className="mt-6 block w-full rounded-full py-4 text-center font-semibold bg-rose-600 text-white"
            >
              Finalizar pedido
            </a>

            <Link href="/catalogo" className="mt-3 block text-center underline">
              Seguir comprando
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
