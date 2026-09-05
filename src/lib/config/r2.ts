export const R2_ACCOUNT_ID =
  process.env.R2_ACCOUNT_ID ?? '27a967e72df3a8b03d272cab0cd7a213';

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME ?? 'kuttab';

export const R2_ENDPOINT = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

export const R2_PUBLIC_URL =
  process.env.R2_PUBLIC_URL ?? 'https://files.rifkifauzi.id';

export const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID ?? '';
export const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY ?? '';
