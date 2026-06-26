import React, { useRef, useState } from 'react';
import { useResume } from '../contexts/ResumeContext';
import ResumePreview from '../components/preview/ResumePreview';
import { Button } from '../components/ui';
import { Download as DownloadIcon, Share2 as ShareIcon } from 'lucide-react';

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
function clampChannel(value) {
  return Math.round(Math.min(255, Math.max(0, value * 255)));
}

function linearSrgbToSrgb(value) {
  return value <= 0.0031308
    ? 12.92 * value
    : 1.055 * Math.pow(value, 1 / 2.4) - 0.055;
}

function oklchToRgb(color) {
  return color.replace(/oklch\(\s*([0-9.]+%?)\s+([0-9.]+)\s+([0-9.]+)(?:deg)?(?:\s*\/\s*([0-9.]+%?))?\s*\)/gi, (
    _match,
    lightnessValue,
    chromaValue,
    hueValue,
    alphaValue
  ) => {
    const lightness = lightnessValue.endsWith('%')
      ? parseFloat(lightnessValue) / 100
      : parseFloat(lightnessValue);
    const chroma = parseFloat(chromaValue);
    const hue = (parseFloat(hueValue) * Math.PI) / 180;
    const alpha = alphaValue
      ? (alphaValue.endsWith('%') ? parseFloat(alphaValue) / 100 : parseFloat(alphaValue))
      : 1;
    const a = chroma * Math.cos(hue);
    const b = chroma * Math.sin(hue);

    const lPrime = lightness + 0.3963377774 * a + 0.2158037573 * b;
    const mPrime = lightness - 0.1055613458 * a - 0.0638541728 * b;
    const sPrime = lightness - 0.0894841775 * a - 1.291485548 * b;
    const l = lPrime ** 3;
    const m = mPrime ** 3;
    const s = sPrime ** 3;

    const red = linearSrgbToSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s);
    const green = linearSrgbToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s);
    const blue = linearSrgbToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s);

    return alpha >= 1
      ? `rgb(${clampChannel(red)}, ${clampChannel(green)}, ${clampChannel(blue)})`
      : `rgba(${clampChannel(red)}, ${clampChannel(green)}, ${clampChannel(blue)}, ${alpha})`;
  });
}

function oklabToRgb(color) {
  return color.replace(/oklab\(\s*([0-9.]+%?)\s+(-?[0-9.]+)\s+(-?[0-9.]+)(?:\s*\/\s*([0-9.]+%?))?\s*\)/gi, (
    _match,
    lightnessValue,
    aValue,
    bValue,
    alphaValue
  ) => {
    const lightness = lightnessValue.endsWith('%')
      ? parseFloat(lightnessValue) / 100
      : parseFloat(lightnessValue);
    const a = parseFloat(aValue);
    const b = parseFloat(bValue);
    const alpha = alphaValue
      ? (alphaValue.endsWith('%') ? parseFloat(alphaValue) / 100 : parseFloat(alphaValue))
      : 1;

    const lPrime = lightness + 0.3963377774 * a + 0.2158037573 * b;
    const mPrime = lightness - 0.1055613458 * a - 0.0638541728 * b;
    const sPrime = lightness - 0.0894841775 * a - 1.291485548 * b;
    const l = lPrime ** 3;
    const m = mPrime ** 3;
    const s = sPrime ** 3;

    const red = linearSrgbToSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s);
    const green = linearSrgbToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s);
    const blue = linearSrgbToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s);

    return alpha >= 1
      ? `rgb(${clampChannel(red)}, ${clampChannel(green)}, ${clampChannel(blue)})`
      : `rgba(${clampChannel(red)}, ${clampChannel(green)}, ${clampChannel(blue)}, ${alpha})`;
  });
}

