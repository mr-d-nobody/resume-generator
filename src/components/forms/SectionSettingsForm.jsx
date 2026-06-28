import React from 'react';
import { RotateCcw } from 'lucide-react';
import { useResume } from '../../contexts/ResumeContext';
import { DEFAULT_SECTION_TITLES, STANDARD_SECTIONS } from '../../utils/resumeSections';

export default function SectionSettingsForm() {
  const { customization, renameSection } = useResume();
  const titles = customization.sectionTitles || {};

  return (
    <div className="card rounded-lg bg-white p-4 shadow-sm dark:bg-gray-900 min-[390px]:p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Section titles</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Rename standard headings without changing how their content works.
      </p>

      <div className="space-y-4">
        {STANDARD_SECTIONS.map(({ type, title }) => (
            <div key={type} className="flex items-end gap-2">
              <div className="flex-1">
                <label htmlFor={`section-title-${type}`} className="form-label">{title}</label>
                <input
                  id={`section-title-${type}`}
                  className="form-input"
                  value={titles[type] ?? title}
                  onChange={(event) => renameSection(type, event.target.value)}
                />
              </div>
              <button
                type="button"
                className="btn-secondary h-[42px] px-3"
                onClick={() => renameSection(type, DEFAULT_SECTION_TITLES[type])}
                aria-label={`Reset ${title} title`}
                title="Reset title"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
        ))}
      </div>
    </div>
  );
}
