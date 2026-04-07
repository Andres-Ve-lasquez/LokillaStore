"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import CartIcon from "@/components/cart/CartIcon";
import { FaBars, FaInstagram, FaSearch, FaTimes, FaTiktok, FaUser } from "react-icons/fa";

const NAV_LINKS = [
  { href: "/inicio",      label: "INICIO" },
  { href: "/colecciones", label: "COLECCIONES" },
  { href: "/informativo", label: "INFORMATIVOS" },
  { href: "/catalogo",    label: "VER TIENDA" },
];

const TICKER_ITEMS = [
  "✦ ENVÍO GRATIS sobre $60.000",
  "✦ Pagos seguros con WebPay y Mercado Pago",
  "✦ Cambios sin drama — 10 días",
  "✦ Síguenos en @lookilla.store",
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const [navH, setNavH] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      setNavH(navRef.current?.offsetHeight ?? 0);
    });
    if (navRef.current) ro.observe(navRef.current);
    setNavH(navRef.current?.offsetHeight ?? 0);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (window.innerWidth >= 768) setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <div ref={navRef} className="fixed left-0 right-0 top-0 z-40">
        {/* ── Ticker animado ─────────────────────────────────── */}
        <div className="overflow-hidden bg-[#1a4876] py-1.5 text-xs font-semibold text-white">
          <div className="ticker-track flex gap-16 whitespace-nowrap">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
              <span key={i}>{t}</span>
            ))}
          </div>
        </div>

        {/* ── Navbar principal ───────────────────────────────── */}
        <nav className={`bg-gradient-to-r from-[#32e1c0] via-[#3bb1e6] to-[#a572e1] transition-shadow duration-300 ${scrolled ? "shadow-xl" : "shadow-md"}`}>
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:h-[88px] md:px-6 lg:h-[96px]">

            {/* Logo */}
            <Link href="/inicio" aria-label="Inicio" className="shrink-0">
              <div className="relative h-[52px] w-[120px] drop-shadow-md transition-transform duration-200 hover:scale-105 md:h-[76px] md:w-[188px] lg:h-[84px] lg:w-[212px]">
                <Image src="/logo.png" alt="Lookilla" fill priority className="object-contain" />
              </div>
            </Link>

            {/* Links — desktop */}
            <ul className="hidden flex-1 items-center justify-center gap-1 md:flex lg:gap-2">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`relative rounded-full px-4 py-2 text-sm font-extrabold tracking-wide text-white transition-all duration-200 lg:text-base
                        ${isActive
                          ? "bg-white/25 shadow-inner"
                          : "hover:bg-white/15"
                        }`}
                    >
                      {link.label}
                      {link.href === "/catalogo" && (
                        <span className="absolute -right-1 -top-1 rounded-full bg-white px-1.5 py-px text-[8px] font-black uppercase tracking-widest text-[#a572e1]">
                          NEW
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Iconos derecha */}
            <div className="flex shrink-0 items-center gap-1 text-white md:gap-2">
              <Link href="/buscar" aria-label="Buscar" className="hidden h-9 w-9 place-items-center rounded-full transition hover:bg-white/20 md:grid">
                <FaSearch size={16} />
              </Link>
              <Link href="/usuario" aria-label="Cuenta" className="hidden h-9 w-9 place-items-center rounded-full transition hover:bg-white/20 md:grid">
                <FaUser size={16} />
              </Link>
              <a href="https://www.instagram.com/lookilla.store/" target="_blank" rel="noopener noreferrer" className="hidden h-9 w-9 place-items-center rounded-full transition hover:bg-white/20 md:grid">
                <FaInstagram size={16} />
              </a>
              <a href="https://www.tiktok.com/@lookilla.store" target="_blank" rel="noopener noreferrer" className="hidden h-9 w-9 place-items-center rounded-full transition hover:bg-white/20 md:grid">
                <FaTiktok size={16} />
              </a>
              <div className="ml-1">
                <CartIcon size={20} />
              </div>
              {/* Hamburguesa mobile */}
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="ml-1 grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/10 transition hover:bg-white/25 md:hidden"
                aria-label="Menú"
              >
                {menuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
              </button>
            </div>
          </div>

          {/* Menú mobile */}
          {menuOpen && (
            <div className="border-t border-white/20 bg-gradient-to-b from-[#3bb1e6]/90 to-[#a572e1]/90 px-4 pb-5 pt-3 backdrop-blur-sm md:hidden">
              <ul className="space-y-1 text-sm font-bold text-white">
                {[...NAV_LINKS, { href: "/seguimiento", label: "RASTREAR PEDIDO" }].map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className={`block rounded-2xl px-4 py-3 tracking-wide transition ${isActive ? "bg-white/30" : "hover:bg-white/20"}`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-4 flex gap-4 px-1 text-white">
                <a href="https://www.instagram.com/lookilla.store/" target="_blank" rel="noopener noreferrer" className="rounded-full p-2 hover:bg-white/20"><FaInstagram size={18} /></a>
                <a href="https://www.tiktok.com/@lookilla.store" target="_blank" rel="noopener noreferrer" className="rounded-full p-2 hover:bg-white/20"><FaTiktok size={18} /></a>
                <Link href="/buscar" onClick={() => setMenuOpen(false)} className="rounded-full p-2 hover:bg-white/20"><FaSearch size={18} /></Link>
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Espaciador */}
      <div style={{ height: navH }} />

      <style jsx>{`
        .ticker-track {
          animation: ticker 25s linear infinite;
          display: inline-flex;
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </>
  );
}
