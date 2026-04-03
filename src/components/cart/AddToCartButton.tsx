'use client';
import { useCart } from './CartProvider';

type Props = {
  product: {
    _id: string;
    nombre: string;
    precio: number;
    imagenUrl?: string;
  };
  talla?: string;
  color?: string;
  cantidad?: number;
  className?: string;
};

export default function AddToCartButton({ product, talla, color, cantidad = 1, className }: Props) {
  const { addItem } = useCart();

  const onAdd = () => {
    addItem({
      productId: String(product._id),
      nombre: product.nombre,
      precio: product.precio,
      imagenUrl: product.imagenUrl,
      talla,
      color,
      cantidad
    });
  };

  return (
    <button onClick={onAdd} className={className ?? 'w-full rounded-full py-3 bg-black text-white'}>
      Agregar al carrito
    </button>
  );
}
