// Upload gambar ke R2 (bucket kuttab) via binding — tanpa secret env frontend.
//
// Endpoint:
//   POST /api/upload   (multipart: files[] + category)

import { json } from './json';

function sanitizeFilename(name) {
  const base = String(name)
    .normalize('NFKD')
    .replace(/[^\w.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '');
  return base || 'file';
}

export async function handleUpload(request, env) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const formData = await request.formData();
    const category = formData.get('category')?.toString() ?? 'misc';
    const files = formData.getAll('files');

    if (!files.length) {
      return json({ error: 'Missing files' }, 400);
    }

    const urls = [];
    for (const file of files) {
      const key = `${category}-images/${Date.now()}-${sanitizeFilename(
        file.name
      )}`;
      const bytes = await file.arrayBuffer();
      await env.IMAGES.put(key, bytes, {
        httpMetadata: {
          contentType: file.type || 'application/octet-stream',
        },
      });
      urls.push(`https://files.rifkifauzi.id/${key}`);
    }

    return json({ imageUrls: urls });
  } catch (err) {
    return json(
      { error: err instanceof Error ? err.message : 'Failed to upload images' },
      500
    );
  }
}
