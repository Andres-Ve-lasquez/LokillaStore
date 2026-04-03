"use client";
import { useState } from "react";

const IMAGES = [
  "/foto1.jpg", // Cambia estos nombres por los de tus imágenes reales
  "/foto2.jpg",
  "/foto3.jpg",
];

export default function Carrusel() {
  const [index, setIndex] = useState(0);

  return (
    <div className="w-full h-64 md:h-80 rounded-3xl overflow-hidden shadow-lg relative bg-[#e7f6f9] flex justify-center items-center">
      <img src={IMAGES[index]} alt="" className="w-full h-full object-cover" />
      <button
        onClick={() => setIndex((prev) => (prev - 1 + IMAGES.length) % IMAGES.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/60 rounded-full p-2"
      >{"<"}</button>
      <button
        onClick={() => setIndex((prev) => (prev + 1) % IMAGES.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/60 rounded-full p-2"
      >{">"}</button>
    </div>
  );
}
