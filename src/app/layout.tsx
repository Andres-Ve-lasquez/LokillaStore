import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

// ✅ mismo archivo para provider y hook
import CartProvider from "@/components/cart/CartProvider";
import CartDrawer from "@/components/cart/CartDrawer"; // tu mini-carrito tipo drawer

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Lookilla Store",
    template: "%s | Lookilla Store",
  },
  description: "Tienda online de accesorios y regalos con compra segura, catalogo y seguimiento de pedidos.",
  openGraph: {
    title: "Lookilla Store",
    description: "Accesorios, detallitos y compras online con seguimiento de pedido.",
    url: baseUrl,
    siteName: "Lookilla Store",
    locale: "es_CL",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CL">
      <body className="bg-[#f7faff] min-h-screen">
        <CartProvider>
          <Navbar />
          <PageTransition>{children}</PageTransition>
          <Footer />
          <CartDrawer /> {/* se renderiza una vez */}
        </CartProvider>
      </body>
    </html>
  );
}
