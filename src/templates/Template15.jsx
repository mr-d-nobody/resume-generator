import React from 'react';
import ContactLinks from '../components/common/ContactLinks';
import CustomSections from '../components/common/CustomSections';
import DateRange from '../components/common/DateRange';
import CertificateDetails from '../components/common/CertificateDetails';
import ProjectLinks from '../components/common/ProjectLinks';
export default function Template15({ data, config }) {
  const { personal, summary, experience, education, skills, projects, certifications, customSections, sectionTitles = {} } = data;
  const { theme, spacing, densityStyle } = config;

  return (
    <div
      className="w-[210mm] min-h-[297mm] mx-auto bg-white shadow-lg overflow-visible"
      style={{ fontFamily: theme.fontFamily, color: theme.textColor }}
    >
      <div className="flex min-h-[297mm] flex-col p-10" style={densityStyle}>
        {/* Header */}
        <header className="mb-8 border-b-2 pb-4" style={{ borderColor: theme.primaryColor }}>
          <h1 className="text-3xl font-bold mb-2">
            <span style={{ color: theme.primaryColor }}>&gt;</span> {personal.name}
          </h1>
          {personal.title && <div className="mb-2 break-words text-sm font-bold leading-snug text-gray-700">{personal.title}</div>}
          <ContactLinks
            personal={personal}
            containerClass="flex flex-wrap gap-4 text-xs text-gray-600"
            itemClass="inline"
            linkClass="hover:underline"
            showIcons={false}
          />
        </header>

        <div className="flex-1 flex flex-col" style={{ gap: spacing.sectionGap }}>

          {/* Profile */}
          {summary && (
            <section>
              <h3 className="text-sm font-bold mb-2 uppercase" style={{ color: theme.primaryColor }}>// {sectionTitles.summary || 'Profile'}</h3>
              <p className="text-xs leading-relaxed text-gray-800">{summary}</p>
            </section>
          )}

          {/* Skills */}
          {skills && Object.keys(skills).length > 0 && (
            <section>
              <h3 className="text-sm font-bold mb-2 uppercase" style={{ color: theme.primaryColor }}>// {sectionTitles.skills || 'Technical_Skills'}</h3>
              <div className="flex flex-col text-xs" style={{ gap: spacing.itemGap }}>
                {Object.entries(skills).map(([category, skillList]) => (
                  <div key={category} className="flex">
                    <span className="font-bold w-32 shrink-0">{category}:</span>
                    <span className="text-gray-800">{skillList.join(', ')}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects (Crucial for Junior Devs) */}
          {projects && projects.length > 0 && (
            <section>
              <h3 className="text-sm font-bold mb-2 uppercase" style={{ color: theme.primaryColor }}>// {sectionTitles.projects || 'Projects'}</h3>
              <div className="flex flex-col" style={{ gap: spacing.itemGap }}>
                {projects.map((project) => (
                  <div key={project.id}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-bold text-sm text-gray-900">{project.name}</h4>
                      <ProjectLinks project={project} containerClassName="flex flex-wrap justify-end gap-2" linkClassName="text-xs font-bold text-blue-600 hover:underline" prefix="[" suffix="]" />
                    </div>
                    {project.description && (
                      <p className="text-xs text-gray-700 mb-1">{project.description}</p>
                    )}
                    {project.highlights && project.highlights.length > 0 && (
                      <ul className="list-disc list-outside ml-4 text-xs text-gray-700 space-y-1">
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

          {/* Education */}
          {education && education.length > 0 && (
            <section>
              <h3 className="text-sm font-bold mb-2 uppercase" style={{ color: theme.primaryColor }}>// {sectionTitles.education || 'Education'}</h3>
              <div className="flex flex-col" style={{ gap: spacing.itemGap }}>
                {education.map((edu) => (
                  <div key={edu.id}>
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-bold text-sm text-gray-900">{edu.degree}</h4>
                      <DateRange startDate={edu.startDate} endDate={edu.endDate} className="text-xs font-bold" />
                    </div>
                    <div className="text-xs text-gray-700">
                      {edu.institution}, {edu.location} {edu.gpa && `| ${edu.gradeLabel || 'GPA'}: ${edu.gpa}`}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Experience */}
          {experience && experience.length > 0 && (
            <section>
              <h3 className="text-sm font-bold mb-2 uppercase" style={{ color: theme.primaryColor }}>// {sectionTitles.experience || 'Experience'}</h3>
              <div className="flex flex-col" style={{ gap: spacing.itemGap }}>
                {experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-bold text-sm text-gray-900">{exp.position} @ {exp.company}</h4>
                      <DateRange startDate={exp.startDate} endDate={exp.endDate} className="text-xs font-bold" />
                    </div>
                    {exp.highlights && exp.highlights.length > 0 && (
                      <ul className="list-disc list-outside ml-4 text-xs text-gray-700 space-y-1 mt-1">
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
              <h3 className="text-sm font-bold mb-2 uppercase" style={{ color: theme.primaryColor }}>// {sectionTitles.certifications || 'Certifications'}</h3>
              <div className="grid grid-cols-2" style={{ gap: spacing.itemGap }}>
                {certifications.map((cert) => (
                  <CertificateDetails key={cert.id} certificate={cert} className="text-xs" metaClassName="text-xs text-gray-700" linkClassName="text-xs font-bold text-blue-600 hover:underline" />
                ))}
              </div>
            </section>
          )}

          <CustomSections
            sections={customSections}
            className=""
            headingPrefix="// "
            headingClassName="text-sm font-bold mb-2 uppercase"
            headingStyle={{ color: theme.primaryColor }}
            itemClassName="text-xs text-gray-700"
            paragraphClassName="text-xs text-gray-700 leading-relaxed"
          />

        </div>
      </div>
    </div>
  );
}


