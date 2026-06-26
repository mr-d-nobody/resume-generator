import React, { useState } from 'react';
import { useResume } from '../contexts/ResumeContext';
import ResumePreview from '../components/preview/ResumePreview';
import { Button } from '../components/ui';
import { Download as DownloadIcon, Share2 as ShareIcon } from 'lucide-react';
import { normalizeCustomSection } from '../utils/resumeSections';
import { normalizeUrl, transformResumeData } from '../utils/resumeData';

const A4_WIDTH = 210;
const A4_HEIGHT = 297;
const FIT_SCALES = [1, 0.96, 0.92, 0.88, 0.84, 0.8, 0.76, 0.72, 0.68];
const DEFAULT_SECTION_ORDER = [
  'summary',
  'experience',
  'education',
  'skills',
  'projects',
  'certifications',
  'achievements',
  'customSections'
];
const BLUE = [37, 99, 235];
const TEXT = [31, 41, 55];
const MUTED = [75, 85, 99];
const LIGHT_GRAY = [229, 231, 235];

function cleanText(value) {
  return String(value || '')
    .replace(/[\u00a0\u202f]/g, ' ')
    .replace(/[\u2010-\u2015]/g, '-')
    .replace(/[\u2022\u00b7]/g, '-')
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function makeStyle(scale) {
  return {
    scale,
    marginX: Math.max(8, 12 * scale),
    marginTop: Math.max(8, 11 * scale),
    marginBottom: Math.max(8, 10 * scale),
    name: 16 * scale,
    title: 7.8 * scale,
    section: 7.6 * scale,
    itemTitle: 7.1 * scale,
    body: 6.5 * scale,
    small: 5.8 * scale,
    nameLine: 6.2 * scale,
    bodyLine: 3.25 * scale,
    smallLine: 2.85 * scale,
    sectionGap: 2.4 * scale,
    itemGap: 1.9 * scale
  };
}

function setFont(pdf, size, style = 'normal', color = TEXT) {
  pdf.setFont('helvetica', style);
  pdf.setFontSize(size);
  pdf.setTextColor(...color);
}

function getTitle(sectionTitles, key, fallback) {
  return cleanText(sectionTitles?.[key]) || fallback;
}

function contactItems(personal) {
  const items = [];
  if (personal.email) items.push({ label: personal.email, url: `mailto:${personal.email}` });
  if (personal.phone) items.push({ label: personal.phone, url: `tel:${personal.phone.replace(/[^0-9+]/g, '')}` });
  if (personal.location) items.push({ label: personal.location });
  (personal.links || []).forEach((link) => {
    const url = normalizeUrl(link.url);
    if (url) items.push({ label: cleanText(link.label) || 'Link', url });
  });
  return items;
}

function buildExportData(resumeData, customization) {
  const data = transformResumeData(resumeData, customization);
  return {
    ...data,
    sectionOrder: Array.isArray(customization?.sectionOrder)
      ? customization.sectionOrder
      : DEFAULT_SECTION_ORDER,
    customSections: (data.customSections || [])
      .map(normalizeCustomSection)
      .filter((section) => section.visible !== false)
  };
}

function createRenderer(pdf, exportData, style, options = {}) {
  const { dryRun = false, paginate = true } = options;
  const contentWidth = A4_WIDTH - style.marginX * 2;
  let y = style.marginTop;
  let page = 1;
  let linkCount = 0;

  const addPage = () => {
    if (!dryRun) pdf.addPage('a4', 'portrait');
    page += 1;
    y = style.marginTop;
  };

  const ensureSpace = (height) => {
    if (
      paginate &&
      y + height > A4_HEIGHT - style.marginBottom &&
      y > style.marginTop + 4
    ) {
      addPage();
    }
  };

  const drawLine = (x1, y1, x2, y2, color = BLUE, width = 0.35) => {
    if (dryRun) return;
    pdf.setDrawColor(...color);
    pdf.setLineWidth(width);
    pdf.line(x1, y1, x2, y2);
  };

  const text = (value, x, lineY, size, fontStyle = 'normal', color = TEXT, opts = {}) => {
    if (dryRun) return;
    setFont(pdf, size, fontStyle, color);
    pdf.text(value, x, lineY, opts);
  };

  const wrapped = (value, x, width, size = style.body, lineHeight = style.bodyLine, opts = {}) => {
    const content = cleanText(value);
    if (!content) return 0;
    setFont(pdf, size, opts.fontStyle || 'normal', opts.color || TEXT);
    const lines = pdf.splitTextToSize(content, width);
    lines.forEach((line) => {
      ensureSpace(lineHeight);
      text(line, x, y, size, opts.fontStyle || 'normal', opts.color || TEXT);
      y += lineHeight;
    });
    return lines.length * lineHeight;
  };

  const bullet = (value, x, width) => {
    const content = cleanText(value);
    if (!content) return;
    setFont(pdf, style.body, 'normal', MUTED);
    const lines = pdf.splitTextToSize(content, width - 3.5);
    lines.forEach((line, index) => {
      ensureSpace(style.bodyLine);
      const prefix = index === 0 ? '- ' : '  ';
      text(`${prefix}${line}`, x, y, style.body, 'normal', MUTED);
      y += style.bodyLine;
    });
  };

  const section = (title, renderContent) => {
    const before = y;
    ensureSpace(style.section + style.sectionGap + 3);
    text(title.toUpperCase(), style.marginX, y, style.section, 'bold', BLUE);
    drawLine(style.marginX, y + 1.2, A4_WIDTH - style.marginX, y + 1.2, BLUE, 0.25);
    y += style.section + 1.2;
    renderContent();
    if (y > before) y += style.sectionGap;
  };

  const itemHeader = (leftValue, rightValue, url) => {
    const left = cleanText(leftValue);
    const right = cleanText(rightValue);
    if (!left && !right) return;

    setFont(pdf, style.small, 'bold', BLUE);
    const rightWidth = right ? pdf.getTextWidth(right) : 0;
    const leftWidth = Math.max(35, contentWidth - rightWidth - (right ? 4 * style.scale : 0));
    setFont(pdf, style.itemTitle, 'bold', TEXT);
    const leftLines = left ? pdf.splitTextToSize(left, leftWidth) : [];
    const headerHeight = Math.max(style.bodyLine, leftLines.length * style.bodyLine);

    ensureSpace(headerHeight + style.itemGap);
    const headerY = y;
    leftLines.forEach((line) => {
      text(line, style.marginX, y, style.itemTitle, 'bold', TEXT);
      y += style.bodyLine;
    });
    if (!leftLines.length) y += style.bodyLine;

    if (right) {
      setFont(pdf, style.small, 'bold', BLUE);
      const labelWidth = pdf.getTextWidth(right);
      const x = A4_WIDTH - style.marginX - labelWidth;
      text(right, x, headerY, style.small, 'bold', BLUE);
      if (!dryRun && url) {
        pdf.link(x, headerY - style.small + 1, labelWidth, style.small + 1, { url });
        linkCount += 1;
      }
    }
  };

  const renderHeader = () => {
    const { personal } = exportData;
    text(personal.name.toUpperCase(), style.marginX, y, style.name, 'bold', BLUE);
    y += style.nameLine;
    if (personal.title) {
      wrapped(personal.title.toUpperCase(), style.marginX, contentWidth, style.title, style.smallLine, {
        fontStyle: 'bold',
        color: MUTED
      });
    }

    const contacts = contactItems(personal);
    if (contacts.length > 0) {
      let x = style.marginX;
      const maxY = y;
      contacts.forEach((item, index) => {
        const label = `${index > 0 ? ' | ' : ''}${item.label}`;
        setFont(pdf, style.small, 'normal', MUTED);
        const labelWidth = pdf.getTextWidth(label);
        if (x + labelWidth > A4_WIDTH - style.marginX) {
          x = style.marginX;
          y += style.smallLine;
        }
        text(label, x, y, style.small, 'normal', item.url ? BLUE : MUTED);
        if (!dryRun && item.url) {
          pdf.link(x, y - style.small + 1, labelWidth, style.small + 1, { url: item.url });
          linkCount += 1;
        }
        x += labelWidth + 1.5;
      });
      y = Math.max(y, maxY) + style.smallLine + 1.6;
    }

    drawLine(style.marginX, y, A4_WIDTH - style.marginX, y, BLUE, 0.55);
    y += 5 * style.scale;
  };

  const renderSummary = () => {
    if (!exportData.summary) return;
    section(getTitle(exportData.sectionTitles, 'summary', 'Profile'), () => {
      wrapped(exportData.summary, style.marginX, contentWidth, style.body, style.bodyLine, { color: MUTED });
    });
  };

  const renderEducation = () => {
    if (!exportData.education?.length) return;
    section(getTitle(exportData.sectionTitles, 'education', 'Education'), () => {
      exportData.education.forEach((edu) => {
        const date = [edu.startDate, edu.endDate].filter(Boolean).join(' - ');
        itemHeader(edu.degree || edu.institution, date);
        wrapped([edu.institution, edu.location].filter(Boolean).join(', '), style.marginX, contentWidth, style.body, style.bodyLine, { color: MUTED });
        if (edu.gpa) wrapped(`GPA: ${edu.gpa}`, style.marginX, contentWidth, style.small, style.smallLine, { fontStyle: 'bold' });
        (edu.highlights || []).forEach((line) => bullet(line, style.marginX + 1.8, contentWidth - 1.8));
        y += style.itemGap;
      });
    });
  };

  const renderProjects = () => {
    if (!exportData.projects?.length) return;
    section(getTitle(exportData.sectionTitles, 'projects', 'Academic & Personal Projects'), () => {
      exportData.projects.forEach((project) => {
        const firstLink = project.links?.[0];
        itemHeader(project.name, firstLink?.label, firstLink?.url);
        wrapped(project.description, style.marginX, contentWidth, style.body, style.bodyLine, {
          fontStyle: 'italic',
          color: MUTED
        });
        (project.highlights || []).forEach((line) => bullet(line, style.marginX + 1.8, contentWidth - 1.8));
        (project.links || []).slice(1).forEach((link) => {
          const url = normalizeUrl(link.url);
          if (url) {
            wrapped(`${link.label}: ${url}`, style.marginX, contentWidth, style.small, style.smallLine, { color: BLUE });
          }
        });
        y += style.itemGap;
      });
    });
  };

  const renderExperience = () => {
    if (!exportData.experience?.length) return;
    section(getTitle(exportData.sectionTitles, 'experience', 'Experience'), () => {
      exportData.experience.forEach((exp) => {
        const date = [exp.startDate, exp.endDate].filter(Boolean).join(' - ');
        itemHeader([exp.position, exp.company].filter(Boolean).join(' at '), date);
        if (exp.location) wrapped(exp.location, style.marginX, contentWidth, style.body, style.bodyLine, { color: MUTED });
        (exp.highlights || []).forEach((line) => bullet(line, style.marginX + 1.8, contentWidth - 1.8));
        y += style.itemGap;
      });
    });
  };

  const renderSkills = () => {
    const skills = Object.entries(exportData.skills || {});
    if (!skills.length) return;
    section(getTitle(exportData.sectionTitles, 'skills', 'Technical Skills'), () => {
      skills.forEach(([category, skillList]) => {
        wrapped(`${category}: ${(skillList || []).join(', ')}`, style.marginX, contentWidth, style.body, style.bodyLine);
      });
    });
  };

  const renderCertifications = () => {
    if (!exportData.certifications?.length) return;
    section(getTitle(exportData.sectionTitles, 'certifications', 'Certifications'), () => {
      exportData.certifications.forEach((cert) => {
        const label = [cert.name, cert.issuer, cert.date].filter(Boolean).join(' - ');
        itemHeader(label, cert.url ? (cert.linkLabel || 'Verify') : '', cert.url);
        if (cert.credentialId) wrapped(`Credential ID: ${cert.credentialId}`, style.marginX, contentWidth, style.small, style.smallLine, { color: MUTED });
        if (cert.description) wrapped(cert.description, style.marginX, contentWidth, style.small, style.smallLine, { color: MUTED });
      });
    });
  };

  const renderAchievements = () => {
    if (!exportData.achievements?.length) return;
    section(getTitle(exportData.sectionTitles, 'achievements', 'Achievements'), () => {
      exportData.achievements.forEach((achievement) => {
        itemHeader([achievement.title, achievement.organization].filter(Boolean).join(' - '), achievement.date);
        wrapped(achievement.description, style.marginX, contentWidth, style.body, style.bodyLine, { color: MUTED });
      });
    });
  };

  const renderCustomSections = () => {
    (exportData.customSections || []).forEach((customSection) => {
      const items = customSection.content || [];
      const entries = customSection.entries || [];
      const links = customSection.links || [];
      if (!items.length && !entries.length && !links.length) return;

      section(customSection.title, () => {
        items.forEach((line) => bullet(line, style.marginX + 1.8, contentWidth - 1.8));
        entries.forEach((entry) => {
          itemHeader(entry.title || entry.linkLabel || 'Profile', entry.url ? (entry.linkLabel || 'Profile') : '', entry.url);
          wrapped(entry.description, style.marginX, contentWidth, style.body, style.bodyLine, { color: MUTED });
        });
        links.forEach((link) => {
          itemHeader(link.label || 'Profile', 'Open', link.url);
        });
      });
    });
  };

  const render = () => {
    if (!dryRun) {
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, A4_WIDTH, A4_HEIGHT, 'F');
      pdf.setDrawColor(...LIGHT_GRAY);
    }
    renderHeader();

    const sectionRenderers = {
      summary: renderSummary,
      experience: renderExperience,
      education: renderEducation,
      skills: renderSkills,
      projects: renderProjects,
      certifications: renderCertifications,
      achievements: renderAchievements,
      customSections: renderCustomSections
    };
    const rendered = new Set();
    [...exportData.sectionOrder, ...DEFAULT_SECTION_ORDER].forEach((key) => {
      if (key === 'personalInfo' || rendered.has(key) || !sectionRenderers[key]) return;
      sectionRenderers[key]();
      rendered.add(key);
    });

    return {
      page,
      height: y + style.marginBottom,
      linkCount
    };
  };

  return { render };
}

