import { env } from 'cloudflare:workers';

import type { LevelId, ModulId, Soal, SoalSet } from '~/lib/types/belajar';

const MODEL = '@cf/qwen/qwen3-30b-a3b-fp8';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 jam
const CACHE_VERSION = 'v6';

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
  const box = BOXES[randInt(0, BOXES.length - 1)];
  const thing = THINGS[randInt(0, THINGS.length - 1)];
  let a: number;
  let b: number;

  if (level === 'mudah') {
    // Tabel 2, 5, 10 (kelompok umur 5–7)
    const tables = [2, 5, 10];
    a = tables[randInt(0, tables.length - 1)];
    b = randInt(2, 5);
  } else if (level === 'sedang') {
    // Tabel sampai 12 & perkalian 2 angka × 1 angka (kelompok umur 7–9)
    if (randInt(0, 1) === 0) {
      a = randInt(2, 12);
      b = randInt(2, 9);
    } else {
      a = randInt(12, 49);
      b = randInt(2, 9);
    }
  } else if (randInt(0, 1) === 0) {
    // Perkalian 2 angka × 2 angka (kelompok umur 9–11)
    a = randInt(11, 29);
    b = randInt(11, 19);
  } else {
    // Perkalian 3 angka × 1 angka (kelompok umur 9–11)
    a = randInt(101, 499);
    b = randInt(2, 9);
  }

  return {
    expr: `${a} × ${b}`,
    answer: a * b,
    story: `Ada ${a} ${box}, masing-masing berisi ${b} ${thing}.`,
  };
}

