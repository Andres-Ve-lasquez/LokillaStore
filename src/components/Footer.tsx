"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaInstagram, FaRecycle, FaShieldAlt, FaTiktok, FaTruck } from "react-icons/fa";

const FEATURED_COLLECTIONS = [
  { label: "Poleras", href: "/catalogo?coleccion=Poleras" },
  { label: "Relojes", href: "/catalogo?coleccion=Relojes" },
  { label: "Calcetines", href: "/catalogo?coleccion=Calcetines" },
  { label: "Billeteras", href: "/catalogo?coleccion=Billeteras" },
];

const INFO_LINKS = [
  { label: "Preguntas frecuentes", href: "/informativo#preguntas-frecuentes" },
  { label: "Tips de cuidados", href: "/informativo#cuidados" },
  { label: "Politicas de envios", href: "/informativo#envios" },
  { label: "Politicas de cambio", href: "/informativo#cambios" },
  { label: "Rastrear mi pedido", href: "/seguimiento", strong: true },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setMessage("Pronto activaremos esta lista. Si quieres ayuda ahora, escribenos por Instagram.");
    setEmail("");
  };

  return (
    <footer className="mt-16">
      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-16 block">
          <path
            fill="url(#g1)"
            d="M0,48 C240,96 480,0 720,32 C960,64 1200,16 1440,48 L1440,80 L0,80 Z"
            opacity="0.25"
          />
          <defs>
            <linearGradient id="g1" x1="0" x2="1">
              <stop offset="0%" stopColor="#32e1c0" />
              <stop offset="50%" stopColor="#3bb1e6" />
              <stop offset="100%" stopColor="#a572e1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="rounded-t-3xl bg-gradient-to-r from-[#32e1c0] via-[#3bb1e6] to-[#a572e1] text-white">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
            <div className="flex items-center gap-5">
              <div className="relative w-[180px] h-[85px] md:w-[220px] md:h-[100px]">
                <Image src="/logo.png" alt="Lookilla" fill className="object-contain drop-shadow" />
              </div>
              <p className="text-sm md:text-base/6 opacity-95 max-w-md">
                Accesorios y detallitos que encantan. Inspirados en color, fandom y buena onda.
              </p>
            </div>

            <form
              onSubmit={submit}
              className="bg-white/15 backdrop-blur rounded-2xl p-4 md:p-5 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="font-semibold">Mantente al tanto de las novedades</p>
                <span className="text-xs opacity-90">Lanzamientos y promos</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="flex-1 rounded-full px-4 py-2.5 text-black outline-none"
                />
                <button
                  type="submit"
                  className="rounded-full px-5 py-2.5 bg-white text-black font-semibold hover:bg-white/90"
                >
                  Avisarme
                </button>
              </div>
              <p className="text-xs opacity-80">
                {message || "Dejanos tu correo y te avisaremos cuando esta funcion quede habilitada."}
              </p>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white/15 backdrop-blur rounded-2xl p-4 flex items-center gap-3">
              <FaTruck size={22} />
              <div>
                <p className="font-semibold">Envios a todo Chile</p>
                <p className="text-sm opacity-90">Rapidos y con seguimiento.</p>
              </div>
            </div>
            <div className="bg-white/15 backdrop-blur rounded-2xl p-4 flex items-center gap-3">
              <FaShieldAlt size={22} />
              <div>
                <p className="font-semibold">Pagos seguros</p>
                <p className="text-sm opacity-90">Transbank / Mercado Pago.</p>
              </div>
            </div>
            <div className="bg-white/15 backdrop-blur rounded-2xl p-4 flex items-center gap-3">
              <FaRecycle size={22} />
              <div>
                <p className="font-semibold">Cambios sin drama</p>
                <p className="text-sm opacity-90">Revisa las politicas en Informativos.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-10">
            <div>
              <h4 className="text-xl font-extrabold mb-3">Colecciones</h4>
              <ul className="space-y-2 opacity-95">
                {FEATURED_COLLECTIONS.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="hover:underline">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/colecciones"
                className="inline-block mt-3 underline underline-offset-4 hover:opacity-90"
              >
                Ver todas
              </Link>
            </div>

            <div>
              <h4 className="text-xl font-extrabold mb-3">Informativos</h4>
              <ul className="space-y-2 opacity-95">
                {INFO_LINKS.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={item.strong ? "hover:underline font-semibold" : "hover:underline"}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xl font-extrabold mb-3">Contactanos</h4>
              <ul className="space-y-2 opacity-95">
                <li className="flex items-center gap-2">
                  <FaInstagram />
                  <a
                    href="https://www.instagram.com/lookilla.store/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Instagram @lookilla.store
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <FaTiktok />
                  <a
                    href="https://www.tiktok.com/@lookilla.store?lang=es-419"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    TikTok @lookilla.store
                  </a>
                </li>
                <li className="text-sm opacity-90">Horario: Lun-Vie 10:00-18:00</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-black/25 mt-4">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 py-4">
              <p className="text-sm">
                © {new Date().getFullYear()} Lookilla Store. Todos los derechos reservados.
              </p>
              <div className="flex items-center gap-4 text-sm opacity-90">
                <Link href="/informativo#terminos" className="hover:underline">
                  Terminos & Condiciones
                </Link>
                <span className="hidden md:inline">•</span>
                <Link href="/informativo#privacidad" className="hover:underline">
                  Politica de Privacidad
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
