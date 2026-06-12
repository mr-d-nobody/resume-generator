import React from 'react';

export default function Template9({ data, config }) {
  const { personal, summary, experience, education, skills, certifications } = data;
  const { theme } = config;

  return (
    <div className="w-[210mm] min-h-[297mm] mx-auto bg-white p-12 text-gray-900 shadow-xl print:shadow-none font-serif flex flex-col">
      <header className="border-y-2 border-black py-6 mb-8 text-center">
        <h1 className="text-4xl font-normal uppercase tracking-[0.2em] mb-2">{personal.name}</h1>
        <p className="text-md uppercase tracking-widest text-gray-600 mb-4">{personal.title}</p>
        <p className="text-xs uppercase tracking-wider">{personal.location} • {personal.phone} • {personal.email} • {personal.website}</p>
      </header>

      {summary && (
        <section className="mb-8 text-center px-12">
          <p className="text-sm leading-relaxed text-gray-700 italic">{summary}</p>
        </section>
      )}

      <div className="space-y-8 flex-1">
        <section>
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-lg font-bold uppercase tracking-[0.15em] whitespace-nowrap">Professional Experience</h2>
            <div className="h-px bg-black w-full"></div>
          </div>
          <div className="space-y-6">
            {experience.map(exp => (
              <div key={exp.id}>
                <div className="flex justify-between items-end mb-1">
                  <h3 className="text-md font-bold uppercase tracking-wider">{exp.company}</h3>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{exp.location}</span>
                </div>
                <div className="flex justify-between items-end mb-3">
                  <span className="text-sm italic">{exp.position}</span>
                  <span className="text-xs italic text-gray-500">{exp.startDate} – {exp.endDate}</span>
                </div>
                <ul className="list-[square] list-outside ml-4 space-y-1 text-sm text-gray-800">
                  {exp.highlights.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-lg font-bold uppercase tracking-[0.15em] whitespace-nowrap">Education & Certifications</h2>
            <div className="h-px bg-black w-full"></div>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div>
              {education.map(edu => (
                <div key={edu.id} className="mb-4">
                  <h3 className="font-bold text-sm uppercase tracking-wider mb-1">{edu.institution}</h3>
                  <p className="text-sm italic mb-1">{edu.degree}</p>
                  <p className="text-xs text-gray-500">{edu.startDate} – {edu.endDate}</p>
                </div>
              ))}
            </div>
            <div>
              {certifications && certifications.map(cert => (
                <div key={cert.id} className="mb-4">
                  <h3 className="font-bold text-sm uppercase tracking-wider mb-1">{cert.name}</h3>
                  <p className="text-sm italic mb-1">{cert.issuer}</p>
                  <p className="text-xs text-gray-500">{cert.date}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-lg font-bold uppercase tracking-[0.15em] whitespace-nowrap">Core Competencies</h2>
            <div className="h-px bg-black w-full"></div>
          </div>
          <div className="text-sm leading-relaxed text-center px-8">
            {skills.languages.concat(skills.frameworks, skills.tools).join(' • ')}
          </div>
        </section>
      </div>
    </div>
  );
}
