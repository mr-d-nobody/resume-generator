/* global process, Buffer */

const TEMPLATE_IDS = new Set(['11', '12', '13', '14', '15', '16']);
const MAX_PAYLOAD_BYTES = 900_000;
const EXPORT_WINDOW_MS = 10 * 60 * 1000;
const EXPORTS_PER_USER_WINDOW = 8;
const EXPORTS_PER_IP_WINDOW = 20;
const MAX_CONCURRENT_EXPORTS = 2;
const rateBuckets = new Map();
let activeExports = 0;

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    return JSON.parse(req.body || '{}');
  }
  return req.body;
}

function getAppOrigin() {
  const configured = String(process.env.PDF_RENDER_ORIGIN || '').replace(/\/$/, '');
  const allowed = String(process.env.PDF_RENDER_ALLOWED_ORIGINS || '')
    .split(',').map((value) => value.trim().replace(/\/$/, '')).filter(Boolean);
  if (!configured) throw Object.assign(new Error('PDF_RENDER_ORIGIN is not configured.'), { statusCode: 503 });
  let origin;
  try {
    origin = new URL(configured).origin;
  } catch {
    throw Object.assign(new Error('PDF_RENDER_ORIGIN is invalid.'), { statusCode: 503 });
  }
  if (!allowed.includes(origin)) throw Object.assign(new Error('PDF render origin is not allowlisted.'), { statusCode: 503 });
  return origin;
}

function getCookie(cookies, name) {
  const match = String(cookies || '').split(';').map((value) => value.trim()).find((value) => value.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : '';
}

function getClientIp(req) {
  return String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
}

function consumeRate(key, limit) {
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || now - bucket.startedAt >= EXPORT_WINDOW_MS) {
    rateBuckets.set(key, { startedAt: now, count: 1 });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

async function authenticateRequest(req, appOrigin) {
  const cookies = req.headers.cookie || '';
  const csrfCookie = getCookie(cookies, 'csrftoken');
  const csrfHeader = String(req.headers['x-csrftoken'] || '');
  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    throw Object.assign(new Error('CSRF validation failed.'), { statusCode: 403 });
  }
  const response = await fetch(`${appOrigin}/api/auth/me`, {
    headers: { Cookie: cookies, Accept: 'application/json' },
    signal: AbortSignal.timeout(5000),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.authenticated || !data.user?.id) {
    throw Object.assign(new Error('Authentication required.'), { statusCode: 401 });
  }
  return data.user;
}

async function withTimeout(promise, timeoutMs, message) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(message)), timeoutMs); }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

function normalizePayload(body) {
  const templateId = TEMPLATE_IDS.has(String(body.templateId || body.selectedTemplate))
    ? String(body.templateId || body.selectedTemplate)
    : '12';

  return {
    resumeData: body.resumeData || {},
    selectedTemplate: templateId,
    templateCategory: body.templateCategory || 'all',
    customization: body.customization || {}
  };
}

export { getAppOrigin, normalizePayload };

async function launchBrowser() {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const [{ default: chromium }, { default: puppeteer }] = await Promise.all([
      import('@sparticuz/chromium'),
      import('puppeteer-core')
    ]);

    return puppeteer.launch({
      args: [
        ...chromium.args,
        '--font-render-hinting=none',
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ],
      defaultViewport: { width: 1280, height: 720, deviceScaleFactor: 1 },
      executablePath: await chromium.executablePath(),
      headless: chromium.headless
    });
  }

  const { default: puppeteer } = await import('puppeteer');
  return puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 720, deviceScaleFactor: 1 }
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  let browser;
  let ownsConcurrencySlot = false;

  try {
    const rawLength = Number(req.headers['content-length'] || 0);
    if (rawLength > MAX_PAYLOAD_BYTES) {
      return res.status(413).json({ error: 'Resume payload is too large to export.' });
    }

    const appOrigin = getAppOrigin();
    const user = await authenticateRequest(req, appOrigin);
    const clientIp = getClientIp(req);
    if (!consumeRate(`user:${user.id}`, EXPORTS_PER_USER_WINDOW) || !consumeRate(`ip:${clientIp}`, EXPORTS_PER_IP_WINDOW)) {
      res.setHeader('Retry-After', String(Math.ceil(EXPORT_WINDOW_MS / 1000)));
      return res.status(429).json({ error: 'PDF export limit reached. Wait before trying again.' });
    }
    if (activeExports >= MAX_CONCURRENT_EXPORTS) {
      res.setHeader('Retry-After', '10');
      return res.status(503).json({ error: 'PDF export is busy. Try again shortly.' });
    }
    activeExports += 1;
    ownsConcurrencySlot = true;

    const payload = normalizePayload(parseBody(req));
    const cachePayload = {
      cacheVersion: 1,
      data: payload,
      revision: 0,
      updatedAt: null,
      syncedHash: ''
    };
    const printUrl = `${appOrigin}/print-resume?template=${encodeURIComponent(payload.selectedTemplate)}`;

    browser = await launchBrowser();
    const page = await browser.newPage();
    await page.evaluateOnNewDocument((storedPayload) => {
      localStorage.setItem('savedResume:guest', JSON.stringify(storedPayload));
      localStorage.setItem('darkMode', 'false');
    }, cachePayload);

    const { pageCount, pdfBuffer } = await withTimeout((async () => {
      await page.goto(printUrl, { waitUntil: 'networkidle0', timeout: 20_000 });
      await page.waitForSelector('[data-resume-ready="true"]', { timeout: 15_000 });
      await page.evaluate(() => document.fonts?.ready);
      await new Promise((resolve) => setTimeout(resolve, 250));
      return {
        pageCount: await page.$$eval('[data-resume-preview-page]', (nodes) => nodes.length),
        pdfBuffer: await page.pdf({
          format: 'A4', printBackground: true, preferCSSPageSize: true,
          margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' }
        }),
      };
    })(), 45_000, 'PDF export timed out.');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Resume-Page-Count', String(pageCount || 1));
    return res.status(200).send(Buffer.from(pdfBuffer));
  } catch (error) {
    console.error('PDF export failed:', error);
    return res.status(error?.statusCode || 500).json({
      error: error?.message || 'Could not generate the PDF.'
    });
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
    if (ownsConcurrencySlot) activeExports = Math.max(0, activeExports - 1);
  }
}
