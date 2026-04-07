"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CartIcon from "@/components/cart/CartIcon";
import { FaBars, FaInstagram, FaSearch, FaTimes, FaTiktok, FaUser } from "react-icons/fa";

const EXTRA_GAP = 12;

const NAV_LINKS = [
  { href: "/inicio", label: "INICIO" },
  { href: "/colecciones", label: "COLECCIONES" },
  { href: "/informativo", label: "INFORMATIVOS" },
  { href: "/catalogo", label: "VER TIENDA" },
];

export default function Navbar() {
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
                className={`relative logo-float transition-all duration-300 ${
                  compact
                    ? "h-[56px] w-[124px] sm:h-[64px] sm:w-[144px] md:h-[100px] md:w-[225px]"
                    : "h-[64px] w-[148px] sm:h-[72px] sm:w-[168px] md:h-[132px] md:w-[300px]"
                }`}
              >
                <Image src="/logo.png" alt="Lookilla" fill priority className="object-contain" />
              </div>
            </Link>

            <ul className="hidden flex-1 items-center justify-center gap-6 text-sm font-semibold text-white md:flex lg:gap-10 lg:text-base">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition hover:text-[#cbb4d4]">
                    {link.label}
                  </Link>
                </li>
              ))}
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
                {[...NAV_LINKS, { href: "/seguimiento", label: "RASTREAR PEDIDO" }].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-2xl px-4 py-3 transition hover:bg-white/20"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
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
