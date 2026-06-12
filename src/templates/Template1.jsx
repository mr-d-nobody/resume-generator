import React from 'react';
import ContactLinks from '../components/common/ContactLinks';
export default function Template1({ data, config }) {
  const { personal, summary, experience, education, skills, projects } = data;
  const { theme } = config;

  return (
    <div className="w-[210mm] min-h-[297mm] mx-auto bg-white p-12 text-gray-800 shadow-xl print:shadow-none" style={{ fontFamily: theme.fontFamily }}>
      {/* Header */}
      <header className="border-b-2 pb-6 mb-6" style={{ borderColor: theme.primaryColor }}>
        <h1 className="text-4xl font-bold uppercase tracking-wider text-center" style={{ color: theme.primaryColor }}>
          {personal.name}
        </h1>
        <p className="text-xl text-center mt-2 text-gray-600">{personal.title}</p>
        
        <ContactLinks 
          personal={personal} 
          containerClass="flex flex-wrap justify-center gap-4 mt-4 text-sm"
        />
      </header>

      {/* Summary */}
      {summary && (
        <section className="mb-6">
          <p className="text-sm leading-relaxed">{summary}</p>
        </section>
      )}

      {/* Experience */}
      <section className="mb-6">
        <h2 className="text-lg font-bold uppercase mb-4 border-b pb-1" style={{ color: theme.primaryColor, borderColor: theme.primaryColor }}>Experience</h2>
        <div className="space-y-4">
          {experience.map(exp => (
            <div key={exp.id}>
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-md">{exp.position}</h3>
                <span className="text-sm font-semibold">{exp.startDate} – {exp.endDate}</span>
              </div>
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-sm italic">{exp.company}</span>
                <span className="text-sm italic">{exp.location}</span>
              </div>
              <ul className="list-disc list-outside ml-4 space-y-1">
                {exp.highlights.map((item, i) => (
                  <li key={i} className="text-sm">{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Projects */}
      {projects && projects.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold uppercase mb-4 border-b pb-1" style={{ color: theme.primaryColor, borderColor: theme.primaryColor }}>Projects</h2>
          <div className="space-y-4">
            {projects.map(proj => (
              <div key={proj.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-md">{proj.name}</h3>
                  {proj.link && <span className="text-sm">{proj.link}</span>}
                </div>
                <p className="text-sm italic mb-2">{proj.description}</p>
                <ul className="list-disc list-outside ml-4 space-y-1">
                  {proj.highlights.map((item, i) => (
                    <li key={i} className="text-sm">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      <section className="mb-6">
        <h2 className="text-lg font-bold uppercase mb-4 border-b pb-1" style={{ color: theme.primaryColor, borderColor: theme.primaryColor }}>Education</h2>
        <div className="space-y-4">
          {education.map(edu => (
            <div key={edu.id}>
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-md">{edu.degree}</h3>
                <span className="text-sm font-semibold">{edu.startDate} – {edu.endDate}</span>
              </div>
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-sm italic">{edu.institution}</span>
                <span className="text-sm italic">{edu.location}</span>
              </div>
              {edu.gpa && <div className="text-sm font-medium mb-1">GPA: {edu.gpa}</div>}
              {edu.highlights && edu.highlights.length > 0 && (
                <ul className="list-disc list-outside ml-4 mt-1 space-y-1">
                  {edu.highlights.map((item, i) => (
                    <li key={i} className="text-sm">{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section>
        <h2 className="text-lg font-bold uppercase mb-4 border-b pb-1" style={{ color: theme.primaryColor, borderColor: theme.primaryColor }}>Skills</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          {Object.entries(skills).map(([category, items]) => (
            <div key={category} className="mb-2">
              <span className="font-bold capitalize">{category}: </span>
              <span>{items.join(', ')}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
