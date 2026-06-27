import baseTemplateConfig from '../data/template-config.json';

export const COLOR_THEMES = [
  {
    id: 'emerald',
    label: 'Emerald',
    primaryColor: '#0f5b4d',
    secondaryColor: '#4b635f',
    textColor: '#17201f'
  },
  {
    id: 'blue',
    label: 'Blue',
    primaryColor: '#2563eb',
    secondaryColor: '#475569',
    textColor: '#1e293b'
  },
  {
    id: 'ink',
    label: 'Ink',
    primaryColor: '#1f2937',
    secondaryColor: '#64748b',
    textColor: '#111827'
  },
  {
    id: 'violet',
    label: 'Violet',
    primaryColor: '#5b21b6',
    secondaryColor: '#6b7280',
    textColor: '#1f2937'
  },
  {
    id: 'copper',
    label: 'Copper',
    primaryColor: '#9a3412',
    secondaryColor: '#6b7280',
    textColor: '#1f2937'
  }
];

export const FONT_OPTIONS = [
  { id: 'inter', label: 'Inter', fontFamily: 'Inter, Arial, sans-serif' },
  { id: 'system', label: 'System', fontFamily: 'Arial, Helvetica, sans-serif' },
  { id: 'serif', label: 'Serif', fontFamily: 'Georgia, Times New Roman, serif' },
  { id: 'mono', label: 'Mono', fontFamily: 'Courier New, Courier, monospace' }
];

export const DEFAULT_LAYOUT = {
  sectionGap: 1.35,
  itemGap: 0.85,
  density: 1
};

export function getDensityScale(layout = {}) {
  const value = Number(layout.density);
  return Math.max(0.72, Math.min(1.18, Number.isFinite(value) ? value : DEFAULT_LAYOUT.density));
}

export function getDensityStyle(layout = {}) {
  const density = getDensityScale(layout);
  return {
    width: `${100 / density}%`,
    transform: `scale(${density})`,
    transformOrigin: 'top left'
  };
}

export function getColorTheme(themeId) {
  return COLOR_THEMES.find((theme) => theme.id === themeId) || COLOR_THEMES[0];
}

export function getFontOption(fontId) {
  return FONT_OPTIONS.find((font) => font.id === fontId) || FONT_OPTIONS[0];
}

export function getLayoutSettings(layout = {}) {
  return {
    sectionGap: Number.isFinite(Number(layout.sectionGap))
      ? Number(layout.sectionGap)
      : DEFAULT_LAYOUT.sectionGap,
    itemGap: Number.isFinite(Number(layout.itemGap))
      ? Number(layout.itemGap)
      : DEFAULT_LAYOUT.itemGap,
    density: Number.isFinite(Number(layout.density))
      ? Number(layout.density)
      : DEFAULT_LAYOUT.density
  };
}

export function buildTemplateConfig(customization = {}) {
  const theme = getColorTheme(customization.colorTheme);
  const font = getFontOption(customization.fontFamily);
  const layout = getLayoutSettings(customization.layout);
  const densityScale = getDensityScale(layout);

  return {
    ...baseTemplateConfig,
    theme: {
      ...baseTemplateConfig.theme,
      primaryColor: theme.primaryColor,
      secondaryColor: theme.secondaryColor,
      textColor: theme.textColor,
      fontFamily: font.fontFamily
    },
    spacing: {
      ...baseTemplateConfig.spacing,
      sectionGap: `${layout.sectionGap}rem`,
      itemGap: `${layout.itemGap}rem`
    },
    layout,
    densityScale,
    densityStyle: getDensityStyle(layout)
  };
}
