const CATEGORIAS = [
  { nombre: "Poleras", img: "/1.png" },
  { nombre: "Relojes", img: "/1.png" },
  { nombre: "Calcetines", img: "/1.png" },
  { nombre: "Billeteras", img: "/1.png" },
  { nombre: "Zapatillas", img: "/1.png" },
  { nombre: "Cortavientos", img: "/1.png" },
  { nombre: "Totebag", img: "/1.png" },
  { nombre: "Tazas", img: "/1.png" },
];

export default function ColeccionesPage() {
  return (
    <main className="max-w-7xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center text-[#32e1c0] mb-10">Colecciones</h1>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
        {CATEGORIAS.map((cat) => (
          <div key={cat.nombre} className="bg-white rounded-2xl shadow p-4 flex flex-col items-center">
            <img src={cat.img} alt={cat.nombre} className="w-24 h-24 object-contain mb-2" />
            <div className="font-semibold text-[#1a4876]">{cat.nombre}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