function makeDivision(level: LevelId): MathSoal {
  const thing = THINGS[randInt(0, THINGS.length - 1)];
  let divisor: number;
  let quotient: number;

  if (level === 'mudah') {
    // Membagi rata dengan 2, 5, 10 (kelompok umur 5–7)
    const divisors = [2, 5, 10];
    divisor = divisors[randInt(0, divisors.length - 1)];
    quotient = randInt(2, 10);
  } else if (level === 'sedang') {
    // Pembagian 2 angka ÷ 1 angka (kelompok umur 7–9)
    divisor = randInt(2, 9);
    quotient = randInt(3, 12);
  } else {
    // Pembagian 3–4 angka ÷ 1–2 angka (kelompok umur 9–11)
    divisor = randInt(0, 1) === 0 ? randInt(2, 12) : randInt(11, 19);
    quotient = randInt(12, 60);
  }

  const total = divisor * quotient;
  return {
    expr: `${total} ÷ ${divisor}`,
    answer: quotient,
    story: `${total} ${thing} dibagi rata ke ${divisor} anak.`,
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

function levelContext(level: LevelId): string {
  if (level === 'mudah') return 'anak usia 5–7 tahun (benda & angka kecil)';
  if (level === 'sedang') return 'anak usia 7–9 tahun (kegiatan sehari-hari)';
  return 'anak usia 9–11 tahun (situasi bertingkat)';
}

async function mathStories(
  items: MathSoal[],
  level: LevelId
): Promise<string[]> {
  const fallback = items.map((i) => i.story);
  try {
    const ops = items.map((i) => `${i.expr} (${i.answer})`).join('; ');
    const konteks = levelContext(level);
    const prompt = [
      `Kamu bercerita kepada ${konteks} dengan gaya "explain like I am 5".`,
      `Buat ${items.length} kalimat cerita singkat (maksimal 15 kata) dalam Bahasa Indonesia yang mudah dibayangkan anak, sesuai operasi berikut.`,
      'Gunakan angka persis seperti yang diberikan. Pakai benda/aktivitas sehari-hari.',
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

function mathPetunjuk(modul: ModulId, level: LevelId): string {
  if (modul === 'perkalian') {
    if (level === 'mudah')
      return 'Kali = tambah berulang. Contoh 3 × 2 = 2 + 2 + 2.';
    if (level === 'sedang')
      return 'Hafalkan tabel 2–12; pecah jadi puluhan + satuan.';
    return 'Kalikan bertahap (puluhan & satuan), lalu jumlahkan hasilnya.';
  }
  if (modul === 'pembagian') {
    if (level === 'mudah')
      return 'Bagi = membagi rata ke beberapa kelompok sama banyak.';
    if (level === 'sedang')
      return 'Cek dengan perkalian: jika 4 × 6 = 24 maka 24 ÷ 4 = 6.';
    return 'Pembagian bersusun: bagi angka depan dulu, lalu turunkan angka berikutnya.';
  }
  if (modul === 'penjumlahan')
    return 'Tambah = menggabungkan, hitung semuanya ya!';
  return 'Kurang = mengambil sebagian dari jumlah awal.';
}

async function generateMathSoal(
  modul: ModulId,
  level: LevelId,
  jumlah: number
): Promise<Soal[]> {
  const items = Array.from({ length: jumlah }, () => buildMath(modul, level));
  const stories = await mathStories(items, level);

  return items.map((item, idx) => {
    const options = shuffle([item.answer, ...distractors(item.answer, 3)]);
    const jawaban = options.indexOf(item.answer);
    return {
      id: `math-${modul}-${level}-${Date.now()}-${idx}`,
      pertanyaan: `${stories[idx]} Berapa hasil dari ${item.expr}?`,
      pilihan: options.map(String),
      jawaban,
      petunjuk: mathPetunjuk(modul, level),
      pembahasan: `${item.expr} = ${item.answer}`,
    };
  });
}

// ---------- SPOK (AI) ----------
// [pertanyaan, pilihan, jawaban, petunjuk, pembahasan]
type SpokSeed = [string, string[], number, string, string];

const HINT_SUBJEK = 'Subjek = pelaku, yaitu yang melakukan kegiatan.';
const HINT_PREDIKAT = 'Predikat = kegiatan yang dilakukan pelaku.';
const HINT_OBJEK =
  'Objek = yang dikenai kegiatan, seperti "yang jadi sasaran".';
const HINT_KETERANGAN = 'Keterangan = info tempat, waktu, atau cara.';

const SPOK_BANK: Record<LevelId, SpokSeed[]> = {
  mudah: [
    [
      'Kalimat: "Adik bermain." Manakah yang menjadi pelaku (subjek)?',
      ['Adik', 'bermain', 'bola', 'rumah'],
      0,
      HINT_SUBJEK,
      'Subjek itu pelakunya. "Adik" yang melakukan kegiatan bermain.',
    ],
    [
      'Kalimat: "Ibu memasak." Kegiatan apa yang dilakukan Ibu (predikat)?',
      ['Ibu', 'memasak', 'nasi', 'dapur'],
      1,
      HINT_PREDIKAT,
      'Predikat itu kegiatannya. Ibu melakukan kegiatan "memasak".',
    ],
    [
      'Kalimat: "Burung terbang." Manakah yang menjadi pelaku (subjek)?',
      ['terbang', 'langit', 'Burung', 'sayap'],
      2,
      HINT_SUBJEK,
      'Subjek itu pelakunya. "Burung" yang melakukan kegiatan terbang.',
    ],
    [
      'Kalimat: "Ayah membaca." Manakah yang menjadi pelaku (subjek)?',
      ['membaca', 'buku', 'Ayah', 'kursi'],
      2,
      HINT_SUBJEK,
      'Subjek itu pelakunya. "Ayah" yang melakukan kegiatan membaca.',
    ],
    [
      'Kalimat: "Kucing tidur." Kegiatan apa yang dilakukan Kucing (predikat)?',
      ['Kucing', 'tidur', 'kasur', 'rumah'],
      1,
      HINT_PREDIKAT,
      'Predikat itu kegiatannya. Kucing melakukan kegiatan "tidur".',
    ],
  ],
  sedang: [
    [
      'Kalimat: "Kakak membeli buku." Kata mana yang jadi sasaran (objek)?',
      ['Kakak', 'membeli', 'buku', 'toko'],
      2,
      HINT_OBJEK,
      'Objek itu sasarannya. Yang dibeli adalah "buku".',
    ],
    [
      'Kalimat: "Adik menyapu lantai." Kegiatan apa yang dilakukan (predikat)?',
      ['Adik', 'menyapu', 'lantai', 'sapu'],
      1,
      HINT_PREDIKAT,
      'Predikat itu kegiatannya. Adik melakukan kegiatan "menyapu".',
    ],
    [
      'Kalimat: "Ayah mencuci mobil." Kata mana yang jadi sasaran (objek)?',
      ['Ayah', 'mencuci', 'mobil', 'halaman'],
      2,
      HINT_OBJEK,
      'Objek itu sasarannya. Yang dicuci adalah "mobil".',
    ],
    [
      'Kalimat: "Ibu menyiram bunga." Kata mana yang jadi sasaran (objek)?',
      ['Ibu', 'menyiram', 'bunga', 'taman'],
      2,
      HINT_OBJEK,
      'Objek itu sasarannya. Yang disiram adalah "bunga".',
    ],
    [
      'Kalimat: "Budi menulis buku." Kata mana yang jadi sasaran (objek)?',
      ['Budi', 'menulis', 'buku', 'meja'],
      2,
      HINT_OBJEK,
      'Objek itu sasarannya. Yang ditulis adalah "buku".',
    ],
  ],
  sulit: [
    [
      'Kalimat: "Ibu memasak nasi di dapur." Kata mana yang memberi info tempat (keterangan)?',
      ['Ibu', 'memasak', 'nasi', 'di dapur'],
      3,
      HINT_KETERANGAN,
      'Keterangan memberi info tempat. "di dapur" menjelaskan di mana memasaknya.',
    ],
    [
      'Kalimat: "Ayah mencuci mobil di halaman." Kata mana yang jadi sasaran (objek)?',
      ['Ayah', 'mencuci', 'mobil', 'di halaman'],
      2,
      HINT_OBJEK,
      'Objek itu sasarannya. Yang dicuci adalah "mobil".',
    ],
    [
      'Kalimat: "Pada pagi hari, Ibu memasak nasi." Manakah pelakunya (subjek)?',
      ['Pada pagi hari', 'Ibu', 'memasak', 'nasi'],
      1,
      HINT_SUBJEK,
      'Subjek itu pelakunya. "Ibu" yang melakukan kegiatan memasak.',
    ],
    [
      'Kalimat: "Kakak membaca buku di kamar." Kata mana yang memberi info tempat (keterangan)?',
      ['Kakak', 'membaca', 'buku', 'di kamar'],
      3,
      HINT_KETERANGAN,
      'Keterangan memberi info tempat. "di kamar" menjelaskan di mana membacanya.',
    ],
    [
      'Kalimat: "Setiap sore, Adik menyiram bunga." Kata mana yang memberi info waktu (keterangan)?',
      ['Setiap sore', 'Adik', 'menyiram', 'bunga'],
      0,
      HINT_KETERANGAN,
      'Keterangan memberi info waktu. "Setiap sore" menjelaskan kapan menyiramnya.',
    ],
  ],
};

function fallbackSpok(level: LevelId, jumlah: number): Soal[] {
  const base = SPOK_BANK[level];
  return Array.from({ length: jumlah }, (_, i) => {
    const [pertanyaan, pilihan, jawaban, petunjuk, pembahasan] =
      base[i % base.length];
    return {
      id: `spok-fallback-${level}-${i}`,
      pertanyaan,
      pilihan,
      jawaban,
      petunjuk,
      pembahasan,
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
      petunjuk:
        typeof o.petunjuk === 'string' && o.petunjuk.trim()
          ? o.petunjuk.trim()
          : undefined,
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
    const prompt = `Kamu guru Bahasa Indonesia untuk anak TK/SD. Gaya "explain like I am 5".
Buat ${jumlah} soal pilihan ganda tentang unsur SPOK (${spokFocus(level)}).

Analogi untuk anak:
- Subjek = PELAKU (yang melakukan kegiatan), "seperti pemain utama".
- Predikat = KEGIATAN yang dilakukan pelaku.
- Objek = SASARAN / yang dikenai kegiatan, "seperti yang jadi sasaran".
- Keterangan = info TEMPAT, WAKTU, atau CARA.

Aturan soal:
- Pakai satu kalimat pendek yang jelas dan mudah dibayangkan anak.
- Tulis kalimatnya di dalam pertanyaan dengan format: Kalimat: "...." lalu tanya.
- Pertanyaan menyebut istilah resmi + analogi, contoh: "Manakah yang menjadi pelaku (subjek)?", "Kata mana yang jadi sasaran (objek)?", "Kegiatan apa yang dilakukan (predikat)?", atau "Kata mana yang memberi info tempat/waktu (keterangan)?".
- Tepat 4 pilihan kata/frasa berbeda; hanya satu yang benar.
- "petunjuk": satu kalimat singkat pengingat, contoh "Subjek = pelaku (yang melakukan)".
- "pembahasan": jelaskan memakai analogi anak.

Balas JSON array dengan bentuk:
[{"pertanyaan":"...","pilihan":["...","...","...","..."],"jawaban":0,"petunjuk":"...","pembahasan":"..."}]
"jawaban" adalah index (0-3) pilihan yang benar.

Contoh:
[{"pertanyaan":"Kalimat: \\"Budi menulis buku.\\" Manakah yang menjadi pelaku (subjek)?","pilihan":["Budi","menulis","buku","meja"],"jawaban":0,"petunjuk":"Subjek = pelaku, yaitu yang melakukan kegiatan.","pembahasan":"Subjek itu pelakunya. Budi yang melakukan kegiatan menulis."}]`;
    const text = await runAi(prompt, 4096);
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
