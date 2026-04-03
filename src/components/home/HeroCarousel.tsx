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
  intervalMs = 4000,
}: { slides: Slide[]; intervalMs?: number }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    timer.current && clearInterval(timer.current);
    timer.current = setInterval(() => {
      setIdx((i) => (i + 1) % slides.length);
    }, intervalMs);
    return () => {
      timer.current && clearInterval(timer.current);
    };
  }, [paused, slides.length, intervalMs]);

  const go = (n: number) =>
    setIdx((i) => (n + slides.length) % slides.length);

  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl shadow-xl"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      style={{ background: "linear-gradient(90deg,#32e1c0,#3bb1e6,#a572e1)" }}
    >
      {/* pista */}
      <div
        className="relative h-[260px] md:h-[360px] lg:h-[420px]"
      >
        {slides.map((s, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ${i === idx ? "opacity-100" : "opacity-0"}`}
          >
            {/* imagen */}
            <Image
              src={s.image}
              alt={s.alt || s.title || `slide-${i}`}
              fill
              className="object-cover"
              priority={i === 0}
            />
            {/* overlay para contraste */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
            {/* texto */}
            {(s.title || s.subtitle || s.cta) && (
              <div className="absolute inset-0 flex items-center px-6 md:px-12">
                <div className="max-w-xl text-white">
                  {s.subtitle && (
                    <p className="uppercase tracking-widest text-xs md:text-sm opacity-90">
                      {s.subtitle}
                    </p>
                  )}
                  {s.title && (
                    <h2 className="text-2xl md:text-4xl font-extrabold drop-shadow-sm mt-1">
                      {s.title}
                    </h2>
                  )}
                  {s.cta && (
                    <Link
                      href={s.cta.href}
                      className="inline-block mt-4 rounded-full bg-white/95 text-black font-semibold px-6 py-2 hover:bg-white"
                    >
                      {s.cta.label}
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* flechas */}
      <button
        aria-label="Anterior"
        onClick={() => go(idx - 1)}
        className="absolute left-2 top-1/2 -translate-y-1/2 grid place-items-center w-9 h-9 rounded-full bg-white/90 hover:bg-white text-black shadow"
      >
        ‹
      </button>
      <button
        aria-label="Siguiente"
        onClick={() => go(idx + 1)}
        className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center w-9 h-9 rounded-full bg-white/90 hover:bg-white text-black shadow"
      >
        ›
      </button>

      {/* dots */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`h-2 w-6 rounded-full transition ${
              i === idx ? "bg-white" : "bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Ir al slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
