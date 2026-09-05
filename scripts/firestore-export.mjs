// Firestore -> Cloudflare D1 (JSON-table) export script.
//
// Membaca semua collection yang dipakai app POSKU dari Firestore, lalu
// menghasilkan file .sql per collection berisi:
//   CREATE TABLE IF NOT EXISTS "fs_<collection>" (id TEXT PRIMARY KEY, data TEXT NOT NULL);
//   INSERT INTO "fs_<collection>" (id, data) VALUES (...);
//
// Prefix "fs_" (dapat diubah via env TABLE_PREFIX) mencegah bentrok dengan
// tabel D1 yang sudah ada, mis. tabel "kelas" (santri) vs collection Firestore
// "kelas" (wakaf per kelas).
//
// Bentuk tabel "JSON" dipilih supaya struktur dokumen Firestore (map/array/
// timestamp) tidak hilang saat dipindah ke D1 (SQLite). Data tetap bisa
// di-query via JSON1: SELECT json_extract(data, '$.title') FROM fs_news;
//
// Cara pakai:
//   FIREBASE_SERVICE_ACCOUNT_PATH=/path/ke/service-account.json \
//     node scripts/firestore-export.mjs [collection1 collection2 ...]
//
// Env:
//   FIREBASE_SERVICE_ACCOUNT_PATH - path file service account JSON (atau)
//   FIREBASE_SERVICE_ACCOUNT       - JSON lengkap service account
//   FIREBASE_PROJECT_ID            - override project id (default dari service account)
//   OUT_DIR                        - folder output (default: d1/firestore)
//   TABLE_PREFIX                   - prefix nama tabel (default: fs_)

import { readFile, mkdir, writeFile, rm } from 'node:fs/promises';
import { createSign } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SCOPE = 'https://www.googleapis.com/auth/cloud-platform';
const TABLE_PREFIX = process.env.TABLE_PREFIX ?? 'fs_';

// Koleksi yang aktif dipakai aplikasi (dari hasil pemindaian kode).
const DEFAULT_COLLECTIONS = [
  'users',
  'admin',
  'quizzes',
  'quiz_attempts',
  'news',
  'events',
  'donations',
  'newsletters',
  'comments',
  'attendanceEvents',
  'attendanceRecords',
  'kelas',
];

const PAGE_SIZE = 300;
const INSERT_BATCH = 200;

const root = fileURLToPath(new URL('..', import.meta.url));
const outDir = process.env.OUT_DIR ?? `${root}d1/firestore`;

// ---------- service account ----------
async function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    return JSON.parse(
      await readFile(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8')
    );
  }
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }
  throw new Error(
    'Missing FIREBASE_SERVICE_ACCOUNT (JSON) or FIREBASE_SERVICE_ACCOUNT_PATH.'
  );
}

// ---------- OAuth via JWT (RS256), tanpa dependency ----------
const b64url = (buf) =>
  Buffer.from(buf).toString('base64url');

