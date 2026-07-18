import { useEffect, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { promotions } from '../data/promotions';
import { useCarrito } from './Carrito';

const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
});

export function Carrusel() {
  const { agregarAlCarrito } = useCarrito();
  const [activeIndex, setActiveIndex] = useState(0);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const activePromotion = promotions[activeIndex];

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setActiveIndex((currentIndex) =>
        currentIndex === promotions.length - 1 ? 0 : currentIndex + 1,
      );
    }, 5200);

    return () => window.clearTimeout(timeout);
  }, [activeIndex]);

  useEffect(() => {
    setLastAddedId(null);
  }, [activeIndex]);

  function showPrevious() {
    setActiveIndex((currentIndex) =>
      currentIndex === 0 ? promotions.length - 1 : currentIndex - 1,
    );
  }

  function showNext() {
    setActiveIndex((currentIndex) =>
      currentIndex === promotions.length - 1 ? 0 : currentIndex + 1,
    );
  }

  function addPromotionToCart() {
    agregarAlCarrito(activePromotion.cartProduct);
    setLastAddedId(activePromotion.id);
  }

  return (
    <section className="carrusel" aria-label="Carrusel de promociones">
      <div className="carrusel-media promocion-media">
        <button
          className="carrusel-image-button"
          type="button"
          aria-label={`Agregar ${activePromotion.name} al carrito por ${currencyFormatter.format(activePromotion.price)}`}
          onClick={addPromotionToCart}
        >
          <img src={activePromotion.image} alt={activePromotion.name} />
        </button>

        <span className="carrusel-discount">
          {activePromotion.discount}% de descuento
        </span>
        <span className="carrusel-cart-state" aria-live="polite">
          {lastAddedId === activePromotion.id ? (
            <>
              <Check size={17} aria-hidden="true" />
              Agregada
            </>
          ) : (
            <ShoppingCart size={18} aria-hidden="true" />
          )}
        </span>

        <div className="carrusel-content">
          <h2>{activePromotion.name}</h2>
          <p>{activePromotion.description}</p>
          <div className="carrusel-price-row">
            <strong>{currencyFormatter.format(activePromotion.price)}</strong>
            <del>{currencyFormatter.format(activePromotion.originalPrice)}</del>
          </div>
        </div>
      </div>

      <div className="carrusel-controls">
        <button
          className="icon-button"
          type="button"
          aria-label="Ver promoción anterior"
          onClick={showPrevious}
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>

        <div className="carrusel-indicators" aria-label="Seleccionar promoción">
          {promotions.map((promotion, index) => (
            <button
              key={promotion.id}
              className={activeIndex === index ? 'active' : ''}
              type="button"
              aria-label={`Ver ${promotion.name}`}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>

        <button
          className="icon-button"
          type="button"
          aria-label="Ver promoción siguiente"
          onClick={showNext}
        >
          <ChevronRight size={22} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
