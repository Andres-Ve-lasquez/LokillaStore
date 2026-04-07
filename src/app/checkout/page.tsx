"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";

const REGIONES = [
  "Arica y Parinacota", "Tarapaca", "Antofagasta", "Atacama", "Coquimbo",
  "Valparaiso", "Metropolitana de Santiago", "O'Higgins", "Maule", "Nuble",
  "Biobio", "La Araucania", "Los Rios", "Los Lagos", "Aysen", "Magallanes",
];

const SHIPPING_COST = 3990;
const FREE_SHIPPING_THRESHOLD = 60000;

function moneyCLP(n: number) {
  return n.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
}

export default function CheckoutPage() {
  const {
    items,
    subtotal,
    clear,
    checkoutNotes,
    setCheckoutNotes,
    acceptedPolicies,
    setAcceptedPolicies,
  } = useCart();

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;

  const [form, setForm] = useState({
    nombre: "", email: "", telefono: "",
    region: REGIONES[6], ciudad: "", comuna: "", calle: "", numero: "", depto: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMsg, setCouponMsg] = useState("");
  const [couponValid, setCouponValid] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState("");

  const total = Math.max(0, subtotal - discount + shipping);

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponMsg("");
    setCouponValid(false);
    setDiscount(0);
    setAppliedCoupon("");
    try {
      const params = new URLSearchParams({ code: couponInput.trim(), amount: String(subtotal) });
      const res = await fetch(`/api/discounts/validate?${params}`);
      const j = await res.json();
      if (j.valid) {
        setDiscount(Math.round(j.discountAmount));
        setAppliedCoupon(couponInput.trim().toUpperCase());
        setCouponValid(true);
        setCouponMsg(`Cupon aplicado: descuento de ${moneyCLP(Math.round(j.discountAmount))}`);
      } else {
        setCouponMsg(j.message ?? "Cupon no valido");
      }
    } catch {
      setCouponMsg("Error al validar el cupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponInput("");
    setCouponMsg("");
    setCouponValid(false);
    setDiscount(0);
    setAppliedCoupon("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length) return;

    if (!acceptedPolicies) {
      setError("Debes aceptar las politicas de compra antes de continuar.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { nombre: form.nombre, email: form.email, telefono: form.telefono },
          address: { region: form.region, ciudad: form.ciudad, comuna: form.comuna, calle: form.calle, numero: form.numero, depto: form.depto },
          items: items.map((it) => ({
            productId: it.productId,
            nombre: it.nombre,
            precio: it.precio,
            cantidad: it.cantidad,
            imagenUrl: it.imagenUrl ?? "",
            talla: it.talla,
            color: it.color,
          })),
          subtotal,
          shippingCost: shipping,
          discount,
          couponCode: appliedCoupon,
          notes: checkoutNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Error al procesar el pedido");
        return;
      }

      clear();
      window.location.href = `${data.url}?token_ws=${data.token}`;
    } catch {
      setError("Error de conexion, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (!items.length) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center md:py-20">
        <p className="text-xl font-semibold text-slate-700">Tu carrito esta vacio.</p>
        <a href="/catalogo" className="mt-4 inline-block text-[#3bb1e6] underline">Ir al catalogo</a>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <h1 className="mb-8 text-2xl font-extrabold text-[#1a4876] md:text-3xl">Finalizar pedido</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
        <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-2 lg:space-y-8">
          <section className="space-y-4 rounded-2xl border bg-white p-5 sm:p-6">
            <h2 className="text-lg font-bold text-[#1a4876]">Datos de contacto</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-600">Nombre completo *</label>
                <input
                  name="nombre"
                  required
                  value={form.nombre}
                  onChange={handle}
                  className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#32e1c0]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Telefono *</label>
                <input
                  name="telefono"
                  required
                  value={form.telefono}
                  onChange={handle}
                  placeholder="+56 9 1234 5678"
                  className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#32e1c0]"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">
                Correo electronico * <span className="text-xs text-slate-400">(aqui recibiras la confirmacion)</span>
              </label>
              <input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handle}
                className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#32e1c0]"
              />
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border bg-white p-5 sm:p-6">
            <h2 className="text-lg font-bold text-[#1a4876]">Direccion de envio</h2>
            <div>
              <label className="text-sm font-medium text-slate-600">Region *</label>
              <select
                name="region"
                required
                value={form.region}
                onChange={handle}
                className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#32e1c0]"
              >
                {REGIONES.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-600">Ciudad *</label>
                <input
                  name="ciudad"
                  required
                  value={form.ciudad}
                  onChange={handle}
                  className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#32e1c0]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Comuna *</label>
                <input
                  name="comuna"
                  required
                  value={form.comuna}
                  onChange={handle}
                  className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#32e1c0]"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-600">Calle *</label>
                <input
                  name="calle"
                  required
                  value={form.calle}
                  onChange={handle}
                  className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#32e1c0]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Numero *</label>
                <input
                  name="numero"
                  required
                  value={form.numero}
                  onChange={handle}
                  className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#32e1c0]"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">
                Dpto / Casa / Block <span className="text-xs text-slate-400">(opcional)</span>
              </label>
              <input
                name="depto"
                value={form.depto}
                onChange={handle}
                placeholder="Ej: Depto 204, Casa B"
                className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#32e1c0]"
              />
            </div>
          </section>

          <section className="rounded-2xl border bg-white p-5 sm:p-6">
            <label className="font-bold text-slate-700">
              Notas del pedido <span className="text-xs font-normal text-slate-400">(opcional)</span>
            </label>
            <textarea
              rows={3}
              value={checkoutNotes}
              onChange={(e) => setCheckoutNotes(e.target.value)}
              placeholder="Ej: timbre roto, dejar con el conserje..."
              className="mt-2 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#32e1c0]"
            />
          </section>

          <section className="rounded-2xl border bg-white p-5 sm:p-6">
            <label className="flex items-start gap-3 text-sm text-slate-600">
              <input
                type="checkbox"
                className="mt-1"
                checked={acceptedPolicies}
                onChange={(e) => setAcceptedPolicies(e.target.checked)}
              />
              <span>
                Confirmo que lei los tiempos de produccion, envios, cambios y politicas del sitio.{" "}
                <Link href="/informativo#terminos" className="font-semibold text-[#3bb1e6] underline">
                  Ver informativos
                </Link>
              </span>
            </label>
          </section>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[#1a4876] py-4 text-base font-bold text-white transition hover:bg-[#1a4876]/90 disabled:opacity-60 md:text-lg"
          >
            {loading ? "Procesando..." : "Pagar con WebPay"}
          </button>
          <p className="text-center text-xs text-slate-400">Seras redirigido al portal seguro de Transbank</p>
        </form>

        <aside className="lg:col-span-1">
          <div className="space-y-4 rounded-2xl border bg-white p-5 sm:p-6 lg:sticky lg:top-6">
            <h2 className="text-lg font-bold text-[#1a4876]">Resumen</h2>

            <ul className="space-y-3 divide-y">
              {items.map((it) => (
                <li key={it.key} className="flex items-start gap-3 pt-3 first:pt-0">
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

            <div className="border-t pt-4">
              <p className="mb-2 text-sm font-medium text-slate-600">Tienes un cupon?</p>
              {couponValid ? (
                <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
                  <div>
                    <p className="text-xs font-bold text-emerald-700">{appliedCoupon}</p>
                    <p className="text-xs text-emerald-600">-{moneyCLP(discount)}</p>
                  </div>
                  <button onClick={removeCoupon} className="text-xs text-slate-400 underline hover:text-red-500">Quitar</button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyCoupon())}
                    placeholder="CODIGO"
                    className="flex-1 rounded-lg border px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-[#32e1c0]"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={couponLoading}
                    className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {couponLoading ? "..." : "Aplicar"}
                  </button>
                </div>
              )}
              {couponMsg && !couponValid && (
                <p className="mt-1 text-xs text-red-600">{couponMsg}</p>
              )}
            </div>

            <div className="space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span><span>{moneyCLP(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between font-medium text-emerald-600">
                  <span>Descuento</span><span>-{moneyCLP(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Envio</span>
                <span>{shipping === 0 ? "Gratis" : moneyCLP(shipping)}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-slate-400">Envio gratis sobre {moneyCLP(FREE_SHIPPING_THRESHOLD)}</p>
              )}
              <div className="flex justify-between border-t pt-2 text-base font-bold">
                <span>Total</span><span>{moneyCLP(total)}</span>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 text-center text-xs text-slate-500">
              Pago seguro con Transbank WebPay
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
