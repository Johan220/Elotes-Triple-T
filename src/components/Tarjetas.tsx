import { ShoppingCart, Star } from 'lucide-react';
import { initialProducts } from '../data/products';
import type { ProductCategory } from '../types';
import { useCarrito } from './Carrito';

type TarjetasProps = {
  activeCategory: ProductCategory | 'Todos';
  searchTerm: string;
};

export function Tarjetas({
  activeCategory,
  searchTerm,
}: TarjetasProps) {
  const { agregarAlCarrito } = useCarrito();
  const query = searchTerm.trim().toLowerCase();
  const visibleProducts = initialProducts.filter((product) => {
    const matchesCategory =
      activeCategory === 'Todos' || product.category === activeCategory;
    const matchesSearch =
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.tags.some((tag) => tag.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  if (visibleProducts.length === 0) {
    return <p className="status-message">No hay productos para mostrar.</p>;
  }

  return (
    <div className="tarjetas-grid">
      {visibleProducts.map((product) => (
        <article className="tarjeta-producto" key={product.id}>
          <div className="tarjeta-media">
            <img src={product.image} alt={product.name} />
            <span className="tarjeta-categoria">{product.category}</span>
            {product.featured && (
              <span className="tarjeta-destacado">
                <Star size={14} aria-hidden="true" />
                Destacado
              </span>
            )}
          </div>

          <div className="tarjeta-contenido">
            <div className="tarjeta-encabezado">
              <h3>{product.name}</h3>
              <strong>${product.price}</strong>
            </div>

            <p>{product.description}</p>

            <div className="tag-list">
              {product.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>

            <button
              className="tarjeta-carrito"
              type="button"
              onClick={() => agregarAlCarrito(product)}
            >
              <ShoppingCart size={18} aria-hidden="true" />
              Agregar al carrito
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
