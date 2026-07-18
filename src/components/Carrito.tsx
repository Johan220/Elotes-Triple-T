import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import { createOrder } from '../services/orders';
import type { Product } from '../types';

type CartItem = {
  product: Product;
  quantity: number;
};

type CarritoContextValue = {
  agregarAlCarrito: (product: Product) => void;
  abrirCarrito: () => void;
  cantidadProductos: number;
};

const CarritoContext = createContext<CarritoContextValue | null>(null);

type CarritoProps = {
  children: ReactNode;
};

export function useCarrito() {
  const context = useContext(CarritoContext);

  if (!context) {
    throw new Error('useCarrito debe usarse dentro de <Carrito>.');
  }

  return context;
}

export function BotonCarrito() {
  const { abrirCarrito, cantidadProductos } = useCarrito();

  return (
    <button className="cart-button" type="button" onClick={abrirCarrito}>
      <ShoppingCart size={18} aria-hidden="true" />
      Carrito
      {cantidadProductos > 0 && <span>{cantidadProductos}</span>}
    </button>
  );
}

export function Carrito({ children }: CarritoProps) {
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderMessage, setOrderMessage] = useState('');

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  );

  function agregarAlCarrito(product: Product) {
    setOrderError('');
    setOrderMessage('');
    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.product.id === product.id,
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...currentItems, { product, quantity: 1 }];
    });
  }

  function disminuirProducto(productId: string) {
    setCartItems((currentItems) =>
      currentItems
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function eliminarProducto(productId: string) {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.product.id !== productId),
    );
  }

  async function confirmarCompra() {
    setOrderLoading(true);
    setOrderError('');
    setOrderMessage('');

    try {
      await createOrder(cartItems);
      setCartItems([]);
      setOrderMessage('Compra registrada correctamente en tu historial.');
      window.dispatchEvent(new Event('elotes:order-created'));
    } catch (error) {
      setOrderError(
        error instanceof Error
          ? error.message
          : 'No se pudo registrar la compra.',
      );
    } finally {
      setOrderLoading(false);
    }
  }

  const contextValue: CarritoContextValue = {
    agregarAlCarrito,
    abrirCarrito: () => setCartOpen(true),
    cantidadProductos: cartCount,
  };

  return (
    <CarritoContext.Provider value={contextValue}>
      {children}

      {cartOpen && (
        <section className="cart-overlay" aria-modal="true" role="dialog">
          <aside className="cart-panel">
            <div className="cart-header">
              <div>
                <p className="eyebrow">Tu pedido</p>
                <h2>Carrito de compras</h2>
              </div>
              <button
                className="icon-button"
                aria-label="Cerrar carrito"
                onClick={() => setCartOpen(false)}
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            {(orderError || orderMessage) && (
              <div className="cart-feedback" aria-live="polite">
                {orderError && <p className="form-error">{orderError}</p>}
                {orderMessage && <p className="status-message">{orderMessage}</p>}
              </div>
            )}

            {cartItems.length === 0 ? (
              <p className="empty-cart">Aún no has agregado productos.</p>
            ) : (
              <>
                <div className="cart-list">
                  {cartItems.map((item) => (
                    <article className="cart-item" key={item.product.id}>
                      <img src={item.product.image} alt={item.product.name} />
                      <div className="cart-item-info">
                        <strong>{item.product.name}</strong>
                        <span>${item.product.price} c/u</span>
                      </div>
                      <div className="quantity-controls">
                        <button
                          className="icon-button"
                          aria-label={`Quitar uno de ${item.product.name}`}
                          onClick={() => disminuirProducto(item.product.id)}
                        >
                          <Minus size={16} aria-hidden="true" />
                        </button>
                        <strong>{item.quantity}</strong>
                        <button
                          className="icon-button"
                          aria-label={`Agregar otro ${item.product.name}`}
                          onClick={() => agregarAlCarrito(item.product)}
                        >
                          <Plus size={16} aria-hidden="true" />
                        </button>
                      </div>
                      <strong className="cart-subtotal">
                        ${item.product.price * item.quantity}
                      </strong>
                      <button
                        className="icon-button danger"
                        aria-label={`Eliminar ${item.product.name} del carrito`}
                        onClick={() => eliminarProducto(item.product.id)}
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </article>
                  ))}
                </div>

                <div className="cart-summary">
                  <span>Total</span>
                  <strong>${cartTotal}</strong>
                </div>
                <div className="cart-actions">
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => {
                      setCartItems([]);
                      setOrderError('');
                      setOrderMessage('');
                    }}
                  >
                    Vaciar carrito
                  </button>
                  <button
                    className="primary-button"
                    type="button"
                    disabled={orderLoading}
                    onClick={confirmarCompra}
                  >
                    {orderLoading ? 'Registrando...' : 'Confirmar compra'}
                  </button>
                </div>
              </>
            )}
          </aside>
        </section>
      )}
    </CarritoContext.Provider>
  );
}
