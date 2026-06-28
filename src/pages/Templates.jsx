import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, UploadCloud } from 'lucide-react';
import { useResume } from '../contexts/ResumeContext';
import { TEMPLATE_CATEGORIES } from '../data/templateCategories';

import Template11 from '../templates/Template11';
import Template12 from '../templates/Template12';
import Template13 from '../templates/Template13';
import Template14 from '../templates/Template14';
import Template15 from '../templates/Template15';
import Template16 from '../templates/Template16';
import { transformResumeData } from '../utils/resumeData';
import { buildTemplateConfig } from '../utils/templateStyle';
  
function Templates() {
  const base = import.meta.env.BASE_URL;
  const { resumeData, customization, setTemplate, templateCategory, setTemplateCategory } = useResume();
  const categoryIds = TEMPLATE_CATEGORIES.map((category) => category.id);
  const initialFilter = categoryIds.includes(templateCategory) ? templateCategory : 'All';
  const [filter, setFilter] = useState(initialFilter);

  const hasData = resumeData?.personalInfo?.firstName || resumeData?.experience?.length > 0;

  // Transform form context data into our template format (re-used from ResumePreview)
  const transformedData = useMemo(() => {
    if (!hasData) return null;
    
    return transformResumeData(resumeData, customization);
  }, [resumeData, customization, hasData]);
  const templateConfig = useMemo(() => buildTemplateConfig(customization), [customization]);

  const renderLiveTemplate = (templateId) => {
    if (!hasData) return null;
    const props = { data: transformedData, config: templateConfig };
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

  class TemplateErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
      return { hasError: true };
    }
    render() {
      if (this.state.hasError) {
        return <div className="p-8 text-center text-red-500 font-medium">Error rendering template</div>;
      }
      return this.props.children;
    }
  }

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

  const filteredTemplates = filter === 'All' ? templates : templates.filter(t => t.category === filter);
  const selectedFilterLabel = TEMPLATE_CATEGORIES.find((category) => category.id === filter)?.label;
  const filters = [{ id: 'All', label: 'All Freshers' }, ...TEMPLATE_CATEGORIES];

  return (
    <div className="min-h-screen bg-gray-50 py-8 dark:bg-gray-900 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Magic Upload CTA */}
        {!hasData && (
          <div className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl overflow-hidden relative sm:mb-12">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="relative flex flex-col items-center justify-between p-5 sm:p-8 md:flex-row lg:p-10">
              <div className="text-white mb-6 md:mb-0 md:mr-8 text-center md:text-left">
                <h2 className="mb-2 flex items-center justify-center text-2xl font-bold sm:text-3xl md:justify-start">
                  <UploadCloud className="mr-3 h-7 w-7 sm:h-8 sm:w-8" />
                  Try Magic Upload
                </h2>
                <p className="max-w-xl text-sm leading-6 text-blue-100 sm:text-lg sm:leading-8">
                  Don't want to fill out forms manually? Upload your existing PDF resume and our AI will automatically populate all of these templates for you instantly!
                </p>
              </div>
              <Link 
                to="/magic"
                className="w-full rounded-full bg-white px-5 py-3 text-center text-base font-bold text-blue-600 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
              >
                Upload Resume ✨
              </Link>
            </div>
          </div>
        )}

        <div className="text-center mb-8">
          <h1 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white sm:mb-4 sm:text-3xl">
            {hasData ? "Your Resume on Fresher Templates" : "Fresher & Intern Templates"}
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-7 text-gray-500 dark:text-gray-300 sm:text-lg">
            {hasData ? "Browse how your extracted data looks across fresher and intern templates." : "Choose from fresher and intern templates designed for early-career resumes."}
          </p>
        </div>

        {/* Filter Bar */}
        <div className="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:mb-10 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0 sm:pb-0">
          {filters.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setFilter(cat.id);
                if (cat.id !== 'All') setTemplateCategory(cat.id);
              }}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors sm:px-6 ${
                filter === cat.id 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {filteredTemplates.length === 0 ? (
          <div className="mb-12 rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center dark:border-gray-700 dark:bg-gray-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              No templates in {selectedFilterLabel || 'this category'} yet
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
              This category is ready in the flow, but we have not added matching templates yet. Pick another fresher category for now.
            </p>
          </div>
        ) : (
          <div className="mb-12 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
            {filteredTemplates.map((template) => (
            <div key={template.id} className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md transition-shadow hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
              
              {/* Template Preview Area */}
              <div className="group relative h-64 overflow-hidden border-b border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-900 sm:h-80 lg:h-96">
                {hasData ? (
                  <>
                    {/* Static thumbnail keeps phone cards readable and avoids desktop-style squeezing. */}
                    <img
                      src={template.image}
                      alt={`${template.name} Template Preview`}
                      className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105 md:hidden"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/300x400?text=Preview+Missing'; }}
                    />
                    {/* Live render is reserved for larger screens where the full resume can breathe. */}
                    <div className="absolute left-0 top-0 hidden h-full w-full justify-center overflow-hidden bg-gray-200 dark:bg-gray-800 md:flex">
                      <div className="origin-top scale-[0.42] transform pt-4 lg:scale-[0.45]">
                        <div className="pointer-events-none min-h-[1123px] w-[794px] bg-white shadow-2xl">
                          <TemplateErrorBoundary>
                            {renderLiveTemplate(template.id)}
                          </TemplateErrorBoundary>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  // Static Image Fallback
                  <img 
                    src={template.image} 
                    alt={`${template.name} Template Preview`} 
                    className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/300x400?text=Preview+Missing'; }}
                  />
                )}
                
                {/* Overlay Action */}
                <div className="absolute inset-0 hidden items-center justify-center bg-blue-900/0 opacity-0 transition-colors group-hover:bg-blue-900/10 group-hover:opacity-100 md:flex">
                  <Link 
                    to={`/builder?template=${template.id}`}
                    onClick={() => setTemplate(template.id)}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-full shadow-lg hover:bg-blue-700 transition transform hover:-translate-y-1"
                  >
                    Select Template
                  </Link>
                </div>
              </div>
              
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">{template.name}</h3>
                <p className="mb-4 flex-1 text-sm leading-6 text-gray-500 dark:text-gray-400 sm:text-base">{template.description}</p>
                
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Features:</h4>
                  <ul className="space-y-1">
                    {template.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Link 
                  to={`/builder?template=${template.id}`}
                  onClick={() => setTemplate(template.id)}
                  className="inline-flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Use This Template
                </Link>
              </div>
            </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default Templates;
