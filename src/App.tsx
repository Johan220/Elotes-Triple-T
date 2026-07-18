import { FormEvent, useEffect, useState } from 'react';
import {
  BadgePlus,
  LogIn,
  LogOut,
  Pencil,
  Search,
  ShoppingBag,
  Trash2,
  Wheat,
  X,
} from 'lucide-react';
import { BotonCarrito, Carrito } from './components/Carrito';
import { Tarjetas } from './components/Tarjetas';
import { TripleT } from './components/TripleT';
import { Usuario } from './components/Usuario';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  updateProduct,
} from './services/products';
import { Carrusel } from './components/Carrusel';
import type { Product, ProductCategory, ProductFormState } from './types';

const ADMIN_USER = 'admin';
const ADMIN_PASSWORD = 'triple-t';

const categories: Array<ProductCategory | 'Todos'> = [
  'Todos',
  'Elotes',
  'Esquites',
  'Especiales',
  'Bebidas',
];

const emptyProductForm: ProductFormState = {
  name: '',
  category: 'Elotes',
  price: 35,
  description: '',
  tags: '',
  image: '',
  featured: false,
};

function toProductForm(product: Product): ProductFormState {
  return {
    ...product,
    tags: product.tags.join(', '),
  };
}

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] =
    useState<(typeof categories)[number]>('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [adminOpen, setAdminOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured);
  const [productsLoading, setProductsLoading] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [productError, setProductError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<ProductFormState>(emptyProductForm);

  useEffect(() => {
    void loadProducts();
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setIsAuthenticated(Boolean(data.session));
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session));
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProducts() {
    setProductsLoading(true);
    setProductError('');

    try {
      setProducts(await fetchProducts());
    } catch (error) {
      setProductError(
        error instanceof Error
          ? error.message
          : 'No se pudieron cargar los productos.',
      );
    } finally {
      setProductsLoading(false);
    }
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '');
    const password = String(formData.get('password') ?? '');

    setAuthLoading(true);
    setLoginError('');

    if (!isSupabaseConfigured || !supabase) {
      if (email === ADMIN_USER && password === ADMIN_PASSWORD) {
        setIsAuthenticated(true);
        setAuthLoading(false);
        return;
      }

      setLoginError('Usuario o contraseña incorrectos.');
      setAuthLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error) {
      setIsAuthenticated(true);
      setAuthLoading(false);
    } else {
      setLoginError('Correo o contraseña incorrectos.');
      setAuthLoading(false);
    }
  }

  async function handleProductSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProductError('');

    try {
      if (editingId) {
        const updatedProduct = await updateProduct(editingId, formState);

        if (updatedProduct) {
          setProducts(
            products.map((product) =>
              product.id === editingId ? updatedProduct : product,
            ),
          );
        }
      } else {
        const newProduct = await createProduct(formState);
        setProducts([newProduct, ...products]);
      }

      setEditingId(null);
      setFormState(emptyProductForm);
    } catch (error) {
      setProductError(
        error instanceof Error
          ? error.message
          : 'No se pudo guardar el producto.',
      );
    }
  }

  function handleEdit(product: Product) {
    setEditingId(product.id);
    setFormState(toProductForm(product));
  }

  async function handleDelete(productId: string) {
    setProductError('');

    try {
      await deleteProduct(productId);
      setProducts(products.filter((product) => product.id !== productId));
    } catch (error) {
      setProductError(
        error instanceof Error
          ? error.message
          : 'No se pudo eliminar el producto.',
      );
    }
  }

  function resetForm() {
    setEditingId(null);
    setFormState(emptyProductForm);
  }

  async function handleSignOut() {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }

    setIsAuthenticated(false);
    resetForm();
  }

  return (
    <Carrito>
      <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Elotes Triple T inicio">
          <span className="brand-mark">
            <Wheat size={24} aria-hidden="true" />
          </span>
          <span>
            <strong>Elotes Triple T</strong>
            <small>El antojo bien servido</small>
          </span>
        </a>

        <nav className="header-actions" aria-label="Navegación principal">
          <a href="#productos">Productos</a>
          <a href="#ubicacion">Ubicación</a>
          <BotonCarrito />
          <Usuario />
        </nav>
      </header>

      <main id="inicio">
        <section className="hero-section">
          <div className="hero-copy">
            <p className="eyebrow">Elotes, esquites y especiales</p>
            <h1>Elotes Triple T</h1>
            <p>
              Maíz tierno, salsas de la casa y toppings crujientes preparados al
              momento para ese antojo de la tarde.
            </p>
            <div className="hero-actions">
              <a className="primary-button" href="#productos">
                <ShoppingBag size={18} aria-hidden="true" />
                Ver menú
              </a>
              <a className="secondary-button" href="tel:+520000000000">
                Ordenar ahora
              </a>
            </div>
          </div>

          <Carrusel />
        </section>

        <section className="menu-section" id="productos">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                {isSupabaseConfigured ? 'Menú conectado' : 'Menú local'}
              </p>
              <h2>Productos de la casa</h2>
            </div>
            <label className="search-box">
              <Search size={18} aria-hidden="true" />
              <input
                type="search"
                placeholder="Buscar elote, esquite, topping..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>
          </div>

          <div className="category-tabs" aria-label="Filtrar por categoría">
            {categories.map((category) => (
              <button
                className={activeCategory === category ? 'active' : ''}
                key={category}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {productsLoading && (
            <p className="status-message">Cargando productos...</p>
          )}
          {productError && <p className="form-error">{productError}</p>}

          <Tarjetas
            activeCategory={activeCategory}
            searchTerm={searchTerm}
          />
        </section>

        <section className="info-band" id="ubicacion">
          <div>
            <p className="eyebrow">Visítanos</p>
            <h2>Abierto todos los días</h2>
          </div>
          <p>
            Estamos listos para atenderte de 4:00 p.m. a 11:00 p.m. Pregunta por
            las salsas especiales y combina tus toppings favoritos.
          </p>
        </section>
      </main>

      <footer>
        <span>Elotes Triple T</span>
        <span>Preparado con maíz, limón y mucho antojo.</span>
      </footer>

      <TripleT />

      {adminOpen && (
        <section className="admin-overlay" aria-modal="true" role="dialog">
          <div className="admin-panel">
            <div className="admin-header">
              <div>
                <p className="eyebrow">Administración</p>
                <h2>{isAuthenticated ? 'Gestionar productos' : 'Iniciar sesión'}</h2>
              </div>
              <button
                className="icon-button"
                aria-label="Cerrar administrador"
                onClick={() => setAdminOpen(false)}
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            {!isAuthenticated ? (
              <form className="login-form" onSubmit={handleLogin}>
                {!isSupabaseConfigured && (
                  <p className="status-message">
                    Modo local activo. Configura Supabase para usar Auth real.
                  </p>
                )}
                <label>
                  {isSupabaseConfigured ? 'Correo' : 'Usuario'}
                  <input
                    name="email"
                    placeholder={isSupabaseConfigured ? 'admin@correo.com' : 'admin'}
                    autoComplete="username"
                  />
                </label>
                <label>
                  Contraseña
                  <input
                    name="password"
                    type="password"
                    placeholder="triple-t"
                    autoComplete="current-password"
                  />
                </label>
                {loginError && <p className="form-error">{loginError}</p>}
                <button className="primary-button" type="submit" disabled={authLoading}>
                  <LogIn size={18} aria-hidden="true" />
                  {authLoading ? 'Entrando...' : 'Entrar'}
                </button>
              </form>
            ) : (
              <div className="admin-content">
                {productError && <p className="form-error admin-error">{productError}</p>}
                <form className="product-form" onSubmit={handleProductSubmit}>
                  <label>
                    Nombre
                    <input
                      required
                      value={formState.name}
                      onChange={(event) =>
                        setFormState({ ...formState, name: event.target.value })
                      }
                    />
                  </label>

                  <div className="form-row">
                    <label>
                      Categoría
                      <select
                        value={formState.category}
                        onChange={(event) =>
                          setFormState({
                            ...formState,
                            category: event.target.value as ProductCategory,
                          })
                        }
                      >
                        {categories
                          .filter((category) => category !== 'Todos')
                          .map((category) => (
                            <option key={category}>{category}</option>
                          ))}
                      </select>
                    </label>
                    <label>
                      Precio
                      <input
                        min="1"
                        required
                        type="number"
                        value={formState.price}
                        onChange={(event) =>
                          setFormState({
                            ...formState,
                            price: Number(event.target.value),
                          })
                        }
                      />
                    </label>
                  </div>

                  <label>
                    Descripción
                    <textarea
                      required
                      value={formState.description}
                      onChange={(event) =>
                        setFormState({
                          ...formState,
                          description: event.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    Etiquetas separadas por coma
                    <input
                      value={formState.tags}
                      onChange={(event) =>
                        setFormState({ ...formState, tags: event.target.value })
                      }
                    />
                  </label>

                  <label>
                    URL de imagen
                    <input
                      value={formState.image}
                      onChange={(event) =>
                        setFormState({ ...formState, image: event.target.value })
                      }
                    />
                  </label>

                  <label className="checkbox-field">
                    <input
                      type="checkbox"
                      checked={Boolean(formState.featured)}
                      onChange={(event) =>
                        setFormState({
                          ...formState,
                          featured: event.target.checked,
                        })
                      }
                    />
                    Marcar como destacado
                  </label>

                  <div className="form-actions">
                    <button className="primary-button" type="submit">
                      <BadgePlus size={18} aria-hidden="true" />
                      {editingId ? 'Guardar cambios' : 'Agregar producto'}
                    </button>
                    {editingId && (
                      <button
                        className="secondary-button"
                        type="button"
                        onClick={resetForm}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>

                <div className="admin-list">
                  <div className="admin-list-header">
                    <strong>{products.length} productos</strong>
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={handleSignOut}
                    >
                      <LogOut size={18} aria-hidden="true" />
                      Salir
                    </button>
                  </div>
                  {products.map((product) => (
                    <article className="admin-product" key={product.id}>
                      <img src={product.image} alt="" />
                      <div>
                        <strong>{product.name}</strong>
                        <span>
                          {product.category} · ${product.price}
                        </span>
                      </div>
                      <button
                        className="icon-button"
                        aria-label={`Editar ${product.name}`}
                        onClick={() => handleEdit(product)}
                      >
                        <Pencil size={18} aria-hidden="true" />
                      </button>
                      <button
                        className="icon-button danger"
                        aria-label={`Eliminar ${product.name}`}
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 size={18} aria-hidden="true" />
                      </button>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
      </div>
    </Carrito>
  );
}
