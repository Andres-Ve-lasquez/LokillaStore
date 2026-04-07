"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function MpSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const status = searchParams.get("status") ?? "approved";
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/orders/${orderId}`)
      .then((r) => r.json())
      .then((j) => {
        if (j?.order?.orderNumber) setOrderNumber(j.order.orderNumber);
      })
      .catch(() => {});
  }, [orderId]);

  const isPending = status === "pending";

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center bg-white rounded-3xl shadow-xl p-8 md:p-10">
        <div className="text-6xl mb-4">{isPending ? "⏳" : "🎉"}</div>
        <h1 className="text-2xl font-extrabold text-[#1a4876] mb-2">
          {isPending ? "Pago en proceso" : "¡Pago exitoso!"}
        </h1>
        <p className="text-neutral-500 mb-6">
          {isPending
            ? "Tu pago está siendo procesado. Te avisaremos por email cuando se confirme."
            : "Tu compra fue confirmada. Te enviamos un email con los detalles."}
        </p>

        {orderNumber && (
          <div className="bg-[#f6f9ff] rounded-2xl p-4 mb-6">
            <p className="text-sm text-neutral-500">Número de orden</p>
            <p className="text-2xl font-extrabold text-[#1a4876] font-mono">{orderNumber}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {orderNumber && (
            <Link
              href={`/seguimiento?order=${orderNumber}`}
              className="w-full rounded-full py-3 bg-gradient-to-r from-[#32e1c0] to-[#a572e1] text-white font-bold text-center"
            >
              Ver estado de mi pedido
            </Link>
          )}
          <Link href="/catalogo" className="w-full rounded-full py-3 border-2 border-[#3bb1e6] text-[#3bb1e6] font-semibold text-center">
            Seguir comprando
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function MpSuccessPage() {
  return (
    <Suspense fallback={null}>
      <MpSuccessContent />
    </Suspense>
  );
}
