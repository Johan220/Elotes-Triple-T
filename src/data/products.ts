import type { Product } from '../types';

export const initialProducts: Product[] = [
  {
    id: 'elote-clasico',
    name: 'Elote Clásico',
    category: 'Elotes',
    price: 38,
    description: 'Elote tierno con mayonesa, queso fresco, chilito y limón.',
    tags: ['Queso fresco', 'Chilito', 'Limón'],
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmrSyHDcZUz97NutA1GHSYJ1zKr56tv0BfjzibUWm0OQ&s=10',
    featured: true,
  },
  {
    id: 'esquite-triple',
    name: 'Esquite Triple T',
    category: 'Esquites',
    price: 52,
    description: 'Vaso generoso de esquite con crema, queso, cacahuate y Takis.',
    tags: ['Crujiente', 'Picante', 'Favorito'],
    image: 'https://www.lala.com.mx/storage/app/media/esquites_optimized.jpg',
    featured: true,
  },
  {
    id: 'elote-flamin',
    name: 'Elote Flamin',
    category: 'Especiales',
    price: 58,
    description: 'Elote cubierto con salsa de la casa y fritura flamin molida.',
    tags: ['Salsa de la casa', 'Muy picante'],
    image:
      'https://i.pinimg.com/736x/85/5b/30/855b301e56ccbfcf78181b7b4b7bb339.jpg',
  },
  {
    id: 'tostiesquite',
    name: 'Tostiesquite',
    category: 'Especiales',
    price: 65,
    description: 'Tostitos con esquite preparado, queso, crema y salsa botanera.',
    tags: ['Botana', 'Para compartir'],
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGxv0dHRBIXEka-X_Ekp4k6nuDIna8G34Swy4Y4rYG7A&s=10',
  },
  {
    id: 'agua-horchata',
    name: 'Agua de Horchata',
    category: 'Bebidas',
    price: 28,
    description: 'Agua fresca cremosa, fría y perfecta para bajar el chilito.',
    tags: ['Natural', 'Fría'],
    image: 'https://mahatmarice.com/wp-content/uploads/2020/04/GettyImages-493110032.jpg',
  },
  {
    id: 'esquite-chico',
    name: 'Esquite Chico',
    category: 'Esquites',
    price: 34,
    description: 'El tamaño ideal para un antojo rápido, preparado a tu gusto.',
    tags: ['Ligero', 'A tu gusto'],
    image: 'https://http2.mlstatic.com/D_NQ_NP_797203-MLM107949927238_032026-O.webp',
  },
  {
    id: 'agua-jamaica',
    name: 'Agua de Jamaica',
    category: 'Bebidas',
    price: 28,
    description: 'Agua fresca de jamaica con hielo, ligera y refrescante.',
    tags: ['Natural', 'Refrescante'],
    image: 'https://assets.tmecosys.com/image/upload/t_web_rdp_recipe_584x480_1_5x/img/recipe/ras/Assets/F34BC251-8877-40BD-BBEF-ADDD34D15543/Derivates/A86DA7B6-65EB-4512-A719-085699EF7072.jpg',
  },
  {
    id: 'agua-tamarindo',
    name: 'Agua de Tamarindo',
    category: 'Bebidas',
    price: 28,
    description: 'Agua fresca de tamarindo con sabor dulce y acidito.',
    tags: ['Natural', 'Dulce acidito'],
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFQUgBUrTGpxvugSv_kjuuuF1BxJFWfwDcnRknIzQEuw&s=10',
  },
];

export const productImageByName: Record<string, string> = Object.fromEntries(
  initialProducts.map((product) => [product.name, product.image]),
);
