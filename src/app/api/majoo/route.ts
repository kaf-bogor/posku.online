import { NextResponse } from 'next/server';

import { fetchReportingData } from './helpers';

export const GET = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || '2024-09-30'; // Default date if not provided
    const token = searchParams.get('token')!;

    const { data } = await fetchReportingData({
      date,
      token,
    });

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'max-age=10',
        'CDN-Cache-Control': 'max-age=60',
        'Vercel-CDN-Cache-Control': 'max-age=500',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'Error fetching data' },
      { status: 500 }
    );
  }
};