function pickLayoutScale(pdf, exportData) {
  return FIT_SCALES.find((scale) => {
    const renderer = createRenderer(pdf, exportData, makeStyle(scale), {
      dryRun: true,
      paginate: false
    });
    return renderer.render().height <= A4_HEIGHT;
  }) || 0.84;
}

async function generateResumePdf({ jsPDF, resumeData, customization }) {
  const exportData = buildExportData(resumeData, customization);
  const measurementPdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const scale = pickLayoutScale(measurementPdf, exportData);
  const dryRenderer = createRenderer(measurementPdf, exportData, makeStyle(scale), {
    dryRun: true,
    paginate: false
  });
  const fitsOnePage = dryRenderer.render().height <= A4_HEIGHT;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });
  const renderer = createRenderer(pdf, exportData, makeStyle(scale), {
    dryRun: false,
    paginate: !fitsOnePage
  });
  const result = renderer.render();

  return {
    pdf,
    pageCount: result.page,
    linkCount: result.linkCount,
    scale
  };
}

function Download() {
  const { resumeData, customization } = useResume();
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const getDocumentTitle = () => `Resume_${[
    resumeData?.personalInfo?.firstName,
    resumeData?.personalInfo?.lastName
  ].filter(Boolean).join('_') || 'Export'}`;

  const handleExportPDF = async () => {
    try {
      setIsDownloading(true);
      setDownloadSuccess(false);
      setDownloadMessage('');

      const { jsPDF } = await import('jspdf');
      const { pdf, pageCount, linkCount } = await generateResumePdf({
        jsPDF,
        resumeData,
        customization
      });

      pdf.save(`${getDocumentTitle()}.pdf`);
      setDownloadMessage(
        `Downloaded ${pageCount}-page A4 PDF${linkCount > 0 ? ` with ${linkCount} clickable link${linkCount === 1 ? '' : 's'}` : ''}.`
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
            Export your resume as a compact, selectable A4 PDF.
          </p>
        </div>

        <div className="card p-6 mb-8">
          <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50 p-4 text-center text-sm text-blue-950 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-100">
            <p className="font-semibold">Professional A4 PDF export</p>
            <p className="mt-1">
              The export uses a dedicated PDF layout engine, tries hard to fit one page, and adds page 2 only when needed.
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
            <p className="text-sm text-gray-600">Current template preview</p>
          </div>

          <div className="overflow-x-auto pb-4">
            <div className="resume-container bg-white w-fit mx-auto border border-gray-200 shadow-sm">
              <ResumePreview isPrintMode={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Download;
