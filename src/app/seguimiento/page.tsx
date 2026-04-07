"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const STEPS = [
  { key: "pending_payment", label: "Pago pendiente", icon: "💳" },
  { key: "paid", label: "Pagado", icon: "✅" },
  { key: "preparing", label: "Preparando", icon: "📦" },
  { key: "shipped", label: "Despachado", icon: "🚚" },
  { key: "delivered", label: "Entregado", icon: "🏠" },
];

const STEP_INDEX: Record<string, number> = Object.fromEntries(
  STEPS.map((s, i) => [s.key, i])
);

function moneyCLP(n: number) {
  return n.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
}

type OrderData = {
  orderNumber: string;
  status: string;
  createdAt: string;
  paidAt: string | null;
  customer: { nombre: string };
  address: { region: string; ciudad: string };
  items: { nombre: string; cantidad: number; precio: number; talla?: string; color?: string; imagenUrl?: string }[];
  total: number;
  shippingCost: number;
  discount: number;
};

function SeguimientoContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [input, setInput] = useState(params.get("order") ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<OrderData | null>(null);

  const buscar = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const code = input.trim().toUpperCase();
    if (!code) return;
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await fetch(`/api/orders/track?order=${code}`);
      const j = await res.json();
      if (j.ok) {
        setOrder(j.order);
        router.replace(`/seguimiento?order=${code}`, { scroll: false });
      } else {
        setError(j.error ?? "Orden no encontrada");
      }
    } catch {
      setError("Error de conexion, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const isCancelled = order?.status === "cancelled";
  const currentStep = order ? (STEP_INDEX[order.status] ?? 0) : -1;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <div className="mb-8 text-center md:mb-10">
        <div className="mb-3 text-5xl">📬</div>
        <h1 className="text-3xl font-extrabold text-[#1a4876]">Seguimiento de pedido</h1>
        <p className="mt-2 text-slate-500">Ingresa tu numero de orden para ver el estado</p>
      </div>

      <form onSubmit={buscar} className="mb-8 flex flex-col gap-3 sm:flex-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          placeholder="ej: ORD-20250403-A1B2C3"
          className="flex-1 rounded-xl border-2 px-4 py-3 font-mono text-sm uppercase focus:outline-none focus:ring-2 focus:ring-[#32e1c0]"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[#1a4876] px-6 py-3 font-bold text-white transition hover:bg-[#1a4876]/90 disabled:opacity-60"
        >
          {loading ? "..." : "Buscar"}
        </button>
      </form>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-center text-red-700">
          {error}
        </div>
      )}

      {order && (
        <div className="space-y-6">
          <div className="rounded-2xl border bg-white p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-mono text-xs text-slate-400">Numero de orden</p>
                <p className="text-xl font-bold text-[#1a4876]">{order.orderNumber}</p>
                <p className="mt-1 text-sm text-slate-500">Hola, {order.customer.nombre}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-xs text-slate-400">Fecha</p>
                <p className="text-sm font-medium">
                  {new Date(order.createdAt).toLocaleDateString("es-CL", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {isCancelled ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
              <p className="mb-2 text-2xl">❌</p>
              <p className="font-bold text-red-700">Orden cancelada</p>
              <p className="mt-1 text-sm text-red-500">Contactanos si tienes dudas.</p>
            </div>
          ) : (
            <div className="rounded-2xl border bg-white p-5 sm:p-6">
              <h2 className="mb-6 font-bold text-[#1a4876]">Estado del pedido</h2>

              <div className="space-y-4 md:hidden">
                {STEPS.map((step, i) => {
                  const done = i <= currentStep;
                  const active = i === currentStep;
                  return (
                    <div key={step.key} className="flex gap-4">
                      <div className="flex w-10 flex-col items-center">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-lg transition-all ${
                            active
                              ? "scale-110 border-[#32e1c0] bg-[#32e1c0] text-white shadow-lg"
                              : done
                                ? "border-[#a572e1] bg-[#a572e1]/10 text-[#a572e1]"
                                : "border-slate-200 bg-white text-slate-300"
                          }`}
                        >
                          {step.icon}
                        </div>
                        {i < STEPS.length - 1 && (
                          <div
                            className={`mt-2 w-1 flex-1 rounded-full ${
                              i < currentStep ? "bg-gradient-to-b from-[#32e1c0] to-[#a572e1]" : "bg-slate-100"
                            }`}
                          />
                        )}
                      </div>
                      <div className="pb-4 pt-1">
                        <p className={`text-sm font-semibold ${active ? "text-[#1a4876]" : done ? "text-[#a572e1]" : "text-slate-400"}`}>
                          {step.label}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {active ? "Estado actual" : done ? "Paso completado" : "Paso pendiente"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="relative hidden md:block">
                <div className="absolute left-[10%] right-[10%] top-5 h-1 rounded-full bg-slate-100" />
                <div
                  className="absolute left-[10%] top-5 h-1 rounded-full bg-gradient-to-r from-[#32e1c0] to-[#a572e1] transition-all duration-700"
                  style={{ width: `${(currentStep / (STEPS.length - 1)) * 80}%` }}
                />
                <div className="relative z-10 flex justify-between">
                  {STEPS.map((step, i) => {
                    const done = i <= currentStep;
                    const active = i === currentStep;
                    return (
                      <div key={step.key} className="flex flex-1 flex-col items-center gap-2">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-lg transition-all ${
                            active
                              ? "scale-110 border-[#32e1c0] bg-[#32e1c0] text-white shadow-lg"
                              : done
                                ? "border-[#a572e1] bg-[#a572e1]/10 text-[#a572e1]"
                                : "border-slate-200 bg-white text-slate-300"
                          }`}
                        >
                          {step.icon}
                        </div>
                        <p className={`text-center text-xs leading-tight ${active ? "font-bold text-[#1a4876]" : done ? "text-[#a572e1]" : "text-slate-300"}`}>
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-600">
                {order.status === "pending_payment" && "Esperando confirmacion del pago."}
                {order.status === "paid" && "Pago recibido. Pronto comenzaremos a preparar tu pedido."}
                {order.status === "preparing" && "Estamos preparando tu pedido con mucho carino."}
                {order.status === "shipped" && `Tu pedido esta en camino a ${order.address.ciudad}, ${order.address.region}.`}
                {order.status === "delivered" && "Pedido entregado. Esperamos que te encante."}
              </div>
            </div>
          )}

          <div className="rounded-2xl border bg-white p-5 sm:p-6">
            <h2 className="mb-4 font-bold text-[#1a4876]">Productos</h2>
            <ul className="space-y-3 divide-y">
              {order.items.map((it, i) => (
                <li key={i} className="flex items-start gap-3 pt-3 first:pt-0">
                  {it.imagenUrl && (
                    <img src={it.imagenUrl} alt={it.nombre} className="h-12 w-12 flex-shrink-0 rounded-lg bg-slate-100 object-cover" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-medium">{it.nombre}</p>
                    <p className="text-xs text-slate-500">
                      x{it.cantidad}{it.talla ? ` · T.${it.talla}` : ""}{it.color ? ` · ${it.color}` : ""}
                    </p>
                  </div>
                  <p className="flex-shrink-0 text-right text-sm font-semibold">{moneyCLP(it.precio * it.cantidad)}</p>
                </li>
              ))}
            </ul>

            <div className="mt-4 space-y-1 border-t pt-4 text-sm">
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Descuento</span>
                  <span>-{moneyCLP(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Envio</span>
                <span>{order.shippingCost === 0 ? "Gratis" : moneyCLP(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between border-t pt-1 text-base font-bold">
                <span>Total pagado</span>
                <span>{moneyCLP(order.total)}</span>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-slate-400">
            Tienes dudas?{" "}
            <a href="https://www.instagram.com/lookilla.store/" target="_blank" rel="noopener noreferrer" className="text-[#3bb1e6] underline">
              Escribenos por Instagram
            </a>
          </p>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/catalogo" className="text-sm text-[#3bb1e6] hover:underline">
          ← Volver al catalogo
        </Link>
      </div>
    </main>
  );
}

export default function SeguimientoPage() {
  return (
    <Suspense>
      <SeguimientoContent />
    </Suspense>
  );
}
