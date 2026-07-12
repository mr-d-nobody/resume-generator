import React from 'react';
import ContactLinks from '../components/common/ContactLinks';
import CustomSections from '../components/common/CustomSections';
import DateRange from '../components/common/DateRange';
import CertificateDetails from '../components/common/CertificateDetails';
import ProjectLinks from '../components/common/ProjectLinks';
export default function Template13({ data, config }) {
  const { personal, summary, education, skills, projects, certifications, customSections, sectionTitles = {} } = data;
  const { theme, spacing, densityStyle } = config;

  return (
    <div
      className="w-[210mm] min-h-[297mm] mx-auto bg-white shadow-lg overflow-visible"
      style={{ fontFamily: theme.fontFamily, color: theme.textColor }}
    >
      <div className="relative flex min-h-[297mm] flex-col bg-white" style={densityStyle}>
        {/* Top Banner */}
        <div className="absolute top-0 left-0 w-full h-40 opacity-10" style={{ backgroundColor: theme.primaryColor }}></div>

        <header className="px-12 pt-12 pb-6 relative z-10 text-center">
        <h1 className="text-5xl font-black tracking-tight mb-2" style={{ color: theme.primaryColor }}>
          {personal.name}
        </h1>
        {personal.title && <h2 className="mb-4 break-words text-xl font-medium uppercase leading-snug tracking-wide text-gray-700">{personal.title}</h2>}
        <ContactLinks 
          personal={personal} 
          containerClass="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm font-medium text-gray-600"
          itemClass="inline"
          linkClass="hover:underline"
          showIcons={false}
          separator="*"
        />
      </header>

      <div className="px-12 py-4 flex-1 flex flex-col" style={{ gap: spacing.sectionGap }}>
        
        {/* Profile */}
        {summary && (
          <section className="text-center px-8">
            {sectionTitles.summary && (
              <h3 className="text-xl font-bold uppercase tracking-widest mb-3" style={{ color: theme.primaryColor }}>{sectionTitles.summary}</h3>
            )}
            <p className="text-sm leading-relaxed text-gray-700 italic">"{summary}"</p>
          </section>
        )}

        {/* Education Highlighted */}
        {education && education.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-px bg-gray-300 flex-1"></div>
              <h3 className="text-xl font-bold uppercase tracking-widest" style={{ color: theme.primaryColor }}>{sectionTitles.education || 'Education'}</h3>
              <div className="h-px bg-gray-300 flex-1"></div>
            </div>
            
            <div className="grid grid-cols-1" style={{ gap: spacing.itemGap }}>
              {education.map((edu) => (
                <div key={edu.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                  <h4 className="font-bold text-lg text-gray-900">{edu.degree}</h4>
                  <p className="text-base text-gray-700 font-medium mb-1">{edu.institution}, {edu.location}</p>
                  <p className="text-sm font-semibold" style={{ color: theme.primaryColor }}><DateRange startDate={edu.startDate} endDate={edu.endDate} />{edu.gpa && ` | ${edu.gradeLabel || 'GPA'}: ${edu.gpa}`}</p>
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
              <h3 className="text-xl font-bold uppercase tracking-widest" style={{ color: theme.primaryColor }}>{sectionTitles.projects || 'Featured Projects'}</h3>
              <div className="h-px bg-gray-300 flex-1"></div>
            </div>
            
            <div className="grid grid-cols-2" style={{ gap: spacing.itemGap }}>
              {projects.map((project) => (
                <div key={project.id} className="border-l-4 pl-4" style={{ borderColor: theme.primaryColor }}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-base text-gray-900">{project.name}</h4>
                    <ProjectLinks project={project} containerClassName="flex flex-wrap justify-end gap-2" />
                  </div>
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

        {certifications && certifications.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-px bg-gray-300 flex-1"></div>
              <h3 className="text-xl font-bold uppercase tracking-widest" style={{ color: theme.primaryColor }}>{sectionTitles.certifications || 'Certifications'}</h3>
              <div className="h-px bg-gray-300 flex-1"></div>
            </div>
            <div className="grid grid-cols-2" style={{ gap: spacing.itemGap }}>
              {certifications.map((cert) => (
                <CertificateDetails key={cert.id} certificate={cert} className="border-l-4 pl-4 text-sm" metaClassName="text-xs text-gray-600" linkClassName="text-xs text-blue-600 hover:underline" />
              ))}
            </div>
          </section>
        )}

        {/* Skills Tags */}
        {skills && Object.keys(skills).length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-px bg-gray-300 flex-1"></div>
              <h3 className="text-xl font-bold uppercase tracking-widest" style={{ color: theme.primaryColor }}>{sectionTitles.skills || 'Skills Arsenal'}</h3>
              <div className="h-px bg-gray-300 flex-1"></div>
            </div>
            
            <div className="flex flex-wrap justify-center" style={{ gap: spacing.itemGap }}>
              {Object.values(skills).flat().map((skill, idx) => (
                <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full border border-gray-200">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        <CustomSections
          sections={customSections}
          renderSection={({ title, content }) => (
            <section>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-px bg-gray-300 flex-1"></div>
                <h3 className="text-xl font-bold uppercase tracking-widest" style={{ color: theme.primaryColor }}>{title}</h3>
                <div className="h-px bg-gray-300 flex-1"></div>
              </div>
              <div className="border-l-4 pl-4" style={{ borderColor: theme.primaryColor }}>
                {content}
              </div>
            </section>
          )}
        />

        </div>
      </div>
    </div>
  );
}


