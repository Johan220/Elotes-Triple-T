import { useEffect, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { Bot, MessageCircle, SendHorizontal, X } from 'lucide-react';
import { askTripleT } from '../services/tripleT';
import type { TripleTChatMessage } from '../services/tripleT';

type Message = TripleTChatMessage & {
  id: string;
};

const welcomeMessage: Message = {
  id: 'triple-t-welcome',
  role: 'assistant',
  content:
    'Hola, soy Triple T. Puedo ayudarte con el menú, promociones, carrito y tus compras.',
};

export function TripleT() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    textareaRef.current?.focus();

    function closeWithEscape(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    window.addEventListener('keydown', closeWithEscape);
    return () => window.removeEventListener('keydown', closeWithEscape);
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function submitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = question.trim();

    if (!content || loading) {
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
    };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setQuestion('');
    setError('');
    setLoading(true);

    try {
      const answer = await askTripleT(
        nextMessages.slice(-8).map(({ role, content: messageContent }) => ({
          role,
          content: messageContent,
        })),
      );

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: answer,
        },
      ]);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudo consultar al asistente.',
      );
    } finally {
      setLoading(false);
    }
  }

  function handleQuestionKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <>
      {open && (
        <section
          className="triple-t-chat"
          role="dialog"
          aria-labelledby="triple-t-title"
        >
          <header className="triple-t-header">
            <span className="triple-t-avatar">
              <Bot size={22} aria-hidden="true" />
            </span>
            <div>
              <h2 id="triple-t-title">Triple T</h2>
              <span>Asistente de Elotes Triple T</span>
            </div>
            <button
              className="triple-t-close"
              type="button"
              aria-label="Cerrar asistente"
              onClick={() => setOpen(false)}
            >
              <X size={20} aria-hidden="true" />
            </button>
          </header>

          <div className="triple-t-messages" aria-live="polite">
            {messages.map((message) => (
              <div
                className={`triple-t-message ${message.role}`}
                key={message.id}
              >
                {message.role === 'assistant' && (
                  <span className="triple-t-message-icon">
                    <Bot size={16} aria-hidden="true" />
                  </span>
                )}
                <p>{message.content}</p>
              </div>
            ))}

            {loading && (
              <div className="triple-t-message assistant triple-t-loading">
                <span className="triple-t-message-icon">
                  <Bot size={16} aria-hidden="true" />
                </span>
                <p>Consultando...</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {error && (
            <p className="triple-t-error" role="alert">
              {error}
            </p>
          )}

          <form className="triple-t-form" onSubmit={submitQuestion}>
            <label className="triple-t-question" htmlFor="triple-t-input">
              <span>Pregunta a Triple T</span>
              <textarea
                id="triple-t-input"
                ref={textareaRef}
                rows={1}
                maxLength={600}
                value={question}
                placeholder="Escribe tu pregunta..."
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={handleQuestionKeyDown}
              />
            </label>
            <button
              className="triple-t-send"
              type="submit"
              aria-label="Enviar pregunta"
              title="Enviar pregunta"
              disabled={!question.trim() || loading}
            >
              <SendHorizontal size={20} aria-hidden="true" />
            </button>
          </form>
        </section>
      )}

      <button
        className={`triple-t-launcher ${open ? 'active' : ''}`}
        type="button"
        aria-label={open ? 'Cerrar asistente Triple T' : 'Abrir asistente Triple T'}
        aria-expanded={open}
        title="Asistente Triple T"
        onClick={() => setOpen((currentOpen) => !currentOpen)}
      >
        {open ? (
          <X size={24} aria-hidden="true" />
        ) : (
          <MessageCircle size={25} aria-hidden="true" />
        )}
      </button>
    </>
  );
}
