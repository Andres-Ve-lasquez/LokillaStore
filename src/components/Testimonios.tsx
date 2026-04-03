export default function Testimonios() {
  return (
    <div className="flex gap-4 flex-wrap">
      <div className="bg-white p-4 rounded-2xl shadow text-[#3bb1e6] max-w-xs">
        ⭐⭐⭐⭐⭐<br />
        “Me encantó la calidad de las poleras. ¡Súper recomendado!”<br />
        <span className="text-[#a572e1] font-bold">– Cliente 1</span>
      </div>
      <div className="bg-white p-4 rounded-2xl shadow text-[#32e1c0] max-w-xs">
        ⭐⭐⭐⭐⭐<br />
        “Mi cortavientos llegó rápido y el diseño es único.”<br />
        <span className="text-[#1a4876] font-bold">– Cliente 2</span>
      </div>
      {/* Puedes agregar más testimonios aquí */}
    </div>
  );
}
