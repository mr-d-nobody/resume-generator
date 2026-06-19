export const STANDARD_SECTIONS = [
  { id: 'summary', type: 'summary', title: 'Summary' },
  { id: 'experience', type: 'experience', title: 'Experience' },
  { id: 'education', type: 'education', title: 'Education' },
  { id: 'skills', type: 'skills', title: 'Skills' },
  { id: 'projects', type: 'projects', title: 'Projects' },
  { id: 'certifications', type: 'certifications', title: 'Certifications' },
  { id: 'achievements', type: 'achievements', title: 'Achievements' }
];

export const DEFAULT_SECTION_TITLES = Object.fromEntries(
  STANDARD_SECTIONS.map(({ type, title }) => [type, title])
);

export function getSectionTitle(sectionTitles, type, fallback) {
  const title = sectionTitles?.[type];
  return typeof title === 'string' && title.trim() ? title.trim() : fallback;
}

export function normalizeCustomSection(section, index = 0) {
  const content = Array.isArray(section?.content)
    ? section.content
    : Array.isArray(section?.items)
      ? section.items
      : String(section?.description || section?.content || '').split('\n');
  const items = content.map(item => String(item || '').trim()).filter(Boolean);
  const links = (Array.isArray(section?.links) ? section.links : [])
    .map((link, linkIndex) => ({
      id: link?.id || `custom-link-${index}-${linkIndex}`,
      label: String(link?.label || '').trim() || 'Profile',
      url: String(link?.url || '').trim()
    }))
    .filter(link => link.url);
  const explicitEntries = (Array.isArray(section?.entries) ? section.entries : [])
    .map((entry, entryIndex) => ({
      id: entry?.id || `custom-entry-${index}-${entryIndex}`,
      title: String(entry?.title || entry?.label || '').trim(),
      description: String(entry?.description || entry?.details || '').trim(),
      url: String(entry?.url || '').trim(),
      linkLabel: String(entry?.linkLabel || entry?.label || '').trim() || 'Profile'
    }))
    .filter(entry => entry.title || entry.description || entry.url);
  const derivedProfileEntries = explicitEntries.length === 0 && links.length > 0
    ? items.map((item, entryIndex) => {
      const [rawTitle, ...details] = item.split(':');
      const title = rawTitle.trim();
      const matchingLink = links.find(link =>
        link.label.toLowerCase() === title.toLowerCase()
      );
      return {
        id: `derived-custom-entry-${index}-${entryIndex}`,
        title,
        description: details.join(':').trim(),
        url: matchingLink?.url || '',
        linkLabel: matchingLink?.label || title || 'Profile'
      };
    }).filter(entry => entry.title && entry.description)
    : [];
  const entries = explicitEntries.length > 0 ? explicitEntries : derivedProfileEntries;
  const displayItems = derivedProfileEntries.length > 0 ? [] : items;

  return {
    ...section,
    id: section?.id || `custom-${Date.now()}-${index}`,
    type: section?.type || 'custom',
    title: String(section?.title || '').trim() || 'Custom Section',
    content: displayItems,
    description: displayItems.join('\n'),
    links: derivedProfileEntries.length > 0 ? [] : links,
    entries,
    order: Number.isFinite(section?.order) ? section.order : index,
    visible: section?.visible !== false
  };
}

export function buildUnifiedSections(resumeData, customization = {}) {
  const visibility = customization.sectionVisibility || {};
  const configuredOrder = customization.sectionOrder || [];
  const standardSections = STANDARD_SECTIONS.map((section, index) => ({
    ...section,
    title: getSectionTitle(customization.sectionTitles, section.type, section.title),
    content: section.type === 'summary'
      ? resumeData?.personalInfo?.summary || ''
      : resumeData?.[section.type] || [],
    order: configuredOrder.indexOf(section.type) >= 0
      ? configuredOrder.indexOf(section.type)
      : index,
    visible: visibility[section.type] !== false
  }));
  const customSections = (resumeData?.customSections || []).map(normalizeCustomSection);

  return [...standardSections, ...customSections];
}

export function customSectionFromStandard(type, data, sectionTitles) {
  const title = getSectionTitle(
    sectionTitles,
    type,
    DEFAULT_SECTION_TITLES[type] || type
  );
  let items = [];

  if (type === 'summary') {
    items = data.summary ? [data.summary] : [];
  } else if (type === 'experience') {
    items = (data.experience || []).map(item =>
      [
        [item.position, item.company].filter(Boolean).join(' at '),
        [item.startDate, item.endDate].filter(Boolean).join(' – '),
        ...(item.highlights || [])
      ].filter(Boolean).join(' — ')
    );
  } else if (type === 'education') {
    items = (data.education || []).map(item =>
      [item.degree, item.institution, [item.startDate, item.endDate].filter(Boolean).join(' – '), item.gpa]
        .filter(Boolean)
        .join(' — ')
    );
  } else if (type === 'skills') {
    items = Object.entries(data.skills || {}).map(([category, skills]) =>
      `${category}: ${(skills || []).join(', ')}`
    );
  } else if (type === 'projects') {
    items = (data.projects || []).map(item =>
      [item.name, item.description, ...(item.highlights || []), item.link].filter(Boolean).join(' — ')
    );
  } else if (type === 'achievements') {
    items = (data.achievements || []).map(item =>
      [item.title, item.organization, item.date, item.description].filter(Boolean).join(' — ')
    );
  } else if (type === 'certifications') {
    items = (data.certifications || []).map(item =>
      [item.name, item.issuer, item.date].filter(Boolean).join(' — ')
    );
  }

  return {
    id: `standard-fallback-${type}`,
    type,
    title,
    content: items,
    items,
    description: items.join('\n'),
    visible: true
  };
}
