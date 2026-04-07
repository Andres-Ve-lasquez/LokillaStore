import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import dbConnect from "@/lib/dbConnect";
import Order from "@/lib/models/Order";

export async function GET() {
  await dbConnect();

  const orders = await Order.find({}).sort({ createdAt: -1 }).lean();

  const rows = orders.map((o: any) => ({
    "N° Orden":       o.orderNumber,
    "Fecha":          new Date(o.createdAt).toLocaleDateString("es-CL"),
    "Estado":         o.status,
    "Cliente":        o.customer?.nombre ?? "",
    "Email":          o.customer?.email ?? "",
    "Teléfono":       o.customer?.telefono ?? "",
    "Región":         o.address?.region ?? "",
    "Ciudad":         o.address?.ciudad ?? "",
    "Comuna":         o.address?.comuna ?? "",
    "Calle":          `${o.address?.calle ?? ""} ${o.address?.numero ?? ""}`.trim(),
    "Depto":          o.address?.depto ?? "",
    "Productos":      (o.items ?? []).map((it: any) => `${it.nombre} x${it.cantidad}`).join(" | "),
    "Subtotal":       o.subtotal ?? 0,
    "Envío":          o.shippingCost ?? 0,
    "Descuento":      o.discount ?? 0,
    "Cupón":          o.couponCode ?? "",
    "Total":          o.total ?? 0,
    "Método de pago": o.payment?.method ?? "webpay",
    "ID Transacción": o.payment?.transactionId ?? "",
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);

  // Ancho de columnas
  ws["!cols"] = [
    { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 22 }, { wch: 28 },
    { wch: 14 }, { wch: 18 }, { wch: 16 }, { wch: 16 }, { wch: 24 },
    { wch: 8  }, { wch: 40 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
    { wch: 12 }, { wch: 10 }, { wch: 14 }, { wch: 20 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Órdenes");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  const fecha = new Date().toISOString().slice(0, 10);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="ordenes-lookilla-${fecha}.xlsx"`,
    },
  });
}
