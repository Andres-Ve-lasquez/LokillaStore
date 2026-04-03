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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-[#1a4876]">Órdenes de Venta</h2>
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

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-xl space-y-10">
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="text-xl font-extrabold text-[#1a4876]">Panel Administrador</h1>
        <button
          onClick={async () => {
            await fetch("/api/admin/login", { method: "DELETE" });
            window.location.href = "/admin/login";
          }}
          className="text-sm px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium"
        >
          Cerrar sesión
        </button>
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#1a4876]">Alertas de Stock</h2>
          <button onClick={fetchLowStock} className="text-sm px-3 py-1 rounded bg-slate-100 hover:bg-slate-200">Actualizar</button>
        </div>
        <div className="mt-3">
          {loadingLow ? (
            <p className="text-slate-500">Cargando...</p>
          ) : lowStockCount === 0 ? (
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded">Todo OK: sin productos bajo el umbral.</div>
          ) : (
            <div>
              <div className="p-3 rounded bg-amber-50 text-amber-800 mb-3">{lowStockCount} producto(s) con stock bajo.</div>
              <div className="grid md:grid-cols-2 gap-3">
                {lowStock.map((p: any) => (
                  <div key={p._id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{p.nombre}</p>
                        <p className="text-sm text-slate-500">Colección: {p.coleccion}</p>
                        <p className="text-sm">Stock: <span className="font-bold">{p.stock}</span> / min {p.minStock}</p>
                      </div>
                      {p.imagenUrl ? (<img src={p.imagenUrl} className="w-16 h-16 object-contain rounded" alt={p.nombre} />) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section id="product-form">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#1a4876]">
            {editingId ? "Editar Producto" : "Agregar Producto"}
          </h2>
          {editingId && (
            <button onClick={resetProductForm} className="text-sm px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200">
              Cancelar edición
            </button>
          )}
        </div>
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-3">
            <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} className="p-2 rounded border" required />
            <input name="sku" placeholder="SKU (opcional)" value={form.sku || ""} onChange={handleChange} className="p-2 rounded border" />
          </div>
          <textarea name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={handleChange} className="p-2 rounded border" required />
          <div className="grid md:grid-cols-3 gap-3">
            <input name="precio" placeholder="Precio" type="number" value={form.precio} onChange={handleChange} className="p-2 rounded border" required />
            <input name="stock" placeholder="Stock" type="number" value={form.stock} onChange={handleChange} className="p-2 rounded border" required />
            <input name="minStock" placeholder="Umbral Bajo Stock" type="number" value={form.minStock} onChange={handleChange} className="p-2 rounded border" required />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <select name="coleccion" value={form.coleccion} onChange={handleChange} className="p-2 rounded border" required>
              {COLECCIONES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="file" accept="image/png,image/jpeg" onChange={handleImage} className="p-2 rounded border" />
          </div>
          {preview && <img src={preview} alt="Preview" className="w-40 h-40 object-contain rounded-lg mx-auto" />}
          <button type="submit" className="bg-[#32e1c0] hover:bg-[#a572e1] text-white py-2 rounded font-bold">
            {editingId ? "Guardar cambios" : "Agregar producto"}
          </button>
        </form>
        {mensaje && <p className="mt-3 text-[#32e1c0] font-semibold">{mensaje}</p>}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#1a4876]">Todos los Productos</h2>
          <button onClick={fetchProducts} className="text-sm px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200">Actualizar</button>
        </div>
        {loadingProducts ? (
          <p className="text-slate-500">Cargando...</p>
        ) : allProducts.length === 0 ? (
          <p className="text-slate-400 text-center py-8">Sin productos aún.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left">Producto</th>
                  <th className="px-4 py-3 text-left">Colección</th>
                  <th className="px-4 py-3 text-right">Precio</th>
                  <th className="px-4 py-3 text-center">Stock</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y bg-white">
                {allProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 flex items-center gap-3">
                      {p.imagenUrl
                        ? <img src={p.imagenUrl} className="w-10 h-10 rounded-lg object-cover bg-slate-100 flex-shrink-0" alt={p.nombre} />
                        : <div className="w-10 h-10 rounded-lg bg-slate-200 flex-shrink-0" />
                      }
                      <span className="font-medium">{p.nombre}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{p.coleccion}</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {Number(p.precio).toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-bold ${p.stock <= p.minStock ? "text-red-500" : "text-emerald-600"}`}>{p.stock}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => startEdit(p)}
                          className="px-3 py-1 text-xs rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium">
                          Editar
                        </button>
                        <button onClick={() => p._id && deleteProduct(p._id, p.nombre)}
                          className="px-3 py-1 text-xs rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-medium">
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4 text-[#1a4876]">Cupones de Descuento</h2>

        <form onSubmit={createCoupon} className="grid gap-3 md:grid-cols-2">
          <input name="code" placeholder="Código (ej. INVIERNO10)" value={couponForm.code} onChange={handleCouponChange} className="p-2 rounded border" required />
          <div className="grid grid-cols-2 gap-3">
            <select name="type" value={couponForm.type} onChange={handleCouponChange} className="p-2 rounded border">
              <option value="percentage">% Porcentaje</option>
              <option value="fixed">$ Fijo</option>
            </select>
            <input name="value" type="number" placeholder="Valor" value={couponForm.value} onChange={handleCouponChange} className="p-2 rounded border" required />
          </div>

          <select name="appliesTo" value={couponForm.appliesTo} onChange={handleCouponChange} className="p-2 rounded border">
            <option value="order">Pedido completo</option>
            <option value="coleccion">Colección</option>
            <option value="product">Producto(s) específico(s)</option>
          </select>

          <input name="minOrderAmount" type="number" placeholder="Mínimo de compra (opcional)" value={couponForm.minOrderAmount} onChange={handleCouponChange} className="p-2 rounded border" />

          {couponForm.appliesTo === "product" && (
            <input name="productIds" placeholder="IDs de producto separados por coma" value={couponForm.productIds} onChange={handleCouponChange} className="p-2 rounded border col-span-2" />
          )}
          {couponForm.appliesTo === "coleccion" && (
            <input name="colecciones" placeholder="Colecciones (coma): Poleras, Tazas" value={couponForm.colecciones} onChange={handleCouponChange} className="p-2 rounded border col-span-2" />
          )}

          <div className="grid grid-cols-2 gap-3">
            <input name="startAt" type="datetime-local" value={couponForm.startAt} onChange={handleCouponChange} className="p-2 rounded border" />
            <input name="endAt" type="datetime-local" value={couponForm.endAt} onChange={handleCouponChange} className="p-2 rounded border" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input name="usageLimit" type="number" placeholder="Límite de usos (opcional)" value={couponForm.usageLimit} onChange={handleCouponChange} className="p-2 rounded border" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isActive" checked={couponForm.isActive} onChange={handleCouponChange} />
              Activo
            </label>
          </div>

          <button className="bg-[#32e1c0] hover:bg-[#a572e1] text-white py-2 rounded font-bold col-span-2">Crear cupón</button>
        </form>

        {couponMsg && <p className="mt-3 text-[#32e1c0] font-semibold">{couponMsg}</p>}

        <div className="mt-6">
          <h3 className="font-semibold mb-2">Probar cupón</h3>
          <form onSubmit={testCoupon} className="grid md:grid-cols-4 gap-3">
            <input placeholder="Código" value={test.code} onChange={(e) => setTest({ ...test, code: e.target.value })} className="p-2 rounded border" required />
            <input placeholder="Monto (producto o pedido)" type="number" value={test.amount} onChange={(e) => setTest({ ...test, amount: e.target.value })} className="p-2 rounded border" required />
            <input placeholder="productId (opcional)" value={test.productId} onChange={(e) => setTest({ ...test, productId: e.target.value })} className="p-2 rounded border" />
            <input placeholder="colección (opcional)" value={test.coleccion} onChange={(e) => setTest({ ...test, coleccion: e.target.value })} className="p-2 rounded border" />
            <button className="bg-slate-800 text-white py-2 rounded font-bold md:col-span-4">Probar</button>
          </form>
          {testResult && <p className="mt-3 text-slate-700">{testResult}</p>}
        </div>
      </section>

      <OrdersSection />
    </div>
  );
}
