import React from 'react';

export default function Template13({ data, config }) {
  const { personal, summary, experience, education, skills, projects } = data;
  const { theme, spacing } = config;

  return (
    <div 
      className="w-[210mm] min-h-[297mm] mx-auto bg-white shadow-lg overflow-hidden flex flex-col relative"
      style={{ fontFamily: theme.fontFamily, color: theme.textColor }}
    >
      {/* Top Banner */}
      <div className="absolute top-0 left-0 w-full h-40 opacity-10" style={{ backgroundColor: theme.primaryColor }}></div>
      
      <header className="px-12 pt-12 pb-6 relative z-10 text-center">
        <h1 className="text-5xl font-black tracking-tight mb-2" style={{ color: theme.primaryColor }}>
          {personal.name}
        </h1>
        <h2 className="text-xl font-medium tracking-wide text-gray-700 mb-4 uppercase">
          {personal.title}
        </h2>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm font-medium text-gray-600">
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>• {personal.phone}</span>}
          {personal.location && <span>• {personal.location}</span>}
          {personal.linkedin && <span>• {personal.linkedin}</span>}
          {personal.github && <span>• {personal.github}</span>}
        </div>
      </header>

      <div className="px-12 py-4 flex-1 flex flex-col" style={{ gap: spacing.sectionGap }}>
        
        {/* Profile */}
        {summary && (
          <section className="text-center px-8">
            <p className="text-sm leading-relaxed text-gray-700 italic">"{summary}"</p>
          </section>
        )}

        {/* Education Highlighted */}
        {education && education.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-px bg-gray-300 flex-1"></div>
              <h3 className="text-xl font-bold uppercase tracking-widest" style={{ color: theme.primaryColor }}>Education</h3>
              <div className="h-px bg-gray-300 flex-1"></div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {education.map((edu) => (
                <div key={edu.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                  <h4 className="font-bold text-lg text-gray-900">{edu.degree}</h4>
                  <p className="text-base text-gray-700 font-medium mb-1">{edu.institution}, {edu.location}</p>
                  <p className="text-sm font-semibold" style={{ color: theme.primaryColor }}>{edu.startDate} - {edu.endDate} {edu.gpa && `| GPA: ${edu.gpa}`}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects in Grid */}
        {projects && projects.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-px bg-gray-300 flex-1"></div>
              <h3 className="text-xl font-bold uppercase tracking-widest" style={{ color: theme.primaryColor }}>Featured Projects</h3>
              <div className="h-px bg-gray-300 flex-1"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              {projects.map((project) => (
                <div key={project.id} className="border-l-4 pl-4" style={{ borderColor: theme.primaryColor }}>
                  <h4 className="font-bold text-base text-gray-900 mb-1">{project.name}</h4>
                  {project.description && (
                    <p className="text-xs font-semibold text-gray-500 mb-2">{project.description}</p>
                  )}
                  {project.highlights && project.highlights.length > 0 && (
                    <ul className="list-disc list-outside ml-3 text-sm text-gray-600 space-y-1">
                      {project.highlights.slice(0, 3).map((highlight, idx) => (
                        <li key={idx}>{highlight}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills Tags */}
        {skills && Object.keys(skills).length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-px bg-gray-300 flex-1"></div>
              <h3 className="text-xl font-bold uppercase tracking-widest" style={{ color: theme.primaryColor }}>Skills Arsenal</h3>
              <div className="h-px bg-gray-300 flex-1"></div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2">
              {Object.values(skills).flat().map((skill, idx) => (
                <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full border border-gray-200">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
