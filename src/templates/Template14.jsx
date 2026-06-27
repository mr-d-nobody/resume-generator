import React from 'react';
import ContactLinks from '../components/common/ContactLinks';
import CustomSections from '../components/common/CustomSections';
import DateRange from '../components/common/DateRange';
import CertificateDetails from '../components/common/CertificateDetails';
import ProjectLinks from '../components/common/ProjectLinks';
export default function Template14({ data, config }) {
  const { personal, experience, education, skills, projects, certifications, customSections, sectionTitles = {} } = data;
  const { theme, spacing } = config;

  return (
    <div 
      className="w-[210mm] min-h-[297mm] mx-auto bg-white shadow-lg overflow-hidden flex flex-col p-12"
      style={{ fontFamily: theme.fontFamily, color: theme.textColor }}
    >
      <header className="mb-6">
        <h1 className="text-4xl font-semibold mb-1" style={{ color: theme.primaryColor }}>
          {personal.name}
        </h1>
        {personal.title && (
          <div className="mb-2 break-words text-sm font-semibold uppercase tracking-wide text-gray-700">
            {personal.title}
          </div>
        )}
        <ContactLinks 
          personal={personal} 
          containerClass="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mb-3 border-b-2 pb-4"
          itemClass="inline"
          linkClass="hover:underline"
          showIcons={false}
          separator="|"
          style={{ borderColor: theme.primaryColor }}
        />
      </header>

      <div className="flex-1 flex flex-col" style={{ gap: spacing.sectionGap }}>
        
        {/* Education First */}
        {education && education.length > 0 && (
          <section>
            <h3 className="text-lg font-bold mb-3 uppercase tracking-wide text-gray-900">{sectionTitles.education || 'Education'}</h3>
            <div className="flex flex-col" style={{ gap: spacing.itemGap }}>
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-base text-gray-800">{edu.institution}</h4>
                    <DateRange startDate={edu.startDate} endDate={edu.endDate} className="text-sm font-medium text-gray-600" />
                  </div>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-sm text-gray-700 italic">{edu.degree}</span>
                    {edu.gpa && <span className="text-sm font-bold text-gray-800">GPA: {edu.gpa}</span>}
                  </div>
                  {edu.highlights && edu.highlights.length > 0 && (
                    <ul className="list-disc list-outside ml-4 text-sm text-gray-600 space-y-1">
                      {edu.highlights.map((highlight, idx) => (
                        <li key={idx}>{highlight}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills && Object.keys(skills).length > 0 && (
          <section>
            <h3 className="text-lg font-bold mb-3 uppercase tracking-wide text-gray-900">{sectionTitles.skills || 'Technical Skills'}</h3>
            <div className="flex flex-col text-sm" style={{ gap: spacing.itemGap }}>
              {Object.entries(skills).map(([category, skillList]) => (
                <div key={category} className="flex">
                  <span className="font-bold w-32 shrink-0">{category}:</span>
                  <span className="text-gray-700">{skillList.join(', ')}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <section>
            <h3 className="text-lg font-bold mb-3 uppercase tracking-wide text-gray-900">{sectionTitles.projects || 'Academic Projects'}</h3>
            <div className="flex flex-col" style={{ gap: spacing.itemGap }}>
              {projects.map((project) => (
                <div key={project.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-base text-gray-800">{project.name}</h4>
                    <ProjectLinks project={project} containerClassName="flex flex-wrap justify-end gap-2" />
                  </div>
                  {project.description && (
                    <p className="text-sm italic text-gray-600 mb-1">{project.description}</p>
                  )}
                  {project.highlights && project.highlights.length > 0 && (
                    <ul className="list-disc list-outside ml-4 text-sm text-gray-600 space-y-1">
                      {project.highlights.map((highlight, idx) => (
                        <li key={idx}>{highlight}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <section>
            <h3 className="text-lg font-bold mb-3 uppercase tracking-wide text-gray-900">{sectionTitles.experience || 'Experience'}</h3>
            <div className="flex flex-col" style={{ gap: spacing.itemGap }}>
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-base text-gray-800">{exp.position}</h4>
                    <DateRange startDate={exp.startDate} endDate={exp.endDate} className="text-sm font-medium text-gray-600" />
                  </div>
                  <div className="text-sm italic text-gray-700 mb-2">{exp.company}, {exp.location}</div>
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="list-disc list-outside ml-4 text-sm text-gray-600 space-y-1">
                      {exp.highlights.map((highlight, idx) => (
                        <li key={idx}>{highlight}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {certifications && certifications.length > 0 && (
          <section>
            <h3 className="text-lg font-bold mb-3 uppercase tracking-wide text-gray-900">{sectionTitles.certifications || 'Certifications'}</h3>
            <div className="grid grid-cols-2" style={{ gap: spacing.itemGap }}>
              {certifications.map((cert) => (
                <CertificateDetails key={cert.id} certificate={cert} className="text-sm" metaClassName="text-xs text-gray-600" linkClassName="text-xs text-blue-600 hover:underline" />
              ))}
            </div>
          </section>
        )}

        <CustomSections
          sections={customSections}
          className=""
          headingClassName="text-lg font-bold mb-3 uppercase tracking-wide text-gray-900"
        />

      </div>
    </div>
  );
}


