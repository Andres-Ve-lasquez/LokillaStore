import Link from "next/link";
import { FaUser, FaSearch, FaBox } from "react-icons/fa";

export default function UsuarioPage() {
  return (
    <main className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#32e1c0] to-[#a572e1] mb-6">
        <FaUser size={32} className="text-white" />
      </div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-[#1a4876] mb-2">Mi cuenta</h1>
      <p className="text-neutral-500 mb-10">
        Lookilla Store no requiere registro. Puedes rastrear tu pedido o seguir comprando directamente.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/seguimiento"
          className="flex flex-col items-center gap-3 rounded-2xl border-2 border-[#32e1c0] p-6 hover:bg-[#32e1c0]/10 transition"
        >
          <FaBox size={28} className="text-[#32e1c0]" />
          <span className="font-semibold text-[#1a4876]">Rastrear mi pedido</span>
          <span className="text-sm text-neutral-500">Ingresa tu número de orden</span>
        </Link>

        <Link
          href="/catalogo"
          className="flex flex-col items-center gap-3 rounded-2xl border-2 border-[#3bb1e6] p-6 hover:bg-[#3bb1e6]/10 transition"
        >
          <FaSearch size={28} className="text-[#3bb1e6]" />
          <span className="font-semibold text-[#1a4876]">Ver tienda</span>
          <span className="text-sm text-neutral-500">Explorar todos los productos</span>
        </Link>
      </div>

      <div className="mt-10 rounded-2xl bg-gradient-to-r from-[#32e1c0] via-[#3bb1e6] to-[#a572e1] p-px">
        <div className="bg-white rounded-2xl p-5 text-left">
          <p className="font-semibold text-[#1a4876] mb-1">¿Necesitas ayuda?</p>
          <p className="text-sm text-neutral-600">
            Escríbenos directamente por{" "}
            <a
              href="https://www.instagram.com/lookilla.store/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#3bb1e6] font-semibold hover:underline"
            >
              Instagram @lookilla.store
            </a>{" "}
            y te respondemos a la brevedad.
          </p>
        </div>
      </div>
    </main>
  );
}
