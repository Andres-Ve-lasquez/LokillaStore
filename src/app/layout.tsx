import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ✅ mismo archivo para provider y hook
import CartProvider from "@/components/cart/CartProvider";
import CartDrawer from "@/components/cart/CartDrawer"; // tu mini-carrito tipo drawer

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-[#f7faff] min-h-screen">
        <CartProvider>
          <Navbar />
          {children}
          <Footer />
          <CartDrawer /> {/* se renderiza una vez */}
        </CartProvider>
      </body>
    </html>
  );
}
