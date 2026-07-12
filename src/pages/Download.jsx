import React, { useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useResume } from '../contexts/ResumeContext';
import ResumePreview from '../components/preview/ResumePreview';
import { Button } from '../components/ui';
import { AlertCircle, CheckCircle2, Download as DownloadIcon, Eye, FileText, Loader2, Share2 as ShareIcon, Sparkles } from 'lucide-react';
import { normalizeCustomSection } from '../utils/resumeSections';
import { normalizeUrl, transformResumeData } from '../utils/resumeData';
import { getA4PageHeightForWidth, getResumeContentBounds } from '../utils/resumePageBounds';
import { DEFAULT_LAYOUT, getColorTheme, getLayoutSettings } from '../utils/templateStyle';
import { validateResumeData } from '../utils/resumeValidation';
import { ensureCsrfCookie, getCsrfToken } from '../utils/authApi';

const A4_WIDTH = 210;
const A4_HEIGHT = 297;
const FIT_SCALES = [1, 0.96, 0.92, 0.88, 0.84, 0.8, 0.76, 0.72, 0.68];
const TEMPLATE_IDS = ['11', '12', '13', '14', '15', '16'];
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
const NAVY = [11, 32, 56];
const ACCENT_BLUE = [74, 143, 193];
const PALE_BLUE = [234, 240, 248];
const UNSUPPORTED_CANVAS_COLOR = /(oklch|oklab|color-mix|lab|lch)\(/i;
const SHARE_SITE_LINK = 'https://resume-generator-8m6r.vercel.app/';
const SHARE_PROMO_TEXT = 'Here is my polished resume, created with ResumeBuilder. ResumeBuilder helps job seekers turn their experience into a clean, professional resume with AI-powered writing, modern templates, smart sections, job search tools, and one-click PDF export. You can build your own resume in minutes here:';
const SHARE_FULL_TEXT = `${SHARE_PROMO_TEXT}\n${SHARE_SITE_LINK}`;
const SHARE_FALLBACK_TEXT = 'Build a polished, job-ready resume in minutes with ResumeBuilder. Use AI-powered writing, modern templates, smart sections, job search tools, and simple PDF export.';

const PDF_TEMPLATE_PROFILES = {
  '11': {
    variant: 'classic',
    font: 'helvetica',
    primary: BLUE,
    accent: BLUE,
    text: TEXT,
    muted: MUTED,
    sectionFallbacks: { projects: 'Academic & Personal Projects', experience: 'Internships & Experience' }
  },
  '12': {
    variant: 'sidebar',
    font: 'helvetica',
    primary: BLUE,
    accent: BLUE,
    text: TEXT,
    muted: MUTED,
    sidebar: BLUE,
    sectionFallbacks: { projects: 'Key Projects' }
  },
  '13': {
    variant: 'centered',
    font: 'helvetica',
    primary: BLUE,
    accent: BLUE,
    text: TEXT,
    muted: MUTED,
    pale: [239, 246, 255],
    sectionFallbacks: { projects: 'Featured Projects', skills: 'Skills Arsenal' }
  },
  '14': {
    variant: 'minimal',
    font: 'helvetica',
    primary: TEXT,
    accent: BLUE,
    text: TEXT,
    muted: MUTED,
    sectionFallbacks: { projects: 'Academic Projects' }
  },
  '15': {
    variant: 'code',
    font: 'courier',
    primary: BLUE,
    accent: BLUE,
    text: TEXT,
    muted: MUTED,
    sectionPrefix: '// ',
    namePrefix: '> ',
    sectionFallbacks: { skills: 'Technical_Skills', projects: 'Projects' }
  },
  '16': {
    variant: 'navy',
    font: 'helvetica',
    primary: NAVY,
    accent: ACCENT_BLUE,
    text: NAVY,
    muted: [78, 98, 120],
    pale: PALE_BLUE,
    sectionFallbacks: { summary: 'Summary', projects: 'Projects' }
  }
};

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

function getTemplateId(value) {
  return TEMPLATE_IDS.includes(String(value)) ? String(value) : '12';
}

function getTemplateProfile(templateId) {
  return PDF_TEMPLATE_PROFILES[getTemplateId(templateId)] || PDF_TEMPLATE_PROFILES['12'];
}

function hexToRgb(hexValue, fallback) {
  const hex = String(hexValue || '').replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(hex)) return fallback;
  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16)
  ];
}

function getPdfFont(fontFamily) {
  if (fontFamily === 'serif') return 'times';
  if (fontFamily === 'mono') return 'courier';
  return 'helvetica';
}

function canvasFallbackForProperty(property, value) {
  if (!value || value === 'transparent' || value === 'rgba(0, 0, 0, 0)') return 'transparent';
  if (property === 'boxShadow' || property === 'box-shadow') return 'none';
  if (property.includes('background')) return '#ffffff';
  if (property.includes('border') || property.includes('outline')) return '#e5e7eb';
  return '#111827';
}

function sanitizeCanvasStyleValue(property, value) {
  if (!value || !UNSUPPORTED_CANVAS_COLOR.test(value)) return value;
  return canvasFallbackForProperty(property, value);
}

function inlineSafeCanvasColors(sourceElement, clonedElement) {
  if (!sourceElement || !clonedElement) return;
  const computedStyle = window.getComputedStyle(sourceElement);
  for (let index = 0; index < computedStyle.length; index += 1) {
    const property = computedStyle[index];
    const value = computedStyle.getPropertyValue(property);
    const safeValue = sanitizeCanvasStyleValue(property, value);
    if (safeValue) {
      clonedElement.style.setProperty(
        property,
        safeValue,
        computedStyle.getPropertyPriority(property)
      );
    }
  }
}

function removeClonedStylesheets(clonedDocument) {
  clonedDocument
    .querySelectorAll('style, link[rel="stylesheet"]')
    .forEach((node) => node.remove());
}

