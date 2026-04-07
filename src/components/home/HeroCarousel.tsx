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
    if (timer.current) clearInterval(timer.current);

    timer.current = setInterval(() => {
      setIdx((i) => (i + 1) % slides.length);
    }, intervalMs);

    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [intervalMs, paused, slides.length]);

  const go = (n: number) => setIdx((i) => (n + slides.length) % slides.length);

  return (
    <div
      className="relative w-full overflow-hidden rounded-[2rem] shadow-xl"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      style={{ background: "linear-gradient(90deg,#32e1c0,#3bb1e6,#a572e1)" }}
    >
      <div className="relative h-[300px] sm:h-[360px] lg:h-[420px]">
        {slides.map((s, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ${i === idx ? "opacity-100" : "opacity-0"}`}
          >
            <Image
              src={s.image}
              alt={s.alt || s.title || `slide-${i}`}
              fill
              className="object-cover"
              priority={i === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />

            {(s.title || s.subtitle || s.cta) && (
              <div className="absolute inset-0 flex items-center px-4 sm:px-8 md:px-12">
                <div className="max-w-[19rem] rounded-3xl bg-black/20 p-4 text-white backdrop-blur-[2px] sm:max-w-xl sm:p-6">
                  {s.subtitle && (
                    <p className="text-xs uppercase tracking-widest opacity-90 md:text-sm">
                      {s.subtitle}
                    </p>
                  )}
                  {s.title && (
                    <h2 className="mt-1 text-2xl font-extrabold drop-shadow-sm sm:text-3xl md:text-4xl">
                      {s.title}
                    </h2>
                  )}
                  {s.cta && (
                    <Link
                      href={s.cta.href}
                      className="mt-4 inline-block rounded-full bg-white/95 px-5 py-2.5 text-sm font-semibold text-black hover:bg-white sm:px-6 sm:text-base"
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

      <button
        aria-label="Anterior"
        onClick={() => go(idx - 1)}
        className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-black shadow hover:bg-white sm:grid"
      >
        ‹
      </button>
      <button
        aria-label="Siguiente"
        onClick={() => go(idx + 1)}
        className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-black shadow hover:bg-white sm:grid"
      >
        ›
      </button>

      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
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
