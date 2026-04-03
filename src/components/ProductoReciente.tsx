"use client";
import { useEffect, useState } from "react";

interface Product {
  _id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenUrl: string;
}

export default function ProductoReciente() {
  const [productos, setProductos] = useState<Product[]>([]);
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProductos(data.slice(-4).reverse())); // últimos 4 productos
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
      {productos.map((prod) => (
        <div key={prod._id} className="bg-white rounded-2xl shadow p-4 flex flex-col items-center">
          <img src={prod.imagenUrl} alt={prod.nombre} className="w-28 h-28 object-contain rounded-xl" />
          <div className="mt-2 font-bold text-[#1a4876]">{prod.nombre}</div>
          <div className="text-[#32e1c0] font-semibold">${prod.precio}</div>
        </div>
      ))}
    </div>
  );
}
