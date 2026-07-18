import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, PackageOpen, ReceiptText } from 'lucide-react';
import { fetchOrders } from '../services/orders';
import type { PurchaseOrder } from '../types';

type HistorialProps = {
  userIdentity: string;
  onBack: () => void;
};

const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('es-MX', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const statusLabels: Record<string, string> = {
  registrada: 'Registrada',
  preparando: 'En preparación',
  completada: 'Completada',
  cancelada: 'Cancelada',
};

export function Historial({ userIdentity, onBack }: HistorialProps) {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      setOrders(await fetchOrders(userIdentity));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'No se pudo cargar el historial de compras.',
      );
    } finally {
      setLoading(false);
    }
  }, [userIdentity]);

  useEffect(() => {
    void loadOrders();
    window.addEventListener('elotes:order-created', loadOrders);

    return () => window.removeEventListener('elotes:order-created', loadOrders);
  }, [loadOrders]);

  return (
    <div className="historial-view">
      <div className="historial-toolbar">
        <button className="historial-back" type="button" onClick={onBack}>
          <ArrowLeft size={18} aria-hidden="true" />
          Volver al perfil
        </button>
        {!loading && !error && (
          <span className="historial-count">
            {orders.length} {orders.length === 1 ? 'orden' : 'órdenes'}
          </span>
        )}
      </div>

      {loading && <p className="historial-state">Cargando tus compras...</p>}

      {error && (
        <div className="historial-error">
          <p className="form-error">{error}</p>
          <button className="secondary-button" type="button" onClick={loadOrders}>
            Volver a intentar
          </button>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="historial-empty">
          <PackageOpen size={38} aria-hidden="true" />
          <strong>Todavía no hay compras</strong>
          <span>Las órdenes que confirmes desde el carrito aparecerán aquí.</span>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="historial-list">
          {orders.map((order) => (
            <article className="historial-order" key={order.id}>
              <header className="historial-order-header">
                <span className="historial-order-icon">
                  <ReceiptText size={20} aria-hidden="true" />
                </span>
                <div>
                  <strong>Orden #{order.id.slice(0, 8).toUpperCase()}</strong>
                  <time dateTime={order.createdAt}>
                    {dateFormatter.format(new Date(order.createdAt))}
                  </time>
                </div>
                <span className={`historial-status ${order.status}`}>
                  {statusLabels[order.status] ?? order.status}
                </span>
              </header>

              <div className="historial-products">
                {order.products.map((product) => (
                  <div
                    className="historial-product"
                    key={`${order.id}-${product.productId}`}
                  >
                    <img src={product.image} alt="" />
                    <div>
                      <strong>{product.name}</strong>
                      <span>
                        {product.quantity} × {currencyFormatter.format(product.unitPrice)}
                      </span>
                    </div>
                    <strong>
                      {currencyFormatter.format(product.unitPrice * product.quantity)}
                    </strong>
                  </div>
                ))}
              </div>

              <footer className="historial-order-total">
                <span>Total de la orden</span>
                <strong>{currencyFormatter.format(order.total)}</strong>
              </footer>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
