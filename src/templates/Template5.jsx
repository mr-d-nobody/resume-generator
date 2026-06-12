import React from 'react';

export default function Template5({ data, config }) {
  const { personal, summary, experience, education, skills, projects } = data;
  const { theme } = config;

  return (
    <div className="w-[210mm] min-h-[297mm] mx-auto bg-white p-12 text-gray-800 shadow-xl print:shadow-none font-serif leading-snug">
      <header className="mb-4 text-center">
        <h1 className="text-4xl font-bold uppercase mb-1">{personal.name}</h1>
        <p className="text-sm italic">{personal.title}</p>
        <p className="text-sm mt-1">{personal.email} | {personal.phone} | {personal.location}</p>
      </header>
      
      <div className="flex gap-6">
        <div className="w-1/3">
          <section className="mb-4">
            <h2 className="text-lg font-bold uppercase border-b-2 border-gray-800 mb-2">Education</h2>
            {education.map(edu => (
              <div key={edu.id} className="mb-3 text-sm">
                <h3 className="font-bold">{edu.degree}</h3>
                <p>{edu.institution}</p>
                <p className="text-xs text-gray-500">{edu.startDate} - {edu.endDate}</p>
                {edu.gpa && <p className="font-semibold text-xs mt-1">GPA: {edu.gpa}</p>}
              </div>
            ))}
          </section>

          <section className="mb-4">
            <h2 className="text-lg font-bold uppercase border-b-2 border-gray-800 mb-2">Skills</h2>
            {Object.entries(skills).map(([cat, items]) => (
              <div key={cat} className="mb-2 text-sm">
                <h3 className="font-bold capitalize">{cat}</h3>
                <p>{items.join(', ')}</p>
              </div>
            ))}
          </section>
        </div>

        <div className="w-2/3">
          <section className="mb-4">
            <h2 className="text-lg font-bold uppercase border-b-2 border-gray-800 mb-2">Experience</h2>
            {experience.map(exp => (
              <div key={exp.id} className="mb-4">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-md">{exp.company}</h3>
                  <span className="text-xs font-bold text-gray-500">{exp.startDate} - {exp.endDate}</span>
                </div>
                <div className="text-sm italic font-medium mb-1">{exp.position}</div>
                <ul className="list-disc list-outside ml-4 space-y-1 text-sm">
                  {exp.highlights.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            ))}
          </section>

          <section className="mb-4">
            <h2 className="text-lg font-bold uppercase border-b-2 border-gray-800 mb-2">Projects</h2>
            {projects.map(proj => (
              <div key={proj.id} className="mb-3">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-sm">{proj.name}</h3>
                </div>
                <p className="text-sm italic mb-1">{proj.description}</p>
                <ul className="list-disc list-outside ml-4 space-y-1 text-sm">
                  {proj.highlights.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
