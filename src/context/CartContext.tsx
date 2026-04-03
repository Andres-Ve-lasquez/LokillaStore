/*"use client";
import {
  createContext, useContext, useEffect, useMemo, useState, ReactNode
} from "react";

export interface CartProduct {
  _id: string;
  nombre: string;
  precio: number;
  imagenUrl?: string;
  cantidad: number;
  // opcionales si manejas variantes:
  talla?: string;
  color?: string;
}

interface CartContextType {
  cart: CartProduct[];
  count: number;
  subtotal: number;
  addToCart: (product: Omit<CartProduct, "cantidad">, qty?: number) => void;
  removeFromCart: (_id: string) => void;
  setQty: (_id: string, qty: number) => void;
  clearCart: () => void;

  // mini-carrito (drawer)
  open: boolean;
  setOpen: (v: boolean) => void;

  // helpers
  moneyCLP: (n: number) => string;
  FREE_SHIPPING_THRESHOLD: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LS_KEY = "cart-v1";
const FREE_SHIPPING_THRESHOLD = 60000;
function moneyCLP(n: number) {
  return n.toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartProduct[]>([]);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  // Cargar desde localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setCart(JSON.parse(raw));
    } catch {}
    setMounted(true);
  }, []);

  // Guardar en localStorage
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(LS_KEY, JSON.stringify(cart));
  }, [cart, mounted]);

  const count = useMemo(
    () => cart.reduce((a, p) => a + p.cantidad, 0),
    [cart]
  );
  const subtotal = useMemo(
    () => cart.reduce((a, p) => a + p.precio * p.cantidad, 0),
    [cart]
  );

  const addToCart = (product: Omit<CartProduct, "cantidad">, qty = 1) => {
    setCart((prev) => {
      // si usas variantes, considera también talla/color en la comparación
      const idx = prev.findIndex(
        (p) =>
          p._id === product._id &&
          p.talla === product.talla &&
          p.color === product.color
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], cantidad: next[idx].cantidad + qty };
        return next;
      }
      return [...prev, { ...product, cantidad: qty }];
    });
    setOpen(true); // abrir mini-carrito al agregar
  };

  const removeFromCart = (_id: string) => {
    setCart((prev) => prev.filter((p) => p._id !== _id));
  };

  const setQty = (_id: string, qty: number) => {
    setCart((prev) =>
      prev.map((p) =>
        p._id === _id ? { ...p, cantidad: Math.max(1, qty) } : p
      )
    );
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{
        cart,
        count,
        subtotal,
        addToCart,
        removeFromCart,
        setQty,
        clearCart,
        open,
        setOpen,
        moneyCLP,
        FREE_SHIPPING_THRESHOLD,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}
*/