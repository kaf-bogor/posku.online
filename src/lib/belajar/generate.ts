import { env } from 'cloudflare:workers';

import type { LevelId, ModulId, Soal, SoalSet } from '~/lib/types/belajar';

const MODEL = '@cf/qwen/qwen3-30b-a3b-fp8';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 jam
const CACHE_VERSION = 'v4';

// ---------- util ----------
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function runAi(prompt: string, maxTokens = 4096): Promise<string> {
  const resp = (await env.AI.run(MODEL, {
    messages: [
      {
        role: 'system',
        content:
          'Kamu guru SD di Indonesia. Jawab HANYA dengan JSON valid, tanpa penjelasan tambahan.',
      },
      { role: 'user', content: prompt },
    ],
    max_tokens: maxTokens,
  })) as {
    response?: unknown;
    text?: unknown;
    choices?: { message?: { content?: unknown } }[];
  };

  // qwen3 mengembalikan hasil di `response` (string/array) dan/atau
  // `choices[0].message.content` (string). Normalisasi ke string JSON.
  const candidates = [
    resp.response,
    resp.choices?.[0]?.message?.content,
    resp.text,
  ];
  for (let i = 0; i < candidates.length; i += 1) {
    const c = candidates[i];
    if (typeof c === 'string' && c.trim()) return c;
    if (c != null) {
      try {
        return JSON.stringify(c);
      } catch {
        // lanjut kandidat berikutnya
      }
    }
  }
  return '';
}

