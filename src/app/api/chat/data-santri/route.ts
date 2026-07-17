import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

import rawData from '~/lib/data/tahun_ajaran_2025_2026.json';

export const maxDuration = 30;

const systemPrompt = `Kamu adalah asisten data santri Kuttab Al-Fatih Bogor untuk Tahun Ajaran 2025/2026.
Jawab pertanyaan pengguna berdasarkan DATA JSON berikut. Jawab dalam Bahasa Indonesia.
Jika informasi tidak ditemukan di data, katakan bahwa data tidak tersedia.
Jawab dengan ringkas dan jelas. Gunakan format tabel atau list jika sesuai.

DATA:
${JSON.stringify(rawData, null, 0)}`;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: google('gemini-2.0-flash'),
    system: systemPrompt,
    messages,
  });

  return result.toUIMessageStreamResponse();
}
