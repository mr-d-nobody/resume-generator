import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PersonalInfoForm from '../components/forms/PersonalInfoForm';
import ExperienceForm from '../components/forms/ExperienceForm';
import EducationForm from '../components/forms/EducationForm';
import SkillsForm from '../components/forms/SkillsForm';
import CertificationForm from '../components/forms/CertificationForm';
import AchievementForm from '../components/forms/AchievementForm';
import ProjectForm from '../components/forms/ProjectForm';
import CustomSectionForm from '../components/forms/CustomSectionForm';
import SummaryForm from '../components/forms/SummaryForm';
import SectionSettingsForm from '../components/forms/SectionSettingsForm';
import ResumePreview from '../components/preview/ResumePreview';
import { useResume } from '../contexts/ResumeContext';
import {
  COLOR_THEMES,
  DEFAULT_LAYOUT,
  FONT_OPTIONS,
  getLayoutSettings
} from '../utils/templateStyle';
import {
  Award,
  Briefcase,
  Check,
  Code,
  Download,
  Eye,
  FileText,
  FolderGit2,
  GraduationCap,
  LayoutTemplate,
  Palette,
  Rows3,
  Settings2,
  SlidersHorizontal,
  Trophy,
  Type,
  User
} from 'lucide-react';

const TEMPLATE_IDS = ['11', '12', '13', '14', '15', '16'];

const templateChoices = [
  { id: '11', name: 'Classic', tone: 'Linear', accent: 'border-t-4' },
  { id: '12', name: 'Professional', tone: 'Sidebar', accent: 'border-l-[18px]' },
  { id: '13', name: 'Centered', tone: 'Editorial', accent: 'border-t-[18px]' },
  { id: '14', name: 'Minimal', tone: 'ATS', accent: 'border-t' },
  { id: '15', name: 'Developer', tone: 'Code', accent: 'border-t-4' },
  { id: '16', name: 'Executive', tone: 'Banner', accent: 'border-t-[18px]' }
];

function getQueryTemplate(search) {
  const value = new URLSearchParams(search).get('template');
  return TEMPLATE_IDS.includes(value) ? value : '';
}

