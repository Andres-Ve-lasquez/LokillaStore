'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type CartItem = {
  key: string;            // productId + variantes (único)
  productId: string;
  nombre: string;
  precio: number;         // en CLP
  cantidad: number;
  imagenUrl?: string;
  talla?: string;
  color?: string;
};

type CartContextType = {
  items: CartItem[];
  count: number;                          // suma de cantidades
  subtotal: number;                       // CLP
  addItem: (item: Omit<CartItem, 'key'>) => void;
  removeItem: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;

  // Drawer
  open: boolean;
  setOpen: (v: boolean) => void;
};

const CartContext = createContext<CartContextType | null>(null);
const LS_KEY = 'cart-v1';
const FREE_SHIPPING_THRESHOLD = 60000;   // $60.000 CLP como en tu ejemplo

function moneyCLP(n: number) {
  return n.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within <CartProvider>');
  return { ...ctx, moneyCLP, FREE_SHIPPING_THRESHOLD };
}

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  // Cargar desde localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setMounted(true);
  }, []);

  // Guardar
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items, mounted]);

  const count = useMemo(() => items.reduce((a, it) => a + it.cantidad, 0), [items]);
  const subtotal = useMemo(() => items.reduce((a, it) => a + it.precio * it.cantidad, 0), [items]);

  function buildKey(p: Omit<CartItem, 'key'>) {
    return `${p.productId}__${p.talla ?? ''}__${p.color ?? ''}`;
  }

  const api: CartContextType = {
    items,
    count,
    subtotal,
    addItem: (p) => {
      const key = buildKey(p);
      setItems((prev) => {
        const idx = prev.findIndex((x) => x.key === key);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], cantidad: next[idx].cantidad + (p.cantidad || 1) };
          return next;
        }
        return [...prev, { ...p, key, cantidad: p.cantidad || 1 }];
      });
      setOpen(true); // abre drawer al agregar
    },
    removeItem: (key) => setItems((prev) => prev.filter((x) => x.key !== key)),
    setQty: (key, qty) => setItems((prev) => prev.map((x) => (x.key === key ? { ...x, cantidad: Math.max(1, qty) } : x))),
    clear: () => setItems([]),

    open,
    setOpen,
  };

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}
