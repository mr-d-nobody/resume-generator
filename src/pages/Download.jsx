import React, { useRef, useState } from 'react';
import { useResume } from '../contexts/ResumeContext';
// Import templates when they're available
// import { ModernTemplate, MinimalTemplate } from '../components/templates';
import ResumePreview from '../components/preview/ResumePreview';
import { Button } from '../components/ui';
import { useReactToPrint } from 'react-to-print';
import { Download as DownloadIcon, Share2 as ShareIcon } from 'lucide-react';

/**
 * Download page component
 * Handles PDF export and sharing functionality
 */
function Download() {
  const { resumeData } = useResume();
  const resumeRef = useRef(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [printLinkCount, setPrintLinkCount] = useState(0);

  // Get the appropriate template component based on selection
  const getTemplateComponent = () => {
    // For now, use ResumePreview until templates are implemented
    return <ResumePreview isPrintMode={true} />;
  };

  const prepareLinksForPrint = () => {
    const links = resumeRef.current?.querySelectorAll('a[href]') || [];
    let validLinkCount = 0;

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
        validLinkCount += 1;
      } catch {
        console.warn('Skipping invalid resume link:', rawHref);
      }
    });

    setPrintLinkCount(validLinkCount);
    return validLinkCount;
  };

  const handleExportPDF = useReactToPrint({
    contentRef: resumeRef,
    preserveAfterPrint: true,
    documentTitle: `Resume_${[
      resumeData?.personalInfo?.firstName,
      resumeData?.personalInfo?.lastName
    ].filter(Boolean).join('_') || 'Export'}`,
    pageStyle: `
      @page {
        size: A4 portrait;
        margin: 0;
      }

      @media print {
        html,
        body {
          width: 210mm;
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
        }

        .resume-container {
          width: 210mm !important;
          margin: 0 !important;
          border: 0 !important;
          box-shadow: none !important;
        }

        .resume-container > div,
        .resume-container .w-\\[210mm\\] {
          width: 210mm !important;
          max-width: 210mm !important;
          margin: 0 !important;
          box-shadow: none !important;
        }

        .resume-print-page,
        .one-page-fit-page {
          width: 210mm !important;
          height: 297mm !important;
          min-height: 297mm !important;
          max-height: 297mm !important;
          overflow: hidden !important;
          break-after: avoid-page;
          break-inside: avoid-page;
        }

        .one-page-fit-content {
          position: static !important;
          width: var(--fit-width) !important;
          max-width: none !important;
          transform: none !important;
          transform-origin: top left !important;
          zoom: var(--fit-scale);
        }
      }
    `,
    onBeforePrint: async () => {
      setIsDownloading(true);
      setDownloadSuccess(false);
      prepareLinksForPrint();
      await document.fonts?.ready;
    },
    onAfterPrint: () => {
      setIsDownloading(false);
      setDownloadSuccess(true);
    },
    onPrintError: (error) => {
      console.error('Print error:', error);
      setIsDownloading(false);
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Download & Share
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Export your resume as PDF or share it with others.
          </p>
        </div>
        
        <div className="card p-6 mb-8">
          <div className="mb-5 rounded-lg border border-amber-300 bg-amber-50 p-4 text-center text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100">
            <p className="font-semibold">To keep hyperlinks clickable</p>
            <p className="mt-1">
              In Chrome’s print window choose <strong>Destination → Save to PDF</strong>.
              Do not choose <strong>Microsoft Print to PDF</strong>—it removes hyperlink annotations.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              onClick={() => {
                prepareLinksForPrint();
                handleExportPDF();
              }}
              className="flex items-center gap-2"
              disabled={isDownloading}
            >
              <DownloadIcon size={18} />
              {isDownloading ? 'Preparing...' : 'Print / Save as PDF'}
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
          
          {downloadSuccess && (
            <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md text-center border border-blue-200">
              <p className="font-medium">Print dialog opened!</p>
              <p className="text-sm mt-1">
                Choose Chrome <strong>Save to PDF</strong>, not Microsoft Print to PDF. {printLinkCount > 0
                  ? `${printLinkCount} clickable link${printLinkCount === 1 ? '' : 's'} prepared.`
                  : 'No valid hyperlinks were found.'}
              </p>
            </div>
          )}
        </div>
        
        <div className="mb-8 bg-white p-2 shadow-lg rounded-lg no-print">
          <div className="text-center mb-4 p-2 bg-gray-100 rounded">
            <p className="text-sm text-gray-600">Preview (This is how your resume will appear in the PDF)</p>
          </div>
          
          <div className="overflow-x-auto pb-4">
            <div ref={resumeRef} className="resume-container bg-white w-fit mx-auto border border-gray-200 shadow-sm">
              {getTemplateComponent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Download;
