"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CartIcon from "@/components/cart/CartIcon";
import { FaInstagram, FaTiktok, FaSearch, FaUser, FaBars, FaTimes } from "react-icons/fa";

const EXTRA_GAP = 12; // px de respiración bajo el nav fijo

export default function Navbar() {
  const [compact, setCompact] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Refs para medir alturas y calcular offset
  const topBarRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);
  const [offsetTop, setOffsetTop] = useState(0);
  const [navH, setNavH] = useState(0);

  useEffect(() => {
    const measure = () => {
      const hTop = topBarRef.current?.offsetHeight ?? 0;
      const hNav = navRef.current?.offsetHeight ?? 0;
      setNavH(hNav);
      setOffsetTop(Math.max(0, hTop - window.scrollY));
      setCompact(window.scrollY > 10);
    };

    measure();

    // Observa cambios de tamaño del nav (responsive / compacto)
    const ro = new ResizeObserver(measure);
    if (navRef.current) ro.observe(navRef.current);

    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <header className="w-full">
      {/* === Franja superior (NO fija) === */}
      <div ref={topBarRef} className="bg-white rounded-t-2xl">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-3 items-center py-2 text-black text-sm font-semibold">
            {/* Izquierda vacía para centrar el mensaje */}
            <div className="hidden md:block" />
            {/* Centro: mensaje centrado y link a IG */}
            <div className="flex items-center justify-center gap-2 text-center">
              <span className="text-xl">←</span>
              <a
                href="https://www.instagram.com/lookilla.store/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                <span role="img" aria-label="soporte" className="mr-1">🎧</span>
                ¿Necesitas ayuda? <span className="font-bold">Toca aquí y hablemos por Instagram.</span>
              </a>
              <span className="text-xl">→</span>
            </div>
            {/* Derecha: redes */}
            <div className="flex justify-end items-center gap-4">
              <a
                href="https://www.instagram.com/lookilla.store/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Lookilla"
                className="hover:opacity-80"
              >
                <FaInstagram size={20} />
              </a>
              <a
                href="https://www.tiktok.com/@lookilla.store?lang=es-419"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok Lookilla"
                className="hover:opacity-80"
              >
                <FaTiktok size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* === NAV degradado (FIJO SIEMPRE) === */}
      <div className="fixed left-0 right-0 z-40" style={{ top: offsetTop }}>
        <nav
          ref={navRef}
          className={`bg-gradient-to-r from-[#32e1c0] via-[#3bb1e6] to-[#a572e1]
                      rounded-b-3xl shadow-lg transition-all duration-300
                      ${compact ? "shadow-xl" : ""}`}
        >
          <div
            className={`max-w-7xl mx-auto px-4 flex items-center justify-between
                        ${compact ? "py-2" : "py-4"}`}
          >
            {/* Logo (flotante, cambia tamaño en modo compacto) */}
            <Link href="/inicio" aria-label="Ir al inicio" className="shrink-0">
              <div
                className={`relative logo-float transition-all duration-300
                           ${compact
                             ? "w-[200px] h-[90px] md:w-[240px] md:h-[108px]"
                             : "w-[300px] h-[130px] md:w-[340px] md:h-[150px]"}`}
              >
                <Image
                  src="/logo.png"
                  alt="Lookilla"
                  fill
                  priority
                  className="object-contain"
                />
              </div>
            </Link>

            {/* Menú centrado — solo desktop */}
            <ul className="hidden md:flex flex-1 justify-center gap-8 md:gap-12 text-white font-semibold text-base md:text-lg">
              <li><Link href="/inicio" className="hover:text-[#cbb4d4] transition">INICIO</Link></li>
              <li><Link href="/colecciones" className="hover:text-[#cbb4d4] transition">COLECCIONES</Link></li>
              <li><Link href="/informativo" className="hover:text-[#cbb4d4] transition">INFORMATIVOS</Link></li>
              <li><Link href="/catalogo" className="hover:text-[#cbb4d4] transition">VER TIENDA</Link></li>
            </ul>

            {/* Iconos derecha */}
            <div className="flex gap-4 md:gap-6 items-center text-white text-2xl">
              <Link href="/buscar" aria-label="Buscar" className="hidden md:block">
                <FaSearch className="hover:text-[#cbb4d4] transition cursor-pointer" />
              </Link>
              <Link href="/usuario" aria-label="Usuario" className="hidden md:block">
                <FaUser className="hover:text-[#cbb4d4] transition cursor-pointer" />
              </Link>
              <CartIcon />
              {/* Hamburguesa — solo mobile */}
              <button onClick={() => setMenuOpen((v) => !v)} className="md:hidden text-white" aria-label="Menú">
                {menuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
              </button>
            </div>
          </div>
          {/* Menú mobile desplegable */}
          {menuOpen && (
            <div className="md:hidden border-t border-white/20 px-4 pb-4 pt-2">
              <ul className="flex flex-col gap-1 text-white font-semibold text-lg">
                {[
                  { href: "/inicio", label: "Inicio" },
                  { href: "/colecciones", label: "Colecciones" },
                  { href: "/catalogo", label: "Ver tienda" },
                  { href: "/informativo", label: "Informativos" },
                  { href: "/seguimiento", label: "📬 Rastrear pedido" },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} onClick={() => setMenuOpen(false)}
                      className="block py-2.5 px-3 rounded-xl hover:bg-white/20 transition">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>
      </div>

      {/* Spacer: evita que el nav fijo tape el contenido */}
      <div style={{ height: navH + EXTRA_GAP }} />

      {/* Animación del logo (suave) */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) }
          50% { transform: translateY(-4px) }
        }
        .logo-float {
          animation: float 5s ease-in-out infinite;
          will-change: transform;
        }
      `}</style>
    </header>
  );
}
