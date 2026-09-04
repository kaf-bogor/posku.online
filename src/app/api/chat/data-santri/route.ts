import { convertToModelMessages, type UIMessage } from 'ai';

export const maxDuration = 30;

const RAG_URL = 'https://posku-rag.kubido.workers.dev';

type SimpleMessage = { role: 'user' | 'assistant' | 'system'; content: string };

function uiToSimple(messages: UIMessage[]): SimpleMessage[] {
  return messages.map((m) => {
    const text = (m.parts ?? [])
      .filter((p) => p.type === 'text' && 'text' in p)
      .map((p) => (p as { text: string }).text)
      .join(' ')
      .trim();
    return { role: m.role as 'user' | 'assistant', content: text };
  });
}

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: UIMessage[] };

  const modelMessages = await convertToModelMessages(messages);

  // Kirim pesan (format model) ke Worker yg menjalankan retrieval + LLM Cloudflare
  const simple = modelMessages.map((m) => {
    let content = '';
    if (typeof m.content === 'string') content = m.content;
    else if (Array.isArray(m.content)) {
      content = m.content
        .map((p) => (p.type === 'text' ? p.text : ''))
        .join(' ');
    }
    return { role: m.role === 'user' ? 'user' : 'assistant', content };
  });

  let text = '';
  try {
    const res = await fetch(`${RAG_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: simple }),
    });
    if (!res.ok) throw new Error(`Worker error: ${res.status}`);
    const body = (await res.json()) as { text?: string };
    text = body.text || '';
  } catch {
    // fallback: gunakan pesan terakhir user utk tidak error di UI
    const lastUser = uiToSimple(messages)
      .reverse()
      .find((m) => m.role === 'user');
    text = `Maaf, layanan tanya data sedang tidak dapat diakses. Pertanyaan Anda: "${lastUser?.content ?? ''}"`;
  }

  // TextStreamChatTransport mengharapkan teks polos sebagai respons
  return new Response(text, {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
