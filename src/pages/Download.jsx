import React, { useRef, useState } from 'react';
import { useResume } from '../contexts/ResumeContext';
// Import templates when they're available
// import { ModernTemplate, MinimalTemplate } from '../components/templates';
import ResumePreview from '../components/preview/ResumePreview';
import { Button } from '../components/ui';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Download as DownloadIcon, Share2 as ShareIcon } from 'lucide-react';

/**
 * Download page component
 * Handles PDF export and sharing functionality
 */
function Download() {
  const { resumeData, selectedTemplate } = useResume();
  const resumeRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Get the appropriate template component based on selection
  const getTemplateComponent = () => {
    // For now, use ResumePreview until templates are implemented
    return <ResumePreview />;
    /* Original implementation to be restored when templates are available
    switch (selectedTemplate) {
      case 'minimal':
        return <MinimalTemplate resumeData={resumeData} />;
      case 'modern':
      default:
        return <ModernTemplate resumeData={resumeData} />;
    }
    */
  };

  // Handle PDF export
  const handleExportPDF = async () => {
    if (!resumeRef.current) {
      console.error('Resume reference is not available');
      return;
    }
    
    setIsGenerating(true);
    setDownloadSuccess(false);
    
    try {
      console.log('Starting PDF generation...');
      
      // Create a clone of the resume element to modify its styles
      const resumeClone = resumeRef.current.cloneNode(true);
      
      // Apply a style to override any modern color functions with standard colors
      const styleOverride = document.createElement('style');
      styleOverride.textContent = `
        * {
          color: #000000 !important;
          background-color: #ffffff !important;
          border-color: #000000 !important;
        }
        .text-blue-600 {
          color: #2563eb !important;
        }
        .border-blue-600 {
          border-color: #2563eb !important;
        }
        .bg-blue-600 {
          background-color: #2563eb !important;
        }
        .text-gray-600, .text-gray-700, .text-gray-800, .text-gray-900 {
          color: #4b5563 !important;
        }
        .bg-gray-100, .bg-gray-200 {
          background-color: #f3f4f6 !important;
        }
      `;
      
      // Append the style override to the clone
      resumeClone.appendChild(styleOverride);
      
      // Temporarily append the clone to the document to render it
      resumeClone.style.position = 'absolute';
      resumeClone.style.left = '-9999px';
      document.body.appendChild(resumeClone);
      
      // Create canvas from the cloned resume element
      const canvas = await html2canvas(resumeClone, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: true, // Enable logging for debugging
        backgroundColor: '#ffffff',
        allowTaint: true,
        onclone: (clonedDoc) => {
          // Additional style modifications can be done here if needed
          console.log('Document cloned for PDF generation');
        }
      });
      
      // Remove the clone from the document
      document.body.removeChild(resumeClone);
      
      console.log('Canvas generated successfully');
      
      // Calculate dimensions for A4 size
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // If the resume is longer than one page, add additional pages
      if (imgHeight > pageHeight) {
        let heightLeft = imgHeight - pageHeight;
        let position = -pageHeight;
        
        while (heightLeft > 0) {
          position = position - pageHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
      }
      
      // Generate filename with timestamp
      const fileName = `resume_${new Date().toISOString().slice(0, 10)}.pdf`;
      console.log('Saving PDF as:', fileName);
      
      // Save the PDF
      pdf.save(fileName);
      
      console.log('PDF generated successfully');
      setDownloadSuccess(true);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Error generating PDF: ${error.message}`);
    } finally {
      setIsGenerating(false);
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
            Export your resume as PDF or share it with others.
          </p>
        </div>
        
        <div className="card p-6 mb-8">
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              onClick={handleExportPDF} 
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              <DownloadIcon size={18} />
              {isGenerating ? 'Generating PDF...' : 'Download as PDF'}
            </Button>
            
            <Button 
              variant="secondary" 
              className="flex items-center gap-2"
              onClick={() => alert('Sharing functionality will be implemented in a future update.')}
            >
              <ShareIcon size={18} />
              Share Resume
            </Button>
          </div>
          
          {downloadSuccess && (
            <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md text-center">
              PDF downloaded successfully!
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