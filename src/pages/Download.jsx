import React, { useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useResume } from '../contexts/ResumeContext';
import ResumePreview from '../components/preview/ResumePreview';
import { Button } from '../components/ui';
import { Download as DownloadIcon, Share2 as ShareIcon } from 'lucide-react';
import { normalizeCustomSection } from '../utils/resumeSections';
import { normalizeUrl, transformResumeData } from '../utils/resumeData';
import { DEFAULT_LAYOUT, getColorTheme, getLayoutSettings } from '../utils/templateStyle';

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
  let bottom = rootRect.bottom;

  resumeElement.querySelectorAll('*').forEach((element) => {
    [...element.getClientRects()].forEach((rect) => {
      if (rect.width > 0 && rect.height > 0) {
        bottom = Math.max(bottom, rect.bottom);
      }
    });
  });

  return {
    width: Math.ceil(rootRect.width),
    height: Math.ceil(Math.max(rootRect.height, bottom - rootRect.top))
  };
}

function getResumeLinks(resumeElement) {
  const rootRect = resumeElement.getBoundingClientRect();
  const pageHeightPx = rootRect.width * (A4_HEIGHT / A4_WIDTH);
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
  const pageHeightPx = Math.floor(canvas.width * (A4_HEIGHT / A4_WIDTH));
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
      pageCanvas.toDataURL('image/jpeg', 0.94),
      'JPEG',
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
            wrapped(left, `GPA: ${edu.gpa}`, leftMargin, sidebarContentWidth, style.small, style.smallLine, {
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
        if (edu.gpa) wrapped(`GPA: ${edu.gpa}`, style.marginX, contentWidth, style.small, style.smallLine, { fontStyle: 'bold' });
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
      scale: Math.min(2, Math.max(1.35, window.devicePixelRatio || 1.5)),
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
      let exportResult;
      let usedFallback = false;

      try {
        const { default: html2canvas } = await import('html2canvas');
        const resumeElement = previewRef.current?.querySelector('.resume-print-page');
        if (!resumeElement) {
          throw new Error('Resume preview is not ready yet.');
        }
        exportResult = await generatePreviewPdf({ jsPDF, html2canvas, resumeElement });
      } catch (captureError) {
        console.warn('Preview PDF export failed, falling back to vector renderer:', captureError);
        usedFallback = true;
        exportResult = await generateResumePdf({
          jsPDF,
          resumeData,
          customization,
          templateId
        });
      }

      const { pdf, pageCount, linkCount } = exportResult;

      pdf.save(`${getDocumentTitle()}.pdf`);
      setDownloadMessage(
        `Downloaded template ${templateId} as a ${pageCount}-page A4 PDF${usedFallback ? ' with the backup renderer' : ' matching the preview'}${linkCount > 0 ? ` with ${linkCount} clickable link${linkCount === 1 ? '' : 's'}` : ''}.`
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
            Export template {templateId} as an exact A4 PDF from the preview.
          </p>
        </div>

        <div className="card p-6 mb-8">
          <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50 p-4 text-center text-sm text-blue-950 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-100">
            <p className="font-semibold">Exact selected-template A4 PDF export</p>
            <p className="mt-1">
              The PDF is generated from the same preview, so font, layout, density, and spacing stay aligned.
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
            <div ref={previewRef} className="resume-container bg-white w-fit mx-auto border border-gray-200 shadow-sm">
              <ResumePreview isPrintMode={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Download;
