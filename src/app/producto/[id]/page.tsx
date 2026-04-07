"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { findProductVariant, normalizeProductVariants } from "@/lib/productVariants";

type Product = {
  _id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenUrl: string;
  stock: number;
  coleccion: string;
  sku?: string;
  tags?: string[];
  variants?: unknown[];
};

function moneyCLP(n: number) {
  return n.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
}

export default function ProductoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addItem, setOpen } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedTalla, setSelectedTalla] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setProduct(j.product);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const variants = useMemo(() => normalizeProductVariants(product?.variants), [product?.variants]);
  const tallaOptions = useMemo(
    () => Array.from(new Set(variants.map((variant) => variant.talla).filter(Boolean))),
    [variants]
  );
  const colorOptions = useMemo(
    () => Array.from(new Set(variants.map((variant) => variant.color).filter(Boolean))),
    [variants]
  );

  useEffect(() => {
    if (!variants.length) {
      setSelectedTalla("");
      setSelectedColor("");
      return;
    }

    const firstAvailable = variants.find((variant) => variant.stock > 0) ?? variants[0];
    setSelectedTalla(firstAvailable.talla);
    setSelectedColor(firstAvailable.color);
  }, [product?._id, variants]);

  useEffect(() => {
    if (!variants.length) return;

    const exists = variants.some(
      (variant) => variant.talla === selectedTalla && variant.color === selectedColor
    );
    if (exists) return;

    const fallback =
      variants.find((variant) => {
        if (selectedTalla && variant.talla !== selectedTalla) return false;
        if (selectedColor && variant.color !== selectedColor) return false;
        return variant.stock > 0;
      }) ??
      variants.find((variant) => {
        if (selectedTalla && variant.talla !== selectedTalla) return false;
        return variant.stock > 0;
      }) ??
      variants.find((variant) => {
        if (selectedColor && variant.color !== selectedColor) return false;
        return variant.stock > 0;
      }) ??
      variants.find((variant) => variant.stock > 0) ??
      variants[0];

    setSelectedTalla(fallback.talla);
    setSelectedColor(fallback.color);
  }, [colorOptions.length, selectedColor, selectedTalla, tallaOptions.length, variants]);

  const selectedVariant = useMemo(
    () => (variants.length ? findProductVariant(variants, { talla: selectedTalla, color: selectedColor }) : null),
    [colorOptions.length, selectedColor, selectedTalla, tallaOptions.length, variants]
  );

  const effectiveStock = selectedVariant?.stock ?? product?.stock ?? 0;

  useEffect(() => {
    if (effectiveStock < qty) {
      setQty(Math.max(1, effectiveStock));
    }
  }, [effectiveStock, qty]);

  const hasTallas = tallaOptions.length > 0;
  const hasColors = colorOptions.length > 0;
  const usesVariants = variants.length > 0;
  const agotado = usesVariants ? !selectedVariant || selectedVariant.stock === 0 : (product?.stock ?? 0) === 0;
  const stockBajo = !agotado && effectiveStock <= 5;

  const isTallaEnabled = (talla: string) =>
    variants.some((variant) => {
      if (variant.talla !== talla) return false;
      if (hasColors && selectedColor && variant.color !== selectedColor) return false;
      return variant.stock > 0;
    });

  const isColorEnabled = (color: string) =>
    variants.some((variant) => {
      if (variant.color !== color) return false;
      if (hasTallas && selectedTalla && variant.talla !== selectedTalla) return false;
      return variant.stock > 0;
    });

  const pushItemToCart = () => {
    if (!product || agotado) return false;

    addItem({
      productId: product._id,
      nombre: product.nombre,
      precio: product.precio,
      imagenUrl: product.imagenUrl,
      cantidad: qty,
      talla: selectedVariant?.talla || undefined,
      color: selectedVariant?.color || undefined,
    });

    setAdded(true);
    setOpen(true);
    setTimeout(() => setAdded(false), 2000);
    return true;
  };

  const handleAdd = () => {
    pushItemToCart();
  };

  const handleBuyNow = () => {
    if (pushItemToCart()) {
      router.push("/checkout");
      return;
    }

    router.push("/checkout");
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10 md:py-12">
        <div className="grid animate-pulse gap-8 md:grid-cols-2 md:gap-10">
          <div className="aspect-square rounded-3xl bg-slate-200" />
          <div className="space-y-4 pt-4">
            <div className="h-4 w-1/3 rounded bg-slate-200" />
            <div className="h-8 w-2/3 rounded bg-slate-200" />
            <div className="h-6 w-1/4 rounded bg-slate-200" />
            <div className="h-24 rounded bg-slate-200" />
            <div className="h-12 rounded-full bg-slate-200" />
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="text-xl font-semibold text-slate-600">Producto no encontrado.</p>
        <Link href="/catalogo" className="mt-4 inline-block text-[#3bb1e6] underline">
          Volver al catalogo
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:py-10">
      <nav className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-400 md:mb-8">
        <Link href="/inicio" className="hover:text-[#3bb1e6]">Inicio</Link>
        <span>/</span>
        <Link href="/catalogo" className="hover:text-[#3bb1e6]">Catalogo</Link>
        <span>/</span>
        <span className="min-w-0 truncate text-slate-600">{product.nombre}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        <div className="rounded-3xl bg-gradient-to-tr from-[#32e1c0] via-[#3bb1e6] to-[#a572e1] p-[3px]">
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-3xl bg-white p-4 sm:p-6">
            {product.imagenUrl ? (
              <img src={product.imagenUrl} alt={product.nombre} className="h-full w-full object-contain" />
            ) : (
              <div className="text-sm text-slate-300">Sin imagen</div>
            )}
          </div>
        </div>

        <div className="flex flex-col justify-center space-y-4 md:space-y-5">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#3bb1e6]">
            {product.coleccion}
          </span>

          <h1 className="text-2xl font-extrabold leading-tight text-[#1a4876] sm:text-3xl md:text-4xl">
            {product.nombre}
          </h1>

          <p className="text-2xl font-bold text-[#19243b] sm:text-3xl">
            {moneyCLP(product.precio)}
          </p>

          {agotado ? (
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600">
              Agotado
            </span>
          ) : stockBajo ? (
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700">
              Ultimas {effectiveStock} unidades
            </span>
          ) : (
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">
              En stock
            </span>
          )}

          <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
            {product.descripcion}
          </p>

          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {usesVariants && (
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white/70 p-4">
              {hasTallas && (
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-700">Talla</p>
                  <div className="flex flex-wrap gap-2">
                    {tallaOptions.map((talla) => {
                      const enabled = isTallaEnabled(talla);
                      const selected = selectedTalla === talla;
                      return (
                        <button
                          key={talla}
                          type="button"
                          disabled={!enabled}
                          onClick={() => setSelectedTalla(talla)}
                          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                            selected
                              ? "border-[#1a4876] bg-[#1a4876] text-white"
                              : enabled
                                ? "border-slate-200 bg-white text-slate-700 hover:border-[#3bb1e6]"
                                : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-300"
                          }`}
                        >
                          {talla}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {hasColors && (
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-700">Color</p>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((color) => {
                      const enabled = isColorEnabled(color);
                      const selected = selectedColor === color;
                      return (
                        <button
                          key={color}
                          type="button"
                          disabled={!enabled}
                          onClick={() => setSelectedColor(color)}
                          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                            selected
                              ? "border-[#1a4876] bg-[#1a4876] text-white"
                              : enabled
                                ? "border-slate-200 bg-white text-slate-700 hover:border-[#3bb1e6]"
                                : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-300"
                          }`}
                        >
                          {color}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedVariant && (
                <p className="text-xs text-slate-500">
                  Stock disponible para esta variante: <span className="font-semibold text-slate-700">{selectedVariant.stock}</span>
                  {selectedVariant.sku ? ` · SKU ${selectedVariant.sku}` : ""}
                </p>
              )}
            </div>
          )}

          {!agotado && (
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:gap-4">
              <div className="inline-flex w-fit items-center overflow-hidden rounded-full border-2 border-slate-200">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-4 py-2 text-lg transition hover:bg-slate-100"
                >
                  -
                </button>
                <span className="min-w-[2.5rem] px-4 py-2 text-center font-semibold">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(effectiveStock, q + 1))}
                  className="px-4 py-2 text-lg transition hover:bg-slate-100"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAdd}
                className={`w-full flex-1 rounded-full py-3 font-bold text-white transition ${
                  added ? "bg-emerald-500" : "bg-[#32e1c0] hover:bg-[#a572e1]"
                }`}
              >
                {added ? "Agregado" : "Agregar al carrito"}
              </button>
            </div>
          )}

          {agotado && (
            <button disabled className="w-full rounded-full border-2 border-[#a572e1] py-3 font-bold text-[#a572e1] opacity-60">
              Agotado
            </button>
          )}

          <button
            onClick={handleBuyNow}
            className="w-full rounded-full border-2 border-[#1a4876] py-3 font-bold text-[#1a4876] transition hover:bg-[#1a4876] hover:text-white"
          >
            Comprar ahora
          </button>

          {(selectedVariant?.sku || product.sku) && (
            <p className="text-xs text-slate-400">SKU: {selectedVariant?.sku || product.sku}</p>
          )}
        </div>
      </div>

      <div className="mt-10 border-t pt-6 md:mt-12">
        <Link href="/catalogo" className="text-sm text-[#3bb1e6] hover:underline">
          ← Volver al catalogo
        </Link>
      </div>
    </main>
  );
}
