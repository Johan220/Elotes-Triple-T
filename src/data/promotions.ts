import { initialProducts } from './products';
import type { Product } from '../types';

export type Promotion = {
  id: string;
  name: string;
  discount: number;
  originalPrice: number;
  price: number;
  description: string;
  image: string;
  cartProduct: Product;
};

type PromotionDefinition = {
  id: string;
  name: string;
  discount: number;
  productIds: [string, string];
};

const promotionDefinitions: PromotionDefinition[] = [
  {
    id: 'promo-duo-maicero',
    name: 'Dúo Maicero',
    discount: 10,
    productIds: ['elote-clasico', 'agua-jamaica'],
  },
  {
    id: 'promo-combo-triple-t',
    name: 'Combo Triple T',
    discount: 15,
    productIds: ['esquite-triple', 'agua-horchata'],
  },
  {
    id: 'promo-fuego-fresco',
    name: 'Fuego Fresco',
    discount: 20,
    productIds: ['elote-flamin', 'agua-tamarindo'],
  },
  {
    id: 'promo-combo-botanero',
    name: 'Combo Botanero',
    discount: 12,
    productIds: ['tostiesquite', 'agua-jamaica'],
  },
  {
    id: 'promo-antojo-ligero',
    name: 'Antojo Ligero',
    discount: 10,
    productIds: ['esquite-chico', 'agua-horchata'],
  },
];

function getProduct(productId: string) {
  const product = initialProducts.find((item) => item.id === productId);

  if (!product) {
    throw new Error(`No se encontró el producto ${productId}.`);
  }

  return product;
}

function createPromotion(definition: PromotionDefinition): Promotion {
  const [firstProductId, secondProductId] = definition.productIds;
  const firstProduct = getProduct(firstProductId);
  const secondProduct = getProduct(secondProductId);
  const originalPrice = firstProduct.price + secondProduct.price;
  const price = Number(
    (originalPrice * (1 - definition.discount / 100)).toFixed(2),
  );
  const description = `Incluye ${firstProduct.name} y ${secondProduct.name}.`;

  return {
    id: definition.id,
    name: definition.name,
    discount: definition.discount,
    originalPrice,
    price,
    description,
    image: firstProduct.image,
    cartProduct: {
      id: definition.id,
      name: definition.name,
      category: 'Especiales',
      price,
      description,
      tags: [
        `${definition.discount}% de descuento`,
        firstProduct.name,
        secondProduct.name,
      ],
      image: firstProduct.image,
      featured: true,
    },
  };
}

export const promotions = promotionDefinitions.map(createPromotion);
