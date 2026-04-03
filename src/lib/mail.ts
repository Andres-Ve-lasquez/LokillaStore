import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

function moneyCLP(n: number) {
  return n.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
}

export async function sendOrderConfirmation(order: any) {
  const itemsHtml = order.items
    .map(
      (it: any) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee">${it.nombre}${it.talla ? ` – Talla ${it.talla}` : ""}${it.color ? ` / ${it.color}` : ""}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:center">${it.cantidad}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">${moneyCLP(it.precio * it.cantidad)}</td>
      </tr>`
    )
    .join("");

  const html = `
  <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
    <div style="background:linear-gradient(135deg,#32e1c0,#3bb1e6,#a572e1);padding:32px;text-align:center;border-radius:12px 12px 0 0">
      <h1 style="color:white;margin:0;font-size:24px">¡Gracias por tu compra! 🎉</h1>
    </div>
    <div style="padding:32px;background:#fff;border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px">
      <p>Hola <strong>${order.customer.nombre}</strong>,</p>
      <p>Recibimos tu pedido correctamente. Aquí tienes el resumen:</p>

      <div style="background:#f8f9fa;padding:16px;border-radius:8px;margin:16px 0">
        <p style="margin:0;font-size:13px;color:#666">Número de orden</p>
        <p style="margin:4px 0 0;font-size:20px;font-weight:bold;color:#1a4876">${order.orderNumber}</p>
      </div>

      <table style="width:100%;border-collapse:collapse;margin:20px 0">
        <thead>
          <tr style="border-bottom:2px solid #eee">
            <th style="text-align:left;padding:8px 0;font-size:13px;color:#666">Producto</th>
            <th style="text-align:center;padding:8px 0;font-size:13px;color:#666">Cant.</th>
            <th style="text-align:right;padding:8px 0;font-size:13px;color:#666">Total</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>

      <div style="border-top:2px solid #eee;padding-top:12px;text-align:right">
        ${order.discount > 0 ? `<p style="margin:4px 0;color:#16a34a">Descuento: -${moneyCLP(order.discount)}</p>` : ""}
        <p style="margin:4px 0;color:#666">Envío: ${order.shippingCost === 0 ? "Gratis 🎁" : moneyCLP(order.shippingCost)}</p>
        <p style="margin:8px 0;font-size:20px;font-weight:bold">Total pagado: ${moneyCLP(order.total)}</p>
      </div>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:16px;border-radius:8px;margin:20px 0">
        <p style="margin:0;font-weight:bold;color:#166534">📦 Dirección de envío</p>
        <p style="margin:8px 0 0;color:#15803d">
          ${order.address.calle} ${order.address.numero}${order.address.depto ? `, ${order.address.depto}` : ""}<br>
          ${order.address.comuna}, ${order.address.ciudad}<br>
          ${order.address.region}
        </p>
      </div>

      <p style="color:#666;font-size:14px">Te avisaremos por este correo cuando tu pedido sea despachado. Si tienes alguna consulta, responde este mail.</p>
      <p style="margin-top:32px;color:#999;font-size:12px;text-align:center">Este correo fue generado automáticamente, por favor no lo reenvíes.</p>
    </div>
  </div>`;

  await transporter.sendMail({
    from: `"Mi Catálogo" <${process.env.GMAIL_USER}>`,
    to: order.customer.email,
    subject: `✅ Pedido confirmado ${order.orderNumber}`,
    html,
  });
}

export async function sendNewOrderNotification(order: any) {
  const itemsList = order.items
    .map((it: any) => `• ${it.nombre} x${it.cantidad} = ${moneyCLP(it.precio * it.cantidad)}`)
    .join("\n");

  await transporter.sendMail({
    from: `"Mi Catálogo" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,
    subject: `🛒 Nueva orden ${order.orderNumber} – ${moneyCLP(order.total)}`,
    text: `Nueva venta!\n\nOrden: ${order.orderNumber}\nCliente: ${order.customer.nombre} (${order.customer.email})\nTeléfono: ${order.customer.telefono}\n\nDirección:\n${order.address.calle} ${order.address.numero}${order.address.depto ? `, ${order.address.depto}` : ""}\n${order.address.comuna}, ${order.address.ciudad}, ${order.address.region}\n\nProductos:\n${itemsList}\n\nTotal: ${moneyCLP(order.total)}\n\nNota del cliente: ${order.notes || "—"}`,
  });
}
