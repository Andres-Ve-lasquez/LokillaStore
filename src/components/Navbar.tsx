"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import CartIcon from "@/components/cart/CartIcon";
import { FaBars, FaInstagram, FaSearch, FaTimes, FaTiktok, FaUser } from "react-icons/fa";

const EXTRA_GAP = 12;

const NAV_LINKS = [
  { href: "/inicio",       label: "Inicio",       emoji: "🏠" },
  { href: "/colecciones",  label: "Colecciones",  emoji: "✨" },
  { href: "/informativo",  label: "Informativos", emoji: "📋" },
  { href: "/catalogo",     label: "Ver Tienda",   emoji: "🛍️", badge: "NUEVO" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [compact, setCompact] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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

    const handleResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
      measure();
    };

    measure();

    const ro = new ResizeObserver(measure);
    if (navRef.current) ro.observe(navRef.current);

    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="w-full">
      <div ref={topBarRef} className="hidden bg-white md:block">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between py-2 text-sm font-semibold text-black">
            <div />
            <a
              href="https://www.instagram.com/lookilla.store/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:underline"
            >
              Necesitas ayuda? <span className="font-bold">Hablemos por Instagram</span>
            </a>
            <div className="flex items-center gap-4">
              <a
                href="https://www.instagram.com/lookilla.store/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="hover:opacity-80"
              >
                <FaInstagram size={18} />
              </a>
              <a
                href="https://www.tiktok.com/@lookilla.store?lang=es-419"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="hover:opacity-80"
              >
                <FaTiktok size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed left-0 right-0 z-40" style={{ top: offsetTop }}>
        <nav
          ref={navRef}
          className={`rounded-b-[2rem] bg-gradient-to-r from-[#32e1c0] via-[#3bb1e6] to-[#a572e1] shadow-lg transition-all duration-300 ${compact ? "shadow-xl" : ""}`}
        >
          <div
            className={`mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 md:px-6 ${compact ? "py-2.5" : "py-3 md:py-4"}`}
          >
            <Link href="/inicio" aria-label="Ir al inicio" className="shrink-0">
              <div
                className={`relative logo-float transition-all duration-300 drop-shadow-lg ${
                  compact
                    ? "h-[60px] w-[134px] sm:h-[70px] sm:w-[158px] md:h-[110px] md:w-[248px]"
                    : "h-[72px] w-[162px] sm:h-[82px] sm:w-[184px] md:h-[148px] md:w-[332px]"
                }`}
              >
                <Image src="/logo.png" alt="Lookilla" fill priority className="object-contain" />
              </div>
            </Link>

            <ul className="hidden flex-1 items-center justify-center gap-2 text-sm font-bold text-white md:flex lg:gap-3 lg:text-[13px]">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`group relative flex items-center gap-1.5 rounded-full px-4 py-2 transition-all duration-200
                        ${isActive
                          ? "bg-white/25 text-white shadow-inner"
                          : "hover:bg-white/15 hover:text-white"
                        }`}
                    >
                      <span className="text-base leading-none">{link.emoji}</span>
                      <span>{link.label}</span>
                      {link.badge && (
                        <span className="ml-1 rounded-full bg-white px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-[#a572e1]">
                          {link.badge}
                        </span>
                      )}
                      {isActive && (
                        <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-white" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="flex shrink-0 items-center gap-3 text-xl text-white sm:gap-4 md:gap-5 md:text-2xl">
              <Link
                href="/buscar"
                aria-label="Buscar"
                className="hidden rounded-full p-2 transition hover:bg-white/10 md:grid md:place-items-center"
              >
                <FaSearch className="cursor-pointer transition hover:text-[#cbb4d4]" />
              </Link>
              <Link
                href="/usuario"
                aria-label="Usuario"
                className="hidden rounded-full p-2 transition hover:bg-white/10 md:grid md:place-items-center"
              >
                <FaUser className="cursor-pointer transition hover:text-[#cbb4d4]" />
              </Link>
              <CartIcon size={compact ? 20 : 22} />
              <button
                onClick={() => setMenuOpen((value) => !value)}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 md:hidden"
                aria-label="Menu"
              >
                {menuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
              </button>
            </div>
          </div>

          {menuOpen && (
            <div className="border-t border-white/20 px-4 pb-4 pt-3 md:hidden">
              <ul className="grid gap-2 text-base font-semibold text-white">
                {[...NAV_LINKS, { href: "/seguimiento", label: "Rastrear pedido", emoji: "📦", badge: undefined }].map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-2 rounded-2xl px-4 py-3 transition ${isActive ? "bg-white/30 font-bold" : "hover:bg-white/20"}`}
                      >
                        <span>{link.emoji}</span>
                        <span>{link.label}</span>
                        {link.badge && (
                          <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[9px] font-extrabold uppercase text-[#a572e1]">
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
                <li className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/buscar"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-2xl bg-white/10 px-4 py-3 text-center transition hover:bg-white/20"
                  >
                    Buscar
                  </Link>
                  <Link
                    href="/usuario"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-2xl bg-white/10 px-4 py-3 text-center transition hover:bg-white/20"
                  >
                    Mi cuenta
                  </Link>
                </li>
              </ul>

              <div className="mt-4 flex items-center gap-4 px-1 text-white/90">
                <a
                  href="https://www.instagram.com/lookilla.store/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="rounded-full p-2 transition hover:bg-white/10"
                >
                  <FaInstagram size={18} />
                </a>
                <a
                  href="https://www.tiktok.com/@lookilla.store?lang=es-419"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="rounded-full p-2 transition hover:bg-white/10"
                >
                  <FaTiktok size={18} />
                </a>
              </div>
            </div>
          )}
        </nav>
      </div>

      <div style={{ height: navH + EXTRA_GAP }} />

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        .logo-float {
          animation: float 5s ease-in-out infinite;
          will-change: transform;
        }
      `}</style>
    </header>
  );
}