function sanitizeCanvasClone(sourceRoot, clonedRoot) {
  if (!sourceRoot || !clonedRoot) return;
  const sourceElements = [sourceRoot, ...sourceRoot.querySelectorAll('*')];
  const clonedElements = [clonedRoot, ...clonedRoot.querySelectorAll('*')];

  sourceElements.forEach((sourceElement, index) => {
    inlineSafeCanvasColors(sourceElement, clonedElements[index]);
  });

  clonedRoot.style.backgroundColor = '#ffffff';
  clonedElements.forEach((element) => {
    element.style.visibility = 'visible';
  });
  clonedRoot.style.position = 'static';
  clonedRoot.style.left = '0';
  clonedRoot.style.top = '0';
  removeClonedStylesheets(clonedRoot.ownerDocument);
}

function waitForPreviewRender() {
  const fontReady = document.fonts?.ready || Promise.resolve();
  return fontReady.then(
    () => new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    })
  );
}

function getVisualExportBounds(resumeElement) {
  const rootRect = resumeElement.getBoundingClientRect();
  const pageHeightPx = getA4PageHeightForWidth(rootRect.width);
  return getResumeContentBounds(resumeElement, pageHeightPx);
}

function getResumeLinks(resumeElement) {
  const rootRect = resumeElement.getBoundingClientRect();
  const pageHeightPx = getA4PageHeightForWidth(rootRect.width);
  return [...resumeElement.querySelectorAll('a[href]')]
    .map((anchor) => {
      const url = normalizeUrl(anchor.getAttribute('href'));
      if (!url && !anchor.getAttribute('href')?.startsWith('mailto:')) return null;
      return [...anchor.getClientRects()].map((rect) => ({
        url: url || anchor.getAttribute('href'),
        page: Math.floor((rect.top - rootRect.top) / pageHeightPx) + 1,
        x: ((rect.left - rootRect.left) / rootRect.width) * A4_WIDTH,
        y: (((rect.top - rootRect.top) % pageHeightPx) / pageHeightPx) * A4_HEIGHT,
        width: (rect.width / rootRect.width) * A4_WIDTH,
        height: (rect.height / pageHeightPx) * A4_HEIGHT
      }));
    })
    .filter(Boolean)
    .flat()
    .filter((link) => link.width > 0 && link.height > 0);
}

function addResumeLinks(pdf, links, pageCount) {
  let linkCount = 0;
  links.forEach((link) => {
    if (link.page < 1 || link.page > pageCount) return;
    pdf.setPage(link.page);
    pdf.link(link.x, link.y, link.width, link.height, { url: link.url });
    linkCount += 1;
  });
  pdf.setPage(pageCount);
  return linkCount;
}

function addCanvasPagesToPdf(pdf, canvas) {
  const pageHeightPx = Math.floor(getA4PageHeightForWidth(canvas.width));
  const pageOverflowTolerancePx = Math.max(4, Math.round(canvas.width * 0.003));
  const pageCanvas = document.createElement('canvas');
  const pageContext = pageCanvas.getContext('2d');
  pageCanvas.width = canvas.width;
  pageCanvas.height = pageHeightPx;

  const pageCount = canvas.height <= pageHeightPx + pageOverflowTolerancePx
    ? 1
    : Math.max(1, Math.ceil(canvas.height / pageHeightPx));

  for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
    if (pageIndex > 0) {
      pdf.addPage('a4', 'portrait');
    }

    const sourceY = pageIndex * pageHeightPx;
    const sliceHeight = Math.min(pageHeightPx, canvas.height - sourceY);
    pageContext.fillStyle = '#ffffff';
    pageContext.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
    pageContext.drawImage(
      canvas,
      0,
      sourceY,
      canvas.width,
      sliceHeight,
      0,
      0,
      canvas.width,
      sliceHeight
    );

    pdf.addImage(
      pageCanvas.toDataURL('image/png'),
      'PNG',
      0,
      0,
      A4_WIDTH,
      A4_HEIGHT,
      undefined,
      'FAST'
    );
  }

  return pageCount;
}

function saveBlobAsFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function makeSafeFileName(value, fallback = 'resume') {
  return String(value || fallback)
    .trim()
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || fallback;
}

function makeResumePdfFile(blob, candidateName) {
  const namePart = makeSafeFileName(candidateName);
  const fileName = namePart === 'resume' ? 'resume.pdf' : `${namePart}-resume.pdf`;

  return new File([blob], fileName, { type: 'application/pdf' });
}

function isShareCancel(error) {
  return error?.name === 'AbortError'
    || /cancel|abort|dismiss/i.test(error?.message || '');
}

async function copyShareCaption() {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(SHARE_FULL_TEXT);
    return true;
  } catch {
    return false;
  }
}

async function shareResumePDF(pdfBlob, candidateName) {
  if (typeof navigator === 'undefined' || !navigator.share) {
    throw new Error('Native sharing is not supported on this browser. Please download the PDF and share it manually.');
  }

  const resumePdfFile = makeResumePdfFile(pdfBlob, candidateName);
  const fileSharePayload = {
    title: 'My Resume',
    text: SHARE_FULL_TEXT,
    url: SHARE_SITE_LINK,
    files: [resumePdfFile]
  };
  const captionCopied = await copyShareCaption();

  if (navigator.canShare?.({ files: [resumePdfFile] })) {
    await navigator.share(fileSharePayload);
    return { captionCopied };
  }

  await navigator.share({
    title: 'ResumeBuilder',
    text: SHARE_FALLBACK_TEXT,
    url: SHARE_SITE_LINK
  });
  return { captionCopied: false };
}

async function generateServerPdf({ resumeData, customization, templateId }) {
  if (!getCsrfToken()) await ensureCsrfCookie();
  const response = await fetch('/api/export-pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCsrfToken() },
    credentials: 'include',
    signal: AbortSignal.timeout(50000),
    body: JSON.stringify({
      resumeData,
      customization,
      selectedTemplate: templateId,
      templateId
    })
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || 'Server PDF export failed.');
  }

  const blob = await response.blob();

  return {
    blob,
    pageCount: Number(response.headers.get('X-Resume-Page-Count')) || 1,
    linkCount: 0
  };
}

