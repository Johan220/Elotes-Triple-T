import { isSupabaseConfigured, supabase } from '../lib/supabase';

export type TripleTChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type TripleTResponse = {
  answer?: string;
  error?: string;
};

async function getFunctionErrorMessage(error: unknown) {
  const fallbackMessage = 'No se pudo consultar al asistente.';

  if (!error || typeof error !== 'object') {
    return fallbackMessage;
  }

  const context = (error as { context?: unknown }).context;

  if (context instanceof Response) {
    try {
      const payload = (await context.clone().json()) as TripleTResponse;
      return payload.error || fallbackMessage;
    } catch {
      return fallbackMessage;
    }
  }

  return error instanceof Error ? error.message : fallbackMessage;
}

export async function askTripleT(messages: TripleTChatMessage[]) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Configura Supabase para utilizar el asistente Triple T.');
  }

  const { data, error } = await supabase.functions.invoke<TripleTResponse>(
    'triple-t-chat',
    {
      body: { messages },
    },
  );

  if (error) {
    throw new Error(await getFunctionErrorMessage(error));
  }

  if (!data?.answer) {
    throw new Error(data?.error || 'El asistente devolvió una respuesta vacía.');
  }

  return data.answer;
}
