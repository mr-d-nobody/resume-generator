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

function Section({ title, children, titleColor = navyDark, borderColor = borderGray }) {
  if (!children) return null;

  return (
    <section className="break-inside-avoid">
      <h3 className="mb-[3px] flex items-center gap-1.5 text-[11px] font-extrabold uppercase leading-none tracking-wide" style={{ color: titleColor }}>
        <span className="inline-block h-3.5 w-[3px]" style={{ backgroundColor: titleColor }} />
        {title}
      </h3>
      <div className="mb-1 h-px w-full" style={{ backgroundColor: borderColor }} />
      {children}
    </section>
  );
}

function SkillTag({ children }) {
  return (
    <span
      className="mb-px mr-1 inline-block px-1.5 py-px text-[8px] font-bold leading-tight"
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
    <ul className="mt-1 space-y-px">
      {cleanItems.map((item, index) => (
        <li key={index} className="flex gap-1.5 text-[9px] leading-[1.22]" style={{ color: textMuted }}>
          <span className="mt-px text-[8px]" style={{ color: accentBlue }}>▶</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function FittedPageBody({ children, layout = {} }) {
  const sectionGap = Math.max(0.35, Number(layout.sectionGap) || 1.35) * 0.45;
  const density = Math.max(0.72, Math.min(1.18, Number(layout.density) || 1));
  const visualScale = density;

  return (
    <div
      className="template16-multipage-body min-h-0 flex-1 overflow-visible"
    >
      <div
        className="template16-content flex flex-col px-[14mm] pb-[3mm] pt-[3mm]"
        style={{
          width: `${100 / visualScale}%`,
          transform: `scale(${visualScale})`,
          transformOrigin: 'top left',
          gap: `${sectionGap}rem`
        }}
        data-fit-scale={visualScale.toFixed(3)}
      >
        {children}
      </div>
    </div>
  );
}

export default function Template16({ data, config = {} }) {
  const { personal, summary, education, skills, projects, certifications, customSections, sectionTitles = {} } = data;
  const theme = config.theme || {};
  const layout = config.layout || {};
  const primaryColor = theme.primaryColor || navyDark;
  const accentColor = theme.secondaryColor || accentBlue;
  const pageTextColor = theme.textColor || navyDark;
  const itemGapStyle = {
    gap: `${Math.max(0.2, Number(layout.itemGap) || 0.85) * 0.35}rem`
  };

  return (
    <div
      className="template16-page mx-auto flex min-h-[297mm] w-[210mm] flex-col overflow-visible bg-white shadow-lg"
      data-page-mode="multi"
      style={{ fontFamily: theme.fontFamily || 'Inter, Arial, sans-serif', color: pageTextColor }}
    >
      <header className="relative shrink-0 text-white" style={{ backgroundColor: primaryColor }}>
        <div className="px-[14mm] pb-[13px] pt-[14px] text-center">
          <h1 className="text-[28px] font-extrabold leading-none tracking-tight">
            {personal.name}
          </h1>
          {personal.title && (
            <div className="mt-1.5 flex items-center justify-center gap-2">
              <span className="h-px w-9" style={{ backgroundColor: accentColor }} />
              <p className="max-w-[650px] break-words text-[8px] font-bold uppercase leading-tight tracking-[0.15em]" style={{ color: '#9CBCE0' }}>
                {personal.title}
              </p>
            </div>
          )}
          <ContactLinks
            personal={personal}
            containerClass="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-0.5 text-[8.5px] leading-tight"
            itemClass="inline"
            linkClass="hover:underline"
            showIcons={false}
            separator="|"
            style={{ color: '#B8C9DC' }}
          />
        </div>
        <div className="h-[3px] w-full" style={{ backgroundColor: accentColor }} />
      </header>

      <FittedPageBody layout={layout}>
        {summary && (
          <Section title={sectionTitles.summary || 'Summary'} titleColor={primaryColor}>
            <p className="text-[9px] leading-[1.3]" style={{ color: textMuted }}>{summary}</p>
          </Section>
        )}

        {education && education.length > 0 && (
          <Section title={sectionTitles.education || 'Education'} titleColor={primaryColor}>
            <div className="flex flex-col" style={itemGapStyle}>
              {education.map((edu) => (
                <div key={edu.id} className="grid grid-cols-[1fr_auto] gap-3">
                  <div>
                    <h4 className="text-[9.5px] font-extrabold leading-tight" style={{ color: primaryColor }}>{edu.institution}</h4>
                    <p className="text-[9px] leading-tight" style={{ color: textMuted }}>{edu.degree}{edu.location ? `, ${edu.location}` : ''}</p>
                    {edu.gpa && <p className="text-[8px] font-bold leading-tight" style={{ color: navyMid }}>{edu.gradeLabel || 'GPA'}: {edu.gpa}</p>}
                    <BulletList items={edu.highlights} />
                  </div>
                  <div className="text-right text-[8px] italic" style={{ color: textMuted }}>
                    <DateRange startDate={edu.startDate} endDate={edu.endDate} />
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {skills && Object.keys(skills).length > 0 && (
          <Section title={sectionTitles.skills || 'Technical Skills'} titleColor={primaryColor}>
            <div className="flex flex-col" style={itemGapStyle}>
              {Object.entries(skills).map(([category, skillList]) => (
                <div key={category} className="grid grid-cols-[82px_1fr] gap-1.5">
                  <span className="text-[9px] font-extrabold capitalize leading-tight" style={{ color: primaryColor }}>{category}</span>
                  <div>
                    {(skillList || []).map((skill) => <SkillTag key={skill}>{skill}</SkillTag>)}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {projects && projects.length > 0 && (
          <Section title={sectionTitles.projects || 'Projects'} titleColor={primaryColor}>
            <div className="flex flex-col" style={itemGapStyle}>
              {projects.slice(0, 4).map((project) => (
                <div key={project.id} className="break-inside-avoid border-l-[3px] px-2 py-1" style={{ borderColor: primaryColor, backgroundColor: '#F8FBFF' }}>
                  <div className="flex items-baseline justify-between gap-2">
                    <h4 className="text-[9.5px] font-extrabold leading-tight" style={{ color: primaryColor }}>{project.name}</h4>
                    <ProjectLinks project={project} containerClassName="flex flex-wrap justify-end gap-1.5" linkClassName="shrink-0 text-[8px] font-bold text-blue-600 hover:underline" />
                  </div>
                  {project.description && <p className="mt-px text-[8.5px] italic leading-[1.2]" style={{ color: textMuted }}>{project.description}</p>}
                  <BulletList items={project.highlights} maxItems={3} />
                </div>
              ))}
            </div>
          </Section>
        )}

        {certifications && certifications.length > 0 && (
          <Section title={sectionTitles.certifications || 'Certifications'} titleColor={primaryColor}>
            <div className="flex flex-col" style={itemGapStyle}>
              {certifications.map((cert) => (
                <CertificateDetails key={cert.id} certificate={cert} className="text-[9px] leading-tight" metaClassName="text-[8px] leading-tight" linkClassName="text-[8px] font-bold hover:underline" />
              ))}
            </div>
          </Section>
        )}

        <CustomSections
          sections={customSections}
          className=""
          itemClassName="text-[8.5px] leading-[1.2]"
          paragraphClassName="text-[8.5px] leading-[1.2]"
          renderSection={({ title, content }) => <Section title={title} titleColor={primaryColor}>{content}</Section>}
        />
      </FittedPageBody>
    </div>
  );
}