function ResumeBuilder() {
  const location = useLocation();
  const {
    resumeData,
    selectedTemplate,
    customization,
    setTemplate,
    updateCustomization
  } = useResume();
  const requestedTemplate = getQueryTemplate(location.search);
  const activeTemplate = TEMPLATE_IDS.includes(selectedTemplate) ? selectedTemplate : '12';

  const [activeTab, setActiveTab] = useState('personal');
  const [mobileView, setMobileView] = useState('edit');
  const [workspaceMode, setWorkspaceMode] = useState('edit');
  const [customizeTab, setCustomizeTab] = useState('template');

  useEffect(() => {
    if (requestedTemplate && requestedTemplate !== selectedTemplate) {
      setTemplate(requestedTemplate);
    }
  }, [requestedTemplate, selectedTemplate, setTemplate]);

  const layout = getLayoutSettings(customization.layout);

  const tabs = [
    { id: 'personal', label: 'Details', icon: User, component: PersonalInfoForm },
    { id: 'summary', label: 'Profile', icon: FileText, component: SummaryForm },
    { id: 'experience', label: 'Experience', icon: Briefcase, component: ExperienceForm },
    { id: 'education', label: 'Education', icon: GraduationCap, component: EducationForm },
    { id: 'skills', label: 'Expertise', icon: Code, component: SkillsForm },
    { id: 'projects', label: 'Projects', icon: FolderGit2, component: ProjectForm },
    { id: 'certifications', label: 'Certificates', icon: Award, component: CertificationForm },
    { id: 'achievements', label: 'Awards', icon: Trophy, component: AchievementForm },
    { id: 'custom', label: 'Sections', icon: Rows3, component: CustomSectionForm },
    { id: 'sections', label: 'Headings', icon: Settings2, component: SectionSettingsForm }
  ];

  const score = useMemo(() => {
    const checks = [
      resumeData.personalInfo?.firstName,
      resumeData.personalInfo?.lastName,
      resumeData.personalInfo?.email,
      resumeData.personalInfo?.phone,
      resumeData.personalInfo?.title,
      resumeData.personalInfo?.summary,
      resumeData.education?.length,
      resumeData.skills?.length,
      resumeData.projects?.length,
      resumeData.experience?.length || resumeData.certifications?.length
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [resumeData]);

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;
  const currentStepIndex = tabs.findIndex((tab) => tab.id === activeTab);
  const downloadPath = `/download?template=${activeTemplate}`;

  const setColorTheme = (colorTheme) => updateCustomization({ colorTheme });
  const setFontFamily = (fontFamily) => updateCustomization({ fontFamily });
  const setLayoutValue = (key, value) => {
    updateCustomization({
      layout: {
        ...DEFAULT_LAYOUT,
        ...(customization.layout || {}),
        [key]: Number(value)
      }
    });
  };

  const renderTemplateCard = (template) => {
    const selected = activeTemplate === template.id;
    const theme = COLOR_THEMES.find((item) => item.id === customization.colorTheme) || COLOR_THEMES[0];
    return (
      <button
        key={template.id}
        type="button"
        onClick={() => setTemplate(template.id)}
        className={`group rounded-md border bg-white p-3 text-left transition hover:border-blue-300 hover:shadow-sm dark:bg-gray-900 ${
          selected ? 'border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900/50' : 'border-gray-200 dark:border-gray-700'
        }`}
      >
        <div className={`relative mb-3 h-36 overflow-hidden rounded border border-gray-200 bg-white ${template.accent}`} style={{ borderColor: theme.primaryColor }}>
          <div className="absolute inset-x-5 top-5 h-1.5 rounded bg-gray-900/80" />
          <div className="absolute inset-x-5 top-9 h-px bg-gray-200" />
          <div className="absolute left-5 top-14 space-y-2">
            <div className="h-1.5 w-24 rounded bg-gray-700/80" />
            <div className="h-1 w-32 rounded bg-gray-300" />
            <div className="h-1 w-28 rounded bg-gray-300" />
          </div>
          <div className="absolute bottom-5 left-5 right-5 space-y-1.5">
            <div className="h-1 w-full rounded bg-gray-200" />
            <div className="h-1 w-5/6 rounded bg-gray-200" />
            <div className="h-1 w-2/3 rounded bg-gray-200" />
          </div>
          {selected && (
            <span className="absolute bottom-2 right-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white">
              <Check className="h-4 w-4" />
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-gray-950 dark:text-white">{template.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{template.tone}</div>
          </div>
          <span className="text-xs font-semibold text-blue-600">#{template.id}</span>
        </div>
      </button>
    );
  };

  const renderCustomizePanel = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-3 rounded-md bg-gray-100 p-1 dark:bg-gray-800">
        {[
          { id: 'template', label: 'Template', icon: LayoutTemplate },
          { id: 'text', label: 'Text', icon: Type },
          { id: 'layout', label: 'Layout', icon: SlidersHorizontal }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCustomizeTab(tab.id)}
              className={`flex items-center justify-center gap-2 rounded px-3 py-2 text-sm font-semibold ${
                customizeTab === tab.id ? 'bg-white text-gray-950 shadow-sm dark:bg-gray-950 dark:text-white' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {customizeTab === 'template' && (
        <div className="space-y-6">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
              <Palette className="h-4 w-4" />
              Main color
            </div>
            <div className="flex flex-wrap gap-3">
              {COLOR_THEMES.map((theme) => {
                const selected = (customization.colorTheme || 'emerald') === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setColorTheme(theme.id)}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 shadow-sm ${
                      selected ? 'border-gray-900 dark:border-white' : 'border-white dark:border-gray-700'
                    }`}
                    style={{ backgroundColor: theme.primaryColor }}
                    aria-label={theme.label}
                    title={theme.label}
                  >
                    {selected && <Check className="h-5 w-5 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {templateChoices.map(renderTemplateCard)}
          </div>
        </div>
      )}

      {customizeTab === 'text' && (
        <div className="grid gap-3 sm:grid-cols-2">
          {FONT_OPTIONS.map((font) => {
            const selected = (customization.fontFamily || 'inter') === font.id;
            return (
              <button
                key={font.id}
                type="button"
                onClick={() => setFontFamily(font.id)}
                className={`rounded-md border bg-white px-4 py-5 text-left transition dark:bg-gray-900 ${
                  selected ? 'border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900/50' : 'border-gray-200 hover:border-blue-300 dark:border-gray-700'
                }`}
              >
                <span className="block text-sm font-semibold text-gray-900 dark:text-white" style={{ fontFamily: font.fontFamily }}>
                  {font.label}
                </span>
                <span className="mt-2 block text-xs text-gray-500 dark:text-gray-400" style={{ fontFamily: font.fontFamily }}>
                  Aa Bb Cc 123
                </span>
              </button>
            );
          })}
        </div>
      )}

      {customizeTab === 'layout' && (
        <div className="space-y-6 rounded-md border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
          {[
            { key: 'sectionGap', label: 'Between sections', min: 0.7, max: 2.3, step: 0.01, value: layout.sectionGap, suffix: 'rem' },
            { key: 'itemGap', label: 'Between blocks', min: 0.4, max: 1.8, step: 0.01, value: layout.itemGap, suffix: 'rem' },
            { key: 'density', label: 'Resume density', min: 0.72, max: 1.12, step: 0.01, value: layout.density, suffix: 'x' }
          ].map((control) => (
            <label key={control.key} className="grid gap-3 sm:grid-cols-[150px_1fr_70px] sm:items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{control.label}</span>
              <input
                type="range"
                min={control.min}
                max={control.max}
                step={control.step}
                value={control.value}
                onChange={(event) => setLayoutValue(control.key, event.target.value)}
                className="w-full accent-blue-600"
              />
              <span className="rounded-md bg-gray-100 px-3 py-2 text-center text-sm font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-200">
                {control.value.toFixed(2)}{control.suffix}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-[calc(100svh-4rem)] bg-[#f4f6fb] pb-[calc(6rem+env(safe-area-inset-bottom))] dark:bg-gray-950 xl:min-h-[calc(100vh-4rem)] xl:pb-0">
      <div className="hidden border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 xl:block">
        <div className="mx-auto flex max-w-[1800px] items-center justify-center px-4 py-3">
          <div className="grid grid-cols-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
            {[
              { id: 'edit', label: 'Edit' },
              { id: 'customize', label: 'Customize' }
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setWorkspaceMode(mode.id)}
                className={`rounded-md px-10 py-2 text-sm font-semibold transition ${
                  workspaceMode === mode.id ? 'bg-white text-gray-950 shadow-sm dark:bg-gray-950 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1800px] grid-cols-1 xl:grid-cols-[minmax(560px,960px)_minmax(480px,1fr)]">
        <section className={`min-h-[calc(100svh-8rem)] bg-white dark:bg-gray-950 xl:min-h-[calc(100vh-8rem)] ${mobileView !== 'edit' ? 'hidden xl:block' : ''}`}>
          <div className="hidden border-b border-gray-200 dark:border-gray-800 xl:block">
            <div className="flex items-center gap-3 px-8 py-5">
              <span className={`rounded-md px-2.5 py-1 text-sm font-bold text-white ${score < 55 ? 'bg-rose-500' : score < 80 ? 'bg-amber-500' : 'bg-emerald-600'}`}>
                {score}%
              </span>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Resume score</span>
            </div>
          </div>

          {workspaceMode === 'edit' ? (
            <>
              <div className="hidden border-b border-gray-200 px-8 py-4 dark:border-gray-800 xl:block">
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {tabs.map((tab, index) => {
                    const Icon = tab.icon;
                    const active = tab.id === activeTab;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                          active
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 bg-white text-gray-500 hover:border-blue-200 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-blue-800 dark:hover:text-white'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {tab.label}
                        <span className="text-xs text-gray-400">{index + 1}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="resume-studio-editor h-[calc(100svh-15rem)] overflow-y-auto px-5 py-6 custom-scrollbar sm:px-8 xl:h-[calc(100vh-18rem)]">
                {ActiveComponent && <ActiveComponent />}
              </div>

              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-8 py-4 dark:border-gray-800 dark:bg-gray-950">
                <button
                  type="button"
                  disabled={currentStepIndex <= 0}
                  onClick={() => setActiveTab(tabs[Math.max(0, currentStepIndex - 1)].id)}
                  className="rounded-md border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 disabled:opacity-40 dark:border-gray-700 dark:text-gray-200"
                >
                  Back
                </button>
                <div className="hidden items-center gap-1 md:flex">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`h-2 rounded-full transition-all ${tab.id === activeTab ? 'w-6 bg-blue-600' : 'w-2 bg-gray-300'}`}
                      aria-label={tab.label}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  disabled={currentStepIndex >= tabs.length - 1}
                  onClick={() => setActiveTab(tabs[Math.min(tabs.length - 1, currentStepIndex + 1)].id)}
                  className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <div className="h-[calc(100svh-13rem)] overflow-y-auto px-6 py-6 custom-scrollbar sm:px-8 xl:h-[calc(100vh-13rem)]">
              {renderCustomizePanel()}
            </div>
          )}
        </section>

        <section className={`relative min-h-[calc(100svh-8rem)] bg-[#eef2f7] dark:bg-gray-950 xl:min-h-[calc(100vh-8rem)] ${mobileView !== 'preview' ? 'hidden xl:block' : ''}`}>
          <div className="sticky top-16 z-10 flex items-center justify-between border-b border-gray-200 bg-white/90 px-6 py-3 backdrop-blur dark:border-gray-800 dark:bg-gray-900/90">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
              <Eye className="h-4 w-4" />
              Template {activeTemplate}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileView('edit')}
                className="rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 xl:hidden dark:border-gray-700 dark:text-gray-200"
              >
                Edit
              </button>
              <Link to={downloadPath} className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                <Download className="h-4 w-4" />
                PDF
              </Link>
            </div>
          </div>

          <div className="flex min-h-[calc(100svh-12rem)] items-start justify-center px-4 py-5 pb-[calc(7rem+env(safe-area-inset-bottom))] xl:min-h-[calc(100vh-12rem)] xl:py-8 xl:pb-8">
            <div className="w-full max-w-[920px]">
              <ResumePreview />
            </div>
          </div>
        </section>
      </div>

      <div className="fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 grid grid-cols-2 rounded-lg border border-gray-200 bg-white p-1 shadow-xl dark:border-gray-800 dark:bg-gray-950 xl:hidden">
        {[
          { id: 'edit', label: 'Edit' },
          { id: 'preview', label: 'Preview' }
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setMobileView(item.id)}
            className={`rounded-md px-4 py-3 text-sm font-semibold ${
              mobileView === item.id ? 'bg-gray-100 text-gray-950 dark:bg-white dark:text-gray-950' : 'text-gray-500 dark:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ResumeBuilder;
