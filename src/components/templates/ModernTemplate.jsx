import React from 'react';
import ContactLinks from '../common/ContactLinks';
import DateRange from '../common/DateRange';

/**
 * Modern resume template
 */
const ModernTemplate = ({ resumeData }) => {
  const { personalInfo, experience, education, skills, customSections } = resumeData;

  return (
    <div className="resume-template p-8 max-w-[800px] mx-auto bg-white text-gray-800 print:bg-white print:text-gray-800">
      {/* Header / Personal Info */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-1">
          {personalInfo.firstName} {personalInfo.lastName}
        </h1>
        {personalInfo.title && (
          <div className="mb-2 break-words text-sm font-semibold text-gray-700">
            {personalInfo.title}
          </div>
        )}
        <ContactLinks personal={personalInfo} containerClass="text-gray-600 flex flex-wrap gap-x-4 gap-y-1 text-sm" showIcons={false} />
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
                <DateRange startDate={job.startDate} endDate={job.current ? 'Present' : job.endDate} className="text-sm text-gray-600" />
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
                <DateRange startDate={edu.startDate} endDate={edu.endDate} className="text-sm text-gray-600" />
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

      {customSections && customSections.length > 0 && customSections.map((section, index) => {
        const items = (section.description || '').split('\n').filter(Boolean);

        return (
          <section key={section.id || index} className="mb-6">
            <h2 className="text-lg font-semibold border-b border-gray-300 pb-1 mb-2">
              {section.title || 'Custom Section'}
            </h2>
            {items.length > 1 ? (
              <ul className="list-disc list-outside ml-5 space-y-1 text-sm">
                {items.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm whitespace-pre-line">{section.description}</p>
            )}
          </section>
        );
      })}
    </div>
  );
};

export default ModernTemplate;
