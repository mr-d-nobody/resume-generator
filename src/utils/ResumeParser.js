import { ensureCsrfCookie } from './authApi';

let pdfLibraryPromise;

async function getPdfLibrary() {
  if (!pdfLibraryPromise) {
    pdfLibraryPromise = Promise.all([
      import('pdfjs-dist/legacy/build/pdf.js'),
      import('pdfjs-dist/legacy/build/pdf.worker.min.js?url'),
    ]).then(([pdfModule, workerModule]) => {
      pdfModule.GlobalWorkerOptions.workerSrc = workerModule.default;
      return pdfModule;
    });
  }
  return pdfLibraryPromise;
}

function getCookie(name) {
  const prefix = `${name}=`;
  const cookie = document.cookie
    .split(';')
    .map(value => value.trim())
    .find(value => value.startsWith(prefix));
  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : '';
}

/**
 * Extracts raw text from a PDF file
 */
export async function extractTextFromPDF(file) {
  try {
    const pdfjsLib = await getPdfLibrary();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      const annotations = await page.getAnnotations();
      const embeddedUrls = annotations
        .filter(annotation => annotation.subtype === 'Link')
        .map(annotation => annotation.url || annotation.unsafeUrl || '')
        .filter(Boolean);
      const uniqueUrls = [...new Set(embeddedUrls)];

      fullText += pageText + '\n';
      if (uniqueUrls.length > 0) {
        fullText += `Embedded hyperlinks on page ${i}:\n${uniqueUrls.join('\n')}\n`;
      }
    }
    
    return fullText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF. Please ensure the file is a valid PDF document.');
  }
}

/**
 * Sends the raw text to our secure Django backend to intelligently parse it into our structured format.
 */
export async function parseResumeWithAI(rawText, resumeType = 'experienced') {
  try {
    // Ensure we have a CSRF cookie before making the POST request.
    if (!getCookie('csrftoken')) {
      await ensureCsrfCookie();
    }

    // Always use relative URL — the Django API lives on the same Vercel domain.
    // For local dev, run Django on port 8000 and use Vite's proxy feature instead.
    const response = await fetch('/api/parse-resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken'),
      },
      credentials: 'include',
      signal: AbortSignal.timeout(35000),
      body: JSON.stringify({ 
        raw_text: rawText,
        resume_type: resumeType
      })
    });

    if (!response.ok) {
      let errorMessage = '';

      try {
        const errorData = await response.json();
        errorMessage = typeof errorData?.error === 'string'
          ? errorData.error
          : (typeof errorData?.detail === 'string' ? errorData.detail : '');
      } catch {
        // The server may return a non-JSON response for infrastructure errors.
      }

      if (!errorMessage && response.status === 429) {
        errorMessage = 'Too many resume parsing requests. Please wait and try again.';
      }

      throw new Error(errorMessage || `Resume parsing failed (HTTP ${response.status}).`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error calling backend API:', error);
    throw new Error(error.message || 'Failed to parse resume with AI. Ensure the backend server is running.');
  }
}
