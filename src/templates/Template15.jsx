import React from 'react';
import ContactLinks from '../components/common/ContactLinks';
export default function Template15({ data, config }) {
  const { personal, summary, experience, education, skills, projects } = data;
  const { theme, spacing } = config;

  return (
    <div 
      className="w-[210mm] min-h-[297mm] mx-auto bg-white shadow-lg overflow-hidden flex flex-col p-10"
      style={{ fontFamily: "'Fira Code', 'Courier New', monospace", color: theme.textColor }}
    >
      {/* Header */}
      <header className="mb-8 border-b-2 pb-4" style={{ borderColor: theme.primaryColor }}>
        <h1 className="text-3xl font-bold mb-2">
          <span style={{ color: theme.primaryColor }}>&gt;</span> {personal.name}
        </h1>
        <div className="text-sm font-bold text-gray-700 mb-2">
          {personal.title}
        </div>
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
            <h3 className="text-sm font-bold mb-2 uppercase" style={{ color: theme.primaryColor }}>// Profile</h3>
            <p className="text-xs leading-relaxed text-gray-800">{summary}</p>
          </section>
        )}

        {/* Skills */}
        {skills && Object.keys(skills).length > 0 && (
          <section>
            <h3 className="text-sm font-bold mb-2 uppercase" style={{ color: theme.primaryColor }}>// Technical_Skills</h3>
            <div className="flex flex-col gap-1 text-xs">
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
            <h3 className="text-sm font-bold mb-2 uppercase" style={{ color: theme.primaryColor }}>// Projects</h3>
            <div className="flex flex-col gap-4">
              {projects.map((project) => (
                <div key={project.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-sm text-gray-900">{project.name}</h4>
                    {project.link && (
                      <a href={project.link} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 hover:underline">[{project.link}]</a>
                    )}
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
            <h3 className="text-sm font-bold mb-2 uppercase" style={{ color: theme.primaryColor }}>// Education</h3>
            <div className="flex flex-col gap-3">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-bold text-sm text-gray-900">{edu.degree}</h4>
                    <span className="text-xs font-bold">{edu.startDate} - {edu.endDate}</span>
                  </div>
                  <div className="text-xs text-gray-700">
                    {edu.institution}, {edu.location} {edu.gpa && `| GPA: ${edu.gpa}`}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <section>
            <h3 className="text-sm font-bold mb-2 uppercase" style={{ color: theme.primaryColor }}>// Experience</h3>
            <div className="flex flex-col gap-4">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-sm text-gray-900">{exp.position} @ {exp.company}</h4>
                    <span className="text-xs font-bold">{exp.startDate} - {exp.endDate}</span>
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

      </div>
    </div>
  );
}
