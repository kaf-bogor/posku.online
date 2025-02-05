import { NextResponse } from 'next/server';

export const GET = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const branch = searchParams.get('branch');

    let email;
    let password;

    switch (branch) {
      case 'LD':
        email = process.env.EMAIL_LD;
        password = process.env.PASSWORD_LD;
        break;
      case 'ATS':
        email = process.env.EMAIL_ATS;
        password = process.env.PASSWORD_ATS;
        break;
      default:
        return NextResponse.json(
          { message: 'Invalid branch' },
          { status: 500 }
        );
    }

    const response = await fetch('https://mayang.majoo.id/0_0_11/user/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        is_cms: 1,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'max-age=3600',
        'CDN-Cache-Control': 'max-age=3600',
        'Vercel-CDN-Cache-Control': 'max-age=36000',
      },
    });
    /* eslint-disable-next-line */
  } catch (error) {
    return NextResponse.json(
      { message: 'Error fetching data' },
      { status: 500 }
    );
  }
};
