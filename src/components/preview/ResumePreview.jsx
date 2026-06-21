import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useResume } from '../../contexts/ResumeContext';
import templateConfig from '../../data/template-config.json';
import { customSectionFromStandard, normalizeCustomSection } from '../../utils/resumeSections';
import { transformResumeData } from '../../utils/resumeData';

import Template11 from '../../templates/Template11';
import Template12 from '../../templates/Template12';
import Template13 from '../../templates/Template13';
import Template14 from '../../templates/Template14';
import Template15 from '../../templates/Template15';
import Template16 from '../../templates/Template16';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ResumePreview({ isPrintMode = false }) {
  const { resumeData, selectedTemplate, customization } = useResume();
  const query = useQuery();
  const requestedTemplate = query.get('template') || selectedTemplate || '12';
  const templateId = ['11', '12', '13', '14', '15', '16'].includes(requestedTemplate)
    ? requestedTemplate
    : '12';

  const transformedData = useMemo(() => {
    const transformed = transformResumeData(resumeData, customization);
    return {
      ...transformed,
      customSections: (transformed.customSections || []).map(normalizeCustomSection)
    };
  }, [resumeData, customization]);

  const containerRef = React.useRef(null);
  const [scale, setScale] = React.useState(0.7);

  React.useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        // Calculate available width with some padding (40px)
        const availableWidth = containerRef.current.clientWidth - 40;
        // A4 width in pixels (approx 210mm at 96 DPI)
        const a4Width = 794; 
        const newScale = Math.min(availableWidth / a4Width, 1);
        setScale(newScale);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const renderTemplate = () => {
    const templateCapabilities = {
      '11': ['summary', 'experience', 'education', 'skills', 'projects', 'certifications'],
      '12': ['summary', 'experience', 'education', 'skills', 'projects', 'certifications'],
      '13': ['summary', 'education', 'skills', 'projects', 'certifications'],
      '14': ['experience', 'education', 'skills', 'projects', 'certifications'],
      '15': ['summary', 'experience', 'education', 'skills', 'projects', 'certifications'],
      '16': ['summary', 'education', 'skills', 'projects', 'certifications']
    };
    const supported = templateCapabilities[templateId] || templateCapabilities['12'];
    const fallbackTypes = ['summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'achievements']
      .filter(type => !supported.includes(type));
    const fallbackSections = fallbackTypes
      .map(type => customSectionFromStandard(type, transformedData, transformedData.sectionTitles))
      .filter(section => section.items.length > 0);
    const data = {
      ...transformedData,
      customSections: [
        ...fallbackSections,
        ...transformedData.customSections
      ].filter(section => section.visible !== false)
    };
    const props = { data, config: templateConfig };
    switch (templateId) {
      case '11': return <Template11 {...props} />;
      case '12': return <Template12 {...props} />;
      case '13': return <Template13 {...props} />;
      case '14': return <Template14 {...props} />;
      case '15': return <Template15 {...props} />;
      case '16': return <Template16 {...props} />;
      default: return <Template12 {...props} />;
    }
  };

  // A4 dimensions in pixels
  const A4_WIDTH = 794;
  const A4_HEIGHT = 1123;

  if (isPrintMode) {
    return (
      <div
        className="resume-print-page mx-auto bg-white"
        style={{ width: '210mm', minHeight: '297mm' }}
      >
        {renderTemplate()}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="w-full h-[calc(100vh-180px)] overflow-auto bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex justify-center py-8 custom-scrollbar"
    >
      <div 
        className="relative transition-all duration-300"
        style={{ 
          width: A4_WIDTH * scale, 
          height: A4_HEIGHT * scale 
        }}
      >
        <div 
          className="absolute top-0 left-0 bg-white shadow-2xl overflow-hidden"
          style={{ 
            width: A4_WIDTH, 
            minHeight: A4_HEIGHT,
            transform: `scale(${scale})`, 
            transformOrigin: 'top left' 
          }}
        >
          {renderTemplate()}
        </div>
      </div>
    </div>
  );
}
