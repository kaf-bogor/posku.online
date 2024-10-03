export async function fetchReportingData({
  date,
  token,
}: {
  date: string;
  token: string;
}) {
  const response = await fetch(
    `https://services.majoo.id/svc-data-reporting/api/v1/dashboard_sales/summary/graph?period=month&date=${date}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}
