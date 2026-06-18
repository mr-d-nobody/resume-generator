import React from 'react';
import ContactLinks from '../components/common/ContactLinks';
import CustomSections from '../components/common/CustomSections';
export default function Template10({ data, config }) {
  const { personal, summary, experience, education, skills, projects, customSections } = data;
  const { theme } = config;

  return (
    <div className="w-[210mm] min-h-[297mm] mx-auto bg-white text-gray-800 shadow-xl print:shadow-none flex font-sans">
      
      {/* Left Sidebar */}
      <aside className="w-[35%] bg-gray-100 p-8 flex flex-col border-r border-gray-200">
        <div className="text-center mb-8">
          <div className="w-32 h-32 rounded-full mx-auto mb-4 border-4 overflow-hidden flex items-center justify-center bg-gray-300 text-4xl text-white font-bold" style={{ borderColor: theme.primaryColor }}>
            {personal.name.split(' ').map(n => n[0]).join('')}
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-wider text-gray-900">{personal.name}</h1>
          <p className="text-md font-medium text-gray-500 mt-1" style={{ color: theme.primaryColor }}>{personal.title}</p>
        </div>

        <ContactLinks 
          personal={personal} 
          containerClass="space-y-4 text-sm text-gray-600 mb-10"
          itemClass="flex items-center gap-3"
          linkClass="break-all hover:underline"
          iconSize={16}
        />

        <div className="mb-10">
          <h2 className="text-lg font-bold uppercase tracking-widest text-gray-900 mb-4 border-b-2 border-gray-300 pb-1">Education</h2>
          <div className="space-y-4">
            {education.map(edu => (
              <div key={edu.id}>
                <h3 className="font-bold text-gray-800">{edu.degree}</h3>
                <p className="text-sm text-gray-600">{edu.institution}</p>
                <p className="text-xs text-gray-400 mt-1">{edu.startDate} - {edu.endDate}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold uppercase tracking-widest text-gray-900 mb-4 border-b-2 border-gray-300 pb-1">Skills</h2>
          <div className="flex flex-col gap-3">
            {Object.entries(skills).map(([cat, items]) => (
              <div key={cat}>
                <h3 className="text-xs font-bold uppercase text-gray-500 mb-1">{cat}</h3>
                <div className="flex flex-wrap gap-1">
                  {items.map(item => <span key={item} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">{item}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="w-[65%] p-8 bg-white flex flex-col">
        {summary && (
          <section className="mb-8">
            <h2 className="text-2xl font-black uppercase tracking-wider text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-sm text-white flex items-center justify-center text-sm" style={{ backgroundColor: theme.primaryColor }}>User</span> Profile
            </h2>
            <p className="text-[14px] leading-relaxed text-gray-600 border-l-4 pl-4 py-1 bg-gray-50" style={{ borderColor: theme.primaryColor }}>{summary}</p>
          </section>
        )}

        <section className="mb-8">
          <h2 className="text-2xl font-black uppercase tracking-wider text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-6 h-6 rounded-sm text-white flex items-center justify-center text-sm" style={{ backgroundColor: theme.primaryColor }}>Work</span> Experience
          </h2>
          <div className="space-y-6">
            {experience.map(exp => (
              <div key={exp.id} className="relative">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-lg text-gray-800">{exp.position}</h3>
                  <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">{exp.startDate} - {exp.endDate}</span>
                </div>
                <div className="flex justify-between items-baseline mb-3">
                  <p className="text-md font-bold" style={{ color: theme.primaryColor }}>{exp.company}</p>
                  <span className="text-xs text-gray-400">{exp.location}</span>
                </div>
                <ul className="list-disc list-outside ml-4 space-y-1">
                  {exp.highlights.map((item, i) => (
                    <li key={i} className="text-[14px] text-gray-600">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {projects && projects.length > 0 && (
          <section>
            <h2 className="text-2xl font-black uppercase tracking-wider text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-6 h-6 rounded-sm text-white flex items-center justify-center text-sm" style={{ backgroundColor: theme.primaryColor }}>Code</span> Projects
            </h2>
            <div className="space-y-5">
              {projects.map(proj => (
                <div key={proj.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-md text-gray-800">{proj.name}</h3>
                    {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">{proj.link}</a>}
                  </div>
                  <p className="text-[14px] text-gray-500 italic mb-2">{proj.description}</p>
                  <ul className="list-disc list-outside ml-4 space-y-1">
                    {proj.highlights.map((item, i) => (
                      <li key={i} className="text-[14px] text-gray-600">{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        <CustomSections
          sections={customSections}
          headingClassName="text-2xl font-black uppercase tracking-wider text-gray-900 mb-4 border-b pb-1"
          headingStyle={{ borderColor: theme.primaryColor }}
        />
      </main>
    </div>
  );
}


