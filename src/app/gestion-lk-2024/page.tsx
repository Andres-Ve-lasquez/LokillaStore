"use client";
import { useEffect, useMemo, useState } from "react";

const COLECCIONES = ["Poleras","Relojes","Calcetines","Billeteras","Zapatillas","Cortavientos","Totebag","Tazas"];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending_payment: { label: "Pago pendiente", color: "bg-yellow-100 text-yellow-800" },
  paid:            { label: "Pagado",          color: "bg-blue-100 text-blue-800" },
  preparing:       { label: "Preparando",      color: "bg-purple-100 text-purple-800" },
  shipped:         { label: "Despachado",      color: "bg-orange-100 text-orange-800" },
  delivered:       { label: "Entregado",       color: "bg-emerald-100 text-emerald-800" },
  cancelled:       { label: "Cancelado",       color: "bg-red-100 text-red-800" },
};

function moneyCLP(n: number) {
  return n.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
}

type Order = {
  _id: string;
  orderNumber: string;
  customer: { nombre: string; email: string; telefono: string };
  address: { region: string; ciudad: string; comuna: string; calle: string; numero: string; depto?: string };
  items: { nombre: string; cantidad: number; precio: number; talla?: string; color?: string }[];
  total: number;
  status: string;
  notes?: string;
  createdAt: string;
};

