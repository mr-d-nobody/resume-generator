import React from 'react';
import ContactLinks from '../components/common/ContactLinks';
import CustomSections from '../components/common/CustomSections';

export default function Template4({ data, config }) {
  const { personal, summary, experience, education, skills, projects, customSections } = data;
  const { theme } = config;

  return (
    <div className="w-[210mm] min-h-[297mm] mx-auto bg-white p-10 text-gray-800 shadow-xl print:shadow-none" style={{ fontFamily: 'monospace' }}>
      <header className="mb-8 border-b-4 pb-4" style={{ borderColor: theme.primaryColor }}>
        <h1 className="text-5xl font-bold mb-2">{personal.name}</h1>
        <p className="text-xl text-gray-600">[{personal.title}]</p>
        <ContactLinks 
          personal={personal} 
          containerClass="text-sm mt-2"
          itemClass="inline"
          linkClass="hover:underline"
          showIcons={false}
          separator=" | "
        />
      </header>
      
      <main className="grid grid-cols-12 gap-8">
        <div className="col-span-8">
          {experience && experience.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-bold bg-gray-200 p-2 mb-4">{"<Experience>"}</h2>
              {experience.map(exp => (
                <div key={exp.id} className="mb-6">
                  <h3 className="font-bold text-lg">{exp.position} @ {exp.company}</h3>
                  <p className="text-sm text-gray-500 mb-2">{exp.startDate} - {exp.endDate}</p>
                  <ul className="list-square ml-4 space-y-1 text-sm">
                    {exp.highlights.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              ))}
            </section>
          )}
          
          {projects && projects.length > 0 && (
            <section>
              <h2 className="text-xl font-bold bg-gray-200 p-2 mb-4">{"<Projects>"}</h2>
              {projects.map(proj => (
                <div key={proj.id} className="mb-4">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold">{proj.name}</h3>
                    {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">{proj.link}</a>}
                  </div>
                  {proj.description && <p className="text-sm text-gray-600">{proj.description}</p>}
                  {proj.highlights && proj.highlights.length > 0 && (
                    <ul className="list-square ml-4 mt-1 space-y-1 text-sm text-gray-700">
                      {proj.highlights.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          )}
        </div>
        
        <div className="col-span-4">
          {skills && Object.keys(skills).length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-bold bg-gray-200 p-2 mb-4">{"<Skills>"}</h2>
              {Object.entries(skills).map(([cat, items]) => (
                <div key={cat} className="mb-4">
                  <h3 className="font-bold capitalize text-sm">{cat}</h3>
                  <div className="flex flex-col gap-1 mt-1">
                    {items.map(item => <span key={item} className="text-xs bg-gray-100 p-1 border">{item}</span>)}
                  </div>
                </div>
              ))}
            </section>
          )}
          {education && education.length > 0 && (
            <section>
              <h2 className="text-xl font-bold bg-gray-200 p-2 mb-4">{"<Education>"}</h2>
              {education.map(edu => (
                <div key={edu.id} className="mb-4">
                  <h3 className="font-bold text-sm">{edu.degree}</h3>
                  <p className="text-xs text-gray-500">{edu.institution}</p>
                </div>
              ))}
            </section>
          )}
        </div>

        <div className="col-span-12">
          <CustomSections
            sections={customSections}
            headingClassName="text-xl font-bold bg-gray-200 p-2 mb-4"
            headingPrefix="<"
            headingSuffix=">"
          />
        </div>
      </main>
    </div>
  );
}


