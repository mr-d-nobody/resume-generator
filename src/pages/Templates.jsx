import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

function Templates() {
  const templates = [
    {
      id: 'modern',
      name: 'Modern',
      description: 'Clean and professional design with a modern touch',
      image: 'https://via.placeholder.com/300x400?text=Modern+Template',
      features: ['Clean layout', 'Professional design', 'Easy to read']
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Simple and elegant design focusing on content',
      image: 'https://via.placeholder.com/300x400?text=Minimal+Template',
      features: ['Minimalist design', 'Content focused', 'Elegant typography']
    },
    {
      id: 'creative',
      name: 'Creative',
      description: 'Stand out with a creative and unique design',
      image: 'https://via.placeholder.com/300x400?text=Creative+Template',
      features: ['Unique layout', 'Creative elements', 'Eye-catching design']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Resume Templates
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-300">
            Choose from our professionally designed templates to create your perfect resume
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {templates.map((template) => (
            <div key={template.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="h-64 bg-gray-200">
                <img 
                  src={template.image} 
                  alt={`${template.name} Template Preview`} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{template.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">{template.description}</p>
                <div className="mb-6">
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

        {/* CTA Section */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Can't decide?</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">Start with any template and you can change it later.</p>
          <Link 
            to="/builder"
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