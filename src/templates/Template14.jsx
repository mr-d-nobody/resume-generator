import React from 'react';

export default function Template14({ data, config }) {
  const { personal, summary, experience, education, skills, projects } = data;
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
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mb-3 border-b-2 pb-4" style={{ borderColor: theme.primaryColor }}>
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>| {personal.phone}</span>}
          {personal.location && <span>| {personal.location}</span>}
          {personal.linkedin && <span>| {personal.linkedin}</span>}
          {personal.github && <span>| {personal.github}</span>}
        </div>
      </header>

      <div className="flex-1 flex flex-col" style={{ gap: spacing.sectionGap }}>
        
        {/* Education First */}
        {education && education.length > 0 && (
          <section>
            <h3 className="text-lg font-bold mb-3 uppercase tracking-wide text-gray-900">Education</h3>
            <div className="flex flex-col gap-4">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-base text-gray-800">{edu.institution}</h4>
                    <span className="text-sm font-medium text-gray-600">{edu.startDate} - {edu.endDate}</span>
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
            <h3 className="text-lg font-bold mb-3 uppercase tracking-wide text-gray-900">Technical Skills</h3>
            <div className="flex flex-col gap-2 text-sm">
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
            <h3 className="text-lg font-bold mb-3 uppercase tracking-wide text-gray-900">Academic Projects</h3>
            <div className="flex flex-col gap-4">
              {projects.map((project) => (
                <div key={project.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-base text-gray-800">{project.name}</h4>
                  </div>
                  {project.description && (
                    <p className="text-sm italic text-gray-600 mb-1">{project.description} {project.link && `- ${project.link}`}</p>
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
            <h3 className="text-lg font-bold mb-3 uppercase tracking-wide text-gray-900">Experience</h3>
            <div className="flex flex-col gap-4">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-base text-gray-800">{exp.position}</h4>
                    <span className="text-sm font-medium text-gray-600">{exp.startDate} - {exp.endDate}</span>
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

      </div>
    </div>
  );
}
