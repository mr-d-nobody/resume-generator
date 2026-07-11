/* global process */

const JOOBLE_API_URL = 'https://jooble.org/api';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const apiKey = process.env.JOOBLE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Jooble credentials are not configured.' });
  }

  const payload = {
    keywords: String(req.query.keywords || '').trim().slice(0, 120),
    location: String(req.query.location || '').trim().slice(0, 120),
    page: 1
  };

  try {
    const response = await fetch(`${JOOBLE_API_URL}/${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000)
    });
    const data = await response.json();

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(502).json({
      error: error?.message || 'Unable to fetch Jooble jobs.'
    });
  }
}