function makeStyle(scale, templateId = '12', customization = {}) {
  const profile = getTemplateProfile(templateId);
  const theme = getColorTheme(customization.colorTheme);
  const layout = getLayoutSettings(customization.layout);
  const primary = hexToRgb(theme.primaryColor, profile.primary);
  const secondary = hexToRgb(theme.secondaryColor, profile.muted);
  const textColor = hexToRgb(theme.textColor, profile.text);
  const compact = profile.variant === 'code' || profile.variant === 'navy';
  const centered = profile.variant === 'centered';
  const typeScale = scale * layout.density;
  const sectionGapRatio = layout.sectionGap / DEFAULT_LAYOUT.sectionGap;
  const itemGapRatio = layout.itemGap / DEFAULT_LAYOUT.itemGap;
  return {
    ...profile,
    font: getPdfFont(customization.fontFamily),
    templateId: getTemplateId(templateId),
    primary,
    accent: primary,
    text: textColor,
    muted: secondary,
    sidebar: profile.variant === 'sidebar' ? primary : profile.sidebar,
    scale,
    marginX: Math.max(8, (centered ? 15 : 12) * scale),
    marginTop: Math.max(8, (centered ? 13 : 11) * scale),
    marginBottom: Math.max(8, 10 * scale),
    name: (compact ? 14.5 : centered ? 19 : 16) * typeScale,
    title: (compact ? 6.8 : 7.8) * typeScale,
    section: (compact ? 6.9 : 7.6) * typeScale,
    itemTitle: (compact ? 6.6 : 7.1) * typeScale,
    body: (compact ? 6.0 : 6.5) * typeScale,
    small: (compact ? 5.4 : 5.8) * typeScale,
    nameLine: (compact ? 5.7 : 6.2) * typeScale,
    bodyLine: (compact ? 2.95 : 3.25) * typeScale,
    smallLine: (compact ? 2.65 : 2.85) * typeScale,
    sectionGap: (compact ? 1.9 : 2.4) * scale * sectionGapRatio,
    itemGap: (compact ? 1.5 : 1.9) * scale * itemGapRatio
  };
}

