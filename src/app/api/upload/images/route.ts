import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const POST = async (req: Request) => {
  try {
    const formData = await req.formData();
    const category = formData.get('category')?.toString() ?? 'misc';

    const files = formData.getAll('files') as File[];
    if (!files.length || !category) {
      return NextResponse.json(
        { error: 'Missing files or category' },
        { status: 400 }
      );
    }

    const urls = await Promise.all(
      files.map(async (file) => {
        const pathname = `/${category}-images/${Date.now()}-${file.name}`;
        const blob = await put(pathname, file, {
          access: 'public',
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });
        return blob.url;
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
