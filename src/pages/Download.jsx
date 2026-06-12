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
  const { resumeData, selectedTemplate } = useResume();
  const resumeRef = useRef(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Get the appropriate template component based on selection
  const getTemplateComponent = () => {
    // For now, use ResumePreview until templates are implemented
    return <ResumePreview isPrintMode={true} />;
  };

  const handleExportPDF = useReactToPrint({
    contentRef: resumeRef,
    documentTitle: `Resume_${resumeData?.personal?.name?.replace(/\s+/g, '_') || 'Export'}`,
    onBeforeGetContent: () => {
      setIsDownloading(true);
      setDownloadSuccess(false);
      return Promise.resolve();
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
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              onClick={() => handleExportPDF()} 
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
              <p className="text-sm mt-1">Please select <strong>"Save as PDF"</strong> as your destination to save the file with clickable links.</p>
            </div>
          )}
        </div>
        
        <div className="mb-8 bg-white p-2 shadow-lg rounded-lg no-print">
          <div className="text-center mb-4 p-2 bg-gray-100 rounded">
            <p className="text-sm text-gray-600">Preview (This is how your resume will appear in the PDF)</p>
          </div>
          
          <div ref={resumeRef} className="resume-container bg-white">
            {getTemplateComponent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Download;