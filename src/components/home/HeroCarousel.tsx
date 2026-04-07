"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Slide = {
  image: string;
  alt?: string;
  title?: string;
  subtitle?: string;
  cta?: { label: string; href: string };
};

export default function HeroCarousel({
  slides,
  intervalMs = 5000,
}: { slides: Slide[]; intervalMs?: number }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => setIdx((i) => (i + 1) % slides.length), intervalMs);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [intervalMs, paused, slides.length]);

  const go = (n: number) => setIdx((i) => (n + slides.length) % slides.length);

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: "clamp(320px, 55vw, 620px)" }}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      {slides.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ${i === idx ? "opacity-100" : "opacity-0"}`}
        >
          {/* Imagen de fondo */}
          <Image
            src={s.image}
            alt={s.alt || s.title || `slide-${i}`}
            fill
            className="object-cover"
            priority={i === 0}
          />

          {/* Gradiente oscuro izquierda→derecha */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
          {/* Gradiente oscuro abajo */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Contenido */}
          {(s.title || s.subtitle || s.cta) && (
            <div className="absolute inset-0 flex items-center px-6 sm:px-10 md:px-16 lg:px-20">
              <div className="max-w-lg text-white">
                {s.subtitle && (
                  <p className="mb-3 inline-block rounded-full border border-white/40 bg-white/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] backdrop-blur-sm">
                    {s.subtitle}
                  </p>
                )}
                {s.title && (
                  <h2 className="text-4xl font-black leading-tight drop-shadow-lg sm:text-5xl md:text-6xl">
                    {s.title}
                  </h2>
                )}
                {s.cta && (
                  <Link
                    href={s.cta.href}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#32e1c0] to-[#a572e1] px-7 py-3 text-base font-extrabold text-white shadow-lg transition hover:scale-105 hover:shadow-xl sm:text-lg"
                  >
                    {s.cta.label}
                    <span className="text-xl">→</span>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Flechas */}
      <button
        aria-label="Anterior"
        onClick={() => go(idx - 1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full bg-black/30 text-2xl text-white backdrop-blur-sm transition hover:bg-black/50"
      >
        ‹
      </button>
      <button
        aria-label="Siguiente"
        onClick={() => go(idx + 1)}
        className="absolute right-4 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full bg-black/30 text-2xl text-white backdrop-blur-sm transition hover:bg-black/50"
      >
        ›
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`rounded-full transition-all duration-300 ${i === idx ? "h-2 w-8 bg-white" : "h-2 w-2 bg-white/50 hover:bg-white/80"}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
