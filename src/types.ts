export type ProductCategory = 'Elotes' | 'Esquites' | 'Especiales' | 'Bebidas';

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  description: string;
  tags: string[];
  image: string;
  featured?: boolean;
};

export type ProductFormState = Omit<Product, 'id' | 'tags'> & {
  tags: string;
};

export type OrderProduct = {
  productId: string;
  name: string;
  image: string;
  unitPrice: number;
  quantity: number;
};

export type PurchaseOrder = {
  id: string;
  userId: string;
  total: number;
  status: string;
  products: OrderProduct[];
  createdAt: string;
};

export type OrderInputItem = {
  product: Product;
  quantity: number;
};
