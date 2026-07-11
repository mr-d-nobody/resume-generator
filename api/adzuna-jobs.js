/* global process */

const ADZUNA_API_URL = 'https://api.adzuna.com/v1/api/jobs';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  const country = String(req.query.country || process.env.ADZUNA_COUNTRY || 'us')
    .toLowerCase()
    .replace(/[^a-z]/g, '');

  if (!appId || !appKey) {
    return res.status(500).json({ error: 'Adzuna credentials are not configured.' });
  }

  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    results_per_page: '50',
    'content-type': 'application/json'
  });
  const keywords = String(req.query.keywords || '').trim().slice(0, 120);
  const location = String(req.query.location || '').trim().slice(0, 120);

  if (keywords) params.set('what', keywords);
  if (location) params.set('where', location);

  try {
    const response = await fetch(`${ADZUNA_API_URL}/${country}/search/1?${params}`, { signal: AbortSignal.timeout(10000) });
    const data = await response.json();

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(502).json({
      error: error?.message || 'Unable to fetch Adzuna jobs.'
    });
  }
}
