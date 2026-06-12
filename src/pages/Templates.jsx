import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

function Templates() {
  const base = import.meta.env.BASE_URL;
  
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
      features: ['Monospace font', 'Tech-focused', 'GitHub emphasis']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Resume Templates
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-300">
            Choose from our professionally designed templates to create your perfect resume
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {templates.map((template) => (
            <div key={template.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="h-96 bg-gray-200 border-b">
                <img 
                  src={template.image} 
                  alt={`${template.name} Template Preview`} 
                  className="w-full h-full object-cover object-top"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/300x400?text=Preview+Missing'; }}
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{template.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4 h-12">{template.description}</p>
                <div className="mb-6 h-24">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Features:</h4>
                  <ul className="space-y-1">
                    {template.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link 
                  to={`/builder?template=${template.id}`}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Use This Template
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Can't decide?</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">Start with any template and you can change it later.</p>
          <Link 
            to="/builder?template=1"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Start Building Now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Templates;