import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { createPortal } from 'react-dom';
import {
  CalendarDays,
  LockKeyhole,
  LogIn,
  LogOut,
  Mail,
  Phone,
  ReceiptText,
  User,
  UserPlus,
  Wheat,
  X,
} from 'lucide-react';
import { Historial } from './Historial';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

type UsuarioMode = 'login' | 'register';

type UsuarioActual = {
  id?: string;
  email: string;
  nombre?: string;
};

const LOCAL_USER_KEY = 'elotes-triple-t-user';

function getLocalUser() {
  const savedUser = localStorage.getItem(LOCAL_USER_KEY);

  if (!savedUser) {
    return null;
  }

  try {
    return JSON.parse(savedUser) as UsuarioActual;
  } catch {
    return null;
  }
}

export function Usuario() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<UsuarioMode>('login');
  const [currentUser, setCurrentUser] = useState<UsuarioActual | null>(getLocalUser);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      setCurrentUser(
        user
          ? {
              id: user.id,
              email: user.email ?? '',
              nombre:
                typeof user.user_metadata.nombre === 'string'
                  ? user.user_metadata.nombre
                  : undefined,
            }
          : null,
      );
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setCurrentUser(
        user
          ? {
              id: user.id,
              email: user.email ?? '',
              nombre:
                typeof user.user_metadata.nombre === 'string'
                  ? user.user_metadata.nombre
                  : undefined,
            }
          : null,
      );
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  function selectMode(nextMode: UsuarioMode) {
    setMode(nextMode);
    setError('');
    setMessage('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');
    const nombre = String(formData.get('nombre') ?? '').trim();
    const edad = Number(formData.get('edad') ?? 0);
    const telefono = String(formData.get('telefono') ?? '').trim();

    setLoading(true);
    setError('');
    setMessage('');

    if (!isSupabaseConfigured || !supabase) {
      const nextUser = { id: email, email, nombre };
      setCurrentUser(nextUser);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(nextUser));
      setMessage(
        mode === 'login'
          ? 'Sesión iniciada en modo local.'
          : 'Registro completado en modo local.',
      );
      setLoading(false);
      return;
    }

    if (mode === 'login') {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        setError('Correo o contraseña incorrectos.');
      } else {
        setMessage('Sesión iniciada correctamente.');
      }

      setLoading(false);
      return;
    }

    const { error: registerError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
          edad,
          telefono,
        },
      },
    });

    if (registerError) {
      setError(registerError.message);
    } else {
      setMessage(
        'Cuenta creada y datos guardados. Revisa tu correo si se requiere confirmación.',
      );
    }

    setLoading(false);
  }

  async function handleSignOut() {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }

    localStorage.removeItem(LOCAL_USER_KEY);
    setCurrentUser(null);
    setShowHistory(false);
    setMessage('');
    setError('');
  }

  return (
    <>
      <button
        className="usuario-button"
        type="button"
        aria-haspopup="dialog"
        onClick={() => {
          setShowHistory(false);
          setOpen(true);
        }}
      >
        <User size={18} aria-hidden="true" />
        {currentUser?.nombre?.split(' ')[0] || 'Usuario'}
      </button>

      {open && createPortal(
        <section
          className="usuario-overlay"
          aria-labelledby="usuario-title"
          aria-modal="true"
          role="dialog"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setOpen(false);
            }
          }}
        >
          <div className="usuario-panel">
            <aside className="usuario-aside">
              <span className="usuario-aside-logo">
                <Wheat size={28} aria-hidden="true" />
              </span>
              <div>
                <p>Elotes Triple T</p>
                <h2>Tu antojo empieza aquí.</h2>
                <span>Maíz, sabor y tradición en cada pedido.</span>
              </div>
              <small>Preparado al momento</small>
            </aside>

            <div className="usuario-main">
              <div className="usuario-header">
                <div>
                  <p className="eyebrow">Tu cuenta</p>
                  <h2 id="usuario-title">
                    {currentUser
                      ? showHistory
                        ? 'Historial de compras'
                        : 'Hola de nuevo'
                      : mode === 'login'
                        ? 'Bienvenido'
                        : 'Crea tu cuenta'}
                  </h2>
                </div>
                <button
                  className="icon-button usuario-close"
                  type="button"
                  aria-label="Cerrar ventana de usuario"
                  onClick={() => setOpen(false)}
                >
                  <X size={20} aria-hidden="true" />
                </button>
              </div>

              {currentUser && showHistory ? (
                <Historial
                  userIdentity={currentUser.id ?? currentUser.email}
                  onBack={() => setShowHistory(false)}
                />
              ) : currentUser ? (
                <div className="usuario-session">
                  <span className="usuario-avatar">
                    <User size={30} aria-hidden="true" />
                  </span>
                  <div>
                    <small>Sesión activa</small>
                    <strong>{currentUser.nombre || 'Usuario registrado'}</strong>
                    <span>{currentUser.email}</span>
                  </div>
                  <button
                    className="primary-button usuario-history-button"
                    type="button"
                    onClick={() => setShowHistory(true)}
                  >
                    <ReceiptText size={18} aria-hidden="true" />
                    Ver historial de compras
                  </button>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={handleSignOut}
                  >
                    <LogOut size={18} aria-hidden="true" />
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <>
                  <div className="usuario-tabs" role="tablist" aria-label="Acceso de usuario">
                    <button
                      className={mode === 'login' ? 'active' : ''}
                      type="button"
                      role="tab"
                      aria-selected={mode === 'login'}
                      onClick={() => selectMode('login')}
                    >
                      <LogIn size={17} aria-hidden="true" />
                      Ingresar
                    </button>
                    <button
                      className={mode === 'register' ? 'active' : ''}
                      type="button"
                      role="tab"
                      aria-selected={mode === 'register'}
                      onClick={() => selectMode('register')}
                    >
                      <UserPlus size={17} aria-hidden="true" />
                      Registrarse
                    </button>
                  </div>

                  <form className="usuario-form" key={mode} onSubmit={handleSubmit}>
                    {mode === 'register' && (
                      <>
                        <label htmlFor="usuario-nombre">
                          Nombre completo
                          <span className="usuario-input">
                            <User size={18} aria-hidden="true" />
                            <input
                              id="usuario-nombre"
                              name="nombre"
                              required
                              autoComplete="name"
                              placeholder="Escribe tu nombre"
                            />
                          </span>
                        </label>

                        <div className="usuario-form-row">
                          <label htmlFor="usuario-edad">
                            Edad
                            <span className="usuario-input">
                              <CalendarDays size={18} aria-hidden="true" />
                              <input
                                id="usuario-edad"
                                name="edad"
                                min="1"
                                max="120"
                                required
                                type="number"
                                inputMode="numeric"
                                placeholder="Edad"
                              />
                            </span>
                          </label>
                          <label htmlFor="usuario-telefono">
                            Número telefónico
                            <span className="usuario-input">
                              <Phone size={18} aria-hidden="true" />
                              <input
                                id="usuario-telefono"
                                name="telefono"
                                required
                                type="tel"
                                autoComplete="tel"
                                placeholder="10 dígitos"
                              />
                            </span>
                          </label>
                        </div>
                      </>
                    )}

                    <label htmlFor="usuario-email">
                      Correo electrónico
                      <span className="usuario-input">
                        <Mail size={18} aria-hidden="true" />
                        <input
                          id="usuario-email"
                          name="email"
                          required
                          type="email"
                          autoComplete="email"
                          placeholder="correo@ejemplo.com"
                        />
                      </span>
                    </label>

                    <label htmlFor="usuario-password">
                      Contraseña
                      <span className="usuario-input">
                        <LockKeyhole size={18} aria-hidden="true" />
                        <input
                          id="usuario-password"
                          name="password"
                          required
                          minLength={6}
                          type="password"
                          autoComplete={
                            mode === 'login' ? 'current-password' : 'new-password'
                          }
                          placeholder="Mínimo 6 caracteres"
                        />
                      </span>
                    </label>

                    <div className="usuario-feedback" aria-live="polite">
                      {error && <p className="form-error">{error}</p>}
                      {message && <p className="status-message">{message}</p>}
                    </div>

                    <button
                      className="primary-button usuario-submit"
                      type="submit"
                      disabled={loading}
                    >
                      {mode === 'login' ? (
                        <LogIn size={18} aria-hidden="true" />
                      ) : (
                        <UserPlus size={18} aria-hidden="true" />
                      )}
                      {loading
                        ? 'Procesando...'
                        : mode === 'login'
                          ? 'Ingresar a mi cuenta'
                          : 'Crear mi cuenta'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </section>,
        document.getElementById('inicio') ?? document.body,
      )}
    </>
  );
}
