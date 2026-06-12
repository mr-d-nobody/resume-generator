import React from 'react';

export default function Template6({ data, config }) {
  const { personal, summary, experience, education, skills } = data;
  const { theme } = config;

  return (
    <div className="w-[210mm] min-h-[297mm] mx-auto bg-gray-50 text-gray-800 shadow-xl print:shadow-none p-12 font-sans">
      <header className="flex items-center gap-8 mb-10">
        <div className="w-24 h-24 rounded-full bg-gray-200 border-4 flex items-center justify-center text-2xl font-bold" style={{ borderColor: theme.primaryColor, color: theme.primaryColor }}>
          {personal.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">{personal.name}</h1>
          <p className="text-xl text-gray-500 font-medium mt-1">{personal.title}</p>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
              <span className="w-8 h-1 bg-gray-800"></span> Experience
            </h2>
            <div className="space-y-6">
              {experience.map(exp => (
                <div key={exp.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex justify-between mb-2">
                    <h3 className="font-bold text-lg text-gray-800">{exp.position}</h3>
                    <span className="text-sm text-gray-400 font-medium">{exp.startDate} - {exp.endDate}</span>
                  </div>
                  <p className="text-sm text-gray-600 font-bold mb-3 uppercase tracking-wider">{exp.company}</p>
                  <ul className="list-disc ml-4 space-y-1 text-sm text-gray-700">
                    {exp.highlights.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="col-span-1 space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
              <span className="w-8 h-1 bg-gray-800"></span> Info
            </h2>
            <div className="text-sm space-y-2 text-gray-600 bg-white p-5 rounded-lg shadow-sm border border-gray-100">
              <p>{personal.email}</p>
              <p>{personal.phone}</p>
              <p>{personal.location}</p>
              <p>{personal.website}</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
              <span className="w-8 h-1 bg-gray-800"></span> Skills
            </h2>
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex flex-wrap gap-2">
              {skills.languages.concat(skills.frameworks).map(skill => (
                <span key={skill} className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">{skill}</span>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
              <span className="w-8 h-1 bg-gray-800"></span> Education
            </h2>
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 space-y-3">
              {education.map(edu => (
                <div key={edu.id}>
                  <h3 className="font-bold text-sm text-gray-800">{edu.degree}</h3>
                  <p className="text-xs text-gray-500">{edu.institution}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
