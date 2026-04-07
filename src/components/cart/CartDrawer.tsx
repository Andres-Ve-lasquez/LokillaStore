'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from './CartProvider';

export default function CartDrawer() {
  const { items, subtotal, count, setQty, removeItem, setOpen, open, moneyCLP, FREE_SHIPPING_THRESHOLD } = useCart();

  const faltante = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progreso = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}>
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={() => setOpen(false)}
      />

      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-lg flex-col bg-white shadow-xl transition-transform duration-300 sm:max-w-md ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b px-4 py-4 sm:px-5">
          <h2 className="text-xl font-semibold sm:text-2xl">
            Carrito <sup className="align-super text-sm">{count}</sup>
          </h2>
          <button onClick={() => setOpen(false)} className="rounded-full p-2 transition hover:bg-neutral-100" aria-label="Cerrar carrito">
            X
          </button>
        </div>

        <div className="border-b px-4 py-4 sm:px-5">
          {faltante > 0 ? (
            <>
              <p className="text-sm">
                Te faltan solo <strong>{moneyCLP(faltante)}</strong> para conseguir envio gratis.
              </p>
              <div className="mt-2 h-2 w-full rounded bg-neutral-200">
                <div className="h-2 rounded bg-black" style={{ width: `${progreso}%` }} />
              </div>
            </>
          ) : (
            <p className="text-sm font-medium text-emerald-600">Ya tienes envio gratis.</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          {items.length === 0 && (
            <p className="py-8 text-sm text-neutral-500">Tu carrito esta vacio.</p>
          )}

          <ul className="space-y-5">
            {items.map((it) => (
              <li key={it.key} className="flex gap-4">
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded bg-neutral-100">
                  {it.imagenUrl && (
                    <Image src={it.imagenUrl} alt={it.nombre} fill className="object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-neutral-500">Anime Streetwear</p>
                  <p className="break-words font-medium">{it.nombre}</p>
                  <p className="text-sm text-neutral-500">
                    {it.color ? `Color ${it.color}` : null} {it.talla ? `· ${it.talla}` : null}
                  </p>
                  <p className="mt-1 text-sm">{moneyCLP(it.precio)}</p>

                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center rounded-lg border">
                      <button className="px-2 py-1" onClick={() => setQty(it.key, it.cantidad - 1)}>-</button>
                      <span className="px-3">{it.cantidad}</span>
                      <button className="px-2 py-1" onClick={() => setQty(it.key, it.cantidad + 1)}>+</button>
                    </div>
                    <button className="text-sm underline" onClick={() => removeItem(it.key)}>Quitar</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t bg-white p-4 sm:p-5">
          <p className="text-sm text-neutral-500">El valor de tu envio se calculara en el checkout</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-neutral-500">Subtotal</span>
            <span className="text-xl font-semibold">{moneyCLP(subtotal)}</span>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Link href="/carrito" onClick={() => setOpen(false)} className="flex-1 rounded-full border py-3 text-center">
              Ver carrito
            </Link>
            <Link href="/checkout" onClick={() => setOpen(false)} className="flex-1 rounded-full bg-rose-600 py-3 text-center text-white">
              Finalizar pedido
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
