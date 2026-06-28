import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Sparkles, UploadCloud } from 'lucide-react';
import { useResume } from '../contexts/ResumeContext';
import { TEMPLATE_CATEGORIES } from '../data/templateCategories';

function Templates() {
  const base = import.meta.env.BASE_URL;
  const { resumeData, selectedTemplate, setTemplate, templateCategory, setTemplateCategory } = useResume();
  const categoryIds = TEMPLATE_CATEGORIES.map((category) => category.id);
  const initialFilter = categoryIds.includes(templateCategory) ? templateCategory : 'All';
  const [filter, setFilter] = useState(initialFilter);

  const hasData = resumeData?.personalInfo?.firstName || resumeData?.experience?.length > 0;

  const templates = [
    {
      id: '11',
      name: 'Campus Standard',
      description: 'Classic fresher format prioritizing education, academic projects, and skills.',
      image: `${base}template-11-preview.jpg`,
      features: ['No photo', 'Education first', 'Academic projects'],
      category: 'starter-no-photo-no-experience'
    },
    {
      id: '12',
      name: 'Internship Modern',
      description: 'Two-column fresher layout emphasizing skills, projects, and early experience.',
      image: `${base}template-12-preview.jpg`,
      features: ['No photo', 'Skills emphasis', 'Internship ready'],
      category: 'starter-no-photo-experience'
    },
    {
      id: '13',
      name: 'Campus Creative',
      description: 'Dynamic project-led layout for freshers building a standout portfolio.',
      image: `${base}template-13-preview.jpg`,
      features: ['No photo', 'Project grid', 'Creative header'],
      category: 'starter-no-photo-no-experience'
    },
    {
      id: '14',
      name: 'Clean Intern',
      description: 'Compact and structured format for education, skills, and starter projects.',
      image: `${base}template-14-preview.jpg`,
      features: ['No photo', 'Compact design', 'Structured'],
      category: 'starter-no-photo-no-experience'
    },
    {
      id: '16',
      name: 'Navy Banner Starter',
      description: 'Full-width navy header with clean academic, skills, and project sections.',
      image: `${base}template-16-preview.jpg`,
      features: ['No photo', 'No experience', 'Project focused'],
      category: 'starter-no-photo-no-experience'
    },
    {
      id: '15',
      name: 'Junior Developer',
      description: 'Terminal-inspired monospace format for tech graduates with internships or early experience.',
      image: `${base}template-15-preview.jpg`,
      features: ['No photo', 'Tech-focused', 'Experience section'],
      category: 'starter-no-photo-experience'
    }
  ];

  const filteredTemplates = filter === 'All'
    ? templates
    : templates.filter((template) => template.category === filter);
  const selectedFilterLabel = TEMPLATE_CATEGORIES.find((category) => category.id === filter)?.label;
  const filters = [{ id: 'All', label: 'All Freshers' }, ...TEMPLATE_CATEGORIES];

  return (
    <div className="min-h-screen bg-slate-50 py-8 dark:bg-gray-950 sm:py-12">
      <div className="mx-auto max-w-7xl px-3 min-[390px]:px-4 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:mb-10 sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                <Sparkles className="h-3.5 w-3.5" />
                Template gallery
              </div>
              <h1 className="max-w-3xl text-xl font-bold tracking-tight text-slate-950 dark:text-white min-[390px]:text-2xl sm:text-4xl">
                Choose a clean resume design that fits your goal.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-gray-400 sm:text-base">
                {hasData
                  ? 'Pick a template, then continue editing with your saved resume details already applied.'
                  : 'Start with a beginner-friendly layout, or upload an old PDF and let the app fill the sections for you.'}
              </p>
            </div>

            {!hasData && (
              <Link
                to="/magic"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
              >
                <UploadCloud className="h-4 w-4" />
                Magic Upload
              </Link>
            )}
          </div>
        </section>

        <div className="mb-6">
          <div className="flex flex-wrap justify-center gap-2">
            {filters.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => {
                  setFilter(category.id);
                  if (category.id !== 'All') setTemplateCategory(category.id);
                }}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  filter === category.id
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/25'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {filteredTemplates.length === 0 ? (
          <div className="mb-12 rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center dark:border-gray-700 dark:bg-gray-900">
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
              No templates in {selectedFilterLabel || 'this category'} yet
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500 dark:text-gray-400">
              This category is ready in the flow, but we have not added matching templates yet. Pick another fresher category for now.
            </p>
          </div>
        ) : (
          <div className="mb-12 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredTemplates.map((template) => {
              const isSelected = selectedTemplate === template.id;
              return (
                <article
                  key={template.id}
                  className={`group flex min-w-0 flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg dark:bg-gray-900 ${
                    isSelected
                      ? 'border-blue-500 ring-2 ring-blue-100 dark:ring-blue-950'
                      : 'border-slate-200 dark:border-gray-800'
                  }`}
                >
                  <div className="relative bg-slate-100 p-3 dark:bg-gray-950">
                    <div className="aspect-[16/10] overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-gray-800 sm:aspect-[4/3]">
                      <img
                        src={template.image}
                        alt={`${template.name} template preview`}
                        className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.03]"
                        loading="lazy"
                        onError={(event) => { event.currentTarget.src = 'https://via.placeholder.com/640x480?text=Template+Preview'; }}
                      />
                    </div>

                    {isSelected && (
                      <span className="absolute right-5 top-5 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                        Current
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-4 sm:p-5">
                    <div className="mb-3">
                      <h3 className="text-base font-semibold text-slate-950 dark:text-white sm:text-lg">{template.name}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-gray-400">{template.description}</p>
                    </div>

                    <div className="mb-5 flex flex-wrap gap-2">
                      {template.features.map((feature) => (
                        <span
                          key={feature}
                          className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-gray-800 dark:text-gray-300"
                        >
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                          {feature}
                        </span>
                      ))}
                    </div>

                    <Link
                      to={`/builder?template=${template.id}`}
                      onClick={() => setTemplate(template.id)}
                      className="mt-auto inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      {isSelected ? 'Continue with this design' : 'Use this template'}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Templates;
