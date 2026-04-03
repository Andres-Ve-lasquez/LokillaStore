'use client';
import Image from 'next/image';
import { useCart } from './CartProvider';

export default function CartDrawer() {
  const { items, subtotal, count, setQty, removeItem, setOpen, open, moneyCLP, FREE_SHIPPING_THRESHOLD } = useCart();

  const faltante = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progreso = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={() => setOpen(false)}
      />
      {/* Panel */}
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transition-transform duration-300
        ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-2xl font-semibold">Carrito <sup className="text-sm align-super">{count}</sup></h2>
          <button onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-neutral-100">✕</button>
        </div>

        {/* Barra envío gratis */}
        <div className="px-5 py-4">
          {faltante > 0 ? (
            <>
              <p className="text-sm">
                ¡Te faltan solo <strong>{moneyCLP(faltante)}</strong> para conseguir envío gratis!
              </p>
              <div className="h-2 w-full bg-neutral-200 rounded mt-2">
                <div className="h-2 bg-black rounded" style={{ width: `${progreso}%` }} />
              </div>
            </>
          ) : (
            <p className="text-sm font-medium text-emerald-600">¡Ya tienes envío gratis! 🎉</p>
          )}
        </div>

        {/* Lista de items */}
        <div className="px-5 overflow-auto" style={{ maxHeight: 'calc(100% - 280px)' }}>
          {items.length === 0 && (
            <p className="text-sm text-neutral-500 py-8">Tu carrito está vacío.</p>
          )}

          <ul className="space-y-5">
            {items.map((it) => (
              <li key={it.key} className="flex gap-4">
                <div className="relative w-20 h-20 rounded overflow-hidden bg-neutral-100">
                  {it.imagenUrl && (
                    <Image src={it.imagenUrl} alt={it.nombre} fill className="object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-neutral-500">Anime Streetwear</p>
                  <p className="font-medium">{it.nombre}</p>
                  <p className="text-sm text-neutral-500">
                    {it.color ? `Color ${it.color}` : null} {it.talla ? `· ${it.talla}` : null}
                  </p>
                  <p className="mt-1 text-sm">{moneyCLP(it.precio)}</p>

                  <div className="mt-2 flex items-center gap-3">
                    <div className="inline-flex items-center border rounded-lg">
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

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t p-5 bg-white">
          <p className="text-sm text-neutral-500">El valor de tu envío se calculará en el checkout</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-neutral-500">Subtotal</span>
            <span className="text-xl font-semibold">{moneyCLP(subtotal)}</span>
          </div>

          <div className="mt-4 flex gap-3">
            <a href="/carrito" className="flex-1 border rounded-full py-3 text-center">Ver carrito</a>
            <a href="/checkout" className="flex-1 rounded-full py-3 text-center bg-rose-600 text-white">Finalizar pedido</a>
          </div>
        </div>
      </aside>
    </div>
  );
}
