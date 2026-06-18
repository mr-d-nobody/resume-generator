import React from 'react';
import ContactLinks from '../components/common/ContactLinks';
import CustomSections from '../components/common/CustomSections';
export default function Template7({ data, config }) {
  const { personal, summary, experience, education, skills, customSections } = data;
  const { theme } = config;

  return (
    <div className="w-[210mm] min-h-[297mm] mx-auto bg-white p-10 text-gray-900 shadow-xl print:shadow-none font-sans">
      <header className="border-b-4 border-black pb-4 mb-8">
        <h1 className="text-6xl font-black uppercase tracking-tighter mb-2">{personal.name}</h1>
        <div className="flex justify-between items-end">
          <p className="text-2xl font-bold text-gray-500">{personal.title}</p>
          <ContactLinks 
            personal={personal} 
            containerClass="text-right text-sm font-bold space-y-1"
            itemClass="block"
            linkClass="hover:underline"
            showIcons={false}
          />
        </div>
      </header>

      <section className="mb-8">
        <p className="text-lg font-medium leading-relaxed">{summary}</p>
      </section>

      {experience && experience.length > 0 && (
        <section className="mb-8">
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-6 bg-black text-white inline-block px-3 py-1">Experience</h2>
          <div className="space-y-6">
            {experience.map(exp => (
              <div key={exp.id}>
                <div className="flex justify-between items-end border-b-2 border-gray-200 pb-1 mb-2">
                  <h3 className="text-xl font-bold">{exp.position} <span className="text-gray-400 font-normal">at {exp.company}</span></h3>
                  <span className="font-bold">{exp.startDate} - {exp.endDate}</span>
                </div>
                <ul className="list-square ml-4 space-y-2 text-[15px] font-medium">
                  {exp.highlights.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-2 gap-8">
        {education && education.length > 0 && (
          <section>
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-4 bg-black text-white inline-block px-3 py-1">Education</h2>
            {education.map(edu => (
              <div key={edu.id} className="mb-4">
                <h3 className="font-bold text-lg">{edu.degree}</h3>
                <p className="font-medium text-gray-600">{edu.institution}</p>
                <p className="text-sm font-bold">{edu.startDate} - {edu.endDate}</p>
              </div>
            ))}
          </section>
        )}

        {skills && Object.keys(skills).length > 0 && (
          <section>
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-4 bg-black text-white inline-block px-3 py-1">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {Object.values(skills).flat().map((skill, idx) => (
                <span key={`${skill}-${idx}`} className="font-bold border-2 border-black px-2 py-1 uppercase text-xs">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>

      <CustomSections
        sections={customSections}
        headingClassName="text-2xl font-black uppercase tracking-tighter mb-4 bg-black text-white inline-block px-3 py-1"
        itemClassName="text-sm text-gray-700"
        paragraphClassName="text-sm text-gray-700 leading-relaxed"
      />
    </div>
  );
}


