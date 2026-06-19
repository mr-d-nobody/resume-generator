import React from 'react';
import ContactLinks from '../components/common/ContactLinks';
import CustomSections from '../components/common/CustomSections';
import DateRange from '../components/common/DateRange';
import CertificateDetails from '../components/common/CertificateDetails';
import ProjectLinks from '../components/common/ProjectLinks';

const navyDark = '#0B2038';
const navyMid = '#163354';
const navyPale = '#EAF0F8';
const accentBlue = '#4A8FC1';
const textMuted = '#4E6278';
const borderGray = '#C2D5E8';

function Section({ title, children }) {
  if (!children) return null;

  return (
    <section>
      <h3 className="mb-2 flex items-center gap-2 text-[13px] font-extrabold uppercase tracking-wide" style={{ color: navyDark }}>
        <span className="inline-block h-4 w-[3px]" style={{ backgroundColor: navyDark }} />
        {title}
      </h3>
      <div className="mb-2 h-px w-full" style={{ backgroundColor: borderGray }} />
      {children}
    </section>
  );
}

function SkillTag({ children }) {
  return (
    <span
      className="mb-1 mr-1 inline-block px-1.5 py-0.5 text-[9px] font-bold"
      style={{ backgroundColor: navyPale, color: navyMid }}
    >
      {children}
    </span>
  );
}

function BulletList({ items, maxItems = 2 }) {
  const cleanItems = (items || []).filter(Boolean).slice(0, maxItems);
  if (cleanItems.length === 0) return null;

  return (
    <ul className="mt-2 space-y-1">
      {cleanItems.map((item, index) => (
        <li key={index} className="flex gap-2 text-[11px] leading-snug" style={{ color: textMuted }}>
          <span className="mt-[2px] text-[10px]" style={{ color: accentBlue }}>▶</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function Template16({ data }) {
  const { personal, summary, education, skills, projects, certifications, customSections, sectionTitles = {} } = data;

  return (
    <div className="mx-auto flex min-h-[297mm] w-[210mm] flex-col overflow-hidden bg-white shadow-lg" style={{ fontFamily: 'Inter, Arial, sans-serif', color: navyDark }}>
      <header className="relative text-white" style={{ backgroundColor: navyDark }}>
        <div className="px-11 pb-8 pt-9 text-center">
          <h1 className="text-[40px] font-extrabold leading-none tracking-tight">
            {personal.name}
          </h1>
          {personal.title && <div className="mt-3 flex items-center justify-center gap-2">
            <span className="h-[2px] w-11" style={{ backgroundColor: accentBlue }} />
            <p className="max-w-[580px] break-words text-[10px] font-bold uppercase leading-relaxed tracking-[0.18em]" style={{ color: '#9CBCE0' }}>
              {personal.title}
            </p>
          </div>}
          <ContactLinks
            personal={personal}
            containerClass="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px]"
            itemClass="inline"
            linkClass="hover:underline"
            showIcons={false}
            separator="|"
            style={{ color: '#B8C9DC' }}
          />
        </div>
        <div className="h-1 w-full" style={{ backgroundColor: accentBlue }} />
      </header>

      <main className="flex flex-1 flex-col gap-4 px-11 py-5">
        {summary && (
          <Section title={sectionTitles.summary || 'Summary'}>
            <p className="text-[12px] leading-relaxed" style={{ color: textMuted }}>
              {summary}
            </p>
          </Section>
        )}

        {education && education.length > 0 && (
          <Section title={sectionTitles.education || 'Education'}>
            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu.id} className="grid grid-cols-[1fr_auto] gap-4">
                  <div>
                    <h4 className="text-[12px] font-extrabold" style={{ color: navyDark }}>{edu.institution}</h4>
                    <p className="text-[11px]" style={{ color: textMuted }}>{edu.degree}{edu.location ? `, ${edu.location}` : ''}</p>
                    {edu.gpa && <p className="text-[10px] font-bold" style={{ color: navyMid }}>GPA: {edu.gpa}</p>}
                    <BulletList items={edu.highlights} />
                  </div>
                  <div className="text-right text-[10px] italic" style={{ color: textMuted }}>
                    <DateRange startDate={edu.startDate} endDate={edu.endDate} />
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {skills && Object.keys(skills).length > 0 && (
          <Section title={sectionTitles.skills || 'Technical Skills'}>
            <div className="space-y-2">
              {Object.entries(skills).map(([category, skillList]) => (
                <div key={category} className="grid grid-cols-[92px_1fr] gap-2">
                  <span className="text-[11px] font-extrabold capitalize" style={{ color: navyDark }}>{category}</span>
                  <div>
                    {(skillList || []).map((skill) => (
                      <SkillTag key={skill}>{skill}</SkillTag>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {projects && projects.length > 0 && (
          <Section title={sectionTitles.projects || 'Projects'}>
            <div className="space-y-2">
              {projects.slice(0, 4).map((project) => (
                <div key={project.id} className="border-l-[3px] px-3 py-2" style={{ borderColor: navyDark, backgroundColor: '#F8FBFF' }}>
                  <div className="flex items-baseline justify-between gap-3">
                    <h4 className="text-[12px] font-extrabold" style={{ color: navyDark }}>{project.name}</h4>
                    <ProjectLinks project={project} containerClassName="flex flex-wrap justify-end gap-2" linkClassName="shrink-0 text-[10px] font-bold text-blue-600 hover:underline" />
                  </div>
                  {project.description && (
                    <p className="mt-0.5 text-[10px] italic" style={{ color: textMuted }}>{project.description}</p>
                  )}
                  <BulletList items={project.highlights} maxItems={3} />
                </div>
              ))}
            </div>
          </Section>
        )}

        {certifications && certifications.length > 0 && (
          <Section title={sectionTitles.certifications || 'Certifications'}>
            <div className="space-y-1">
              {certifications.map((cert) => (
                <CertificateDetails key={cert.id} certificate={cert} className="text-[11px]" metaClassName="text-[10px]" linkClassName="text-[10px] font-bold hover:underline" />
              ))}
            </div>
          </Section>
        )}

        <CustomSections
          sections={customSections}
          renderSection={({ title, content }) => (
            <Section title={title}>
              {content}
            </Section>
          )}
        />
      </main>
    </div>
  );
}
