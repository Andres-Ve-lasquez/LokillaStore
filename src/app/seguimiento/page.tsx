"use client";
import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

const STEPS = [
  { key: "pending_payment", label: "Pago pendiente", icon: "💳" },
  { key: "paid",            label: "Pagado",          icon: "✅" },
  { key: "preparing",       label: "Preparando",      icon: "📦" },
  { key: "shipped",         label: "Despachado",      icon: "🚚" },
  { key: "delivered",       label: "Entregado",       icon: "🏠" },
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
      setError("Error de conexión, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const isCancelled = order?.status === "cancelled";
  const currentStep = order ? (STEP_INDEX[order.status] ?? 0) : -1;

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <div className="text-5xl mb-3">📬</div>
        <h1 className="text-3xl font-extrabold text-[#1a4876]">Seguimiento de pedido</h1>
        <p className="text-slate-500 mt-2">Ingresa tu número de orden para ver el estado</p>
      </div>

      {/* Buscador */}
      <form onSubmit={buscar} className="flex gap-3 mb-8">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          placeholder="ej: ORD-20250403-A1B2C3"
          className="flex-1 border-2 rounded-xl px-4 py-3 font-mono text-sm uppercase focus:outline-none focus:ring-2 focus:ring-[#32e1c0]"
        />
        <button type="submit" disabled={loading}
          className="px-6 py-3 rounded-xl bg-[#1a4876] text-white font-bold disabled:opacity-60 hover:bg-[#1a4876]/90 transition">
          {loading ? "..." : "Buscar"}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-center mb-6">
          {error}
        </div>
      )}

      {order && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl border p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-400 font-mono">Número de orden</p>
                <p className="text-xl font-bold text-[#1a4876]">{order.orderNumber}</p>
                <p className="text-sm text-slate-500 mt-1">Hola, {order.customer.nombre}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Fecha</p>
                <p className="text-sm font-medium">
                  {new Date(order.createdAt).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline de estado */}
          {isCancelled ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
              <p className="text-2xl mb-2">❌</p>
              <p className="font-bold text-red-700">Orden cancelada</p>
              <p className="text-sm text-red-500 mt-1">Contáctanos si tienes dudas.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border p-6">
              <h2 className="font-bold text-[#1a4876] mb-6">Estado del pedido</h2>
              <div className="relative">
                {/* Línea base */}
                <div className="absolute top-5 left-[10%] right-[10%] h-1 bg-slate-100 rounded-full" />
                {/* Línea de progreso */}
                <div
                  className="absolute top-5 left-[10%] h-1 bg-gradient-to-r from-[#32e1c0] to-[#a572e1] rounded-full transition-all duration-700"
                  style={{ width: `${(currentStep / (STEPS.length - 1)) * 80}%` }}
                />
                <div className="flex justify-between relative z-10">
                  {STEPS.map((step, i) => {
                    const done = i <= currentStep;
                    const active = i === currentStep;
                    return (
                      <div key={step.key} className="flex flex-col items-center gap-2 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all
                          ${active ? "border-[#32e1c0] bg-[#32e1c0] text-white shadow-lg scale-110"
                            : done ? "border-[#a572e1] bg-[#a572e1]/10 text-[#a572e1]"
                            : "border-slate-200 bg-white text-slate-300"}`}>
                          {step.icon}
                        </div>
                        <p className={`text-xs text-center leading-tight ${active ? "font-bold text-[#1a4876]" : done ? "text-[#a572e1]" : "text-slate-300"}`}>
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mensaje según estado */}
              <div className="mt-6 p-4 bg-slate-50 rounded-xl text-sm text-slate-600 text-center">
                {order.status === "pending_payment" && "Esperando confirmación del pago."}
                {order.status === "paid" && "¡Pago recibido! Pronto comenzaremos a preparar tu pedido."}
                {order.status === "preparing" && "Estamos preparando tu pedido con mucho cariño. 📦"}
                {order.status === "shipped" && `Tu pedido está en camino a ${order.address.ciudad}, ${order.address.region}. 🚚`}
                {order.status === "delivered" && "¡Pedido entregado! Esperamos que te encante. ✨"}
              </div>
            </div>
          )}

          {/* Productos */}
          <div className="bg-white rounded-2xl border p-6">
            <h2 className="font-bold text-[#1a4876] mb-4">Productos</h2>
            <ul className="space-y-3 divide-y">
              {order.items.map((it, i) => (
                <li key={i} className="flex items-center gap-3 pt-3 first:pt-0">
                  {it.imagenUrl && (
                    <img src={it.imagenUrl} alt={it.nombre} className="w-12 h-12 rounded-lg object-cover bg-slate-100 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{it.nombre}</p>
                    <p className="text-xs text-slate-500">
                      x{it.cantidad}{it.talla ? ` · T.${it.talla}` : ""}{it.color ? ` · ${it.color}` : ""}
                    </p>
                  </div>
                  <p className="text-sm font-semibold flex-shrink-0">{moneyCLP(it.precio * it.cantidad)}</p>
                </li>
              ))}
            </ul>

            <div className="border-t mt-4 pt-4 space-y-1 text-sm">
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Descuento</span><span>-{moneyCLP(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Envío</span>
                <span>{order.shippingCost === 0 ? "Gratis 🎁" : moneyCLP(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-1 border-t">
                <span>Total pagado</span><span>{moneyCLP(order.total)}</span>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-slate-400">
            ¿Tienes dudas?{" "}
            <a href="https://www.instagram.com/lookilla.store/" target="_blank" rel="noopener noreferrer" className="underline text-[#3bb1e6]">
              Escríbenos por Instagram
            </a>
          </p>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/catalogo" className="text-sm text-[#3bb1e6] hover:underline">← Volver al catálogo</Link>
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
