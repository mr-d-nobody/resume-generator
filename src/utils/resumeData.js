const LEGACY_LINK_FIELDS = [
  ['LinkedIn', 'linkedin'],
  ['GitHub', 'github'],
  ['Website', 'website']
];

const EMPTY_PLACEHOLDER = /^(?:none|null|undefined|n\/a|na|not available|not applicable|nil|-+)$/i;
const EDUCATION_GRADE_LABELS = ['CGPA', 'GPA', 'Percentage'];

function normalizeEducationGradeLabel(value) {
  const label = asString(value);
  return EDUCATION_GRADE_LABELS.find((option) => option.toLowerCase() === label.toLowerCase()) || 'GPA';
}

export const asString = (value) => {
  if (typeof value !== 'string') return '';
  const cleanValue = value.trim();
  return !cleanValue || EMPTY_PLACEHOLDER.test(cleanValue) ? '' : cleanValue;
};
const asArray = (value) => Array.isArray(value) ? value : [];
const asDate = (value) => {
  const date = asString(value);
  return /^(date|start date|end date|grad date)$/i.test(date) ? '' : date;
};

export function formatMonthYear(value) {
  const cleanValue = asDate(value);
  if (!cleanValue || /^(?:present|current)$/i.test(cleanValue)) return cleanValue;
  const match = cleanValue.match(/^(\d{4})-(0[1-9]|1[0-2])(?:-\d{2})?$/);
  if (!match) return cleanValue;
  const [, year, month] = match;
  const monthName = new Intl.DateTimeFormat('en', { month: 'long', timeZone: 'UTC' })
    .format(new Date(Date.UTC(2000, Number(month) - 1, 1)));
  return `${monthName} ${year}`;
}