function extractJsonArray(text: string): unknown[] | null {
  const cleaned = text.replace(/```json/gi, '```').replace(/```/g, '');
  const start = cleaned.indexOf('[');
  const end = cleaned.lastIndexOf(']');
  if (start < 0 || end < 0) return null;
  try {
    const arr = JSON.parse(cleaned.slice(start, end + 1)) as unknown;
    return Array.isArray(arr) ? arr : null;
  } catch {
    return null;
  }
}

// ---------- cache ----------
async function readCache(key: string): Promise<Soal[] | null> {
  try {
    const row = await env.DB.prepare(
      'SELECT payload, created_at FROM belajar_soal_cache WHERE cache_key = ?'
    )
      .bind(key)
      .first<{ payload: string; created_at: string }>();
    if (!row) return null;
    if (Date.now() - Date.parse(row.created_at) > CACHE_TTL_MS) return null;
    const parsed = JSON.parse(row.payload) as Soal[];
    return Array.isArray(parsed) && parsed.length ? parsed : null;
  } catch {
    return null;
  }
}

async function writeCache(key: string, soal: Soal[]): Promise<void> {
  try {
    await env.DB.prepare(
      `INSERT INTO belajar_soal_cache (cache_key, payload, created_at)
       VALUES (?, ?, ?)
       ON CONFLICT(cache_key) DO UPDATE SET
         payload = excluded.payload,
         created_at = excluded.created_at`
    )
      .bind(key, JSON.stringify(soal), new Date().toISOString())
      .run();
  } catch {
    // abaikan kegagalan cache
  }
}

// ---------- matematika (jawaban dihitung server, akurat) ----------
interface MathSoal {
  expr: string;
  answer: number;
  story: string;
}

const NAMES = ['Ani', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fajar', 'Gita', 'Hana'];
const THINGS = ['kelereng', 'permen', 'buku', 'pensil', 'apel', 'jeruk', 'kue'];
const BOXES = ['kotak', 'keranjang', 'kantong', 'piring', 'kelompok'];

function pick(level: LevelId, easy: number, mid: number, hard: number): number {
  if (level === 'mudah') return easy;
  if (level === 'sedang') return mid;
  return hard;
}

function makeAddition(level: LevelId): MathSoal {
  const max = pick(level, 10, 50, 300);
  const a = randInt(1, max);
  const b = randInt(1, max);
  const name = NAMES[randInt(0, NAMES.length - 1)];
  const thing = THINGS[randInt(0, THINGS.length - 1)];
  return {
    expr: `${a} + ${b}`,
    answer: a + b,
    story: `${name} memiliki ${a} ${thing}, lalu mendapat ${b} ${thing} lagi.`,
  };
}

function makeSubtraction(level: LevelId): MathSoal {
  const max = pick(level, 15, 80, 400);
  const a = randInt(2, max);
  const b = randInt(1, a - 1);
  const name = NAMES[randInt(0, NAMES.length - 1)];
  const thing = THINGS[randInt(0, THINGS.length - 1)];
  return {
    expr: `${a} − ${b}`,
    answer: a - b,
    story: `${name} punya ${a} ${thing}, lalu ${b} ${thing} diberikan kepada teman.`,
  };
}

function makeMultiplication(level: LevelId): MathSoal {
  const a = pick(level, randInt(2, 5), randInt(2, 9), randInt(3, 12));
  const b = pick(level, randInt(2, 5), randInt(2, 9), randInt(4, 15));
  const box = BOXES[randInt(0, BOXES.length - 1)];
  const thing = THINGS[randInt(0, THINGS.length - 1)];
  return {
    expr: `${a} × ${b}`,
    answer: a * b,
    story: `Ada ${a} ${box}, masing-masing berisi ${b} ${thing}.`,
  };
}

function makeDivision(level: LevelId): MathSoal {
  const b = pick(level, randInt(2, 5), randInt(2, 9), randInt(3, 12));
  const q = pick(level, randInt(2, 5), randInt(3, 12), randInt(5, 20));
  const r = level === 'sulit' ? randInt(0, b - 1) : 0;
  const total = b * q + r;
  const thing = THINGS[randInt(0, THINGS.length - 1)];
  const sisa = r > 0 ? ' (ada sisa)' : '';
  return {
    expr: `${total} ÷ ${b}`,
    answer: q,
    story: `${total} ${thing} dibagi rata ke ${b} anak${sisa}.`,
  };
}

function buildMath(modul: ModulId, level: LevelId): MathSoal {
  if (modul === 'penjumlahan') return makeAddition(level);
  if (modul === 'pengurangan') return makeSubtraction(level);
  if (modul === 'perkalian') return makeMultiplication(level);
  return makeDivision(level);
}

function distractors(answer: number, count: number): number[] {
  const set = new Set<number>();
  const candidates = [
    answer + 1,
    answer - 1,
    answer + 2,
    answer - 2,
    answer + 10,
    answer - 10,
    answer * 2,
    Math.max(0, answer - 3),
  ];
  const shuffled = shuffle(candidates);
  for (let i = 0; i < shuffled.length && set.size < count; i += 1) {
    const c = shuffled[i];
    if (c >= 0 && c !== answer && !set.has(c)) set.add(c);
  }
  while (set.size < count) {
    const c = answer + randInt(1, 12);
    if (c !== answer && !set.has(c)) set.add(c);
  }
  return Array.from(set).slice(0, count);
}

async function mathStories(items: MathSoal[]): Promise<string[]> {
  const fallback = items.map((i) => i.story);
  try {
    const ops = items.map((i) => `${i.expr} (${i.answer})`).join('; ');
    const prompt = [
      `Buat ${items.length} kalimat cerita singkat (maksimal 15 kata) dalam Bahasa Indonesia untuk anak SD, sesuai operasi berikut.`,
      'Gunakan angka persis seperti yang diberikan.',
      'Balas JSON array of string, contoh: ["...", "..."].',
      `Operasi: ${ops}`,
    ].join('\n');
    const text = await runAi(prompt, 1024);
    const arr = extractJsonArray(text);
    if (!arr || arr.length < items.length) return fallback;
    return items.map((_, idx) => {
      const s = arr[idx];
      return typeof s === 'string' && s.trim() ? s.trim() : fallback[idx];
    });
  } catch {
    return fallback;
  }
}

async function generateMathSoal(
  modul: ModulId,
  level: LevelId,
  jumlah: number
): Promise<Soal[]> {
  const items = Array.from({ length: jumlah }, () => buildMath(modul, level));
  const stories = await mathStories(items);

  return items.map((item, idx) => {
    const options = shuffle([item.answer, ...distractors(item.answer, 3)]);
    const jawaban = options.indexOf(item.answer);
    return {
      id: `math-${modul}-${level}-${Date.now()}-${idx}`,
      pertanyaan: `${stories[idx]} Berapa hasil dari ${item.expr}?`,
      pilihan: options.map(String),
      jawaban,
      pembahasan: `${item.expr} = ${item.answer}`,
    };
  });
}

// ---------- SPOK (AI) ----------
type SpokSeed = [string, string[], number];

const SPOK_BANK: Record<LevelId, SpokSeed[]> = {
  mudah: [
    [
      'Pada kalimat "Adik bermain.", manakah subjeknya?',
      ['Adik', 'bermain', 'bola', 'rumah'],
      0,
    ],
    [
      'Pada kalimat "Ibu memasak.", manakah predikatnya?',
      ['Ibu', 'memasak', 'nasi', 'dapur'],
      1,
    ],
    [
      'Pada kalimat "Burung terbang.", manakah subjeknya?',
      ['terbang', 'langit', 'Burung', 'sayap'],
      2,
    ],
  ],
  sedang: [
    [
      'Pada kalimat "Kakak membeli buku.", manakah objeknya?',
      ['Kakak', 'membeli', 'buku', 'toko'],
      2,
    ],
    [
      'Pada kalimat "Adik menyapu lantai.", manakah predikatnya?',
      ['Adik', 'menyapu', 'lantai', 'sapu'],
      1,
    ],
    [
      'Pada kalimat "Ayah mencuci mobil.", manakah objeknya?',
      ['Ayah', 'mencuci', 'mobil', 'halaman'],
      2,
    ],
  ],
  sulit: [
    [
      'Pada kalimat "Ibu memasak nasi di dapur.", manakah keterangannya?',
      ['Ibu', 'memasak', 'nasi', 'di dapur'],
      3,
    ],
    [
      'Pada kalimat "Ayah mencuci mobil di halaman.", manakah objeknya?',
      ['Ayah', 'mencuci', 'mobil', 'di halaman'],
      2,
    ],
    [
      'Pada kalimat "Pada pagi hari, Ibu memasak nasi.", manakah subjeknya?',
      ['Pada pagi hari', 'Ibu', 'memasak', 'nasi'],
      1,
    ],
  ],
};

function fallbackSpok(level: LevelId, jumlah: number): Soal[] {
  const base = SPOK_BANK[level];
  return Array.from({ length: jumlah }, (_, i) => {
    const [pertanyaan, pilihan, jawaban] = base[i % base.length];
    return {
      id: `spok-fallback-${level}-${i}`,
      pertanyaan,
      pilihan,
      jawaban,
      pembahasan: `Jawaban: ${pilihan[jawaban]}`,
    };
  });
}

function sanitizeSpok(items: unknown[], level: LevelId): Soal[] {
  const out: Soal[] = [];
  items.forEach((it, i) => {
    if (!it || typeof it !== 'object') return;
    const o = it as Record<string, unknown>;
    const pertanyaan =
      typeof o.pertanyaan === 'string' ? o.pertanyaan.trim() : '';
    const pilihan = Array.isArray(o.pilihan)
      ? o.pilihan
          .filter((x): x is string => typeof x === 'string')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    const jawaban = Number(o.jawaban);
    if (!pertanyaan || pilihan.length !== 4) return;
    if (!Number.isInteger(jawaban) || jawaban < 0 || jawaban > 3) return;
    out.push({
      id: `spok-${level}-${Date.now()}-${i}`,
      pertanyaan,
      pilihan,
      jawaban,
      pembahasan:
        typeof o.pembahasan === 'string' ? o.pembahasan.trim() : undefined,
    });
  });
  return out;
}

function spokFocus(level: LevelId): string {
  if (level === 'mudah') return 'subjek dan predikat';
  if (level === 'sedang') return 'subjek, predikat, dan objek';
  return 'subjek, predikat, objek, dan keterangan';
}

async function generateSpokSoal(
  level: LevelId,
  jumlah: number
): Promise<Soal[]> {
  try {
    const prompt = `Buat ${jumlah} soal pilihan ganda Bahasa Indonesia tentang unsur SPOK (${spokFocus(
      level
    )}) untuk anak SD.
Setiap soal: satu kalimat pendek, lalu tanya salah satu unsur (subjek/predikat/objek/keterangan).
Balas JSON array dengan bentuk:
[{"pertanyaan":"...","pilihan":["...","...","...","..."],"jawaban":0,"pembahasan":"..."}]
Aturan: tepat 4 pilihan, "jawaban" adalah index (0-3) pilihan yang benar, bahasa sederhana.`;
    const text = await runAi(prompt, 2048);
    const arr = extractJsonArray(text);
    const soal = arr ? sanitizeSpok(arr, level) : [];
    if (soal.length >= Math.min(3, jumlah)) {
      const extra = fallbackSpok(level, jumlah);
      let k = 0;
      while (soal.length < jumlah) {
        soal.push(extra[k % extra.length]);
        k += 1;
      }
      return soal.slice(0, jumlah);
    }
  } catch {
    // jatuh ke fallback
  }
  return fallbackSpok(level, jumlah);
}

// ---------- entry ----------
export async function getSoalSet(
  modul: ModulId,
  level: LevelId,
  jumlah: number
): Promise<SoalSet> {
  const key = `${CACHE_VERSION}:${modul}:${level}:${jumlah}`;
  const cached = await readCache(key);
  if (cached) return { modul, level, soal: cached };

  const soal =
    modul === 'spok'
      ? await generateSpokSoal(level, jumlah)
      : await generateMathSoal(modul, level, jumlah);

  await writeCache(key, soal);
  return { modul, level, soal };
}
