"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function SuccessContent() {
  const params = useSearchParams();
  const orderNumber = params.get("order") ?? "";

  return (
    <main className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="text-6xl mb-6">🎉</div>
      <h1 className="text-3xl font-extrabold text-[#1a4876] mb-3">¡Pago exitoso!</h1>
      <p className="text-slate-600 mb-6">
        Tu pedido fue confirmado. Recibirás un correo con el detalle.
      </p>

      {orderNumber && (
        <div className="bg-[#f0fdf4] border border-emerald-200 rounded-2xl p-6 mb-8">
          <p className="text-sm text-slate-500">Número de orden</p>
          <p className="text-2xl font-bold text-[#1a4876] mt-1">{orderNumber}</p>
          <p className="text-xs text-slate-400 mt-2">Guarda este número para cualquier consulta</p>
        </div>
      )}

      <div className="space-y-3">
        {orderNumber && (
          <Link href={`/seguimiento?order=${orderNumber}`}
            className="block w-full py-3 rounded-2xl bg-[#32e1c0] text-white font-bold text-center hover:bg-[#32e1c0]/90">
            📬 Ver estado de mi pedido
          </Link>
        )}
        <Link href="/catalogo"
          className="block w-full py-3 rounded-2xl bg-[#1a4876] text-white font-bold text-center hover:bg-[#1a4876]/90">
          Seguir comprando
        </Link>
        <Link href="/inicio" className="block text-sm underline text-slate-500 text-center">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
