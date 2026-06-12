import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, UploadCloud } from 'lucide-react';
import { useResume } from '../contexts/ResumeContext';

import Template1 from '../templates/Template1';
import Template2 from '../templates/Template2';
import Template3 from '../templates/Template3';
import Template4 from '../templates/Template4';
import Template5 from '../templates/Template5';
import Template6 from '../templates/Template6';
import Template7 from '../templates/Template7';
import Template8 from '../templates/Template8';
import Template9 from '../templates/Template9';
import Template10 from '../templates/Template10';
import Template11 from '../templates/Template11';
import Template12 from '../templates/Template12';
import Template13 from '../templates/Template13';
import Template14 from '../templates/Template14';
import Template15 from '../templates/Template15';
import templateConfig from '../data/template-config.json';
  
function Templates() {
  const base = import.meta.env.BASE_URL;
  const navigate = useNavigate();
  const { resumeData, setTemplate } = useResume();
  const [filter, setFilter] = useState('All');

  const hasData = resumeData?.personalInfo?.firstName || resumeData?.experience?.length > 0;

  // Transform form context data into our template format (re-used from ResumePreview)
  const transformedData = useMemo(() => {
    if (!hasData) return null;
    
    const { personalInfo, experience, education, skills, certifications, achievements, projects } = resumeData;

    const safeArray = (arr) => Array.isArray(arr) ? arr : [];

    const groupedSkills = safeArray(skills).reduce((acc, skill) => {
      let cat = 'Skills';
      let name = 'Unknown Skill';
      
      if (typeof skill === 'string') {
        name = skill;
      } else if (skill && typeof skill === 'object') {
        cat = skill.category || 'Skills';
        name = skill.name || name;
      }
      
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(name);
      return acc;
    }, {});
    
    if (Object.keys(groupedSkills).length === 0) {
      groupedSkills['Languages'] = [];
    }

    const safeString = (val) => typeof val === 'string' ? val : '';

    return {
      personal: {
        name: `${safeString(personalInfo?.firstName)} ${safeString(personalInfo?.lastName)}`.trim() || 'Your Name',
        title: safeString(personalInfo?.title) || 'Professional Title',
        email: safeString(personalInfo?.email),
        phone: safeString(personalInfo?.phone),
        location: safeString(personalInfo?.location),
        website: safeString(personalInfo?.website),
        linkedin: safeString(personalInfo?.linkedin),
        github: safeString(personalInfo?.github)
      },
      summary: safeString(personalInfo?.summary),
      experience: safeArray(experience).map(exp => {
        let highlights = [];
        if (typeof exp?.description === 'string') {
          highlights = exp.description.split('\n').filter(Boolean);
        } else if (Array.isArray(exp?.description)) {
          highlights = exp.description.filter(h => typeof h === 'string');
        } else if (Array.isArray(exp?.highlights)) {
          highlights = exp.highlights.filter(h => typeof h === 'string');
        }
        
        return {
          id: Math.random().toString(),
          company: safeString(exp?.company) || 'Company Name',
          position: safeString(exp?.position) || 'Position',
          location: safeString(exp?.location),
          startDate: safeString(exp?.startDate) || 'Start Date',
          endDate: exp?.current ? 'Present' : (safeString(exp?.endDate) || 'End Date'),
          highlights
        };
      }),
      education: safeArray(education).map(edu => ({
        id: Math.random().toString(),
        institution: safeString(edu?.institution) || 'University Name',
        degree: safeString(edu?.degree) || 'Degree',
        location: safeString(edu?.location),
        startDate: safeString(edu?.startDate) || 'Start Date',
        endDate: safeString(edu?.graduationDate) || 'Grad Date',
        gpa: edu?.cgpa ? `${edu.cgpa}` : null,
        highlights: edu?.description ? [safeString(edu.description)] : []
      })),
      skills: groupedSkills,
      certifications: safeArray(certifications).map(cert => ({
        id: Math.random().toString(),
        name: safeString(cert?.name) || 'Certification Name',
        issuer: safeString(cert?.issuer) || 'Issuer',
        date: safeString(cert?.date) || 'Date'
      })),
      achievements: safeArray(achievements).map(ach => ({
        id: Math.random().toString(),
        title: safeString(ach?.title) || 'Achievement',
        organization: safeString(ach?.organization),
        date: safeString(ach?.date),
        description: safeString(ach?.description)
      })),
      projects: (safeArray(projects).length > 0) ? safeArray(projects).map(proj => {
        let highlights = [];
        if (Array.isArray(proj?.highlights)) {
          highlights = proj.highlights;
        } else if (typeof proj?.description === 'string') {
          highlights = proj.description.split('\n').filter(Boolean);
        }
        return {
          id: Math.random().toString(),
          name: safeString(proj?.name) || 'Project Name',
          link: safeString(proj?.link),
          description: safeString(proj?.description),
          highlights
        };
      }) : safeArray(achievements).map(ach => ({
        id: Math.random().toString(),
        name: safeString(ach?.title) || 'Project / Achievement',
        description: safeString(ach?.organization),
        link: '',
        highlights: ach?.description ? [safeString(ach.description)] : []
      }))
    };
  }, [resumeData, hasData]);

  const renderLiveTemplate = (templateId) => {
    if (!hasData) return null;
    const props = { data: transformedData, config: templateConfig };
    switch (templateId) {
      case '1': return <Template1 {...props} />;
      case '2': return <Template2 {...props} />;
      case '3': return <Template3 {...props} />;
      case '4': return <Template4 {...props} />;
      case '5': return <Template5 {...props} />;
      case '6': return <Template6 {...props} />;
      case '7': return <Template7 {...props} />;
      case '8': return <Template8 {...props} />;
      case '9': return <Template9 {...props} />;
      case '10': return <Template10 {...props} />;
      case '11': return <Template11 {...props} />;
      case '12': return <Template12 {...props} />;
      case '13': return <Template13 {...props} />;
      case '14': return <Template14 {...props} />;
      case '15': return <Template15 {...props} />;
      default: return <Template1 {...props} />;
    }
  };

  class TemplateErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) {
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
      id: '1',
      name: 'The Classic',
      description: 'A highly readable, corporate-standard layout.',
      image: `${base}template-1-preview.jpg`,
      features: ['Single-column', 'Traditional serif font', 'ATS favorite']
    },
    {
      id: '2',
      name: 'Modern Minimalist',
      description: 'Sans-serif, single-column with a subtle accent color.',
      image: `${base}template-2-preview.jpg`,
      features: ['Sans-serif', 'Subtle accent color', 'Ample whitespace']
    },
    {
      id: '3',
      name: 'The Executive',
      description: 'Two-tone typography focused on impact.',
      image: `${base}template-3-preview.jpg`,
      features: ['Two-column', 'Elegant typography', 'Strong horizontal dividers']
    },
    {
      id: '4',
      name: 'Tech Pro',
      description: 'Clean headers with a distinct primary color for engineers.',
      image: `${base}template-4-preview.jpg`,
      features: ['Monospace style', 'Clean section headers', 'Bullet-point focused']
    },
    {
      id: '5',
      name: 'Academic',
      description: 'High information density, tailored for research/academic.',
      image: `${base}template-5-preview.jpg`,
      features: ['High density', 'Two-column', 'Academic styling']
    },
    {
      id: '6',
      name: 'Creative',
      description: 'Modern right-aligned sidebar layout.',
      image: `${base}template-6-preview.jpg`,
      features: ['Right sidebar', 'Modern typography', 'Visual appeal']
    },
    {
      id: '7',
      name: 'Startup',
      description: 'Bold headers, tight spacing, highly scannable.',
      image: `${base}template-7-preview.jpg`,
      features: ['Bold inverted headers', 'Tight spacing', 'Highly scannable']
    },
    {
      id: '8',
      name: 'Analyst',
      description: 'Data-focused layout, distinct project separation.',
      image: `${base}template-8-preview.jpg`,
      features: ['Data-focused', 'Distinct separation', 'Left-side metrics']
    },
    {
      id: '9',
      name: 'Consultant',
      description: 'Very structured, traditional with modern font pairings.',
      image: `${base}template-9-preview.jpg`,
      features: ['Centered headers', 'Structured layout', 'Traditional pairing']
    },
    {
      id: '10',
      name: 'Hybrid',
      description: 'Professional side-column variant.',
      image: `${base}template-10-preview.jpg`,
      features: ['Left side-column', 'Standard colors', 'Professional']
    },
    {
      id: '11',
      name: 'Graduate Standard',
      description: 'Classic format prioritizing education and academic projects.',
      image: `${base}template-11-preview.jpg`,
      features: ['Fresher focused', 'Education first', 'Academic projects']
    },
    {
      id: '12',
      name: 'Entry Level Modern',
      description: 'Two-column design emphasizing skills and early experience.',
      image: `${base}template-12-preview.jpg`,
      features: ['Two-column', 'Skills emphasis', 'Modern look']
    },
    {
      id: '13',
      name: 'Campus Creative',
      description: 'Dynamic header and grid layout for standout portfolios.',
      image: `${base}template-13-preview.jpg`,
      features: ['Grid layout', 'Creative header', 'Distinctive']
    },
    {
      id: '14',
      name: 'The Intern',
      description: 'Compact and structured format to fit entry-level details.',
      image: `${base}template-14-preview.jpg`,
      features: ['Compact design', 'Structured', 'High density']
    },
    {
      id: '15',
      name: 'Junior Developer',
      description: 'Terminal-inspired monospace format for tech graduates.',
      image: `${base}template-15-preview.jpg`,
      features: ['Monospace font', 'Tech-focused', 'GitHub emphasis'],
      category: 'Fresher'
    }
  ].map(t => {
    // Dynamically assign categories if not hardcoded
    if (!t.category) {
      if (['1', '3', '8', '9', '10'].includes(t.id)) t.category = 'Professional';
      else if (['2', '6', '7', '13'].includes(t.id)) t.category = 'Creative';
      else t.category = 'Fresher';
    }
    return t;
  });

  const filteredTemplates = filter === 'All' ? templates : templates.filter(t => t.category === filter);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Magic Upload CTA */}
        {!hasData && (
          <div className="mb-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl overflow-hidden relative">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center justify-between">
              <div className="text-white mb-6 md:mb-0 md:mr-8 text-center md:text-left">
                <h2 className="text-3xl font-bold mb-2 flex items-center justify-center md:justify-start">
                  <UploadCloud className="mr-3 w-8 h-8" />
                  Try Magic Upload
                </h2>
                <p className="text-blue-100 text-lg max-w-xl">
                  Don't want to fill out forms manually? Upload your existing PDF resume and our AI will automatically populate all of these templates for you instantly!
                </p>
              </div>
              <Link 
                to="/magic"
                className="whitespace-nowrap px-8 py-4 bg-white text-blue-600 font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-lg"
              >
                Upload Resume ✨
              </Link>
            </div>
          </div>
        )}

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {hasData ? "✨ Your Resume on 15 Templates" : "Resume Templates"}
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-300">
            {hasData ? "Browse how your extracted data looks across all our professional templates." : "Choose from our professionally designed templates to create your perfect resume."}
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {['All', 'Professional', 'Creative', 'Fresher'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === cat 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {cat === 'Fresher' ? 'Fresher & Academic' : cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3 mb-12">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow flex flex-col">
              
              {/* Template Preview Area */}
              <div className="h-96 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 relative overflow-hidden group">
                {hasData ? (
                  // Live Render
                  <div className="absolute top-0 left-0 w-full h-full flex justify-center custom-scrollbar overflow-hidden bg-gray-200 dark:bg-gray-800">
                    <div className="transform scale-[0.45] origin-top pt-4">
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

      </div>
    </div>
  );
}

export default Templates;