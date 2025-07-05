import { handleUpload } from '@vercel/blob/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // This function is called before a client token is generated.
        // It's a good place to add authentication and authorization.

        return {
          allowedContentTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
          ],
          pathname,
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // This callback is called after the upload is completed.
        // You can use this to update your database with the blob details.
        // eslint-disable-next-line no-console
        console.log('Blob upload completed:', blob, tokenPayload);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Server error: ${message}` },
      { status: 400 }
    );
  }
}
