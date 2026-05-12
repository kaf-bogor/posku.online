import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { notFound } from 'next/navigation';

import type { DonationPage } from '~/lib/types/donation';
import { generateSlug } from '~/lib/utils/slug';

import DonationDetailClient from './DonationDetailClient';

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '';
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '';
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://posku.online';

type FValue =
  | { stringValue: string }
  | { integerValue: string }
  | { doubleValue: number }
  | { booleanValue: boolean }
  | { nullValue: null }
  | { timestampValue: string }
  | { arrayValue: { values?: FValue[] } }
  | { mapValue: { fields?: Record<string, FValue> } };

function fromFValue(v: FValue): unknown {
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('timestampValue' in v) return v.timestampValue;
  if ('nullValue' in v) return null;
  if ('arrayValue' in v)
    return (v.arrayValue.values ?? []).map((item) => fromFValue(item));
  if ('mapValue' in v) {
    const obj: Record<string, unknown> = {};
    Object.entries(v.mapValue.fields ?? {}).forEach(([k, fv]) => {
      obj[k] = fromFValue(fv);
    });
    return obj;
  }
  return null;
}

function docToType(doc: {
  name: string;
  fields?: Record<string, FValue>;
}): DonationPage {
  const id = doc.name.split('/').pop() ?? '';
  const data: Record<string, unknown> = { id };
  Object.entries(doc.fields ?? {}).forEach(([k, v]) => {
    data[k] = fromFValue(v);
  });
  return data as unknown as DonationPage;
}

async function fetchDonation(slugOrId: string): Promise<DonationPage | null> {
  try {
    // 1. Try query by slug field
    const queryRes = await fetch(`${BASE_URL}:runQuery?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'donations' }],
          where: {
            fieldFilter: {
              field: { fieldPath: 'slug' },
              op: 'EQUAL',
              value: { stringValue: slugOrId },
            },
          },
          limit: 1,
        },
      }),
      next: { revalidate: 60 },
    });

    if (queryRes.ok) {
      const queryData = await queryRes.json();
      const firstDoc = queryData[0]?.document;
      if (firstDoc) return docToType(firstDoc);
    }

    // 2. Fallback: fetch by document ID
    const idRes = await fetch(
      `${BASE_URL}/donations/${slugOrId}?key=${API_KEY}`,
      { next: { revalidate: 60 } }
    );
    if (idRes.ok) {
      const idData = await idRes.json();
      if (idData.name) return docToType(idData);
    }

    // 3. Fallback: scan collection and match generateSlug(title) for docs
    //    that were created before the slug field was introduced
    const allRes = await fetch(
      `${BASE_URL}/donations?key=${API_KEY}&pageSize=100`,
      { next: { revalidate: 60 } }
    );
    if (allRes.ok) {
      const allData = await allRes.json();
      const match = (
        allData.documents as Array<{
          name: string;
          fields?: Record<string, FValue>;
        }>
      )?.find((document) => {
        const titleField = document.fields?.title;
        const title =
          titleField && 'stringValue' in titleField
            ? titleField.stringValue
            : '';
        return generateSlug(title) === slugOrId;
      });
      if (match) return docToType(match);
    }
  } catch {
    // ignore fetch errors — notFound() called below
  }

  return null;
}

const getCachedDonation = (slugOrId: string) =>
  unstable_cache(() => fetchDonation(slugOrId), [`donation-${slugOrId}`], {
    revalidate: 300,
    tags: ['donations'],
  })();

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const campaign = await getCachedDonation(params.id);

  if (!campaign) {
    return {
      title: 'Amal tidak ditemukan | POSKU Al-Fatih Bogor',
    };
  }

  const raised = (campaign.donors || []).reduce((sum, d) => sum + d.value, 0);
  const percent = campaign.target
    ? Math.min(100, Math.round((raised / campaign.target) * 100))
    : 0;

  const plainSummary = campaign.summary
    ? campaign.summary.replace(/<[^>]*>/g, '').slice(0, 160)
    : `Bantu wujudkan ${campaign.title}. ${percent}% tercapai dari target.`;

  const canonicalSlug = campaign.slug || params.id;
  const pageUrl = `${SITE_URL}/amal/${canonicalSlug}`;
  const ogImage =
    campaign.imageUrls?.[0] ?? `${SITE_URL}/icons/icon-512x512.png`;

  return {
    title: `${campaign.title} | POSKU Al-Fatih Bogor`,
    description: plainSummary,
    alternates: { canonical: pageUrl },
    openGraph: {
      type: 'website',
      url: pageUrl,
      title: campaign.title,
      description: plainSummary,
      siteName: 'POSKU Al-Fatih Bogor',
      images: [{ url: ogImage, width: 1200, height: 630, alt: campaign.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: campaign.title,
      description: plainSummary,
      images: [ogImage],
    },
  };
}

export default async function DonationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const campaign = await getCachedDonation(params.id);

  if (!campaign) {
    notFound();
  }

  return <DonationDetailClient campaign={campaign} />;
}
