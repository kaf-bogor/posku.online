import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

import {
  R2_ACCESS_KEY_ID,
  R2_BUCKET_NAME,
  R2_ENDPOINT,
  R2_PUBLIC_URL,
  R2_SECRET_ACCESS_KEY,
} from '~/lib/config/r2';

function sanitizeFilename(name: string): string {
  const base = name
    .normalize('NFKD')
    .replace(/[^\w.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '');
  return base || 'file';
}

export const POST = async (req: Request) => {
  try {
    if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
      return NextResponse.json(
        { error: 'R2 credentials are not configured' },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const category = formData.get('category')?.toString() ?? 'misc';

    const files = formData.getAll('files') as File[];
    if (!files.length) {
      return NextResponse.json({ error: 'Missing files' }, { status: 400 });
    }

    const s3 = new S3Client({
      region: 'auto',
      endpoint: R2_ENDPOINT,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });

    const urls = await Promise.all(
      files.map(async (file) => {
        const key = `${category}-images/${Date.now()}-${sanitizeFilename(
          file.name
        )}`;
        const buffer = Buffer.from(await file.arrayBuffer());

        await s3.send(
          new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: file.type || 'application/octet-stream',
          })
        );

        return `${R2_PUBLIC_URL}/${key}`;
      })
    );

    return NextResponse.json({ imageUrls: urls }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to upload images' },
      { status: 500 }
    );
  }
};
