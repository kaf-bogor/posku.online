import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { notFound } from 'next/navigation';

import type { DonationPage } from '~/lib/types/donation';
import { generateSlug } from '~/lib/utils/slug';

import DonationDetailClient from './DonationDetailClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://poskubogor.com';

async function fetchDonation(slugOrId: string): Promise<DonationPage | null> {
  try {
    const base =
      process.env.NEXT_PUBLIC_D1_API_URL ||
      'https://posku-d1.kubido.workers.dev';
    const res = await fetch(
      `${base}/api/donations/${encodeURIComponent(slugOrId)}`,
      {
        headers: { Accept: 'application/json' },
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) return null;
    return (await res.json()) as DonationPage;
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

  const canonicalSlug =
    campaign.slug || generateSlug(campaign.title) || params.id;
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
