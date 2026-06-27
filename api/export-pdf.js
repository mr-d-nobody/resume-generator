/* global process, Buffer */

const TEMPLATE_IDS = new Set(['11', '12', '13', '14', '15', '16']);
const MAX_PAYLOAD_BYTES = 900_000;

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    return JSON.parse(req.body || '{}');
  }
  return req.body;
}

function getAppOrigin(req) {
  if (process.env.PDF_RENDER_ORIGIN) {
    return process.env.PDF_RENDER_ORIGIN.replace(/\/$/, '');
  }

  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || (String(host).includes('localhost') ? 'http' : 'https');
  return `${protocol}://${host}`;
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

  try {
    const rawLength = Number(req.headers['content-length'] || 0);
    if (rawLength > MAX_PAYLOAD_BYTES) {
      return res.status(413).json({ error: 'Resume payload is too large to export.' });
    }

    const payload = normalizePayload(parseBody(req));
    const cachePayload = {
      cacheVersion: 1,
      data: payload,
      revision: 0,
      updatedAt: null,
      syncedHash: ''
    };
    const appOrigin = getAppOrigin(req);
    const printUrl = `${appOrigin}/print-resume?template=${encodeURIComponent(payload.selectedTemplate)}`;

    browser = await launchBrowser();
    const page = await browser.newPage();
    await page.evaluateOnNewDocument((storedPayload) => {
      localStorage.setItem('savedResume:guest', JSON.stringify(storedPayload));
      localStorage.setItem('darkMode', 'false');
    }, cachePayload);

    await page.goto(printUrl, { waitUntil: 'networkidle0', timeout: 45_000 });
    await page.waitForSelector('[data-resume-ready="true"]', { timeout: 30_000 });
    await page.evaluate(() => document.fonts?.ready);
    await new Promise((resolve) => setTimeout(resolve, 250));

    const pageCount = await page.$$eval('[data-resume-preview-page]', (nodes) => nodes.length);
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Resume-Page-Count', String(pageCount || 1));
    return res.status(200).send(Buffer.from(pdfBuffer));
  } catch (error) {
    console.error('PDF export failed:', error);
    return res.status(500).json({
      error: error?.message || 'Could not generate the PDF.'
    });
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}
