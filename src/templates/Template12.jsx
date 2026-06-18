import React from 'react';
import ContactLinks from '../components/common/ContactLinks';
import CustomSections from '../components/common/CustomSections';
export default function Template12({ data, config }) {
  const { personal, summary, experience, education, skills, projects, certifications, customSections, sectionTitles = {} } = data;
  const { theme, spacing } = config;

  return (
    <div 
      className="w-[210mm] min-h-[297mm] mx-auto bg-white shadow-lg overflow-hidden flex flex-row"
      style={{ fontFamily: theme.fontFamily, color: theme.textColor }}
    >
      {/* Left Sidebar */}
      <div className="w-[35%] p-8 text-white flex flex-col gap-8" style={{ backgroundColor: theme.primaryColor }}>
        
        {/* Name & Title */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">{personal.name}</h1>
          <h2 className="text-lg font-medium opacity-90">{personal.title}</h2>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-bold uppercase tracking-wider mb-4 border-b border-white/30 pb-2">Contact</h3>
          <ContactLinks 
            personal={personal} 
            containerClass="flex flex-col gap-3 text-sm opacity-90"
            itemClass="flex items-center gap-3"
            linkClass="hover:underline"
            iconSize={16}
          />
        </div>

        {/* Education (Prominent for Fresher) */}
        {education && education.length > 0 && (
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wider mb-4 border-b border-white/30 pb-2">{sectionTitles.education || 'Education'}</h3>
            <div className="flex flex-col gap-4">
              {education.map((edu) => (
                <div key={edu.id}>
                  <h4 className="font-bold text-sm">{edu.degree}</h4>
                  <p className="text-xs opacity-90 mb-1">{edu.institution}</p>
                  <div className="flex justify-between text-xs opacity-80">
                    <span>{edu.startDate} - {edu.endDate}</span>
                    {edu.gpa && <span>GPA: {edu.gpa}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills && Object.keys(skills).length > 0 && (
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wider mb-4 border-b border-white/30 pb-2">{sectionTitles.skills || 'Skills'}</h3>
            <div className="flex flex-col gap-3">
              {Object.entries(skills).map(([category, skillList]) => (
                <div key={category}>
                  <div className="text-xs font-bold uppercase opacity-80 mb-1">{category}</div>
                  <div className="flex flex-wrap gap-1">
                    {skillList.map((skill, i) => (
                      <span key={i} className="text-xs bg-white/20 px-2 py-1 rounded">{skill}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Right Content */}
      <div className="w-[65%] p-8 flex flex-col" style={{ gap: spacing.sectionGap }}>
        
        {/* Summary */}
        {summary && (
          <section>
            <h3 className="text-xl font-bold uppercase tracking-widest mb-3" style={{ color: theme.primaryColor }}>{sectionTitles.summary || 'Profile'}</h3>
            <p className="text-sm leading-relaxed text-gray-700">{summary}</p>
          </section>
        )}

        {/* Projects (Highest priority for right col) */}
        {projects && projects.length > 0 && (
          <section>
            <h3 className="text-xl font-bold uppercase tracking-widest mb-4" style={{ color: theme.primaryColor }}>{sectionTitles.projects || 'Key Projects'}</h3>
            <div className="flex flex-col gap-5">
              {projects.map((project) => (
                <div key={project.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-base text-gray-900">{project.name}</h4>
                    {project.link && (
                      <a href={project.link} target="_blank" rel="noreferrer" className="text-xs font-medium bg-gray-100 px-2 py-1 rounded text-blue-600 hover:underline">{project.link}</a>
                    )}
                  </div>
                  {project.description && (
                    <p className="text-sm font-medium text-gray-600 mb-2">{project.description}</p>
                  )}
                  {project.highlights && project.highlights.length > 0 && (
                    <ul className="list-disc list-outside ml-4 text-sm text-gray-600 space-y-1">
                      {project.highlights.map((highlight, idx) => (
                        <li key={idx}>{highlight}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Experience (Internships) */}
        {experience && experience.length > 0 && (
          <section>
            <h3 className="text-xl font-bold uppercase tracking-widest mb-4" style={{ color: theme.primaryColor }}>{sectionTitles.experience || 'Experience'}</h3>
            <div className="flex flex-col gap-5">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-base text-gray-900">{exp.position}</h4>
                    <span className="text-sm font-semibold" style={{ color: theme.primaryColor }}>{exp.startDate} - {exp.endDate}</span>
                  </div>
                  <div className="text-sm font-medium text-gray-700 mb-2">{exp.company}, {exp.location}</div>
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="list-disc list-outside ml-4 text-sm text-gray-600 space-y-1">
                      {exp.highlights.map((highlight, idx) => (
                        <li key={idx}>{highlight}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <section>
            <h3 className="text-xl font-bold uppercase tracking-widest mb-4" style={{ color: theme.primaryColor }}>{sectionTitles.certifications || 'Certifications'}</h3>
            <div className="grid grid-cols-1 gap-3">
              {certifications.map((cert) => (
                <div key={cert.id} className="bg-gray-50 p-3 rounded border border-gray-100">
                  <h4 className="font-bold text-sm text-gray-900">{cert.name}</h4>
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>{cert.issuer}</span>
                    <span>{cert.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <CustomSections
          sections={customSections}
          className=""
          headingClassName="text-xl font-bold uppercase tracking-widest mb-4"
          headingStyle={{ color: theme.primaryColor }}
        />

      </div>
    </div>
  );
}