export function normalizeUrl(value) {
  const raw = asString(value);
  if (!raw) return '';

  if (/^(mailto:|tel:)/i.test(raw)) return raw;
  if (/^[a-z][a-z\d+.-]*:/i.test(raw) && !/^https?:/i.test(raw)) return '';

  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(candidate);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

export function renderOptionalField(value, render = (cleanValue) => cleanValue) {
  const cleanValue = asString(value);
  return cleanValue ? render(cleanValue) : null;
}

export function formatDateRange(startDate, endDate) {
  return [formatMonthYear(startDate), formatMonthYear(endDate)].filter(Boolean).join(' – ');
}

function normalizeCustomLinks(links) {
  return asArray(links)
    .map((link, index) => ({
      id: link?.id || `link-${index}`,
      label: asString(link?.label) || 'Link',
      url: normalizeUrl(link?.url),
      displayMode: link?.displayMode === 'url' ? 'url' : 'label'
    }))
    .filter((link) => link.url);
}

export function inferLinkLabel(url, fallback = 'Link') {
  const normalized = normalizeUrl(url);
  if (!normalized) return fallback;

  try {
    const host = new URL(normalized).hostname.replace(/^www\./, '').toLowerCase();
    if (host.includes('github.com')) return 'GitHub';
    if (host.includes('leetcode.com')) return 'LeetCode';
    if (host.includes('codeforces.com')) return 'Codeforces';
    if (host.includes('hackerrank.com')) return 'HackerRank';
    if (host.includes('kaggle.com')) return 'Kaggle';
    if (host.includes('behance.net')) return 'Behance';
    if (host.includes('dribbble.com')) return 'Dribbble';
    return fallback;
  } catch {
    return fallback;
  }
}

export function normalizeProjectLinks(project = {}) {
  const links = asArray(project.links).map((link, index) => ({
    id: link?.id || `project-link-${index}`,
    label: asString(link?.label) || inferLinkLabel(link?.url, 'Live Demo'),
    url: normalizeUrl(link?.url)
  })).filter((link) => link.url);

  const legacyUrl = normalizeUrl(project.link);
  if (legacyUrl && !links.some((link) => link.url.toLowerCase() === legacyUrl.toLowerCase())) {
    links.unshift({
      id: 'project-link-legacy',
      label: asString(project.linkLabel) || inferLinkLabel(legacyUrl, 'Live Demo'),
      url: legacyUrl
    });
  }

  return links;
}

const comparableText = (value) => asString(value).replace(/\s+/g, ' ').toLowerCase();

export function normalizeProjectHighlights(project = {}) {
  const description = asString(project.description);
  const descriptionKey = comparableText(description);
  const highlights = asArray(project.highlights).map(asString).filter(Boolean);

  // Older manual-builder saves generated highlights by splitting the project
  // description. Suppress that legacy duplicate while preserving genuinely
  // independent highlights from manual entry and Magic Upload.
  if (descriptionKey && comparableText(highlights.join('\n')) === descriptionKey) {
    return [];
  }

  const seen = new Set();
  return highlights.filter((highlight) => {
    const key = comparableText(highlight);
    if (!key || key === descriptionKey || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function normalizeResumeLinks(personalInfo = {}) {
  const customLinks = normalizeCustomLinks(personalInfo.links);

  const seenUrls = new Set(customLinks.map((link) => link.url.toLowerCase()));
  const legacyLinks = LEGACY_LINK_FIELDS.map(([label, field]) => ({
    id: `legacy-${field}`,
    label,
    url: normalizeUrl(personalInfo[field]),
    displayMode: personalInfo.linkDisplay?.[field] === 'url' ? 'url' : 'label'
  })).filter((link) => {
    if (!link.url || seenUrls.has(link.url.toLowerCase())) return false;
    seenUrls.add(link.url.toLowerCase());
    return true;
  });

  return [...legacyLinks, ...customLinks];
}

export function normalizeCertification(certification = {}, index = 0) {
  return {
    ...certification,
    id: certification.id || `certification-${index}`,
    name: asString(certification.name),
    issuer: asString(certification.issuer),
    date: asDate(certification.date),
    expirationDate: asDate(certification.expirationDate),
    credentialId: asString(certification.credentialId || certification.credentialID),
    url: normalizeUrl(
      certification.url ||
      certification.certificateURL ||
      certification.credentialURL ||
      certification.verifyLink
    ),
    linkLabel: asString(certification.linkLabel || certification.verifyLabel) || 'Verify',
    description: asString(certification.description)
  };
}

export function normalizeResumeData(resumeData = {}) {
  const personalInfo = {
    ...(resumeData.personalInfo || {}),
    links: normalizeCustomLinks(resumeData.personalInfo?.links)
  };
  delete personalInfo.photo;

  return {
    ...resumeData,
    personalInfo,
    experience: asArray(resumeData.experience),
    education: asArray(resumeData.education),
    skills: asArray(resumeData.skills),
    projects: asArray(resumeData.projects).map((project) => ({
      ...project,
      description: asString(project?.description),
      highlights: normalizeProjectHighlights(project),
      links: normalizeProjectLinks(project)
    })),
    certifications: asArray(resumeData.certifications)
      .map(normalizeCertification)
      .filter((certificate) => [
        certificate.name, certificate.issuer, certificate.date,
        certificate.expirationDate, certificate.credentialId,
        certificate.url, certificate.description
      ].some(Boolean)),
    achievements: asArray(resumeData.achievements),
    customSections: asArray(resumeData.customSections),
    languages: asArray(resumeData.languages)
  };
}

export function transformResumeData(resumeData = {}, customization = {}) {
  const normalized = normalizeResumeData(resumeData);
  const {
    personalInfo, experience, education, skills, certifications,
    achievements, projects, customSections
  } = normalized;
  const visibility = customization.sectionVisibility || {};
  const groupedSkills = skills.reduce((groups, skill) => {
    const name = asString(typeof skill === 'string' ? skill : skill?.name);
    if (!name) return groups;
    const category = asString(skill?.category) || 'Skills';
    groups[category] = [...(groups[category] || []), name];
    return groups;
  }, {});

  return {
    personal: {
      name: [asString(personalInfo.firstName), asString(personalInfo.lastName)].filter(Boolean).join(' ') || 'Your Name',
      title: asString(personalInfo.title),
      email: asString(personalInfo.email),
      phone: asString(personalInfo.phone),
      location: asString(personalInfo.location),
      links: normalizeResumeLinks(personalInfo)
    },
    summary: visibility.summary === false ? '' : asString(personalInfo.summary),
    experience: visibility.experience === false ? [] : experience.filter((item) => [
      item?.company, item?.position, item?.location, item?.startDate,
      item?.endDate, item?.description, ...(asArray(item?.highlights))
    ].some((value) => asString(value))).map((item, index) => ({
      ...item,
      id: item?.id || `experience-${index}`,
      company: asString(item?.company),
      position: asString(item?.position),
      location: asString(item?.location),
      startDate: formatMonthYear(item?.startDate),
      endDate: item?.current === true ? 'Present' : formatMonthYear(item?.endDate),
      highlights: asArray(item?.highlights).length
        ? asArray(item.highlights).map(asString).filter(Boolean)
        : asString(item?.description).split('\n').map(asString).filter(Boolean)
    })),
    education: visibility.education === false ? [] : education.filter((item) => [
      item?.institution, item?.degree, item?.location, item?.startDate,
      item?.graduationDate, item?.endDate, item?.cgpa, item?.gpa,
      item?.description, ...(asArray(item?.highlights))
    ].some((value) => asString(value))).map((item, index) => ({
      ...item,
      id: item?.id || `education-${index}`,
      institution: asString(item?.institution),
      degree: asString(item?.degree),
      location: asString(item?.location),
      startDate: formatMonthYear(item?.startDate),
      endDate: formatMonthYear(item?.graduationDate || item?.endDate),
      gpa: asString(item?.cgpa || item?.gpa),
      gradeLabel: normalizeEducationGradeLabel(item?.gradeLabel),
      highlights: asArray(item?.highlights).length
        ? asArray(item.highlights).map(asString).filter(Boolean)
        : asString(item?.description).split('\n').map(asString).filter(Boolean)
    })),
    skills: visibility.skills === false ? {} : groupedSkills,
    certifications: visibility.certifications === false ? [] : certifications.map((certificate) => ({
      ...certificate,
      date: formatMonthYear(certificate.date),
      expirationDate: formatMonthYear(certificate.expirationDate)
    })),
    achievements: visibility.achievements === false ? [] : achievements.filter((item) => [
      item?.title, item?.organization, item?.date, item?.description
    ].some((value) => asString(value))).map((item, index) => ({
      ...item,
      id: item?.id || `achievement-${index}`,
      title: asString(item?.title),
      organization: asString(item?.organization),
      date: formatMonthYear(item?.date),
      description: asString(item?.description)
    })),
    projects: visibility.projects === false ? [] : projects.filter((item) => [
      item?.name, item?.link, item?.description, ...(asArray(item?.links)),
      ...(asArray(item?.highlights))
    ].some((value) => asString(value))).map((item, index) => ({
      ...item,
      id: item?.id || `project-${index}`,
      name: asString(item?.name),
      links: normalizeProjectLinks(item),
      description: asString(item?.description),
      highlights: asArray(item?.highlights).map(asString).filter(Boolean)
    })),
    sectionTitles: customization.sectionTitles || {},
    customSections
  };
}
