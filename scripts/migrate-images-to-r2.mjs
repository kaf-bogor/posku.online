import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { cert, initializeApp as initializeAdminApp } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const VERCEL_BLOB = 'https://gtxkitey0g3yotdg.public.blob.vercel-storage.com';
const R2_ACCOUNT_ID =
  process.env.R2_ACCOUNT_ID ?? '27a967e72df3a8b03d272cab0cd7a213';
const R2_BUCKET = process.env.R2_BUCKET_NAME ?? 'kuttab';
const R2_PUBLIC = process.env.R2_PUBLIC_URL ?? 'https://files.rifkifauzi.id';
const R2_ENDPOINT = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
if (!accessKeyId || !secretAccessKey) {
  console.error('❌ Missing R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY env vars.');
  process.exit(1);
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: { accessKeyId, secretAccessKey },
});

let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
  serviceAccount = JSON.parse(
    await readFile(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8')
  );
} else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  console.error(
    '❌ Missing FIREBASE_SERVICE_ACCOUNT (JSON) or FIREBASE_SERVICE_ACCOUNT_PATH.'
  );
  process.exit(1);
}

const db = getAdminFirestore(
  initializeAdminApp({ credential: cert(serviceAccount) })
);

const root = fileURLToPath(new URL('..', import.meta.url));

const download = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${res.status}: ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  return {
    buf,
    contentType: res.headers.get('content-type') || 'application/octet-stream',
  };
};

const upload = async (key, buf, contentType) => {
  await s3.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buf,
      ContentType: contentType,
    })
  );
};

const migrateOne = async (sourceUrl, key) => {
  try {
    const { buf, contentType } = await download(sourceUrl);
    await upload(key, buf, contentType);
    return `${R2_PUBLIC}/${key}`;
  } catch (err) {
    console.warn(`  [warn] ${err.message}`);
    return null;
  }
};

const safeDecode = (value) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const keyFromUrl = (url) =>
  safeDecode(new URL(url).pathname.replace(/^\//, ''));

let staticCount = 0;
let newsletterCount = 0;
let firestoreCount = 0;

async function migrateStatic() {
  const paths = [
    'logo_posku.png',
    'mc_light.png',
    'mc_dark.png',
    'promo%20maqom%202025.webp',
    'bilistiwa.jpg',
    'wakaf_ats%2Fgallery_1.png',
  ];
  for (const p of paths) {
    const key = safeDecode(p);
    const out = await migrateOne(`${VERCEL_BLOB}/${p}?alt=media`, key);
    if (!out) {
      console.warn(`  [skip] ${p}`);
      continue;
    }
    console.log(`  [static] ${p} -> ${out}`);
    staticCount += 1;
  }
}

async function migrateNewsletterJson() {
  const path = `${root}src/lib/data/newsletter.json`;
  const items = JSON.parse(await readFile(path, 'utf8'));
  for (const item of items) {
    if (!item.image_url) continue;
    const source = `${VERCEL_BLOB}/${item.image_url}`;
    const key = safeDecode(item.image_url.split('?')[0]);
    const out = await migrateOne(source, key);
    if (!out) {
      console.warn(`  [skip] ${item.image_url}`);
      continue;
    }
    item.image_url = key;
    console.log(`  [newsletter] ${item.image_url} -> ${out}`);
    newsletterCount += 1;
  }
  await writeFile(path, `${JSON.stringify(items, null, 2)}\n`);
}

async function migrateFirestore() {
  const collections = ['news', 'events', 'donations'];
  for (const name of collections) {
    const snap = await db.collection(name).get();
    for (const d of snap.docs) {
      const data = d.data();
      if (!Array.isArray(data.imageUrls) || data.imageUrls.length === 0) {
        continue;
      }
      const newUrls = [];
      let changed = false;
      for (const u of data.imageUrls) {
        if (typeof u !== 'string' || !u.includes('blob.vercel-storage.com')) {
          newUrls.push(u);
          continue;
        }
        const key = keyFromUrl(u);
        const out = await migrateOne(u, key);
        if (!out) {
          newUrls.push(u);
          continue;
        }
        newUrls.push(out);
        changed = true;
        firestoreCount += 1;
        console.log(`  [${name}/${d.id}] ${key} -> ${out}`);
      }
      if (changed) {
        await d.ref.update({ imageUrls: newUrls });
      }
    }
  }
}

async function rewriteBaseUrl() {
  const files = [
    `${root}src/lib/context/baseUrl.ts`,
    `${root}src/app/manifest.ts`,
  ];
  for (const path of files) {
    const content = await readFile(path, 'utf8');
    const next = content.replace(new RegExp(VERCEL_BLOB, 'g'), R2_PUBLIC);
    if (next !== content) {
      await writeFile(path, next);
      console.log(`  [code] ${path} -> ${R2_PUBLIC}`);
    }
  }

  // Decode %2F path references so they resolve on R2 custom domain.
  const wakafPath = `${root}src/app/amal/wakaf_ats/page.tsx`;
  const wakaf = await readFile(wakafPath, 'utf8');
  const wakafNext = wakaf.replace('wakaf_ats%2Fgallery_1.png', 'wakaf_ats/gallery_1.png');
  if (wakafNext !== wakaf) {
    await writeFile(wakafPath, wakafNext);
    console.log(`  [code] ${wakafPath}: decoded %2F path`);
  }
}

async function main() {
  const onlyFirestore = process.argv.includes('--firestore');
  console.log('Migrating images from Vercel Blob -> Cloudflare R2\n');

  if (!onlyFirestore) {
    console.log('1/3 Static images...');
    await migrateStatic();

    console.log('\n2/3 Newsletter JSON...');
    await migrateNewsletterJson();
  } else {
    console.log('Skipping static & newsletter (already migrated).');
  }

  console.log('\n3/3 Firestore (news/events/donations)...');
  await migrateFirestore();

  if (!onlyFirestore) {
    console.log('\nRewriting code references...');
    await rewriteBaseUrl();
  }

  console.log('\n✅ Done.');
  console.log(`   static: ${staticCount}`);
  console.log(`   newsletter: ${newsletterCount}`);
  console.log(`   firestore: ${firestoreCount}`);
}

main().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
