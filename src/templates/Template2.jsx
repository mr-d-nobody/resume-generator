import React from 'react';
import ContactLinks from '../components/common/ContactLinks';
export default function Template2({ data, config }) {
  const { personal, summary, experience, education, skills } = data;
  const { theme } = config;

  return (
    <div className="w-[210mm] min-h-[297mm] mx-auto bg-white text-gray-800 shadow-xl print:shadow-none flex flex-col font-sans" style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      
      {/* Header Block */}
      <header className="p-10 text-white text-center" style={{ backgroundColor: theme.primaryColor }}>
        <h1 className="text-5xl font-light tracking-wide">{personal.name}</h1>
        <p className="text-xl font-medium mt-3 opacity-90">{personal.title}</p>
        <ContactLinks 
          personal={personal} 
          containerClass="flex flex-wrap justify-center gap-6 mt-6 text-sm opacity-80"
          itemClass="flex items-center gap-2"
          iconSize={16}
        />
      </header>

      {/* Main Content */}
      <div className="p-10 flex-1 flex flex-col gap-8">
        
        {/* Summary */}
        {summary && (
          <section>
            <p className="text-[15px] leading-relaxed text-gray-700">{summary}</p>
          </section>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold uppercase tracking-wider mb-6 text-gray-800">Experience</h2>
            <div className="space-y-8">
              {experience.map(exp => (
                <div key={exp.id} className="relative pl-6 border-l-2" style={{ borderColor: theme.primaryColor }}>
                  <div className="absolute w-3 h-3 rounded-full -left-[7px] top-2" style={{ backgroundColor: theme.primaryColor }}></div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{exp.position}</h3>
                      <p className="text-md text-gray-600 font-medium">{exp.company}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{exp.startDate} - {exp.endDate}</p>
                      <p className="text-sm text-gray-400">{exp.location}</p>
                    </div>
                  </div>
                  <ul className="list-none space-y-2 mt-3">
                    {exp.highlights.map((item, i) => (
                      <li key={i} className="text-[14.5px] text-gray-700 relative pl-4 before:content-['•'] before:absolute before:left-0" style={{ beforeColor: theme.primaryColor }}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-2 gap-8 mt-auto">
          {/* Education */}
          {education && education.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold uppercase tracking-wider mb-6 text-gray-800">Education</h2>
              <div className="space-y-6">
                {education.map(edu => (
                  <div key={edu.id}>
                    <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                    <p className="text-sm font-medium text-gray-600">{edu.institution}</p>
                    <p className="text-sm text-gray-500 mt-1">{edu.startDate} - {edu.endDate}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills */}
          {skills && Object.keys(skills).length > 0 && (
            <section>
              <h2 className="text-2xl font-bold uppercase tracking-wider mb-6 text-gray-800">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {Object.values(skills).flat().map((skill, idx) => (
                  <span key={`${skill}-${idx}`} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-md border border-gray-200">
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

      </div>
    </div>
  );
}
