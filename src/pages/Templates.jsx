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
      <div className="mx-auto max-w-7xl px-3 min-[390px]:px-4 sm:px-6 lg:px-8">
        
        {/* Magic Upload CTA */}
        {!hasData && (
          <div className="relative mb-10 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-xl sm:mb-12 sm:rounded-2xl">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="relative flex flex-col items-center justify-between p-5 min-[390px]:p-6 md:flex-row md:p-12">
              <div className="text-white mb-6 md:mb-0 md:mr-8 text-center md:text-left">
                <h2 className="mb-2 flex items-center justify-center text-2xl font-bold min-[390px]:text-3xl md:justify-start">
                  <UploadCloud className="mr-3 h-7 w-7 shrink-0 min-[390px]:h-8 min-[390px]:w-8" />
                  Try Magic Upload
                </h2>
                <p className="max-w-xl text-sm leading-6 text-blue-100 min-[390px]:text-base sm:text-lg">
                  Don't want to fill out forms manually? Upload your existing PDF resume and our AI will automatically populate all of these templates for you instantly!
                </p>
              </div>
              <Link 
                to="/magic"
                className="inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-bold text-blue-600 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl min-[390px]:w-auto sm:px-8 sm:py-4 sm:text-lg"
              >
                Upload Resume ✨
              </Link>
            </div>
          </div>
        )}

        <div className="text-center mb-8">
          <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white min-[390px]:text-3xl">
            {hasData ? "Your Resume on Fresher Templates" : "Fresher & Intern Templates"}
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-7 text-gray-500 dark:text-gray-300 sm:text-lg">
            {hasData ? "Browse how your extracted data looks across fresher and intern templates." : "Choose from fresher and intern templates designed for early-career resumes."}
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {filters.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setFilter(cat.id);
                if (cat.id !== 'All') setTemplateCategory(cat.id);
              }}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
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
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3 mb-12">
            {filteredTemplates.map((template) => (
            <div key={template.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow flex flex-col">
              
              {/* Template Preview Area */}
              <div className="group relative h-80 overflow-hidden border-b border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-900 min-[390px]:h-96">
                {hasData ? (
                  // Live Render
                  <div className="absolute top-0 left-0 w-full h-full flex justify-center custom-scrollbar overflow-hidden bg-gray-200 dark:bg-gray-800">
                    <div className="origin-top scale-[0.36] pt-4 min-[390px]:scale-[0.43] sm:scale-[0.45]">
                      <div className="shadow-2xl bg-white min-h-[1123px] w-[794px] pointer-events-none">
                        <TemplateErrorBoundary>
                          {renderLiveTemplate(template.id)}
                        </TemplateErrorBoundary>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Static Image Fallback
                  <img 
                    src={template.image} 
                    alt={`${template.name} Template Preview`} 
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/300x400?text=Preview+Missing'; }}
                  />
                )}
                
                {/* Overlay Action */}
                <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Link 
                    to={`/builder?template=${template.id}`}
                    onClick={() => setTemplate(template.id)}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-full shadow-lg hover:bg-blue-700 transition transform hover:-translate-y-1"
                  >
                    Select Template
                  </Link>
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{template.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4 flex-1">{template.description}</p>
                
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
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
