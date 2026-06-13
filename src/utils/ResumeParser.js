import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

// Disable the Web Worker entirely to fix iOS/Mobile WebKit compatibility issues.
// This forces PDF.js to parse the PDF on the main thread, which is completely fine for 1-2 page resumes.
pdfjsLib.GlobalWorkerOptions.workerSrc = '';

/**
 * Extracts raw text from a PDF file
 */
export async function extractTextFromPDF(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
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
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    // Remove trailing slash if it exists to prevent double slashes
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    
    const response = await fetch(`${cleanBaseUrl}/api/parse-resume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        raw_text: rawText,
        resume_type: resumeType
      })
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Too many requests. Please try again later.');
      }
      throw new Error(`Server responded with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error calling backend API:', error);
    throw new Error(error.message || 'Failed to parse resume with AI. Ensure the backend server is running.');
  }
}
