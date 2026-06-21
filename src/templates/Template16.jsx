import React, { useLayoutEffect, useRef, useState } from 'react';
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
    <section className="break-inside-avoid">
      <h3 className="mb-[3px] flex items-center gap-1.5 text-[11px] font-extrabold uppercase leading-none tracking-wide" style={{ color: navyDark }}>
        <span className="inline-block h-3.5 w-[3px]" style={{ backgroundColor: navyDark }} />
        {title}
      </h3>
      <div className="mb-1 h-px w-full" style={{ backgroundColor: borderGray }} />
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

const TARGET_PAGE_FILL = 0.9;
const MIN_QUALITY_SCALE = 0.84;
const MAX_FILL_SCALE = 1.18;

function FittedPageBody({ children, onPageModeChange }) {
  const viewportRef = useRef(null);
  const contentRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [pageMode, setPageMode] = useState('single');

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return undefined;

    let frame;

    const fit = () => {
      const availableHeight = viewport.clientHeight;
      const naturalHeight = content.scrollHeight;
      if (!availableHeight || !naturalHeight) return;

      const idealScale = (availableHeight * TARGET_PAGE_FILL) / naturalHeight;
      const nextMode = idealScale < MIN_QUALITY_SCALE ? 'multi' : 'single';
      const nextScale = nextMode === 'multi'
        ? 1
        : Math.max(MIN_QUALITY_SCALE, Math.min(MAX_FILL_SCALE, idealScale));

      setScale(nextScale);
      setPageMode(nextMode);
      onPageModeChange(nextMode);

      if (nextMode === 'single') {
        frame = requestAnimationFrame(() => {
          const renderedHeight = content.getBoundingClientRect().height;
          const currentFill = renderedHeight / availableHeight;
          if (currentFill > 0 && Math.abs(currentFill - TARGET_PAGE_FILL) > 0.01) {
            setScale((current) => Math.max(
              MIN_QUALITY_SCALE,
              Math.min(MAX_FILL_SCALE, current * (TARGET_PAGE_FILL / currentFill))
            ));
          }
        });
      }
    };

    setScale(1);
    frame = requestAnimationFrame(fit);
    const observer = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    });
    observer.observe(content, {
      childList: true,
      subtree: true,
      characterData: true
    });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [children, onPageModeChange]);

  return (
    <div
      ref={viewportRef}
      className={pageMode === 'single' ? 'min-h-0 flex-1 overflow-hidden' : 'template16-multipage-body'}
    >
      <div
        ref={contentRef}
        className="template16-content mx-auto flex flex-col gap-[7px] px-[14mm] pb-[3mm] pt-[3mm]"
        style={{ width: `${100 / scale}%`, zoom: scale }}
        data-fit-scale={scale.toFixed(3)}
      >
        {children}
      </div>
    </div>
  );
}

export default function Template16({ data }) {
  const { personal, summary, education, skills, projects, certifications, customSections, sectionTitles = {} } = data;
  const [pageMode, setPageMode] = useState('single');

  return (
    <div
      className={`template16-page mx-auto flex w-[210mm] flex-col bg-white shadow-lg ${
        pageMode === 'single' ? 'h-[297mm] overflow-hidden' : 'min-h-[297mm] overflow-visible'
      }`}
      data-page-mode={pageMode}
      style={{ fontFamily: 'Inter, Arial, sans-serif', color: navyDark }}
    >
      <header className="relative shrink-0 text-white" style={{ backgroundColor: navyDark }}>
        <div className="px-[14mm] pb-[13px] pt-[14px] text-center">
          <h1 className="text-[28px] font-extrabold leading-none tracking-tight">
            {personal.name}
          </h1>
          {personal.title && (
            <div className="mt-1.5 flex items-center justify-center gap-2">
              <span className="h-px w-9" style={{ backgroundColor: accentBlue }} />
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
        <div className="h-[3px] w-full" style={{ backgroundColor: accentBlue }} />
      </header>

      <FittedPageBody onPageModeChange={setPageMode}>
        {summary && (
          <Section title={sectionTitles.summary || 'Summary'}>
            <p className="text-[9px] leading-[1.3]" style={{ color: textMuted }}>{summary}</p>
          </Section>
        )}

        {education && education.length > 0 && (
          <Section title={sectionTitles.education || 'Education'}>
            <div className="space-y-1">
              {education.map((edu) => (
                <div key={edu.id} className="grid grid-cols-[1fr_auto] gap-3">
                  <div>
                    <h4 className="text-[9.5px] font-extrabold leading-tight" style={{ color: navyDark }}>{edu.institution}</h4>
                    <p className="text-[9px] leading-tight" style={{ color: textMuted }}>{edu.degree}{edu.location ? `, ${edu.location}` : ''}</p>
                    {edu.gpa && <p className="text-[8px] font-bold leading-tight" style={{ color: navyMid }}>GPA: {edu.gpa}</p>}
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
          <Section title={sectionTitles.skills || 'Technical Skills'}>
            <div className="space-y-px">
              {Object.entries(skills).map(([category, skillList]) => (
                <div key={category} className="grid grid-cols-[82px_1fr] gap-1.5">
                  <span className="text-[9px] font-extrabold capitalize leading-tight" style={{ color: navyDark }}>{category}</span>
                  <div>
                    {(skillList || []).map((skill) => <SkillTag key={skill}>{skill}</SkillTag>)}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {projects && projects.length > 0 && (
          <Section title={sectionTitles.projects || 'Projects'}>
            <div className="space-y-1">
              {projects.slice(0, 4).map((project) => (
                <div key={project.id} className="break-inside-avoid border-l-[3px] px-2 py-1" style={{ borderColor: navyDark, backgroundColor: '#F8FBFF' }}>
                  <div className="flex items-baseline justify-between gap-2">
                    <h4 className="text-[9.5px] font-extrabold leading-tight" style={{ color: navyDark }}>{project.name}</h4>
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
          <Section title={sectionTitles.certifications || 'Certifications'}>
            <div className="space-y-px">
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
          renderSection={({ title, content }) => <Section title={title}>{content}</Section>}
        />
      </FittedPageBody>
    </div>
  );
}
