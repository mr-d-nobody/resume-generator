import React from 'react';
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';

export default function Template11({ data, config }) {
  const { personal, summary, experience, education, skills, projects, certifications } = data;
  const { theme, spacing } = config;

  return (
    <div 
      className="w-[210mm] min-h-[297mm] mx-auto bg-white shadow-lg overflow-hidden flex flex-col"
      style={{ fontFamily: theme.fontFamily, color: theme.textColor }}
    >
      {/* Header */}
      <header className="px-10 py-8 border-b-4" style={{ borderColor: theme.primaryColor, backgroundColor: '#f8fafc' }}>
        <h1 className="text-4xl font-bold uppercase tracking-wider mb-2" style={{ color: theme.primaryColor }}>
          {personal.name}
        </h1>
        <h2 className="text-xl font-medium mb-4" style={{ color: theme.secondaryColor }}>
          {personal.title}
        </h2>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
          {personal.email && (
            <span className="flex items-center gap-1"><Mail size={14} /> {personal.email}</span>
          )}
          {personal.phone && (
            <span className="flex items-center gap-1"><Phone size={14} /> {personal.phone}</span>
          )}
          {personal.location && (
            <span className="flex items-center gap-1"><MapPin size={14} /> {personal.location}</span>
          )}
          {personal.linkedin && (
            <span className="flex items-center gap-1"><Linkedin size={14} /> {personal.linkedin}</span>
          )}
          {personal.github && (
            <span className="flex items-center gap-1"><Github size={14} /> {personal.github}</span>
          )}
        </div>
      </header>

      <div className="px-10 py-6 flex-1 flex flex-col" style={{ gap: spacing.sectionGap }}>
        
        {/* Summary */}
        {summary && (
          <section>
            <p className="text-sm leading-relaxed text-gray-700">{summary}</p>
          </section>
        )}

        {/* Education (Prioritized for Fresher) */}
        {education && education.length > 0 && (
          <section>
            <h3 className="text-lg font-bold uppercase tracking-widest border-b-2 mb-4 pb-1" style={{ borderColor: theme.primaryColor, color: theme.primaryColor }}>
              Education
            </h3>
            <div className="flex flex-col gap-4">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-semibold text-base">{edu.degree}</h4>
                    <span className="text-sm font-medium" style={{ color: theme.primaryColor }}>{edu.startDate} - {edu.endDate}</span>
                  </div>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-sm font-medium text-gray-700">{edu.institution}, {edu.location}</span>
                    {edu.gpa && <span className="text-sm font-bold bg-gray-100 px-2 py-0.5 rounded">GPA: {edu.gpa}</span>}
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

        {/* Academic Projects (Prioritized) */}
        {projects && projects.length > 0 && (
          <section>
            <h3 className="text-lg font-bold uppercase tracking-widest border-b-2 mb-4 pb-1" style={{ borderColor: theme.primaryColor, color: theme.primaryColor }}>
              Academic & Personal Projects
            </h3>
            <div className="flex flex-col gap-4">
              {projects.map((project) => (
                <div key={project.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-semibold text-base">{project.name}</h4>
                    {project.link && (
                      <span className="text-xs font-medium text-blue-600">{project.link}</span>
                    )}
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

        {/* Skills */}
        {skills && Object.keys(skills).length > 0 && (
          <section>
            <h3 className="text-lg font-bold uppercase tracking-widest border-b-2 mb-4 pb-1" style={{ borderColor: theme.primaryColor, color: theme.primaryColor }}>
              Technical Skills
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {Object.entries(skills).map(([category, skillList]) => (
                <div key={category} className="mb-2">
                  <span className="font-semibold mr-2">{category}:</span>
                  <span className="text-gray-700">{skillList.join(', ')}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Experience (If any, usually internships) */}
        {experience && experience.length > 0 && (
          <section>
            <h3 className="text-lg font-bold uppercase tracking-widest border-b-2 mb-4 pb-1" style={{ borderColor: theme.primaryColor, color: theme.primaryColor }}>
              Internships & Experience
            </h3>
            <div className="flex flex-col gap-4">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-semibold text-base">{exp.position}</h4>
                    <span className="text-sm font-medium" style={{ color: theme.primaryColor }}>{exp.startDate} - {exp.endDate}</span>
                  </div>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-sm font-medium text-gray-700">{exp.company}, {exp.location}</span>
                  </div>
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
