const HIMALAYAS_API_URL = 'https://himalayas.app/jobs/api/search';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const params = new URLSearchParams();
  const query = String(req.query.q || '').trim();
  const limit = String(req.query.limit || '50').trim();

  if (query) params.set('q', query);
  params.set('limit', limit);

  try {
    const response = await fetch(`${HIMALAYAS_API_URL}?${params}`);
    const data = await response.json();

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(502).json({
      error: error?.message || 'Unable to fetch Himalayas jobs.'
    });
  }
}
