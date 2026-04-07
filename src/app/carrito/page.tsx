"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";

export default function CarritoPage() {
  const {
    items,
    subtotal,
    setQty,
    removeItem,
    checkoutNotes,
    setCheckoutNotes,
    acceptedPolicies,
    setAcceptedPolicies,
    moneyCLP,
    FREE_SHIPPING_THRESHOLD,
  } = useCart();

  const faltante = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progreso = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 md:py-8">
      <h1 className="mb-8 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
        Contenido del carrito
      </h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
        <div className="lg:col-span-2">
          {items.length === 0 ? (
            <div className="text-neutral-600">
              <p>Tu carrito esta vacio.</p>
              <Link href="/catalogo" className="underline">Seguir comprando</Link>
            </div>
          ) : (
            <ul className="divide-y">
              {items.map((it) => (
                <li key={it.key} className="grid grid-cols-[72px_1fr] gap-4 py-6 sm:grid-cols-[96px_1fr_auto] sm:gap-6">
                  <div className="relative h-[72px] w-[72px] overflow-hidden rounded bg-neutral-100 sm:h-24 sm:w-24">
                    {it.imagenUrl && (
                      <Image
                        src={it.imagenUrl}
                        alt={it.nombre}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm text-neutral-500">Anime Streetwear</p>
                    <h3 className="break-words font-medium">{it.nombre}</h3>
                    <p className="text-sm text-neutral-500">
                      {it.color ? `Color ${it.color}` : null} {it.talla ? `· ${it.talla}` : null}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-3 sm:gap-4">
                      <div className="inline-flex items-center rounded-lg border">
                        <button className="px-3 py-1" onClick={() => setQty(it.key, it.cantidad - 1)}>-</button>
                        <span className="px-4">{it.cantidad}</span>
                        <button className="px-3 py-1" onClick={() => setQty(it.key, it.cantidad + 1)}>+</button>
                      </div>

                      <button className="text-sm underline" onClick={() => removeItem(it.key)}>
                        Quitar
                      </button>
                    </div>
                  </div>

                  <div className="col-start-2 text-left font-medium sm:col-start-auto sm:text-right">
                    {moneyCLP(it.precio * it.cantidad)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="lg:col-span-1">
          <div className="rounded-2xl border bg-white p-5 sm:p-6 lg:sticky lg:top-6">
            <div className="flex items-center justify-between gap-4">
              <span className="text-neutral-500">Subtotal</span>
              <span className="text-2xl font-semibold">{moneyCLP(subtotal)}</span>
            </div>

            <p className="mt-2 text-sm text-neutral-500">
              El valor de tu envio se calculara en el checkout
            </p>

            <div className="mt-5 rounded-xl border bg-neutral-50 p-4">
              {faltante > 0 ? (
                <>
                  <p className="text-sm">
                    Te faltan <strong>{moneyCLP(faltante)}</strong> para conseguir envio gratis.
                  </p>
                  <div className="mt-2 h-2 w-full rounded bg-neutral-200">
                    <div className="h-2 rounded bg-black" style={{ width: `${progreso}%` }} />
                  </div>
                </>
              ) : (
                <p className="text-sm font-medium text-emerald-600">Ya tienes envio gratis.</p>
              )}
            </div>

            <label className="mt-6 block text-sm font-medium">Algo para que tengamos en cuenta?</label>
            <textarea
              value={checkoutNotes}
              onChange={(e) => setCheckoutNotes(e.target.value)}
              className="mt-1 w-full rounded-xl border p-3"
              placeholder="Indicaciones para la entrega del pedido"
              rows={3}
            />

            <div className="mt-6 flex items-start gap-2">
              <input
                id="acepto"
                type="checkbox"
                className="mt-1"
                checked={acceptedPolicies}
                onChange={(e) => setAcceptedPolicies(e.target.checked)}
              />
              <label htmlFor="acepto" className="text-sm text-neutral-600">
                Acepto los tiempos de produccion y la politica de cambios del sitio. Puedes revisarlos en{" "}
                <Link href="/informativo#terminos" className="underline">
                  Informativos
                </Link>.
              </label>
            </div>

            <Link
              href="/checkout"
              className="mt-6 block w-full rounded-full bg-rose-600 py-4 text-center font-semibold text-white"
            >
              Finalizar pedido
            </Link>

            <Link href="/catalogo" className="mt-3 block text-center underline">
              Seguir comprando
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
