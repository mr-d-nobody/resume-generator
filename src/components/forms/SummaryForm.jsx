import React from 'react';
import { useResume } from '../../contexts/ResumeContext';
import { FileText } from 'lucide-react';

function SummaryForm() {
  const { resumeData, updatePersonalInfo } = useResume();
  const { personalInfo } = resumeData;

  const handleInputChange = (e) => {
    updatePersonalInfo({ summary: e.target.value });
  };

  return (
    <div className="card rounded-lg bg-white p-5 shadow-sm dark:bg-gray-900 sm:p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
        <FileText className="h-5 w-5 mr-2" />
        Professional Summary
      </h2>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Write a brief professional summary highlighting your key skills, experience, and career goals. This is usually the first thing recruiters read.
      </p>

      <div>
        <textarea
          value={personalInfo.summary}
          onChange={handleInputChange}
          className="form-input h-48 resize-none"
          placeholder="e.g. Dedicated and detail-oriented Software Engineer with 3 years of experience developing scalable web applications. Proficient in React, Node.js, and cloud technologies. Proven track record of improving application performance and collaborating with cross-functional teams."
        />
      </div>
    </div>
  );
}

export default SummaryForm;
