import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useResume } from '../../contexts/ResumeContext';
import { customSectionFromStandard, normalizeCustomSection } from '../../utils/resumeSections';
import { transformResumeData } from '../../utils/resumeData';
import { getA4PageHeightForWidth, getResumeContentBounds } from '../../utils/resumePageBounds';
import { buildTemplateConfig } from '../../utils/templateStyle';

import Template11 from '../../templates/Template11';
import Template12 from '../../templates/Template12';
import Template13 from '../../templates/Template13';
import Template14 from '../../templates/Template14';
import Template15 from '../../templates/Template15';
import Template16 from '../../templates/Template16';

const A4_WIDTH = 794;
const A4_HEIGHT = getA4PageHeightForWidth(A4_WIDTH);

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
  const templateConfig = useMemo(() => buildTemplateConfig(customization), [customization]);

  const containerRef = React.useRef(null);
  const measureRef = React.useRef(null);
  const [scale, setScale] = React.useState(0.7);
  const [pageWidth, setPageWidth] = React.useState(A4_WIDTH);
  const [pageCount, setPageCount] = React.useState(1);
  const [pageHeight, setPageHeight] = React.useState(A4_HEIGHT);

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

  React.useLayoutEffect(() => {
    const measureElement = measureRef.current;
    if (!measureElement) return undefined;

    let frames = [];
    const cancelMeasurements = () => {
      frames.forEach((frame) => cancelAnimationFrame(frame));
      frames = [];
    };
    const measurePages = () => {
      const rect = measureElement.getBoundingClientRect();
      const nextPageWidth = rect.width || A4_WIDTH;
      const nextPageHeight = getA4PageHeightForWidth(nextPageWidth);
      const contentBounds = getResumeContentBounds(measureElement, nextPageHeight);
      const tolerance = Math.max(2, rect.width * 0.003);
      const nextPageCount = contentBounds.contentHeight <= nextPageHeight + tolerance
        ? 1
        : Math.ceil(contentBounds.contentHeight / nextPageHeight);

      setPageWidth(nextPageWidth);
      setPageHeight(nextPageHeight || A4_HEIGHT);
      setPageCount(Math.max(1, nextPageCount));
    };
    const queueMeasure = (remainingPasses = 3) => {
      const frame = requestAnimationFrame(() => {
        measurePages();
        if (remainingPasses > 0) {
          queueMeasure(remainingPasses - 1);
        }
      });
      frames.push(frame);
    };
    const updatePages = () => {
      cancelMeasurements();
      queueMeasure();
    };

    const fontReady = document.fonts?.ready || Promise.resolve();
    fontReady.then(updatePages);

    const resizeObserver = new ResizeObserver(updatePages);
    const mutationObserver = new MutationObserver(updatePages);
    resizeObserver.observe(measureElement);
    mutationObserver.observe(measureElement, {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true
    });

    return () => {
      cancelMeasurements();
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [customization, resumeData, templateId, transformedData, templateConfig]);

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

  if (isPrintMode) {
    return (
      <div
        className="resume-print-page mx-auto bg-white"
        style={{ width: '210mm' }}
      >
        {renderTemplate()}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      data-resume-preview-shell
      data-resume-page-count={pageCount}
      className="relative w-full h-[calc(100vh-180px)] overflow-auto bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex justify-center py-8 custom-scrollbar"
    >
      <div
        ref={measureRef}
        data-resume-measure-root
        className="pointer-events-none fixed top-0 bg-white"
        style={{ width: '210mm', left: '-10000px', visibility: 'hidden' }}
      >
        {renderTemplate()}
      </div>

      <div
        className="flex shrink-0 flex-col items-center gap-6 transition-all duration-300"
        data-resume-preview-stack
        style={{ width: pageWidth * scale }}
      >
        {Array.from({ length: pageCount }).map((_, pageIndex) => (
          <div
            key={pageIndex}
            data-resume-preview-page
            data-page-index={pageIndex + 1}
            className="relative shrink-0 bg-white shadow-2xl overflow-hidden"
            style={{
              width: pageWidth * scale,
              height: pageHeight * scale
            }}
          >
            <div
              className="absolute left-0 top-0"
              style={{
                width: pageWidth,
                transform: `scale(${scale})`,
                transformOrigin: 'top left'
              }}
            >
              <div style={{ transform: `translateY(-${pageIndex * pageHeight}px)` }}>
                {renderTemplate()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
