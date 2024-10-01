import { NextResponse } from 'next/server';

const TOKEN =
  'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjIxMDAzNjQiLCJjYWJhbmdfaWQiOiI2Njg2OTAiLCJ1c2VybmFtZSI6IkluZHJhIFRoYW1yaW4iLCJpYXQiOjE3Mjc3NDcwOTksImV4cCI6MTcyNzgzMzQ5OX0.rCiG3eyVdAy7bo7smBK_GhkzTT8XceeV-tmpAbqrE1M';

export const GET = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || '2024-09-30'; // Default date if not provided

    const response = await fetch(
      `https://services.majoo.id/svc-data-reporting/api/v1/dashboard_sales/summary/graph?period=month&date=${date}`,
      {
        headers: {
          Authorization: TOKEN,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Error fetching data' },
      { status: 500 }
    );
  }
};
