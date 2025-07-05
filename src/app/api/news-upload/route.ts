/* eslint-disable no-console */
import { handleUpload } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const response = await handleUpload({
      request,
      token: {
        // Use environment variables for the token configuration
        // These will need to be set in your Vercel project settings
        allowedContentTypes: [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/gif',
        ],
        pathname: '/news-images',
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error handling news image upload:', error);
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    );
  }
}
