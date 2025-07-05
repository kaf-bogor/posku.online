'use server';

import { put } from '@vercel/blob';

/**
 * Uploads multiple files to Vercel Blob Storage using server-side function.
 * @param files Array of File/Blob objects (usually from FormData or file inputs)
 * @param category Folder name like "event", "news", "donation"
 * @returns array of blob URLs
 */
export async function uploadImages(
  files: File[] | Blob[],
  category: string
): Promise<string[]> {
  return Promise.all(
    files.map(async (file) => {
      const filename = `${Date.now()}-${(file as File).name ?? 'upload.dat'}`;
      const pathname = `/${category}-images/${filename}`;

      const blob = await put(pathname, file, {
        access: 'public',
      });

      return blob.url;
    })
  );
}
