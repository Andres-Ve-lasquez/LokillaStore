'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FaTimes, FaShoppingBag, FaTrash } from 'react-icons/fa';
import { useCart } from './CartProvider';

export default function CartDrawer() {
  const { items, subtotal, count, setQty, removeItem, setOpen, open, moneyCLP, FREE_SHIPPING_THRESHOLD } = useCart();

  const faltante = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progreso = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}>
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-[#32e1c0] via-[#3bb1e6] to-[#a572e1] px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white">
              <FaShoppingBag size={20} />
              <h2 className="text-xl font-extrabold tracking-tight">
                Mi carrito
                {count > 0 && (
                  <span className="ml-2 rounded-full bg-white/25 px-2 py-0.5 text-sm font-bold">
                    {count}
                  </span>
                )}
              </h2>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="grid h-9 w-9 place-items-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
              aria-label="Cerrar carrito"
            >
              <FaTimes size={16} />
            </button>
          </div>

          {/* Barra progreso envío gratis */}
          <div className="mt-3">
            {faltante > 0 ? (
              <>
                <p className="text-xs text-white/90">
                  Te faltan <strong className="text-white">{moneyCLP(faltante)}</strong> para envío gratis 🚚
                </p>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/30">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-500"
                    style={{ width: `${progreso}%` }}
                  />
                </div>
              </>
            ) : (
              <p className="text-xs font-semibold text-white">🎉 ¡Tienes envío gratis!</p>
            )}
          </div>
        </div>

        {/* Productos */}
        <div className="flex-1 overflow-y-auto bg-[#f7faff] px-4 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 grid h-20 w-20 place-items-center rounded-full bg-white shadow-sm">
                <FaShoppingBag size={32} className="text-[#3bb1e6]" />
              </div>
              <p className="font-semibold text-slate-600">Tu carrito está vacío</p>
              <p className="mt-1 text-sm text-slate-400">Agrega productos para comenzar</p>
              <Link
                href="/catalogo"
                onClick={() => setOpen(false)}
                className="mt-5 rounded-full bg-gradient-to-r from-[#32e1c0] to-[#a572e1] px-6 py-2.5 text-sm font-bold text-white shadow transition hover:opacity-90"
              >
                Ver tienda
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((it) => (
                <li key={it.key} className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm">
                  {/* Imagen */}
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                    {it.imagenUrl ? (
                      <Image src={it.imagenUrl} alt={it.nombre} fill className="object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-xs text-slate-400">Sin img</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-semibold text-[#1a4876] leading-tight">{it.nombre}</p>
                    {(it.color || it.talla) && (
                      <p className="mt-0.5 text-xs text-slate-400">
                        {it.color && `Color: ${it.color}`}{it.color && it.talla && ' · '}{it.talla && `T: ${it.talla}`}
                      </p>
                    )}
                    <p className="mt-1 text-sm font-bold text-[#a572e1]">{moneyCLP(it.precio * it.cantidad)}</p>

                    <div className="mt-2 flex items-center justify-between">
                      {/* Contador */}
                      <div className="inline-flex items-center overflow-hidden rounded-full border border-slate-200 bg-slate-50 text-sm">
                        <button
                          onClick={() => setQty(it.key, it.cantidad - 1)}
                          className="px-3 py-1 font-bold text-slate-500 transition hover:bg-slate-100 hover:text-[#a572e1]"
                        >
                          −
                        </button>
                        <span className="min-w-[28px] text-center font-semibold">{it.cantidad}</span>
                        <button
                          onClick={() => setQty(it.key, it.cantidad + 1)}
                          className="px-3 py-1 font-bold text-slate-500 transition hover:bg-slate-100 hover:text-[#32e1c0]"
                        >
                          +
                        </button>
                      </div>

                      {/* Quitar */}
                      <button
                        onClick={() => removeItem(it.key)}
                        className="grid h-7 w-7 place-items-center rounded-full text-slate-300 transition hover:bg-red-50 hover:text-red-500"
                        aria-label="Quitar producto"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t bg-white px-4 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-slate-500">Subtotal ({count} producto{count !== 1 ? 's' : ''})</span>
              <span className="text-xl font-extrabold text-[#1a4876]">{moneyCLP(subtotal)}</span>
            </div>
            <p className="mb-3 text-center text-xs text-slate-400">Envío y descuentos se calculan en el checkout</p>

            <div className="flex flex-col gap-2">
              <Link
                href="/checkout"
                onClick={() => setOpen(false)}
                className="block w-full rounded-full bg-gradient-to-r from-[#32e1c0] via-[#3bb1e6] to-[#a572e1] py-3.5 text-center text-base font-extrabold text-white shadow-lg transition hover:opacity-90 hover:shadow-xl"
              >
                Finalizar pedido →
              </Link>
              <Link
                href="/carrito"
                onClick={() => setOpen(false)}
                className="block w-full rounded-full border-2 border-slate-200 py-3 text-center text-sm font-semibold text-slate-600 transition hover:border-[#3bb1e6] hover:text-[#3bb1e6]"
              >
                Ver carrito completo
              </Link>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