function sanitizeStyleValue(property, value) {
  if (!value || value === 'transparent' || value === 'currentcolor') return value;
  let sanitized = value.includes('oklch(') ? oklchToRgb(value) : value;
  sanitized = sanitized.includes('oklab(') ? oklabToRgb(sanitized) : sanitized;

  if (/oklch\(|oklab\(|color-mix\(/i.test(sanitized)) {
    if (property.includes('shadow')) return 'none';
    if (property.includes('background')) return 'transparent';
    return 'rgb(0, 0, 0)';
  }

  return sanitized;
}

function inlineComputedStyles(sourceElement, clonedElement) {
  const computed = window.getComputedStyle(sourceElement);

  for (let index = 0; index < computed.length; index += 1) {
    const property = computed[index];
    if (property.startsWith('--')) continue;

    const value = sanitizeStyleValue(property, computed.getPropertyValue(property));
    if (!value) continue;
    clonedElement.style.setProperty(
      property,
      value,
      computed.getPropertyPriority(property)
    );
  }

  clonedElement.style.boxShadow = 'none';
  clonedElement.style.textShadow = 'none';
}

function sanitizeCanvasClone(sourceRoot, clonedRoot) {
  const sourceElements = [sourceRoot, ...sourceRoot.querySelectorAll('*')];
  const clonedElements = [clonedRoot, ...clonedRoot.querySelectorAll('*')];

  sourceElements.forEach((sourceElement, index) => {
    const clonedElement = clonedElements[index];
    if (!clonedElement) return;
    inlineComputedStyles(sourceElement, clonedElement);
  });
}

function removeClonedStylesheets(clonedDocument) {
  clonedDocument
    .querySelectorAll('style, link[rel="stylesheet"]')
    .forEach((node) => node.remove());
}

function Download() {
  const { resumeData } = useResume();
  const resumeRef = useRef(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const getDocumentTitle = () => `Resume_${[
    resumeData?.personalInfo?.firstName,
    resumeData?.personalInfo?.lastName
  ].filter(Boolean).join('_') || 'Export'}`;

  const prepareLinksForPdf = () => {
    const links = resumeRef.current?.querySelectorAll('a[href]') || [];
    const validLinks = [];

    links.forEach((link) => {
      const rawHref = link.getAttribute('href')?.trim();
      if (!rawHref || rawHref === '#') return;

      try {
        const absoluteHref = /^(mailto:|tel:)/i.test(rawHref)
          ? rawHref
          : new URL(rawHref, window.location.origin).href;
        link.setAttribute('href', absoluteHref);
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
        validLinks.push({ element: link, href: absoluteHref });
      } catch {
        console.warn('Skipping invalid resume link:', rawHref);
      }
    });

    return validLinks;
  };

  const handleExportPDF = async () => {
    const resumeElement = resumeRef.current?.querySelector('.one-page-fit-page')
      || resumeRef.current?.querySelector('.resume-print-page')
      || resumeRef.current;

    if (!resumeElement) return;

    try {
      setIsDownloading(true);
      setDownloadSuccess(false);
      setDownloadMessage('');
      await document.fonts?.ready;

      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);
      const links = prepareLinksForPdf();
      const pageRect = resumeElement.getBoundingClientRect();
      const canvas = await html2canvas(resumeElement, {
        backgroundColor: '#ffffff',
        scale: Math.min(3, Math.max(2, window.devicePixelRatio || 1)),
        useCORS: true,
        logging: false,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
        onclone: (clonedDocument) => {
          const clonedElement = clonedDocument.querySelector('.one-page-fit-page')
            || clonedDocument.querySelector('.resume-print-page')
            || clonedDocument.querySelector('.resume-container');
          if (clonedElement) {
            sanitizeCanvasClone(resumeElement, clonedElement);
          }
          removeClonedStylesheets(clonedDocument);
        }
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      pdf.addImage(
        canvas.toDataURL('image/jpeg', 0.98),
        'JPEG',
        0,
        0,
        A4_WIDTH_MM,
        A4_HEIGHT_MM,
        undefined,
        'FAST'
      );

      links.forEach(({ element, href }) => {
        const rect = element.getBoundingClientRect();
        const left = Math.max(rect.left, pageRect.left);
        const top = Math.max(rect.top, pageRect.top);
        const right = Math.min(rect.right, pageRect.right);
        const bottom = Math.min(rect.bottom, pageRect.bottom);

        if (right <= left || bottom <= top) return;

        pdf.link(
          ((left - pageRect.left) / pageRect.width) * A4_WIDTH_MM,
          ((top - pageRect.top) / pageRect.height) * A4_HEIGHT_MM,
          ((right - left) / pageRect.width) * A4_WIDTH_MM,
          ((bottom - top) / pageRect.height) * A4_HEIGHT_MM,
          { url: href }
        );
      });

      pdf.save(`${getDocumentTitle()}.pdf`);
      setDownloadMessage(
        links.length > 0
          ? `Downloaded one-page PDF with ${links.length} clickable link${links.length === 1 ? '' : 's'}.`
          : 'Downloaded one-page PDF.'
      );
      setDownloadSuccess(true);
    } catch (error) {
      console.error('PDF export error:', error);
      setDownloadMessage(`Could not generate the PDF: ${error?.message || 'Please try again.'}`);
      setDownloadSuccess(false);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Download & Share
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Export your resume as a deterministic one-page PDF.
          </p>
        </div>

        <div className="card p-6 mb-8">
          <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50 p-4 text-center text-sm text-blue-950 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-100">
            <p className="font-semibold">One-page PDF export</p>
            <p className="mt-1">
              The app generates the PDF directly, so browser print scaling will not distort the resume.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              onClick={handleExportPDF}
              className="flex items-center gap-2"
              disabled={isDownloading}
            >
              <DownloadIcon size={18} />
              {isDownloading ? 'Generating...' : 'Download PDF'}
            </Button>

            <Button
              variant="secondary"
              className="flex items-center gap-2"
              onClick={() => alert('Sharing functionality will be implemented in a future update.')}
              disabled={isDownloading}
            >
              <ShareIcon size={18} />
              Share Resume
            </Button>
          </div>

          {downloadMessage && (
            <div className={`mt-4 rounded-md border p-3 text-center ${
              downloadSuccess
                ? 'border-blue-200 bg-blue-50 text-blue-800'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}>
              <p className="font-medium">{downloadMessage}</p>
            </div>
          )}
        </div>

        <div className="mb-8 bg-white p-2 shadow-lg rounded-lg no-print">
          <div className="text-center mb-4 p-2 bg-gray-100 rounded">
            <p className="text-sm text-gray-600">Preview (This is how your resume will appear in the PDF)</p>
          </div>

          <div className="overflow-x-auto pb-4">
            <div ref={resumeRef} className="resume-container bg-white w-fit mx-auto border border-gray-200 shadow-sm">
              <ResumePreview isPrintMode={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Download;
