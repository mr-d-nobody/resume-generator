import React from 'react';
import ContactLinks from '../components/common/ContactLinks';
import CustomSections from '../components/common/CustomSections';
export default function Template3({ data, config }) {
  const { personal, summary, experience, education, skills, projects, customSections } = data;
  const { theme } = config;

  return (
    <div className="w-[210mm] min-h-[297mm] mx-auto bg-white text-gray-800 shadow-xl print:shadow-none font-serif flex">
      {/* Sidebar */}
      <aside className="w-1/3 p-8 text-white flex flex-col" style={{ backgroundColor: theme.primaryColor }}>
        <h1 className="text-4xl font-bold uppercase tracking-wider mb-2">{personal.name.split(' ')[0]}</h1>
        <h1 className="text-4xl font-light uppercase tracking-wider mb-4">{personal.name.split(' ')[1]}</h1>
        <p className="text-lg font-medium opacity-90 mb-8 border-b border-white/30 pb-4">{personal.title}</p>

        <ContactLinks 
          personal={personal} 
          containerClass="space-y-4 text-sm mb-12 opacity-90"
          itemClass="flex items-center gap-3"
          linkClass="break-all hover:underline"
          iconSize={16}
        />

        {skills && Object.keys(skills).length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold uppercase tracking-widest mb-4 border-b border-white/30 pb-2">Skills</h2>
            <div className="space-y-4">
              {Object.entries(skills).map(([cat, items]) => (
                <div key={cat}>
                  <h3 className="font-bold capitalize mb-1 opacity-80">{cat}</h3>
                  <p className="text-sm opacity-90 leading-relaxed">{items.join(', ')}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {education && education.length > 0 && (
          <div>
            <h2 className="text-xl font-bold uppercase tracking-widest mb-4 border-b border-white/30 pb-2">Education</h2>
            <div className="space-y-4">
              {education.map(edu => (
                <div key={edu.id}>
                  <h3 className="font-bold text-sm leading-tight mb-1">{edu.degree}</h3>
                  <p className="text-sm italic opacity-80">{edu.institution}</p>
                  <p className="text-xs opacity-70 mt-1">{edu.startDate} - {edu.endDate}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="w-2/3 p-8 bg-gray-50 flex flex-col">
        {summary && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold uppercase tracking-widest mb-4 text-gray-800" style={{ color: theme.primaryColor }}>Profile</h2>
            <p className="text-[15px] leading-relaxed text-gray-700">{summary}</p>
          </section>
        )}

        {experience && experience.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold uppercase tracking-widest mb-6 text-gray-800" style={{ color: theme.primaryColor }}>Experience</h2>
            <div className="space-y-8">
              {experience.map(exp => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-lg text-gray-900">{exp.position}</h3>
                    <span className="text-sm font-bold text-gray-500">{exp.startDate} - {exp.endDate}</span>
                  </div>
                  <div className="flex justify-between items-baseline mb-3">
                    <p className="text-md font-medium text-gray-700 uppercase tracking-wide">{exp.company}</p>
                    <span className="text-sm text-gray-400">{exp.location}</span>
                  </div>
                  <ul className="list-disc list-outside ml-5 space-y-1">
                    {exp.highlights.map((item, i) => (
                      <li key={i} className="text-[14.5px] text-gray-700">{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {projects && projects.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold uppercase tracking-widest mb-6 text-gray-800" style={{ color: theme.primaryColor }}>Projects</h2>
            <div className="space-y-6">
              {projects.map(proj => (
                <div key={proj.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-md text-gray-900">{proj.name}</h3>
                    {proj.link && <span className="text-xs text-blue-600">{proj.link}</span>}
                  </div>
                  <p className="text-[14.5px] text-gray-700 italic mb-2">{proj.description}</p>
                  <ul className="list-disc list-outside ml-5 space-y-1">
                    {proj.highlights.map((item, i) => (
                      <li key={i} className="text-[14.5px] text-gray-700">{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        <CustomSections
          sections={customSections}
          headingClassName="text-2xl font-bold uppercase tracking-widest mb-4 text-gray-800 border-b pb-1"
          headingStyle={{ color: theme.primaryColor, borderColor: theme.primaryColor }}
        />
      </main>
    </div>
  );
}


