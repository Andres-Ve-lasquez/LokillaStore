"use client";
import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";

const REGIONES = [
  "Arica y Parinacota", "Tarapacá", "Antofagasta", "Atacama", "Coquimbo",
  "Valparaíso", "Metropolitana de Santiago", "O'Higgins", "Maule", "Ñuble",
  "Biobío", "La Araucanía", "Los Ríos", "Los Lagos", "Aysén", "Magallanes",
];

const SHIPPING_COST = 3990;
const FREE_SHIPPING_THRESHOLD = 60000;

function moneyCLP(n: number) {
  return n.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
}

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;

  const [form, setForm] = useState({
    nombre: "", email: "", telefono: "",
    region: REGIONES[6], ciudad: "", comuna: "", calle: "", numero: "", depto: "",
  });
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Cupón
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
        setCouponMsg(`✅ Cupón aplicado — descuento de ${moneyCLP(Math.round(j.discountAmount))}`);
      } else {
        setCouponMsg(`❌ ${j.message ?? "Cupón no válido"}`);
      }
    } catch {
      setCouponMsg("❌ Error al validar el cupón");
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
          notes,
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
      setError("Error de conexión, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (!items.length) {
    return (
      <main className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-xl font-semibold text-slate-700">Tu carrito está vacío.</p>
        <a href="/catalogo" className="mt-4 inline-block underline text-[#3bb1e6]">Ir al catálogo</a>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold text-[#1a4876] mb-8">Finalizar pedido</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Formulario */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-8">

          {/* Datos personales */}
          <section className="bg-white rounded-2xl border p-6 space-y-4">
            <h2 className="font-bold text-lg text-[#1a4876]">Datos de contacto</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Nombre completo *</label>
                <input name="nombre" required value={form.nombre} onChange={handle}
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#32e1c0]" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Teléfono *</label>
                <input name="telefono" required value={form.telefono} onChange={handle} placeholder="+56 9 1234 5678"
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#32e1c0]" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">
                Correo electrónico * <span className="text-xs text-slate-400">(aquí recibirás la confirmación)</span>
              </label>
              <input name="email" type="email" required value={form.email} onChange={handle}
                className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#32e1c0]" />
            </div>
          </section>

          {/* Dirección */}
          <section className="bg-white rounded-2xl border p-6 space-y-4">
            <h2 className="font-bold text-lg text-[#1a4876]">Dirección de envío</h2>
            <div>
              <label className="text-sm font-medium text-slate-600">Región *</label>
              <select name="region" required value={form.region} onChange={handle}
                className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#32e1c0]">
                {REGIONES.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Ciudad *</label>
                <input name="ciudad" required value={form.ciudad} onChange={handle}
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#32e1c0]" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Comuna *</label>
                <input name="comuna" required value={form.comuna} onChange={handle}
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#32e1c0]" />
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-600">Calle *</label>
                <input name="calle" required value={form.calle} onChange={handle}
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#32e1c0]" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Número *</label>
                <input name="numero" required value={form.numero} onChange={handle}
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#32e1c0]" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">
                Dpto / Casa / Block <span className="text-xs text-slate-400">(opcional)</span>
              </label>
              <input name="depto" value={form.depto} onChange={handle} placeholder="Ej: Depto 204, Casa B"
                className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#32e1c0]" />
            </div>
          </section>

          {/* Notas */}
          <section className="bg-white rounded-2xl border p-6">
            <label className="font-bold text-slate-700">
              Notas del pedido <span className="text-xs font-normal text-slate-400">(opcional)</span>
            </label>
            <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: timbre roto, dejar con el conserje..."
              className="mt-2 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#32e1c0]" />
          </section>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">{error}</div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-4 rounded-2xl font-bold text-white text-lg bg-[#1a4876] hover:bg-[#1a4876]/90 disabled:opacity-60 transition">
            {loading ? "Procesando..." : "Pagar con WebPay 🔒"}
          </button>
          <p className="text-center text-xs text-slate-400">Serás redirigido al portal seguro de Transbank</p>
        </form>

        {/* Resumen del pedido */}
        <aside className="lg:col-span-1">
          <div className="sticky top-6 bg-white rounded-2xl border p-6 space-y-4">
            <h2 className="font-bold text-lg text-[#1a4876]">Resumen</h2>

            <ul className="space-y-3 divide-y">
              {items.map((it) => (
                <li key={it.key} className="flex items-center gap-3 pt-3 first:pt-0">
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

            {/* Cupón */}
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-slate-600 mb-2">¿Tienes un cupón?</p>
              {couponValid ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                  <div>
                    <p className="text-xs font-bold text-emerald-700">{appliedCoupon}</p>
                    <p className="text-xs text-emerald-600">-{moneyCLP(discount)}</p>
                  </div>
                  <button onClick={removeCoupon} className="text-xs text-slate-400 hover:text-red-500 underline">Quitar</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyCoupon())}
                    placeholder="CÓDIGO"
                    className="flex-1 border rounded-lg px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-[#32e1c0]"
                  />
                  <button type="button" onClick={applyCoupon} disabled={couponLoading}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium disabled:opacity-50">
                    {couponLoading ? "..." : "Aplicar"}
                  </button>
                </div>
              )}
              {couponMsg && !couponValid && (
                <p className="text-xs mt-1 text-red-600">{couponMsg}</p>
              )}
            </div>

            {/* Totales */}
            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span><span>{moneyCLP(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Descuento</span><span>-{moneyCLP(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Envío</span>
                <span>{shipping === 0
                  ? <span className="text-emerald-600 font-medium">Gratis 🎁</span>
                  : moneyCLP(shipping)}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-slate-400">Envío gratis sobre {moneyCLP(FREE_SHIPPING_THRESHOLD)}</p>
              )}
              <div className="flex justify-between font-bold text-base border-t pt-2">
                <span>Total</span><span>{moneyCLP(total)}</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-500 text-center">
              🔒 Pago seguro con Transbank WebPay
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
