import React from 'react';

/**
 * Modern resume template
 */
const ModernTemplate = ({ resumeData }) => {
  const { personalInfo, experience, education, skills } = resumeData;

  return (
    <div className="resume-template p-8 max-w-[800px] mx-auto bg-white text-gray-800 print:bg-white print:text-gray-800">
      {/* Header / Personal Info */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-1">
          {personalInfo.firstName} {personalInfo.lastName}
        </h1>
        <div className="text-gray-600 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {personalInfo.email && (
            <span>{personalInfo.email}</span>
          )}
          {personalInfo.phone && (
            <span>{personalInfo.phone}</span>
          )}
          {personalInfo.location && (
            <span>{personalInfo.location}</span>
          )}
          {personalInfo.linkedin && (
            <span>{personalInfo.linkedin}</span>
          )}
          {personalInfo.website && (
            <span>{personalInfo.website}</span>
          )}
        </div>
      </header>

      {/* Summary */}
      {personalInfo.summary && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold border-b border-gray-300 pb-1 mb-2">Summary</h2>
          <p>{personalInfo.summary}</p>
        </section>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold border-b border-gray-300 pb-1 mb-2">Experience</h2>
          {experience.map((job, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-start">
                <h3 className="font-medium">{job.title}</h3>
                <span className="text-sm text-gray-600">
                  {job.startDate} - {job.endDate || 'Present'}
                </span>
              </div>
              <div className="text-gray-700">{job.company}, {job.location}</div>
              <p className="mt-1 text-sm whitespace-pre-line">{job.description}</p>
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold border-b border-gray-300 pb-1 mb-2">Education</h2>
          {education.map((edu, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-start">
                <h3 className="font-medium">{edu.degree}</h3>
                <span className="text-sm text-gray-600">
                  {edu.startDate} - {edu.endDate || 'Present'}
                </span>
              </div>
              <div className="text-gray-700">{edu.school}, {edu.location}</div>
              {edu.description && (
                <p className="mt-1 text-sm whitespace-pre-line">{edu.description}</p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-semibold border-b border-gray-300 pb-1 mb-2">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                {skill.name}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ModernTemplate;