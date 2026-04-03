"use client";
import { FaShoppingCart } from "react-icons/fa";
import { useCart } from "./CartProvider";

export default function CartIcon({ size = 22 }: { size?: number }) {
  const { count, setOpen } = useCart();

  return (
    <button
      aria-label="Abrir carrito"
      onClick={() => setOpen(true)}
      className="relative text-white hover:text-[#cbb4d4] transition cursor-pointer"
    >
      {/* mismo set de íconos que usas en Navbar */}
      <FaShoppingCart size={size} />

      {count > 0 && (
        <span
          className="absolute -top-2 -right-3 min-w-5 h-5 px-1 rounded-full
                     bg-rose-600 text-white text-xs font-semibold
                     flex items-center justify-center border-2 border-white"
        >
          {count}
        </span>
      )}
    </button>
  );
}
