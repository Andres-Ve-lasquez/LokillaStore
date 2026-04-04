import Link from "next/link";

const quickLinks = [
  { href: "#preguntas-frecuentes", label: "Preguntas frecuentes" },
  { href: "#envios", label: "Envios" },
  { href: "#cambios", label: "Cambios" },
  { href: "#cuidados", label: "Cuidados" },
  { href: "#terminos", label: "Terminos" },
  { href: "#privacidad", label: "Privacidad" },
];

const faqItems = [
  {
    question: "Cuanto demora mi pedido?",
    answer:
      "Preparamos cada pedido con cuidado. El tiempo exacto puede variar segun la coleccion y la demanda del momento, pero siempre podras seguir el avance con tu numero de orden.",
  },
  {
    question: "Como rastreo mi compra?",
    answer:
      "Apenas tu compra este registrada, podras revisar su avance desde la seccion de seguimiento usando tu numero de orden.",
  },
  {
    question: "Que medios de pago aceptan?",
    answer:
      "Los pagos online se procesan con WebPay de Transbank. Cuando el pago es aprobado, recibiras una confirmacion por correo.",
  },
  {
    question: "Puedo pedir ayuda antes de comprar?",
    answer:
      "Si. Si tienes dudas sobre stock, envios o ideas de regalo, puedes escribirnos por Instagram y te orientamos antes de cerrar la compra.",
  },
];

const shippingPoints = [
  "Realizamos envios dentro de Chile.",
  "El costo de envio se calcula automaticamente y aparece en tu resumen de compra.",
  "Las compras sobre el monto informado en el carrito pueden acceder a envio gratis.",
  "Cuando tu pedido avance de estado, podras seguirlo desde la pagina de seguimiento.",
];

const exchangePoints = [
  "Si tu producto llega con un problema o necesitas gestionar un cambio, contactanos apenas lo recibas.",
  "El producto debe mantenerse en buen estado, sin uso indebido y con sus accesorios o empaque si corresponde.",
  "Las solicitudes se revisan caso a caso para darte la solucion mas justa y rapida posible.",
];

const carePoints = [
  "Guarda tus accesorios en un lugar seco y limpio.",
  "Evita el contacto directo con agua, perfumes o superficies abrasivas.",
  "Si el producto incluye detalles delicados, manipularlo con cuidado ayudara a que se mantenga bonito por mas tiempo.",
];

