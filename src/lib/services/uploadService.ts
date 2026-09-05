// Upload gambar ke R2 via worker posku-d1 (binding R2, tanpa secret env frontend).
import { D1_API_URL } from '../config/d1';

export async function uploadImages(
  files: File[],
  category: string
): Promise<string[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  formData.append('category', category);

  const res = await fetch(`${D1_API_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const data = (await res.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  const data = (await res.json()) as { imageUrls?: string[] };
  return data.imageUrls ?? [];
}

export async function uploadImage(
  file: File,
  category = 'newsletters'
): Promise<string> {
  const urls = await uploadImages([file], category);
  return urls[0];
}
