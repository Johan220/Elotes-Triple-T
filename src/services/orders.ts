import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type {
  OrderInputItem,
  OrderProduct,
  PurchaseOrder,
} from '../types';

const LOCAL_USER_KEY = 'elotes-triple-t-user';
const LOCAL_ORDERS_PREFIX = 'elotes-triple-t-orders';

type OrderRow = {
  id: string;
  usuario_id: string;
  total: number | string;
  estado: string;
  productos: unknown;
  created_at: string;
};

function localOrdersKey(userIdentity: string) {
  return `${LOCAL_ORDERS_PREFIX}:${encodeURIComponent(userIdentity)}`;
}

function getLocalUserIdentity() {
  const savedUser = localStorage.getItem(LOCAL_USER_KEY);

  if (!savedUser) {
    return null;
  }

  try {
    const user = JSON.parse(savedUser) as { email?: string };
    return user.email?.trim() || null;
  } catch {
    return null;
  }
}

function toOrderProducts(items: OrderInputItem[]): OrderProduct[] {
  return items.map(({ product, quantity }) => ({
    productId: product.id,
    name: product.name,
    image: product.image,
    unitPrice: Number(product.price),
    quantity,
  }));
}

function parseOrderProducts(value: unknown): OrderProduct[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') {
      return [];
    }

    const product = item as Partial<OrderProduct>;

    if (
      typeof product.productId !== 'string' ||
      typeof product.name !== 'string' ||
      typeof product.image !== 'string'
    ) {
      return [];
    }

    return [
      {
        productId: product.productId,
        name: product.name,
        image: product.image,
        unitPrice: Number(product.unitPrice),
        quantity: Number(product.quantity),
      },
    ];
  });
}

function fromRow(row: OrderRow): PurchaseOrder {
  return {
    id: row.id,
    userId: row.usuario_id,
    total: Number(row.total),
    status: row.estado,
    products: parseOrderProducts(row.productos),
    createdAt: row.created_at,
  };
}

function getLocalOrders(userIdentity: string): PurchaseOrder[] {
  const savedOrders = localStorage.getItem(localOrdersKey(userIdentity));

  if (!savedOrders) {
    return [];
  }

  try {
    return JSON.parse(savedOrders) as PurchaseOrder[];
  } catch {
    return [];
  }
}

function databaseError(error: { code?: string; message: string }) {
  if (error.code === '42P01' || error.code === 'PGRST205') {
    return new Error('La tabla de órdenes todavía no está configurada en Supabase.');
  }

  return new Error(error.message);
}

export async function createOrder(items: OrderInputItem[]) {
  if (items.length === 0) {
    throw new Error('Agrega al menos un producto antes de confirmar la compra.');
  }

  const products = toOrderProducts(items);
  const total = products.reduce(
    (orderTotal, product) =>
      orderTotal + product.unitPrice * product.quantity,
    0,
  );

  if (!isSupabaseConfigured || !supabase) {
    const userIdentity = getLocalUserIdentity();

    if (!userIdentity) {
      throw new Error('Inicia sesión para registrar esta compra en tu historial.');
    }

    const order: PurchaseOrder = {
      id: crypto.randomUUID(),
      userId: userIdentity,
      total,
      status: 'registrada',
      products,
      createdAt: new Date().toISOString(),
    };
    const orders = [order, ...getLocalOrders(userIdentity)];
    localStorage.setItem(localOrdersKey(userIdentity), JSON.stringify(orders));
    return order;
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Inicia sesión para registrar esta compra en tu historial.');
  }

  const { data, error } = await supabase
    .from('ordenes')
    .insert({
      usuario_id: user.id,
      total,
      estado: 'registrada',
      productos: products,
    })
    .select()
    .single();

  if (error) {
    throw databaseError(error);
  }

  return fromRow(data as OrderRow);
}

export async function fetchOrders(userIdentity: string) {
  if (!isSupabaseConfigured || !supabase) {
    return getLocalOrders(userIdentity);
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Tu sesión terminó. Inicia sesión nuevamente.');
  }

  const { data, error } = await supabase
    .from('ordenes')
    .select('*')
    .eq('usuario_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw databaseError(error);
  }

  return (data as OrderRow[]).map(fromRow);
}
