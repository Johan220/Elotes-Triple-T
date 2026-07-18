import { initialProducts, productImageByName } from '../data/products';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { Product, ProductFormState } from '../types';

const STORAGE_KEY = 'elotes-triple-t-products';
const fallbackImage = initialProducts[0].image;

type ProductRow = {
  id: string;
  name: string;
  category: Product['category'];
  price: number;
  description: string;
  tags: string[] | null;
  image_url: string;
  featured: boolean | null;
};

function fromRow(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    description: row.description,
    tags: row.tags ?? [],
    image: productImageByName[row.name] ?? row.image_url,
    featured: Boolean(row.featured),
  };
}

function getStoredProducts() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return initialProducts;
  }

  try {
    const storedProducts = JSON.parse(saved) as Product[];
    const normalizedProducts = storedProducts.map((product) => ({
      ...product,
      image: productImageByName[product.name] ?? product.image,
    }));

    saveStoredProducts(normalizedProducts);
    return normalizedProducts;
  } catch {
    return initialProducts;
  }
}

function saveStoredProducts(products: Product[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export function normalizeTags(tags: string) {
  return tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function toPayload(formState: ProductFormState) {
  return {
    name: formState.name,
    category: formState.category,
    price: Number(formState.price),
    description: formState.description,
    tags: normalizeTags(formState.tags),
    image_url: formState.image || fallbackImage,
    featured: Boolean(formState.featured),
  };
}

export async function fetchProducts() {
  if (!isSupabaseConfigured || !supabase) {
    return getStoredProducts();
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data as ProductRow[]).map(fromRow);
}

export async function createProduct(formState: ProductFormState) {
  if (!isSupabaseConfigured || !supabase) {
    const nextProduct: Product = {
      id: crypto.randomUUID(),
      ...formState,
      price: Number(formState.price),
      image: formState.image || fallbackImage,
      tags: normalizeTags(formState.tags),
    };
    const nextProducts = [nextProduct, ...getStoredProducts()];
    saveStoredProducts(nextProducts);
    return nextProduct;
  }

  const { data, error } = await supabase
    .from('products')
    .insert(toPayload(formState))
    .select()
    .single();

  if (error) {
    throw error;
  }

  return fromRow(data as ProductRow);
}

export async function updateProduct(productId: string, formState: ProductFormState) {
  if (!isSupabaseConfigured || !supabase) {
    const nextProducts = getStoredProducts().map((product) =>
      product.id === productId
        ? {
            ...product,
            ...formState,
            price: Number(formState.price),
            image: formState.image || fallbackImage,
            tags: normalizeTags(formState.tags),
          }
        : product,
    );
    saveStoredProducts(nextProducts);
    return nextProducts.find((product) => product.id === productId) ?? null;
  }

  const { data, error } = await supabase
    .from('products')
    .update(toPayload(formState))
    .eq('id', productId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return fromRow(data as ProductRow);
}

export async function deleteProduct(productId: string) {
  if (!isSupabaseConfigured || !supabase) {
    const nextProducts = getStoredProducts().filter(
      (product) => product.id !== productId,
    );
    saveStoredProducts(nextProducts);
    return;
  }

  const { error } = await supabase.from('products').delete().eq('id', productId);

  if (error) {
    throw error;
  }
}
