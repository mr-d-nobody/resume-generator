import React from 'react';

export default function Template8({ data, config }) {
  const { personal, experience, education, skills, projects } = data;
  const { theme } = config;

  return (
    <div className="w-[210mm] min-h-[297mm] mx-auto bg-white p-12 text-gray-800 shadow-xl print:shadow-none font-sans text-[13px] leading-relaxed">
      <header className="flex justify-between items-center mb-8 border-b-2 pb-4" style={{ borderColor: theme.primaryColor }}>
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-wider text-gray-900">{personal.name}</h1>
          <p className="text-lg text-gray-600 uppercase tracking-widest mt-1">{personal.title}</p>
        </div>
        <div className="text-right text-gray-500">
          <p>{personal.email}</p>
          <p>{personal.phone}</p>
          <p>{personal.location}</p>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3">
          <h2 className="font-bold uppercase tracking-widest text-gray-400 mb-2">Skills / Tech</h2>
          <div className="mb-6">
            {Object.entries(skills).map(([cat, items]) => (
              <div key={cat} className="mb-3">
                <h3 className="font-semibold text-gray-700 capitalize">{cat}</h3>
                <div className="text-gray-500">{items.join(' • ')}</div>
              </div>
            ))}
          </div>

          <h2 className="font-bold uppercase tracking-widest text-gray-400 mb-2">Education</h2>
          <div>
            {education.map(edu => (
              <div key={edu.id} className="mb-3">
                <h3 className="font-semibold text-gray-700">{edu.degree}</h3>
                <div className="text-gray-500">{edu.institution}</div>
                <div className="text-gray-400 text-xs mt-1">{edu.startDate} - {edu.endDate}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-9 pl-6 border-l" style={{ borderColor: theme.primaryColor }}>
          <h2 className="font-bold uppercase tracking-widest text-gray-400 mb-4">Professional Experience</h2>
          <div className="space-y-6 mb-8">
            {experience.map(exp => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-[15px] text-gray-800">{exp.position}</h3>
                  <span className="text-gray-400 font-medium text-xs">{exp.startDate} - {exp.endDate}</span>
                </div>
                <div className="font-medium text-gray-600 mb-2">{exp.company} • {exp.location}</div>
                <ul className="list-disc list-outside ml-4 space-y-1 text-gray-600">
                  {exp.highlights.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>

          <h2 className="font-bold uppercase tracking-widest text-gray-400 mb-4">Selected Projects</h2>
          <div className="space-y-4">
            {projects.map(proj => (
              <div key={proj.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-[14px] text-gray-800">{proj.name}</h3>
                </div>
                <p className="text-gray-500 mb-1 italic">{proj.description}</p>
                <ul className="list-disc list-outside ml-4 space-y-1 text-gray-600 text-xs">
                  {proj.highlights.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