function setFont(pdf, size, style = 'normal', color = TEXT, family = 'helvetica') {
  pdf.setFont(family, style);
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

function getSectionTitle(exportData, style, key, fallback) {
  return getTitle(
    exportData.sectionTitles,
    key,
    style.sectionFallbacks?.[key] || fallback
  );
}

function createSidebarRenderer(pdf, exportData, style, options = {}) {
  const { dryRun = false, paginate = true } = options;
  const sidebarWidth = A4_WIDTH * 0.35;
  const leftMargin = Math.max(6, 8 * style.scale);
  const rightX = sidebarWidth + Math.max(7, 8 * style.scale);
  const rightWidth = A4_WIDTH - rightX - Math.max(8, 9 * style.scale);
  const pageTop = Math.max(8, 11 * style.scale);
  const pageBottom = Math.max(8, 10 * style.scale);
  const left = { y: pageTop };
  const right = { y: pageTop };
  let page = 1;
  let linkCount = 0;

  const paintPage = () => {
    if (dryRun) return;
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, A4_WIDTH, A4_HEIGHT, 'F');
    pdf.setFillColor(...style.sidebar);
    pdf.rect(0, 0, sidebarWidth, A4_HEIGHT, 'F');
  };

  const addPage = () => {
    if (!dryRun) pdf.addPage('a4', 'portrait');
    page += 1;
    left.y = pageTop;
    right.y = pageTop;
    paintPage();
  };

  const ensureRightSpace = (height) => {
    if (
      paginate &&
      right.y + height > A4_HEIGHT - pageBottom &&
      right.y > pageTop + 4
    ) {
      addPage();
    }
  };

  const text = (value, x, lineY, size, fontStyle = 'normal', color = style.text, opts = {}) => {
    if (dryRun) return;
    setFont(pdf, size, fontStyle, color, style.font);
    pdf.text(value, x, lineY, opts);
  };

  const wrapped = (cursor, value, x, width, size, lineHeight, opts = {}) => {
    const content = cleanText(value);
    if (!content) return 0;
    setFont(pdf, size, opts.fontStyle || 'normal', opts.color || style.text, style.font);
    const lines = pdf.splitTextToSize(content, width);
    lines.forEach((line) => {
      if (cursor === right) ensureRightSpace(lineHeight);
      const lineX = opts.align === 'center' ? x + width / 2 : x;
      text(line, lineX, cursor.y, size, opts.fontStyle || 'normal', opts.color || style.text, opts);
      cursor.y += lineHeight;
    });
    return lines.length * lineHeight;
  };

  const section = (cursor, title, x, width, color, renderContent, dark = false) => {
    if (cursor === right) ensureRightSpace(style.section + style.sectionGap + 2);
    text(title.toUpperCase(), x, cursor.y, style.section, 'bold', color);
    if (!dryRun) {
      pdf.setDrawColor(...color);
      pdf.setLineWidth(dark ? 0.16 : 0.25);
      pdf.line(x, cursor.y + 1.1, x + width, cursor.y + 1.1);
    }
    cursor.y += style.section + 1.6;
    renderContent();
    cursor.y += style.sectionGap + (dark ? 1.1 : 0);
  };

  const bullet = (cursor, value, x, width, color) => {
    const content = cleanText(value);
    if (!content) return;
    setFont(pdf, style.body, 'normal', color, style.font);
    const lines = pdf.splitTextToSize(content, width - 3.2);
    lines.forEach((line, index) => {
      if (cursor === right) ensureRightSpace(style.bodyLine);
      text(`${index === 0 ? '- ' : '  '}${line}`, x, cursor.y, style.body, 'normal', color);
      cursor.y += style.bodyLine;
    });
  };

  const itemHeader = (cursor, x, width, leftValue, rightValue, url) => {
    const leftText = cleanText(leftValue);
    const rightText = cleanText(rightValue);
    if (!leftText && !rightText) return;
    setFont(pdf, style.small, 'bold', style.accent, style.font);
    const rightTextWidth = rightText ? pdf.getTextWidth(rightText) : 0;
    setFont(pdf, style.itemTitle, 'bold', style.text, style.font);
    const leftLines = leftText
      ? pdf.splitTextToSize(leftText, Math.max(30, width - rightTextWidth - 3))
      : [];
    const height = Math.max(style.bodyLine, leftLines.length * style.bodyLine);
    if (cursor === right) ensureRightSpace(height + style.itemGap);
    const headerY = cursor.y;
    leftLines.forEach((line) => {
      text(line, x, cursor.y, style.itemTitle, 'bold', style.text);
      cursor.y += style.bodyLine;
    });
    if (!leftLines.length) cursor.y += style.bodyLine;
    if (rightText) {
      const linkX = x + width - rightTextWidth;
      text(rightText, linkX, headerY, style.small, 'bold', style.accent);
      if (!dryRun && url) {
        pdf.link(linkX, headerY - style.small + 1, rightTextWidth, style.small + 1, { url });
        linkCount += 1;
      }
    }
  };

  const renderLeft = () => {
    const sidebarContentWidth = sidebarWidth - leftMargin * 2;
    text(exportData.personal.name.toUpperCase(), sidebarWidth / 2, left.y, 12.8 * style.scale, 'bold', [255, 255, 255], { align: 'center' });
    left.y += 5.6 * style.scale;
    if (exportData.personal.title) {
      wrapped(left, exportData.personal.title.toUpperCase(), leftMargin, sidebarContentWidth, style.title, style.smallLine, {
        color: [226, 232, 240],
        fontStyle: 'bold',
        align: 'center'
      });
    }
    left.y += 4 * style.scale;

    const contacts = contactItems(exportData.personal);
    if (contacts.length > 0) {
      section(left, 'Contact', leftMargin, sidebarContentWidth, [255, 255, 255], () => {
        contacts.forEach((item) => {
          wrapped(left, item.label, leftMargin, sidebarContentWidth, style.small, style.smallLine, {
            color: [239, 246, 255]
          });
          if (!dryRun && item.url) {
            const lineWidth = Math.min(sidebarContentWidth, pdf.getTextWidth(item.label));
            pdf.link(leftMargin, left.y - style.smallLine - style.small + 1, lineWidth, style.small + 1, { url: item.url });
            linkCount += 1;
          }
        });
      }, true);
    }

    if (exportData.education?.length) {
      section(left, getSectionTitle(exportData, style, 'education', 'Education'), leftMargin, sidebarContentWidth, [255, 255, 255], () => {
        exportData.education.forEach((edu) => {
          wrapped(left, edu.degree || edu.institution, leftMargin, sidebarContentWidth, style.body, style.bodyLine, {
            color: [255, 255, 255],
            fontStyle: 'bold'
          });
          wrapped(left, edu.institution, leftMargin, sidebarContentWidth, style.small, style.smallLine, {
            color: [226, 232, 240]
          });
          wrapped(left, [edu.startDate, edu.endDate].filter(Boolean).join(' - '), leftMargin, sidebarContentWidth, style.small, style.smallLine, {
            color: [219, 234, 254]
          });
          if (edu.gpa) {
            wrapped(left, `${edu.gradeLabel || 'GPA'}: ${edu.gpa}`, leftMargin, sidebarContentWidth, style.small, style.smallLine, {
              color: [219, 234, 254],
              fontStyle: 'bold'
            });
          }
          left.y += style.itemGap;
        });
      }, true);
    }

    const skills = Object.entries(exportData.skills || {});
    if (skills.length) {
      section(left, getSectionTitle(exportData, style, 'skills', 'Skills'), leftMargin, sidebarContentWidth, [255, 255, 255], () => {
        skills.forEach(([category, skillList]) => {
          wrapped(left, category.toUpperCase(), leftMargin, sidebarContentWidth, style.small, style.smallLine, {
            color: [219, 234, 254],
            fontStyle: 'bold'
          });
          wrapped(left, (skillList || []).join(', '), leftMargin, sidebarContentWidth, style.small, style.smallLine, {
            color: [255, 255, 255]
          });
          left.y += style.itemGap * 0.4;
        });
      }, true);
    }
  };

  const renderRight = () => {
    if (exportData.summary) {
      section(right, getSectionTitle(exportData, style, 'summary', 'Profile'), rightX, rightWidth, style.primary, () => {
        wrapped(right, exportData.summary, rightX, rightWidth, style.body, style.bodyLine, { color: style.muted });
      });
    }

    if (exportData.projects?.length) {
      section(right, getSectionTitle(exportData, style, 'projects', 'Key Projects'), rightX, rightWidth, style.primary, () => {
        exportData.projects.forEach((project) => {
          const firstLink = project.links?.[0];
          itemHeader(right, rightX, rightWidth, project.name, firstLink?.label, firstLink?.url);
          wrapped(right, project.description, rightX, rightWidth, style.body, style.bodyLine, { color: style.muted, fontStyle: 'italic' });
          (project.highlights || []).forEach((line) => bullet(right, line, rightX + 1.8, rightWidth - 1.8, style.muted));
          right.y += style.itemGap;
        });
      });
    }

    if (exportData.experience?.length) {
      section(right, getSectionTitle(exportData, style, 'experience', 'Experience'), rightX, rightWidth, style.primary, () => {
        exportData.experience.forEach((exp) => {
          itemHeader(right, rightX, rightWidth, [exp.position, exp.company].filter(Boolean).join(' at '), [exp.startDate, exp.endDate].filter(Boolean).join(' - '));
          (exp.highlights || []).forEach((line) => bullet(right, line, rightX + 1.8, rightWidth - 1.8, style.muted));
          right.y += style.itemGap;
        });
      });
    }

    if (exportData.certifications?.length) {
      section(right, getSectionTitle(exportData, style, 'certifications', 'Certifications'), rightX, rightWidth, style.primary, () => {
        exportData.certifications.forEach((cert) => {
          itemHeader(right, rightX, rightWidth, [cert.name, cert.issuer, cert.date].filter(Boolean).join(' - '), cert.url ? (cert.linkLabel || 'Verify') : '', cert.url);
        });
      });
    }

    (exportData.customSections || []).forEach((customSection) => {
      const items = customSection.content || [];
      const entries = customSection.entries || [];
      const links = customSection.links || [];
      if (!items.length && !entries.length && !links.length) return;
      section(right, customSection.title, rightX, rightWidth, style.primary, () => {
        items.forEach((line) => bullet(right, line, rightX + 1.8, rightWidth - 1.8, style.muted));
        entries.forEach((entry) => {
          itemHeader(right, rightX, rightWidth, entry.title || entry.linkLabel || 'Profile', entry.url ? (entry.linkLabel || 'Profile') : '', entry.url);
          wrapped(right, entry.description, rightX, rightWidth, style.body, style.bodyLine, { color: style.muted });
        });
        links.forEach((link) => itemHeader(right, rightX, rightWidth, link.label || 'Profile', 'Open', link.url));
      });
    });
  };

  const render = () => {
    paintPage();
    renderLeft();
    renderRight();
    return {
      page,
      height: Math.max(left.y, right.y) + pageBottom,
      linkCount
    };
  };

  return { render };
}

