import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResume } from '../contexts/ResumeContext';
import { extractTextFromPDF, parseResumeWithAI } from '../utils/ResumeParser';
import { UploadCloud, Sparkles, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { DEFAULT_TEMPLATE_CATEGORY, TEMPLATE_CATEGORIES, getTemplateCategory } from '../data/templateCategories';

export default function MagicUpload() {
  const [status, setStatus] = useState('idle'); // idle, reading, parsing, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(DEFAULT_TEMPLATE_CATEGORY);
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { loadResume, setTemplateCategory } = useResume();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setErrorMessage('Please upload a valid PDF file.');
        setStatus('error');
        return;
      }
      processFile(selectedFile);
    }
  };

  const processFile = async (selectedFile) => {
    try {
      setStatus('reading');
      // Yield to the browser paint cycle so the 'reading' loader actually appears
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const rawText = await extractTextFromPDF(selectedFile);
      
      setStatus('parsing');
      const category = getTemplateCategory(selectedCategory);
      const parsedData = await parseResumeWithAI(rawText, category.parserType);
      
      // We have the structured data! Now load it into our context.
      setStatus('success');
      
      // Construct the payload matching the ResumeContext structure
      const payload = {
        resumeData: {
          personalInfo: parsedData.personalInfo || {},
          experience: parsedData.experience || [],
          education: parsedData.education || [],
          skills: parsedData.skills || [],
          projects: parsedData.projects || [],
          certifications: parsedData.certifications || [],
          achievements: parsedData.achievements || [],
          customSections: parsedData.customSections || [],
          languages: []
        }
      };
      
      loadResume({
        ...payload,
        templateCategory: category.id
      });
      setTemplateCategory(category.id);
      
      // Redirect to templates page to see the magic
      setTimeout(() => {
        navigate('/templates');
      }, 1500);

    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || 'Something went wrong during parsing.');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Magic Upload
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Drop your existing PDF resume here. Our secure AI will automatically extract your details and instantly format them into 15 stunning templates.
          </p>
        </div>

        {/* Template Category Selection */}
        <div className="mb-8 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 max-w-2xl mx-auto">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-center">Choose your fresher / intern template category</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {TEMPLATE_CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(category.id)}
                disabled={status !== 'idle' && status !== 'error'}
                className={`text-left rounded-lg border p-4 transition ${
                  selectedCategory === category.id
                    ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-sm dark:bg-blue-900/30 dark:text-blue-100'
                    : 'border-gray-200 bg-transparent text-gray-700 hover:border-blue-300 hover:bg-blue-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
                } ${status !== 'idle' && status !== 'error' ? 'cursor-not-allowed opacity-70' : ''}`}
              >
                <span className="block text-sm font-semibold">{category.label}</span>
                <span className="mt-1 block text-xs opacity-80">{category.description}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-300 mt-3 text-center">
            Templates will be filtered to this category after upload. Empty categories are fine while we add more designs.
          </p>
        </div>

        {/* Upload Zone */}
        <div 
          onClick={() => status === 'idle' || status === 'error' ? fileInputRef.current?.click() : null}
          className={`
            bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed p-12 text-center transition-all duration-300
            ${status === 'idle' || status === 'error' ? 'cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-gray-300 dark:border-gray-600' : 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'}
          `}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="application/pdf" 
            className="hidden" 
          />
          
          {status === 'idle' && (
            <div className="flex flex-col items-center">
              <UploadCloud className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Click or drag PDF here</h3>
              <p className="text-gray-500 dark:text-gray-400">Maximum file size: 5MB</p>
            </div>
          )}

          {status === 'reading' && (
            <div className="flex flex-col items-center text-blue-600 dark:text-blue-400">
              <Loader2 className="w-16 h-16 animate-spin mb-4" />
              <h3 className="text-xl font-medium mb-2">Reading PDF...</h3>
              <p className="text-sm opacity-80">Extracting raw text from your resume.</p>
            </div>
          )}

          {status === 'parsing' && (
            <div className="flex flex-col items-center text-purple-600 dark:text-purple-400">
              <Sparkles className="w-16 h-16 animate-pulse mb-4" />
              <h3 className="text-xl font-medium mb-2">AI is working its magic...</h3>
              <p className="text-sm opacity-80">Structuring your experience, skills, and projects.</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center text-green-600 dark:text-green-400">
              <CheckCircle className="w-16 h-16 mb-4" />
              <h3 className="text-xl font-medium mb-2">Extraction Complete!</h3>
              <p className="text-sm opacity-80">Redirecting to your new templates...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center text-red-600 dark:text-red-400">
              <AlertCircle className="w-16 h-16 mb-4" />
              <h3 className="text-xl font-medium mb-2">Oops! Something went wrong.</h3>
              <p className="text-sm opacity-80 mb-4">{errorMessage}</p>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setStatus('idle');
                }}
                className="px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 transition"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
