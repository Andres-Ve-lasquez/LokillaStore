"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

const REASONS: Record<string, string> = {
  rejected: "El pago fue rechazado por el banco. Puedes intentar con otra tarjeta.",
  cancelled: "Cancelaste el pago en WebPay. Tu carrito sigue guardado.",
  no_token: "No se recibió una respuesta válida de WebPay.",
  order_not_found: "No encontramos la orden asociada al pago.",
  server_error: "Ocurrió un error en el servidor. Contáctanos si el cargo apareció en tu tarjeta.",
  unknown: "Algo salió mal. Por favor intenta de nuevo.",
};

function ErrorContent() {
  const params = useSearchParams();
  const reason = params.get("reason") ?? "unknown";
  const message = REASONS[reason] ?? REASONS.unknown;

  return (
    <main className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="text-6xl mb-6">😕</div>
      <h1 className="text-3xl font-extrabold text-red-600 mb-3">Pago no completado</h1>
      <p className="text-slate-600 mb-8">{message}</p>

      <div className="space-y-3">
        <Link href="/carrito"
          className="block w-full py-3 rounded-2xl bg-[#1a4876] text-white font-bold hover:bg-[#1a4876]/90">
          Volver al carrito
        </Link>
        <Link href="/catalogo" className="block text-sm underline text-slate-500">
          Seguir comprando
        </Link>
      </div>
    </main>
  );
}

export default function ErrorPage() {
  return (
    <Suspense>
      <ErrorContent />
    </Suspense>
  );
}