async function getAccessToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    })
  );
  const signer = createSign('RSA-SHA256');
  signer.update(`${header}.${claims}`);
  signer.end();
  const signature = signer.sign(sa.private_key, 'base64url');

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${header}.${claims}.${signature}`,
    }),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(`Token error ${res.status}: ${JSON.stringify(body)}`);
  }
  return body.access_token;
}

// ---------- decode dokumen Firestore (REST "fields") -> plain JSON ----------
function fromFValue(v) {
  if (v === null || typeof v !== 'object') return null;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return Number(v.doubleValue);
  if ('booleanValue' in v) return v.booleanValue;
  if ('timestampValue' in v) return v.timestampValue; // ISO string
  if ('nullValue' in v) return null;
  if ('referenceValue' in v) return v.referenceValue;
  if ('bytesValue' in v) return v.bytesValue;
  if ('geoPointValue' in v) return v.geoPointValue;
  if ('arrayValue' in v) {
    return (v.arrayValue.values ?? []).map((item) => fromFValue(item));
  }
  if ('mapValue' in v) {
    const obj = {};
    for (const [k, fv] of Object.entries(v.mapValue.fields ?? {})) {
      obj[k] = fromFValue(fv);
    }
    return obj;
  }
  return null;
}

function docIdFromName(name) {
  return name.split('/').pop();
}

// ---------- ambil semua dokumen 1 collection (pagination) ----------
async function listCollection(projectId, token, collection) {
  const base = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${encodeURIComponent(collection)}`;
  const docs = [];
  let pageToken = null;

  for (let page = 0; page < 1000; page += 1) {
    const usp = new URLSearchParams({ pageSize: String(PAGE_SIZE) });
    if (pageToken) usp.set('pageToken', pageToken);

    const res = await fetch(`${base}?${usp}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 404) return { ok: true, empty: true }; // collection belum ada
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`List ${collection} -> ${res.status}: ${body}`);
    }

    const data = await res.json();
    for (const doc of data.documents ?? []) {
      docs.push({
        id: docIdFromName(doc.name),
        data: fromFValue({ mapValue: { fields: doc.fields } }),
      });
    }

    pageToken = data.nextPageToken ?? null;
    if (!pageToken) break;
  }

  return { ok: true, empty: false, docs };
}

// ---------- build SQL ----------
const sqlStr = (s) => `'${String(s).replace(/'/g, "''")}'`;

function buildSql(label, table, docs) {
  const lines = [];
  lines.push(`-- ${label}: ${docs.length} dokumen`);
  lines.push(`CREATE TABLE IF NOT EXISTS "${table}" (`);
  lines.push(`  id   TEXT PRIMARY KEY,`);
  lines.push(`  data TEXT NOT NULL`);
  lines.push(`);`);
  lines.push('');

  for (let i = 0; i < docs.length; i += INSERT_BATCH) {
    const chunk = docs.slice(i, i + INSERT_BATCH);
    const rows = chunk
      .map((d) => `(${sqlStr(d.id)}, ${sqlStr(JSON.stringify(d.data))})`)
      .join(',\n');
    lines.push(`INSERT INTO "${table}" (id, data) VALUES`);
    lines.push(`${rows};`);
    lines.push('');
  }

  return lines.join('\n');
}

// ---------- main ----------
async function main() {
  const requested = process.argv.slice(2);
  const collections =
    requested.length > 0 ? requested : DEFAULT_COLLECTIONS;

  const sa = await loadServiceAccount();
  const projectId = process.env.FIREBASE_PROJECT_ID ?? sa.project_id;
  const token = await getAccessToken(sa);

  await mkdir(outDir, { recursive: true });
  // bersihkan hasil lama agar file yang sudah tidak dipakai tidak menyesatkan
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  console.log(`Project: ${projectId}`);
  console.log(`Output : ${outDir}\n`);

  const summary = [];
  for (const collection of collections) {
    process.stdout.write(`- ${collection} ... `);
    try {
      const { empty, docs } = await listCollection(projectId, token, collection);
      if (empty) {
        console.log('0 dokumen (collection belum ada)');
        summary.push({ collection, count: 0 });
        continue;
      }
      const table = TABLE_PREFIX + collection;
      const sql = buildSql(collection, table, docs);
      await writeFile(`${outDir}/${collection}.sql`, sql, 'utf8');
      console.log(`${docs.length} dokumen`);
      summary.push({ collection, count: docs.length });
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
      summary.push({ collection, count: -1 });
    }
  }

  const total = summary
    .filter((s) => s.count > 0)
    .reduce((sum, s) => sum + s.count, 0);
  console.log(`\nSelesai. ${summary.length} collection, ${total} dokumen.`);
  console.log('\nImport ke D1 (remote):');
  for (const s of summary) {
    if (s.count > 0) {
      console.log(`  npx wrangler d1 execute posku-db --remote --file=d1/firestore/${s.collection}.sql`);
    }
  }
  if (total === 0) {
    console.log('  (tidak ada data untuk diimpor)');
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((err) => {
    console.error('Export gagal:', err.message);
    process.exit(1);
  });
}

export { buildSql, fromFValue, docIdFromName };