function OrdersSection() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = async (status: string) => {
    setLoading(true);
    try {
      const url = status ? `/api/orders?status=${status}` : "/api/orders?limit=50";
      const res = await fetch(url);
      const j = await res.json();
      if (j.ok) setOrders(j.orders);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(filterStatus); }, [filterStatus]);

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(orderId);
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchOrders(filterStatus);
      if (selected?._id === orderId) setSelected((o) => o ? { ...o, status } : null);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-bold text-[#1a4876]">Órdenes de Venta</h2>
        <div className="flex gap-2">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="text-sm border rounded-lg px-3 py-1.5">
            <option value="">Todas</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <button onClick={() => fetchOrders(filterStatus)} className="text-sm px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200">
            Actualizar
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500">Cargando órdenes...</p>
      ) : orders.length === 0 ? (
        <div className="p-4 bg-slate-50 rounded-xl text-slate-500 text-center">No hay órdenes aún.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left">Orden</th>
                <th className="px-4 py-3 text-left">Cliente</th>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y bg-white">
              {orders.map((o) => {
                const st = STATUS_LABELS[o.status] ?? { label: o.status, color: "bg-slate-100 text-slate-700" };
                return (
                  <tr key={o._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-semibold text-[#1a4876]">
                      <button onClick={() => setSelected(o)} className="hover:underline">{o.orderNumber}</button>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{o.customer.nombre}</p>
                      <p className="text-xs text-slate-400">{o.customer.email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {new Date(o.createdAt).toLocaleDateString("es-CL")}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{moneyCLP(o.total)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <select
                        value={o.status}
                        disabled={updating === o._id}
                        onChange={(e) => updateStatus(o._id, e.target.value)}
                        className="text-xs border rounded-lg px-2 py-1 disabled:opacity-50"
                      >
                        {Object.entries(STATUS_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal detalle de orden */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-[#1a4876]">{selected.orderNumber}</h3>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700 text-xl">✕</button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="font-semibold mb-1">Cliente</p>
                <p>{selected.customer.nombre}</p>
                <p className="text-slate-500">{selected.customer.email}</p>
                <p className="text-slate-500">{selected.customer.telefono}</p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <p className="font-semibold mb-1">Dirección de envío</p>
                <p>{selected.address.calle} {selected.address.numero}{selected.address.depto ? `, ${selected.address.depto}` : ""}</p>
                <p>{selected.address.comuna}, {selected.address.ciudad}</p>
                <p>{selected.address.region}</p>
              </div>

              <div>
                <p className="font-semibold mb-2">Productos</p>
                <ul className="space-y-2">
                  {selected.items.map((it, i) => (
                    <li key={i} className="flex justify-between border-b pb-2">
                      <span>{it.nombre} x{it.cantidad}{it.talla ? ` – T.${it.talla}` : ""}</span>
                      <span className="font-semibold">{moneyCLP(it.precio * it.cantidad)}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between font-bold mt-2 text-base">
                  <span>Total</span><span>{moneyCLP(selected.total)}</span>
                </div>
              </div>

              {selected.notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="font-semibold">Nota del cliente:</p>
                  <p className="text-slate-600">{selected.notes}</p>
                </div>
              )}

              <div>
                <p className="font-semibold mb-2">Cambiar estado</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(STATUS_LABELS).map(([k, v]) => (
                    <button key={k}
                      onClick={() => updateStatus(selected._id, k)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${selected.status === k ? v.color + " border-transparent" : "bg-white text-slate-600 hover:bg-slate-100"}`}>
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

type Product = {
  _id?: string;
  nombre: string;
  descripcion: string;
  precio: number | string;
  imagenUrl: string;
  stock: number | string;
  minStock: number | string;
  coleccion: string;
  sku?: string;
};

export default function AdminPage() {
  const EMPTY_FORM: Product = { nombre: "", descripcion: "", precio: "", imagenUrl: "", stock: "", minStock: 5, coleccion: COLECCIONES[0], sku: "" };
  const [form, setForm] = useState<Product>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [loadingLow, setLoadingLow] = useState(false);

  const [couponForm, setCouponForm] = useState({
    code: "",
    type: "percentage",
    value: 10,
    appliesTo: "order",
    productIds: "",
    colecciones: "",
    minOrderAmount: 0,
    startAt: "",
    endAt: "",
    usageLimit: "",
    isActive: true,
  });
  const [couponMsg, setCouponMsg] = useState("");

  const [test, setTest] = useState({ code: "", amount: "", productId: "", coleccion: "" });
  const [testResult, setTestResult] = useState<string>("");

  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImage = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMensaje("Solo imágenes PNG/JPG permitidas");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((f) => ({ ...f, imagenUrl: reader.result as string }));
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const resetProductForm = () => { setForm(EMPTY_FORM); setEditingId(null); setPreview(null); };

  const startEdit = (p: Product) => {
    setForm({ nombre: p.nombre, descripcion: p.descripcion, precio: p.precio, imagenUrl: p.imagenUrl, stock: p.stock, minStock: p.minStock, coleccion: p.coleccion, sku: p.sku ?? "" });
    setEditingId(p._id!);
    setPreview(p.imagenUrl || null);
    window.scrollTo({ top: document.getElementById("product-form")?.offsetTop ?? 0, behavior: "smooth" });
  };

  const deleteProduct = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`)) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    const j = await res.json();
    if (j.ok) { fetchProducts(); fetchLowStock(); }
    else alert("Error al eliminar: " + j.error);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setMensaje("");
    const payload = { ...form, precio: Number(form.precio), stock: Number(form.stock), minStock: Number(form.minStock || 5) };
    try {
      const res = await fetch(editingId ? `/api/products/${editingId}` : "/api/products", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      if (res.ok && j?.ok) {
        setMensaje(editingId ? "¡Producto actualizado!" : "¡Producto guardado!");
        resetProductForm();
        fetchProducts();
        fetchLowStock();
      } else {
        setMensaje("Error: " + (j?.error || ""));
      }
    } catch (err: any) {
      setMensaje("Error en la red: " + err?.message);
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch("/api/products?limit=100");
      const j = await res.json();
      if (j?.ok) setAllProducts(j.items || []);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchLowStock = async () => {
    try {
      setLoadingLow(true);
      const res = await fetch("/api/products?lowStock=true&limit=50");
      const j = await res.json();
      if (j?.ok) setLowStock(j.items || []);
    } finally {
      setLoadingLow(false);
    }
  };

  useEffect(() => { fetchLowStock(); fetchProducts(); }, []);

  const handleCouponChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setCouponForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const createCoupon = async (e: any) => {
    e.preventDefault();
    setCouponMsg("");
    try {
      const payload: any = {
        code: couponForm.code,
        type: couponForm.type,
        value: Number(couponForm.value),
        appliesTo: couponForm.appliesTo,
        minOrderAmount: Number(couponForm.minOrderAmount || 0),
        startAt: couponForm.startAt || undefined,
        endAt: couponForm.endAt || undefined,
        usageLimit: couponForm.usageLimit ? Number(couponForm.usageLimit) : undefined,
        isActive: couponForm.isActive,
      };
      if (couponForm.appliesTo === "product" && couponForm.productIds.trim()) {
        payload.productIds = couponForm.productIds.split(",").map((s) => s.trim());
      }
      if (couponForm.appliesTo === "coleccion" && couponForm.colecciones.trim()) {
        payload.colecciones = couponForm.colecciones.split(",").map((s) => s.trim());
      }

      const res = await fetch("/api/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      setCouponMsg(res.ok && j?.ok ? "Cupón creado ✔" : "Error: " + (j?.error || "desconocido"));
    } catch (e: any) {
      setCouponMsg("Error: " + e.message);
    }
  };

  const testCoupon = async (e: any) => {
    e.preventDefault();
    setTestResult("");
    const params = new URLSearchParams({ code: test.code, amount: String(test.amount || 0) });
    if (test.productId) params.set("productId", test.productId);
    if (test.coleccion) params.set("coleccion", test.coleccion);

    const res = await fetch(`/api/discounts/validate?${params.toString()}`);
    const j = await res.json();
    if (j?.valid) setTestResult(`Válido. Descuento: $${j.discountAmount?.toFixed(0)} → Total final: $${j.finalAmount?.toFixed(0)}`);
    else setTestResult(`No válido: ${j?.message || "—"}`);
  };

  const lowStockCount = useMemo(() => lowStock.length, [lowStock]);

  const TABS = [
    { key: "productos", label: "📦 Productos", badge: lowStockCount > 0 ? lowStockCount : null },
    { key: "cupones",   label: "🎟️ Cupones",   badge: null },
    { key: "ordenes",   label: "🛒 Órdenes",   badge: null },
  ];
  const [tab, setTab] = useState("productos");

  return (
    <div className="max-w-5xl mx-auto mt-6 px-4 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#32e1c0] to-[#a572e1] flex items-center justify-center text-white font-bold text-lg">L</div>
          <h1 className="text-xl font-extrabold text-[#1a4876]">Panel Admin</h1>
        </div>
        <button
          onClick={async () => { await fetch("/api/admin/login", { method: "DELETE" }); window.location.href = "/gestion-lk-2024/login"; }}
          className="text-sm px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium"
        >
          Cerrar sesión
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-8">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2
              ${tab === t.key ? "bg-white shadow text-[#1a4876]" : "text-slate-500 hover:text-slate-700"}`}>
            {t.label}
            {t.badge ? <span className="bg-amber-400 text-white text-xs rounded-full px-1.5 py-0.5">{t.badge}</span> : null}
          </button>
        ))}
      </div>

      {/* Tab: Productos */}
      {tab === "productos" && (
        <div className="space-y-8">
          {/* Alertas stock */}
          {lowStockCount > 0 && (
            <section className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-amber-800">⚠️ Stock bajo ({lowStockCount})</h2>
                <button onClick={fetchLowStock} className="text-xs px-3 py-1 rounded-lg bg-white border hover:bg-slate-50">Actualizar</button>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {lowStock.map((p: any) => (
                  <div key={p._id} className="bg-white p-3 border rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{p.nombre}</p>
                      <p className="text-xs text-slate-500">{p.coleccion}</p>
                      <p className="text-xs mt-1">Stock: <span className="font-bold text-red-500">{p.stock}</span> / min {p.minStock}</p>
                    </div>
                    {p.imagenUrl && <img src={p.imagenUrl} className="w-12 h-12 object-contain rounded-lg" alt={p.nombre} />}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Formulario agregar/editar */}
          <section className="bg-white rounded-2xl border p-6" id="product-form">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#1a4876]">{editingId ? "✏️ Editar Producto" : "➕ Agregar Producto"}</h2>
              {editingId && <button onClick={resetProductForm} className="text-sm px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200">Cancelar</button>}
            </div>
            <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-3">
                <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} className="p-2 rounded-lg border" required />
                <input name="sku" placeholder="SKU (opcional)" value={form.sku || ""} onChange={handleChange} className="p-2 rounded-lg border" />
              </div>
              <textarea name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={handleChange} className="p-2 rounded-lg border" required />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <input name="precio" placeholder="Precio" type="number" value={form.precio} onChange={handleChange} className="p-2 rounded-lg border" required />
                <input name="stock" placeholder="Stock" type="number" value={form.stock} onChange={handleChange} className="p-2 rounded-lg border" required />
                <input name="minStock" placeholder="Stock mínimo" type="number" value={form.minStock} onChange={handleChange} className="p-2 rounded-lg border col-span-2 sm:col-span-1" required />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <select name="coleccion" value={form.coleccion} onChange={handleChange} className="p-2 rounded-lg border" required>
                  {COLECCIONES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="file" accept="image/png,image/jpeg" onChange={handleImage} className="p-2 rounded-lg border" />
              </div>
              {preview && <img src={preview} alt="Preview" className="w-32 h-32 object-contain rounded-xl mx-auto border" />}
              <button type="submit" className="bg-[#32e1c0] hover:bg-[#a572e1] text-white py-2.5 rounded-xl font-bold transition">
                {editingId ? "Guardar cambios" : "Agregar producto"}
              </button>
            </form>
            {mensaje && <p className="mt-3 text-emerald-600 font-semibold">{mensaje}</p>}
          </section>

          {/* Lista productos */}
          <section className="bg-white rounded-2xl border">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-bold text-[#1a4876]">Todos los productos ({allProducts.length})</h2>
              <button onClick={fetchProducts} className="text-sm px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200">Actualizar</button>
            </div>
            {loadingProducts ? (
              <p className="text-slate-500 p-5">Cargando...</p>
            ) : allProducts.length === 0 ? (
              <p className="text-slate-400 text-center py-10">Sin productos aún.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 text-left">Producto</th>
                      <th className="px-4 py-3 text-left hidden md:table-cell">Colección</th>
                      <th className="px-4 py-3 text-right">Precio</th>
                      <th className="px-4 py-3 text-center">Stock</th>
                      <th className="px-4 py-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y bg-white">
                    {allProducts.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {p.imagenUrl ? <img src={p.imagenUrl} className="w-10 h-10 rounded-lg object-cover bg-slate-100 flex-shrink-0" alt={p.nombre} /> : <div className="w-10 h-10 rounded-lg bg-slate-200 flex-shrink-0" />}
                            <span className="font-medium truncate max-w-[140px]">{p.nombre}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{p.coleccion}</td>
                        <td className="px-4 py-3 text-right font-semibold">{Number(p.precio).toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 })}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-bold ${Number(p.stock) <= Number(p.minStock) ? "text-red-500" : "text-emerald-600"}`}>{p.stock}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => startEdit(p)} className="px-3 py-1 text-xs rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium">Editar</button>
                            <button onClick={() => p._id && deleteProduct(p._id, p.nombre)} className="px-3 py-1 text-xs rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-medium">Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}

      {/* Tab: Cupones */}
      {tab === "cupones" && (
        <div className="space-y-6">
          <section className="bg-white rounded-2xl border p-6">
            <h2 className="text-lg font-bold text-[#1a4876] mb-4">🎟️ Crear cupón</h2>
            <form onSubmit={createCoupon} className="flex flex-col gap-3">
              <input name="code" placeholder="Código (ej. INVIERNO10)" value={couponForm.code} onChange={handleCouponChange} className="p-2 rounded-lg border w-full" required />
              <div className="grid grid-cols-2 gap-3">
                <select name="type" value={couponForm.type} onChange={handleCouponChange} className="p-2 rounded-lg border">
                  <option value="percentage">% Porcentaje</option>
                  <option value="fixed">$ Fijo</option>
                </select>
                <input name="value" type="number" placeholder="Valor" value={couponForm.value} onChange={handleCouponChange} className="p-2 rounded-lg border" required />
              </div>
              <select name="appliesTo" value={couponForm.appliesTo} onChange={handleCouponChange} className="p-2 rounded-lg border w-full">
                <option value="order">Pedido completo</option>
                <option value="coleccion">Colección</option>
                <option value="product">Producto(s) específico(s)</option>
              </select>
              <input name="minOrderAmount" type="number" placeholder="Mínimo de compra (opcional)" value={couponForm.minOrderAmount} onChange={handleCouponChange} className="p-2 rounded-lg border w-full" />
              {couponForm.appliesTo === "product" && (
                <input name="productIds" placeholder="IDs de producto separados por coma" value={couponForm.productIds} onChange={handleCouponChange} className="p-2 rounded-lg border w-full" />
              )}
              {couponForm.appliesTo === "coleccion" && (
                <input name="colecciones" placeholder="Colecciones (coma): Poleras, Tazas" value={couponForm.colecciones} onChange={handleCouponChange} className="p-2 rounded-lg border w-full" />
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input name="startAt" type="datetime-local" value={couponForm.startAt} onChange={handleCouponChange} className="p-2 rounded-lg border" />
                <input name="endAt" type="datetime-local" value={couponForm.endAt} onChange={handleCouponChange} className="p-2 rounded-lg border" />
              </div>
              <div className="flex items-center gap-4">
                <input name="usageLimit" type="number" placeholder="Límite de usos (opcional)" value={couponForm.usageLimit} onChange={handleCouponChange} className="p-2 rounded-lg border flex-1" />
                <label className="flex items-center gap-2 text-sm whitespace-nowrap">
                  <input type="checkbox" name="isActive" checked={couponForm.isActive} onChange={handleCouponChange} />
                  Activo
                </label>
              </div>
              <button className="bg-[#32e1c0] hover:bg-[#a572e1] text-white py-2.5 rounded-xl font-bold transition">Crear cupón</button>
            </form>
            {couponMsg && <p className="mt-3 text-emerald-600 font-semibold">{couponMsg}</p>}
          </section>

          <section className="bg-white rounded-2xl border p-6">
            <h2 className="text-lg font-bold text-[#1a4876] mb-4">🧪 Probar cupón</h2>
            <form onSubmit={testCoupon} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Código" value={test.code} onChange={(e) => setTest({ ...test, code: e.target.value })} className="p-2 rounded-lg border" required />
                <input placeholder="Monto total" type="number" value={test.amount} onChange={(e) => setTest({ ...test, amount: e.target.value })} className="p-2 rounded-lg border" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="productId (opcional)" value={test.productId} onChange={(e) => setTest({ ...test, productId: e.target.value })} className="p-2 rounded-lg border" />
                <input placeholder="Colección (opcional)" value={test.coleccion} onChange={(e) => setTest({ ...test, coleccion: e.target.value })} className="p-2 rounded-lg border" />
              </div>
              <button className="bg-slate-800 text-white py-2.5 rounded-xl font-bold transition hover:bg-slate-700">Probar</button>
            </form>
            {testResult && (
              <div className="mt-3 p-3 bg-slate-50 rounded-xl text-sm font-medium text-slate-700">{testResult}</div>
            )}
          </section>
        </div>
      )}

      {/* Tab: Órdenes */}
      {tab === "ordenes" && <OrdersSection />}
    </div>
  );
}
