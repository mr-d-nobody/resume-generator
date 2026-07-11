const HIMALAYAS_API_URL = 'https://himalayas.app/jobs/api/search';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const params = new URLSearchParams();
  const query = String(req.query.q || '').trim().slice(0, 120);
  const limit = String(Math.min(50, Math.max(1, Number(req.query.limit) || 50)));

  if (query) params.set('q', query);
  params.set('limit', limit);

  try {
    const response = await fetch(`${HIMALAYAS_API_URL}?${params}`, { signal: AbortSignal.timeout(10000) });
    const data = await response.json();

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(502).json({
      error: error?.message || 'Unable to fetch Himalayas jobs.'
    });
  }
}
