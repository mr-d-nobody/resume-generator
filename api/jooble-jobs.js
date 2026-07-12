/* global process */

const JOOBLE_API_URL = 'https://jooble.org/api';
const APIFY_API_URL = 'https://api.apify.com/v2';
const DEFAULT_APIFY_ACTOR = 'curious_coder~linkedin-jobs-scraper';

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function apifyRequest(path, token, options = {}) {
  return fetch(`${APIFY_API_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    },
    signal: AbortSignal.timeout(9000)
  });
}

function linkedinSearchUrl(req) {
  const params = new URLSearchParams({ position: '1', pageNum: '0' });
  const keywords = String(req.query.keywords || '').trim().slice(0, 120);
  const location = String(req.query.location || '').trim().slice(0, 120);
  if (keywords) params.set('keywords', keywords);
  if (location) params.set('location', location);
  return `https://www.linkedin.com/jobs/search/?${params}`;
}

async function handleLinkedIn(req, res) {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'Apify credentials are not configured.' });
  }

  const actorId = process.env.APIFY_LINKEDIN_ACTOR_ID || DEFAULT_APIFY_ACTOR;
  const runId = String(req.query.runId || '').trim();

  try {
    if (!runId) {
      const count = clamp(Number(req.query.count) || 50, 10, 100);
      const response = await apifyRequest(`/acts/${encodeURIComponent(actorId)}/runs`, token, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urls: [linkedinSearchUrl(req)],
          count,
          scrapeCompany: true,
          splitByLocation: false
        })
      });
      const data = await response.json();
      if (!response.ok || !data.data?.id) {
        return res.status(response.status || 502).json({ error: data.error?.message || 'Unable to start the LinkedIn scraper.' });
      }
      return res.status(202).json({ status: data.data.status || 'RUNNING', runId: data.data.id });
    }

    const response = await apifyRequest(`/actor-runs/${encodeURIComponent(runId)}`, token);
    const data = await response.json();
    if (!response.ok || !data.data) {
      return res.status(response.status || 502).json({ error: data.error?.message || 'Unable to check the LinkedIn scraper.' });
    }

    const run = data.data;
    if (run.status === 'SUCCEEDED') {
      if (!run.defaultDatasetId) return res.status(200).json({ status: 'SUCCEEDED', items: [] });
      const datasetResponse = await apifyRequest(
        `/datasets/${encodeURIComponent(run.defaultDatasetId)}/items?clean=true&limit=100`,
        token
      );
      const items = await datasetResponse.json();
      if (!datasetResponse.ok || !Array.isArray(items)) {
        return res.status(datasetResponse.status || 502).json({ error: 'Unable to read LinkedIn scraper results.' });
      }
      return res.status(200).json({ status: 'SUCCEEDED', items });
    }

    if (['FAILED', 'ABORTED', 'TIMED-OUT'].includes(run.status)) {
      return res.status(502).json({ error: `LinkedIn scraper ${String(run.status).toLowerCase()}.` });
    }

    return res.status(200).json({ status: run.status || 'RUNNING', runId });
  } catch (error) {
    return res.status(502).json({ error: error?.message || 'Unable to fetch LinkedIn jobs.' });
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  if (String(req.query.source || '').toLowerCase() === 'linkedin') {
    return handleLinkedIn(req, res);
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
