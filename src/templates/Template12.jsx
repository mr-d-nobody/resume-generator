import React from 'react';
import ContactLinks from '../components/common/ContactLinks';
import CustomSections from '../components/common/CustomSections';
import DateRange from '../components/common/DateRange';
import CertificateDetails from '../components/common/CertificateDetails';
import ProjectLinks from '../components/common/ProjectLinks';

function SidebarBlock({ title, children }) {
  if (!children) return null;
  return (
    <section>
      <h3 className="mb-3 border-b border-white/35 pb-1.5 text-[13px] font-bold uppercase tracking-[0.12em]">
        {title}
      </h3>
      {children}
    </section>
  );
}

function MainSection({ title, children, color }) {
  if (!children) return null;
  return (
    <section className="break-inside-avoid">
      <h3 className="mb-3 border-b pb-1.5 text-[13px] font-extrabold uppercase tracking-[0.14em]" style={{ color, borderColor: color }}>
        {title}
      </h3>
      {children}
    </section>
  );
}

export default function Template12({ data, config }) {
  const {
    personal,
    summary,
    experience,
    education,
    skills,
    projects,
    certifications,
    customSections,
    sectionTitles = {}
  } = data;
  const { theme, spacing } = config;

  return (
    <div
      className="mx-auto grid min-h-[297mm] w-[210mm] grid-cols-[34%_66%] overflow-hidden bg-white shadow-lg"
      style={{ fontFamily: theme.fontFamily, color: theme.textColor }}
    >
      <aside className="px-8 py-10 text-white" style={{ backgroundColor: theme.primaryColor }}>
        <div className="mb-10 text-center">
          <h1 className="text-[27px] font-black leading-tight tracking-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {personal.name}
          </h1>
          <div className="mx-auto my-4 h-px w-12 bg-white/70" />
          {personal.title && (
            <p className="break-words text-[10px] font-bold uppercase leading-snug tracking-[0.15em] text-white/85">
              {personal.title}
            </p>
          )}
        </div>

        <div className="flex flex-col" style={{ gap: spacing.sectionGap }}>
          <SidebarBlock title="Details">
            <ContactLinks
              personal={personal}
              containerClass="flex flex-col gap-1.5 text-[10.5px] leading-snug text-white/95"
              itemClass="inline"
              linkClass="underline underline-offset-2"
              showIcons={false}
            />
          </SidebarBlock>

          {education && education.length > 0 && (
            <SidebarBlock title={sectionTitles.education || 'Education'}>
              <div className="flex flex-col" style={{ gap: spacing.itemGap }}>
                {education.map((edu) => (
                  <div key={edu.id}>
                    <h4 className="text-[11px] font-bold leading-tight">{edu.degree}</h4>
                    <p className="mt-1 text-[9.5px] leading-tight text-white/85">{edu.institution}</p>
                    <p className="mt-1 text-[9px] text-white/75">
                      <DateRange startDate={edu.startDate} endDate={edu.endDate} />
                      {edu.gpa ? ` | GPA: ${edu.gpa}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            </SidebarBlock>
          )}

          {skills && Object.keys(skills).length > 0 && (
            <SidebarBlock title={sectionTitles.skills || 'Skills'}>
              <div className="flex flex-col" style={{ gap: spacing.itemGap }}>
                {Object.entries(skills).map(([category, skillList]) => (
                  <div key={category}>
                    <div className="mb-1 text-[9.5px] font-bold uppercase tracking-wide text-white/75">{category}</div>
                    <p className="text-[10px] leading-snug text-white/95">{skillList.join(', ')}</p>
                  </div>
                ))}
              </div>
            </SidebarBlock>
          )}
        </div>
      </aside>

      <main className="px-8 py-10">
        <div className="flex flex-col" style={{ gap: spacing.sectionGap }}>
          {summary && (
            <MainSection title={sectionTitles.summary || 'Profile'} color={theme.primaryColor}>
              <p className="text-[11px] leading-[1.45] text-gray-700">{summary}</p>
            </MainSection>
          )}

          {projects && projects.length > 0 && (
            <MainSection title={sectionTitles.projects || 'Key Projects'} color={theme.primaryColor}>
              <div className="flex flex-col" style={{ gap: spacing.itemGap }}>
                {projects.map((project) => (
                  <div key={project.id} className="break-inside-avoid">
                    <div className="mb-1 flex items-baseline justify-between gap-3">
                      <h4 className="text-[12px] font-extrabold text-gray-950">{project.name}</h4>
                      <ProjectLinks project={project} containerClassName="flex flex-wrap justify-end gap-1.5" linkClassName="text-[9px] font-bold text-blue-600 hover:underline" />
                    </div>
                    {project.description && (
                      <p className="mb-1 text-[10.5px] italic leading-[1.35] text-gray-600">{project.description}</p>
                    )}
                    {project.highlights && project.highlights.length > 0 && (
                      <ul className="ml-3 list-disc space-y-0.5 text-[10px] leading-tight text-gray-600">
                        {project.highlights.map((highlight, index) => (
                          <li key={index}>{highlight}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </MainSection>
          )}

          {experience && experience.length > 0 && (
            <MainSection title={sectionTitles.experience || 'Experience'} color={theme.primaryColor}>
              <div className="flex flex-col" style={{ gap: spacing.itemGap }}>
                {experience.map((exp) => (
                  <div key={exp.id} className="break-inside-avoid">
                    <div className="mb-1 flex items-baseline justify-between gap-3">
                      <h4 className="text-[12px] font-extrabold text-gray-950">{exp.position}</h4>
                      <DateRange startDate={exp.startDate} endDate={exp.endDate} className="text-[10px] font-bold" style={{ color: theme.primaryColor }} />
                    </div>
                    <p className="mb-1 text-[10.5px] font-semibold text-gray-700">{exp.company}{exp.location ? `, ${exp.location}` : ''}</p>
                    {exp.highlights && exp.highlights.length > 0 && (
                      <ul className="ml-3 list-disc space-y-0.5 text-[10px] leading-tight text-gray-600">
                        {exp.highlights.map((highlight, index) => (
                          <li key={index}>{highlight}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </MainSection>
          )}

          {certifications && certifications.length > 0 && (
            <MainSection title={sectionTitles.certifications || 'Certifications'} color={theme.primaryColor}>
              <div className="grid grid-cols-1" style={{ gap: spacing.itemGap }}>
                {certifications.map((cert) => (
                  <CertificateDetails key={cert.id} certificate={cert} className="text-[10.5px] font-semibold text-gray-900" metaClassName="text-[9px] text-gray-600" linkClassName="text-[9px] font-bold text-blue-600 hover:underline" />
                ))}
              </div>
            </MainSection>
          )}

          <CustomSections
            sections={customSections}
            className=""
            headingClassName="mb-3 border-b pb-1.5 text-[13px] font-extrabold uppercase tracking-[0.14em]"
            headingStyle={{ color: theme.primaryColor, borderColor: theme.primaryColor }}
            itemClassName="text-[10.5px] text-gray-700"
            paragraphClassName="text-[10.5px] leading-[1.35] text-gray-700"
          />
        </div>
      </main>
    </div>
  );
}