export default function InformativoPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-10 md:py-14">
      <section className="rounded-[2rem] overflow-hidden bg-gradient-to-r from-[#32e1c0] via-[#3bb1e6] to-[#a572e1] text-white shadow-lg">
        <div className="px-6 py-10 md:px-10 md:py-14">
          <p className="text-sm uppercase tracking-[0.35em] opacity-85">Lookilla Store</p>
          <h1 className="mt-3 text-3xl md:text-5xl font-extrabold max-w-3xl leading-tight">
            Todo lo importante de tu compra, en un solo lugar.
          </h1>
          <p className="mt-4 max-w-2xl text-sm md:text-base opacity-95">
            Aqui encontraras respuestas rapidas sobre pedidos, envios, cambios, cuidados y el tratamiento de tus datos.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {quickLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full bg-white/18 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white/25 transition"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3 mt-8">
        <div className="rounded-3xl bg-white border p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#3bb1e6]">Seguimiento</p>
          <p className="mt-2 text-xl font-bold text-[#1a4876]">Revisa tu pedido cuando quieras</p>
          <p className="mt-2 text-sm text-slate-600">
            Usa tu numero de orden para conocer el estado de tu compra en cualquier momento.
          </p>
          <Link href="/seguimiento" className="inline-block mt-4 text-sm font-semibold text-[#3bb1e6] underline">
            Ir a seguimiento
          </Link>
        </div>

        <div className="rounded-3xl bg-white border p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#32e1c0]">Atencion</p>
          <p className="mt-2 text-xl font-bold text-[#1a4876]">Te acompanamos antes y despues de comprar</p>
          <p className="mt-2 text-sm text-slate-600">
            Si algo no te queda claro, escribenos y resolvemos dudas sobre stock, envios o cambios.
          </p>
          <a
            href="https://www.instagram.com/lookilla.store/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 text-sm font-semibold text-[#3bb1e6] underline"
          >
            Hablar por Instagram
          </a>
        </div>

        <div className="rounded-3xl bg-white border p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#a572e1]">Compra segura</p>
          <p className="mt-2 text-xl font-bold text-[#1a4876]">Pagos online con confirmacion</p>
          <p className="mt-2 text-sm text-slate-600">
            Cuando el pago se aprueba, el sistema actualiza tu compra y envia confirmacion por correo.
          </p>
        </div>
      </section>

      <section id="preguntas-frecuentes" className="mt-10 scroll-mt-28">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#1a4876]">Preguntas frecuentes</h2>
        <div className="grid gap-4 mt-5">
          {faqItems.map((item) => (
            <article key={item.question} className="rounded-3xl border bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#1a4876]">{item.question}</h3>
              <p className="mt-2 text-slate-600 leading-7">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="envios" className="mt-10 scroll-mt-28 rounded-3xl border bg-white p-6 md:p-8 shadow-sm">
        <h2 className="text-2xl font-extrabold text-[#1a4876]">Politicas de envio</h2>
        <div className="grid gap-3 mt-4 text-slate-600">
          {shippingPoints.map((point) => (
            <p key={point} className="rounded-2xl bg-[#f7faff] px-4 py-3">
              {point}
            </p>
          ))}
        </div>
      </section>

      <section id="cambios" className="mt-10 scroll-mt-28 rounded-3xl border bg-white p-6 md:p-8 shadow-sm">
        <h2 className="text-2xl font-extrabold text-[#1a4876]">Cambios y postventa</h2>
        <div className="grid gap-3 mt-4 text-slate-600">
          {exchangePoints.map((point) => (
            <p key={point} className="rounded-2xl bg-[#fdf8ff] px-4 py-3">
              {point}
            </p>
          ))}
        </div>
      </section>

      <section id="cuidados" className="mt-10 scroll-mt-28 rounded-3xl border bg-white p-6 md:p-8 shadow-sm">
        <h2 className="text-2xl font-extrabold text-[#1a4876]">Tips de cuidados</h2>
        <div className="grid gap-3 mt-4 text-slate-600">
          {carePoints.map((point) => (
            <p key={point} className="rounded-2xl bg-[#f4fffb] px-4 py-3">
              {point}
            </p>
          ))}
        </div>
      </section>

      <section id="terminos" className="mt-10 scroll-mt-28 rounded-3xl border bg-white p-6 md:p-8 shadow-sm">
        <h2 className="text-2xl font-extrabold text-[#1a4876]">Terminos de compra</h2>
        <div className="mt-4 space-y-3 text-slate-600 leading-7">
          <p>
            Al realizar una compra, aceptas que la informacion entregada en checkout sea correcta y suficiente para procesar el pedido.
          </p>
          <p>
            Los valores, disponibilidad y tiempos pueden cambiar sin previo aviso cuando exista actualizacion de catalogo, stock o condiciones logisticas.
          </p>
          <p>
            Si el sistema detecta un problema de stock o datos incompletos, nos pondremos en contacto para ofrecerte una alternativa o solucion.
          </p>
        </div>
      </section>

      <section id="privacidad" className="mt-10 scroll-mt-28 rounded-3xl border bg-white p-6 md:p-8 shadow-sm">
        <h2 className="text-2xl font-extrabold text-[#1a4876]">Politica de privacidad</h2>
        <div className="mt-4 space-y-3 text-slate-600 leading-7">
          <p>
            Usamos los datos que ingresas en la compra para procesar tu pedido, enviarte confirmaciones y darte soporte postventa.
          </p>
          <p>
            No publicamos ni compartimos tus datos personales con terceros ajenos al procesamiento del pedido y del pago.
          </p>
          <p>
            Si necesitas corregir informacion de tu compra o tienes dudas sobre su uso, puedes escribirnos por Instagram o por el canal de contacto disponible.
          </p>
        </div>
      </section>
    </main>
  );
}