function createRenderer(pdf, exportData, style, options = {}) {
  if (style.variant === 'sidebar') {
    return createSidebarRenderer(pdf, exportData, style, options);
  }

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

  const drawLine = (x1, y1, x2, y2, color = style.primary, width = 0.35) => {
    if (dryRun) return;
    pdf.setDrawColor(...color);
    pdf.setLineWidth(width);
    pdf.line(x1, y1, x2, y2);
  };

  const text = (value, x, lineY, size, fontStyle = 'normal', color = style.text, opts = {}) => {
    if (dryRun) return;
    setFont(pdf, size, fontStyle, color, style.font);
    pdf.text(value, x, lineY, opts);
  };

  const wrapped = (value, x, width, size = style.body, lineHeight = style.bodyLine, opts = {}) => {
    const content = cleanText(value);
    if (!content) return 0;
    setFont(pdf, size, opts.fontStyle || 'normal', opts.color || style.text, style.font);
    const lines = pdf.splitTextToSize(content, width);
    lines.forEach((line) => {
      ensureSpace(lineHeight);
      const lineX = opts.align === 'center' ? x + width / 2 : x;
      text(line, lineX, y, size, opts.fontStyle || 'normal', opts.color || style.text, opts);
      y += lineHeight;
    });
    return lines.length * lineHeight;
  };

  const bullet = (value, x, width) => {
    const content = cleanText(value);
    if (!content) return;
    setFont(pdf, style.body, 'normal', style.muted, style.font);
    const lines = pdf.splitTextToSize(content, width - 3.5);
    lines.forEach((line, index) => {
      ensureSpace(style.bodyLine);
      const prefix = index === 0 ? '- ' : '  ';
      text(`${prefix}${line}`, x, y, style.body, 'normal', style.muted);
      y += style.bodyLine;
    });
  };

  const section = (title, renderContent) => {
    const before = y;
    ensureSpace(style.section + style.sectionGap + 3);
    const label = `${style.sectionPrefix || ''}${title}`.toUpperCase();
    if (style.variant === 'centered') {
      drawLine(style.marginX, y - 1, style.marginX + 45 * style.scale, y - 1, LIGHT_GRAY, 0.25);
      drawLine(A4_WIDTH - style.marginX - 45 * style.scale, y - 1, A4_WIDTH - style.marginX, y - 1, LIGHT_GRAY, 0.25);
      text(label, A4_WIDTH / 2, y, style.section, 'bold', style.primary, { align: 'center' });
    } else if (style.variant === 'navy') {
      if (!dryRun) {
        pdf.setFillColor(...style.primary);
        pdf.rect(style.marginX, y - style.section + 1.2, 1.1 * style.scale, style.section + 1.5, 'F');
      }
      text(label, style.marginX + 2.6 * style.scale, y, style.section, 'bold', style.primary);
      drawLine(style.marginX, y + 1.2, A4_WIDTH - style.marginX, y + 1.2, [194, 213, 232], 0.2);
    } else {
      text(label, style.marginX, y, style.section, 'bold', style.primary);
      if (style.variant !== 'minimal' && style.variant !== 'code') {
        drawLine(style.marginX, y + 1.2, A4_WIDTH - style.marginX, y + 1.2, style.primary, 0.25);
      }
    }
    y += style.section + 1.2;
    renderContent();
    if (y > before) y += style.sectionGap;
  };

  const itemHeader = (leftValue, rightValue, url) => {
    const left = cleanText(leftValue);
    const right = cleanText(rightValue);
    if (!left && !right) return;

    setFont(pdf, style.small, 'bold', style.accent, style.font);
    const rightWidth = right ? pdf.getTextWidth(right) : 0;
    const leftWidth = Math.max(35, contentWidth - rightWidth - (right ? 4 * style.scale : 0));
    setFont(pdf, style.itemTitle, 'bold', style.text, style.font);
    const leftLines = left ? pdf.splitTextToSize(left, leftWidth) : [];
    const headerHeight = Math.max(style.bodyLine, leftLines.length * style.bodyLine);

    ensureSpace(headerHeight + style.itemGap);
    const headerY = y;
    leftLines.forEach((line) => {
      text(line, style.marginX, y, style.itemTitle, 'bold', style.text);
      y += style.bodyLine;
    });
    if (!leftLines.length) y += style.bodyLine;

    if (right) {
      setFont(pdf, style.small, 'bold', style.accent, style.font);
      const labelWidth = pdf.getTextWidth(right);
      const x = A4_WIDTH - style.marginX - labelWidth;
      text(right, x, headerY, style.small, 'bold', style.accent);
      if (!dryRun && url) {
        pdf.link(x, headerY - style.small + 1, labelWidth, style.small + 1, { url });
        linkCount += 1;
      }
    }
  };

  const renderHeader = () => {
    const { personal } = exportData;
    if (style.variant === 'centered') {
      if (!dryRun) {
        pdf.setFillColor(...style.pale);
        pdf.rect(0, 0, A4_WIDTH, 36 * style.scale, 'F');
      }
      text(personal.name.toUpperCase(), A4_WIDTH / 2, y + 1.5 * style.scale, style.name, 'bold', style.primary, { align: 'center' });
      y += style.nameLine + 1.5 * style.scale;
      if (personal.title) {
        wrapped(personal.title.toUpperCase(), style.marginX + 18 * style.scale, contentWidth - 36 * style.scale, style.title, style.smallLine, {
          fontStyle: 'bold',
          color: style.muted
        });
      }
      const contacts = contactItems(personal);
      if (contacts.length > 0) {
        wrapped(contacts.map((item) => item.label).join(' | '), style.marginX, contentWidth, style.small, style.smallLine, {
          color: style.muted,
          align: 'center'
        });
      }
      y += 3 * style.scale;
      return;
    }

    if (style.variant === 'navy') {
      const headerHeight = 31 * style.scale;
      if (!dryRun) {
        pdf.setFillColor(...style.primary);
        pdf.rect(0, 0, A4_WIDTH, headerHeight, 'F');
        pdf.setFillColor(...style.accent);
        pdf.rect(0, headerHeight, A4_WIDTH, 1.3 * style.scale, 'F');
      }
      text(personal.name.toUpperCase(), A4_WIDTH / 2, y + 4 * style.scale, style.name, 'bold', [255, 255, 255], { align: 'center' });
      y += style.nameLine + 4 * style.scale;
      if (personal.title) {
        wrapped(personal.title.toUpperCase(), style.marginX, contentWidth, style.title, style.smallLine, {
          fontStyle: 'bold',
          color: [184, 201, 220],
          align: 'center'
        });
      }
      const contacts = contactItems(personal);
      if (contacts.length > 0) {
        wrapped(contacts.map((item) => item.label).join(' | '), style.marginX, contentWidth, style.small, style.smallLine, {
          color: [184, 201, 220],
          align: 'center'
        });
      }
      y = headerHeight + 6 * style.scale;
      return;
    }

    text(`${style.namePrefix || ''}${personal.name.toUpperCase()}`, style.marginX, y, style.name, 'bold', style.primary);
    y += style.nameLine;
    if (personal.title) {
      wrapped(personal.title.toUpperCase(), style.marginX, contentWidth, style.title, style.smallLine, {
        fontStyle: 'bold',
        color: style.muted
      });
    }

    const contacts = contactItems(personal);
    if (contacts.length > 0) {
      let x = style.marginX;
      const maxY = y;
      contacts.forEach((item, index) => {
        const label = `${index > 0 ? ' | ' : ''}${item.label}`;
        setFont(pdf, style.small, 'normal', style.muted, style.font);
        const labelWidth = pdf.getTextWidth(label);
        if (x + labelWidth > A4_WIDTH - style.marginX) {
          x = style.marginX;
          y += style.smallLine;
        }
        text(label, x, y, style.small, 'normal', item.url ? style.accent : style.muted);
        if (!dryRun && item.url) {
          pdf.link(x, y - style.small + 1, labelWidth, style.small + 1, { url: item.url });
          linkCount += 1;
        }
        x += labelWidth + 1.5;
      });
      y = Math.max(y, maxY) + style.smallLine + 1.6;
    }

    drawLine(style.marginX, y, A4_WIDTH - style.marginX, y, style.variant === 'minimal' ? style.accent : style.primary, 0.55);
    y += 5 * style.scale;
  };

  const renderSummary = () => {
    if (!exportData.summary) return;
    section(getSectionTitle(exportData, style, 'summary', 'Profile'), () => {
      wrapped(exportData.summary, style.marginX, contentWidth, style.body, style.bodyLine, { color: style.muted });
    });
  };

  const renderEducation = () => {
    if (!exportData.education?.length) return;
    section(getSectionTitle(exportData, style, 'education', 'Education'), () => {
      exportData.education.forEach((edu) => {
        const date = [edu.startDate, edu.endDate].filter(Boolean).join(' - ');
        itemHeader(edu.degree || edu.institution, date);
        wrapped([edu.institution, edu.location].filter(Boolean).join(', '), style.marginX, contentWidth, style.body, style.bodyLine, { color: style.muted });
        if (edu.gpa) wrapped(`${edu.gradeLabel || 'GPA'}: ${edu.gpa}`, style.marginX, contentWidth, style.small, style.smallLine, { fontStyle: 'bold' });
        (edu.highlights || []).forEach((line) => bullet(line, style.marginX + 1.8, contentWidth - 1.8));
        y += style.itemGap;
      });
    });
  };

  const renderProjects = () => {
    if (!exportData.projects?.length) return;
    section(getSectionTitle(exportData, style, 'projects', 'Academic & Personal Projects'), () => {
      exportData.projects.forEach((project) => {
        const firstLink = project.links?.[0];
        itemHeader(project.name, firstLink?.label, firstLink?.url);
        wrapped(project.description, style.marginX, contentWidth, style.body, style.bodyLine, {
          fontStyle: 'italic',
          color: style.muted
        });
        (project.highlights || []).forEach((line) => bullet(line, style.marginX + 1.8, contentWidth - 1.8));
        (project.links || []).slice(1).forEach((link) => {
          const url = normalizeUrl(link.url);
          if (url) {
            wrapped(`${link.label}: ${url}`, style.marginX, contentWidth, style.small, style.smallLine, { color: style.accent });
          }
        });
        y += style.itemGap;
      });
    });
  };

  const renderExperience = () => {
    if (!exportData.experience?.length) return;
    section(getSectionTitle(exportData, style, 'experience', 'Experience'), () => {
      exportData.experience.forEach((exp) => {
        const date = [exp.startDate, exp.endDate].filter(Boolean).join(' - ');
        itemHeader([exp.position, exp.company].filter(Boolean).join(' at '), date);
        if (exp.location) wrapped(exp.location, style.marginX, contentWidth, style.body, style.bodyLine, { color: style.muted });
        (exp.highlights || []).forEach((line) => bullet(line, style.marginX + 1.8, contentWidth - 1.8));
        y += style.itemGap;
      });
    });
  };

  const renderSkills = () => {
    const skills = Object.entries(exportData.skills || {});
    if (!skills.length) return;
    section(getSectionTitle(exportData, style, 'skills', 'Technical Skills'), () => {
      skills.forEach(([category, skillList]) => {
        wrapped(`${category}: ${(skillList || []).join(', ')}`, style.marginX, contentWidth, style.body, style.bodyLine);
      });
    });
  };

  const renderCertifications = () => {
    if (!exportData.certifications?.length) return;
    section(getSectionTitle(exportData, style, 'certifications', 'Certifications'), () => {
      exportData.certifications.forEach((cert) => {
        const label = [cert.name, cert.issuer, cert.date].filter(Boolean).join(' - ');
        itemHeader(label, cert.url ? (cert.linkLabel || 'Verify') : '', cert.url);
        if (cert.credentialId) wrapped(`Credential ID: ${cert.credentialId}`, style.marginX, contentWidth, style.small, style.smallLine, { color: style.muted });
        if (cert.description) wrapped(cert.description, style.marginX, contentWidth, style.small, style.smallLine, { color: style.muted });
      });
    });
  };

  const renderAchievements = () => {
    if (!exportData.achievements?.length) return;
    section(getSectionTitle(exportData, style, 'achievements', 'Achievements'), () => {
      exportData.achievements.forEach((achievement) => {
        itemHeader([achievement.title, achievement.organization].filter(Boolean).join(' - '), achievement.date);
        wrapped(achievement.description, style.marginX, contentWidth, style.body, style.bodyLine, { color: style.muted });
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
          wrapped(entry.description, style.marginX, contentWidth, style.body, style.bodyLine, { color: style.muted });
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

function pickLayoutScale(pdf, exportData, templateId) {
  return FIT_SCALES.find((scale) => {
    const renderer = createRenderer(pdf, exportData, makeStyle(scale, templateId, exportData.customization), {
      dryRun: true,
      paginate: false
    });
    return renderer.render().height <= A4_HEIGHT;
  }) || 0.84;
}

async function generateResumePdf({ jsPDF, resumeData, customization, templateId }) {
  const exportData = {
    ...buildExportData(resumeData, customization),
    customization
  };
  const measurementPdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const scale = pickLayoutScale(measurementPdf, exportData, templateId);
  const dryRenderer = createRenderer(measurementPdf, exportData, makeStyle(scale, templateId, customization), {
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
  const renderer = createRenderer(pdf, exportData, makeStyle(scale, templateId, customization), {
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

async function generatePreviewPdf({ jsPDF, html2canvas, resumeElement }) {
  await waitForPreviewRender();

  const exportBounds = getVisualExportBounds(resumeElement);
  const exportWidth = exportBounds.width;
  const exportHeight = exportBounds.height;
  const links = getResumeLinks(resumeElement);

  resumeElement.setAttribute('data-pdf-export-root', 'true');

  try {
    const canvas = await html2canvas(resumeElement, {
      backgroundColor: '#ffffff',
      height: exportHeight,
      width: exportWidth,
      logging: false,
      scale: Math.min(3, Math.max(2, window.devicePixelRatio || 2)),
      scrollX: -window.scrollX,
      scrollY: -window.scrollY,
      useCORS: true,
      windowHeight: Math.max(document.documentElement.clientHeight, exportHeight),
      windowWidth: Math.max(document.documentElement.clientWidth, exportWidth),
      onclone: (clonedDocument) => {
        const clonedRoot = clonedDocument.querySelector('[data-pdf-export-root="true"]');
        sanitizeCanvasClone(resumeElement, clonedRoot);
        if (clonedRoot) {
          clonedRoot.style.width = `${exportWidth}px`;
          clonedRoot.style.height = `${exportHeight}px`;
          clonedRoot.style.minHeight = `${exportHeight}px`;
        }
      }
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    const pageCount = addCanvasPagesToPdf(pdf, canvas);
    const linkCount = addResumeLinks(pdf, links, pageCount);

    return { pdf, pageCount, linkCount };
  } finally {
    resumeElement.removeAttribute('data-pdf-export-root');
  }
}

function Download() {
  const location = useLocation();
  const { resumeData, customization, selectedTemplate } = useResume();
  const queryTemplate = new URLSearchParams(location.search).get('template');
  const templateId = getTemplateId(queryTemplate || selectedTemplate);
  const previewRef = useRef(null);
  const pdfPreparationRef = useRef(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState('');
  const [shareNotice, setShareNotice] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [pdfCache, setPdfCache] = useState(null);
  const [shareSupport, setShareSupport] = useState({
    checked: false,
    mobileLike: false,
    webShare: false
  });
  const resumeValidation = React.useMemo(() => validateResumeData(resumeData), [resumeData]);

  const candidateName = [
    resumeData?.personalInfo?.firstName,
    resumeData?.personalInfo?.lastName
  ].filter(Boolean).join(' ').trim();
  const documentTitle = `Resume_${candidateName.replace(/\s+/g, '_') || 'Export'}`;

  const preparePdfBlob = React.useCallback(async () => {
    if (pdfCache?.blob) {
      return pdfCache;
    }

    if (pdfPreparationRef.current) {
      return pdfPreparationRef.current;
    }

    const preparation = (async () => {
      let exportResult;

      try {
        exportResult = await generateServerPdf({
          resumeData,
          customization,
          templateId
        });
      } catch (serverError) {
        console.warn('Server PDF export failed, falling back to client renderer:', serverError);
        const { jsPDF } = await import('jspdf');
        try {
          const { default: html2canvas } = await import('html2canvas');
          const resumeElement = previewRef.current?.querySelector('[data-resume-measure-root]');
          if (!resumeElement) {
            throw new Error('Resume preview is not ready yet.');
          }
          exportResult = await generatePreviewPdf({ jsPDF, html2canvas, resumeElement });
        } catch (captureError) {
          console.warn('Client preview PDF export failed, falling back to vector renderer:', captureError);
          exportResult = await generateResumePdf({
            jsPDF,
            resumeData,
            customization,
            templateId
          });
        }
      }

      const preparedPdf = {
        ...exportResult,
        blob: exportResult.blob || exportResult.pdf.output('blob'),
        fileName: `${documentTitle}.pdf`
      };

      setPdfCache(preparedPdf);
      return preparedPdf;
    })();

    pdfPreparationRef.current = preparation;

    try {
      return await preparation;
    } finally {
      pdfPreparationRef.current = null;
    }
  }, [customization, documentTitle, pdfCache, resumeData, templateId]);

  const handleExportPDF = async () => {
    if (!resumeValidation.isValid) {
      setDownloadMessage('Correct the highlighted resume fields before exporting.');
      setDownloadSuccess(false);
      return;
    }
    try {
      setIsDownloading(true);
      setDownloadSuccess(false);
      setDownloadMessage('');
      setShareNotice(null);

      const { blob, fileName, pageCount, linkCount } = await preparePdfBlob();

      saveBlobAsFile(blob, fileName);
      setDownloadMessage(
        `Your ${pageCount}-page PDF is ready${linkCount > 0 ? ` with ${linkCount} clickable link${linkCount === 1 ? '' : 's'}` : ''}.`
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

  const handleShareResume = async () => {
    setShareNotice(null);

    if (!resumeValidation.isValid) {
      setShareNotice({ type: 'error', message: 'Correct the invalid resume fields before sharing.' });
      return;
    }

    if (!shareSupport.webShare) {
      setShareNotice({
        type: 'error',
        message: 'Native sharing is not supported on this browser. Please download the PDF and share it manually.'
      });
      return;
    }

    try {
      setIsSharing(true);
      if (pdfCache?.blob) {
        const shareResult = await shareResumePDF(pdfCache.blob, candidateName);
        setShareNotice({
          type: 'success',
          message: shareResult?.captionCopied
            ? 'Your resume is ready to share. The caption was also copied in case the selected app only receives the PDF.'
            : 'Your resume is ready to share.'
        });
      } else {
        await preparePdfBlob();
        setShareNotice({
          type: 'info',
          message: 'Your resume is ready. Tap Share again to open your phone sharing options.'
        });
        return;
      }
    } catch (error) {
      if (!isShareCancel(error)) {
        setShareNotice({
          type: 'error',
          message: error?.message || 'Could not open sharing. Please download the PDF and share it manually.'
        });
      }
    } finally {
      setIsSharing(false);
    }
  };

  React.useEffect(() => {
    const detectShareSupport = () => {
      const hasWindow = typeof window !== 'undefined';
      const hasNavigator = typeof navigator !== 'undefined';
      const mobileViewport = hasWindow && window.matchMedia('(max-width: 1024px)').matches;
      const touchDevice = hasNavigator && navigator.maxTouchPoints > 0;

      setShareSupport({
        checked: true,
        mobileLike: Boolean(mobileViewport || touchDevice),
        webShare: hasNavigator && Boolean(navigator.share)
      });
    };

    detectShareSupport();
    window.addEventListener('resize', detectShareSupport);

    return () => window.removeEventListener('resize', detectShareSupport);
  }, []);

  React.useEffect(() => {
    setPdfCache(null);
    pdfPreparationRef.current = null;
  }, [resumeData, customization, templateId]);

  React.useEffect(() => {
    if (!shareSupport.checked || !shareSupport.mobileLike || !shareSupport.webShare || pdfCache?.blob) {
      return undefined;
    }

    const prepareTimer = window.setTimeout(() => {
      preparePdfBlob().catch((error) => {
        console.warn('Mobile share PDF pre-cache failed:', error);
      });
    }, 700);

    return () => window.clearTimeout(prepareTimer);
  }, [pdfCache, preparePdfBlob, shareSupport.checked, shareSupport.mobileLike, shareSupport.webShare]);

  return (
    <div className="min-h-screen bg-slate-50 py-8 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {!resumeValidation.isValid && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-5 text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200" role="alert">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <h2 className="font-semibold">Your resume is not ready to export</h2>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                  {resumeValidation.errors.slice(0, 8).map((error) => <li key={`${error.path}-${error.message}`}>{error.message}</li>)}
                </ul>
                {resumeValidation.errors.length > 8 && <p className="mt-2 text-sm">And {resumeValidation.errors.length - 8} more issue(s).</p>}
                <Link to="/builder" className="mt-3 inline-flex rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800">Return to editor</Link>
              </div>
            </div>
          </div>
        )}
        <div className="mb-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-center lg:p-8">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                <Sparkles className="h-3.5 w-3.5" />
                Export center
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
                Download your resume
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-gray-400">
                Review your selected resume design, then export a polished A4 PDF that keeps your layout, spacing, and links.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-950">
              <div className="mb-4 flex items-center gap-3 text-sm text-slate-600 dark:text-gray-300">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-950 dark:text-white">Selected design</p>
                  <p>Ready for PDF export</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={handleExportPDF}
                  className="flex min-h-11 items-center gap-2 px-5"
                  disabled={isDownloading || isSharing || !resumeValidation.isValid}
                >
                  {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <DownloadIcon size={18} />}
                  {isDownloading ? 'Preparing PDF' : 'Download PDF'}
                </Button>

                {shareSupport.checked && shareSupport.mobileLike ? (
                  <Button
                    variant="secondary"
                    className="flex min-h-11 items-center gap-2 px-5"
                    onClick={handleShareResume}
                    disabled={isDownloading || isSharing || !resumeValidation.isValid}
                  >
                    {isSharing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShareIcon size={18} />}
                    {isSharing ? 'Preparing share...' : 'Share'}
                  </Button>
                ) : (
                  <div className="flex min-h-11 items-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
                    Sharing is available on mobile devices.
                  </div>
                )}
              </div>

              {shareNotice && (
                <div className={`mt-3 rounded-lg border px-3 py-2 text-sm ${
                  shareNotice.type === 'error'
                    ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200'
                    : shareNotice.type === 'success'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200'
                      : 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200'
                }`}>
                  {shareNotice.message}
                </div>
              )}
            </div>
          </div>

          {downloadMessage && (
            <div className={`mx-6 mb-6 flex items-start gap-3 rounded-lg border p-4 text-sm lg:mx-8 ${
              downloadSuccess
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200'
                : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200'
            }`}>
              {downloadSuccess ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />}
              <p className="font-medium">{downloadMessage}</p>
            </div>
          )}
        </div>

        <div className="mb-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm no-print dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-gray-800 dark:bg-gray-950 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm ring-1 ring-slate-200 dark:bg-gray-900 dark:ring-gray-800">
                <Eye className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-950 dark:text-white">Preview before downloading</p>
                <p className="text-xs text-slate-500 dark:text-gray-400">Scroll inside the preview to review the full resume.</p>
              </div>
            </div>
            <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
              A4 PDF preview
            </span>
          </div>

          <div className="bg-slate-100 p-3 dark:bg-gray-950 sm:p-5">
            <div className="rounded-lg border border-slate-200 bg-slate-900 p-3 shadow-inner dark:border-gray-800 sm:p-5">
              <div ref={previewRef} className="mx-auto w-full max-w-[1080px]">
                <ResumePreview />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Download;
