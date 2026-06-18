import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useResume } from '../../contexts/ResumeContext';
import templateConfig from '../../data/template-config.json';

import Template1 from '../../templates/Template1';
import Template2 from '../../templates/Template2';
import Template3 from '../../templates/Template3';
import Template4 from '../../templates/Template4';
import Template5 from '../../templates/Template5';
import Template6 from '../../templates/Template6';
import Template7 from '../../templates/Template7';
import Template8 from '../../templates/Template8';
import Template9 from '../../templates/Template9';
import Template10 from '../../templates/Template10';
import Template11 from '../../templates/Template11';
import Template12 from '../../templates/Template12';
import Template13 from '../../templates/Template13';
import Template14 from '../../templates/Template14';
import Template15 from '../../templates/Template15';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ResumePreview({ isPrintMode = false }) {
  const { resumeData, selectedTemplate } = useResume();
  const query = useQuery();
  const templateId = query.get('template') || selectedTemplate || '1';

  // Transform form context data into our template format
  const transformedData = useMemo(() => {
    const { personalInfo, experience, education, skills, certifications, achievements, projects, customSections } = resumeData;

    // Group skills by category
    const groupedSkills = skills.reduce((acc, skill) => {
      const cat = skill.category || 'Skills';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill.name);
      return acc;
    }, {});
    
    // Add fallback for empty skills so templates don't crash
    if (Object.keys(groupedSkills).length === 0) {
      groupedSkills['Languages'] = [];
      groupedSkills['Frameworks'] = [];
      groupedSkills['Tools'] = [];
    }

    return {
      personal: {
        name: `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`.trim() || 'Your Name',
        title: personalInfo.title || 'Professional Title',
        email: personalInfo.email || '',
        phone: personalInfo.phone || '',
        location: personalInfo.location || '',
        website: personalInfo.website || '',
        linkedin: personalInfo.linkedin || '',
        github: personalInfo.github || ''
      },
      summary: personalInfo.summary || '',
      experience: experience.map(exp => ({
        id: Math.random().toString(),
        company: exp.company || 'Company Name',
        position: exp.position || 'Position',
        location: exp.location || '',
        startDate: exp.startDate || 'Start Date',
        endDate: exp.current ? 'Present' : (exp.endDate || 'End Date'),
        highlights: exp.description ? exp.description.split('\n').filter(Boolean) : []
      })),
      education: education.map(edu => ({
        id: Math.random().toString(),
        institution: edu.institution || 'University Name',
        degree: edu.degree || 'Degree',
        location: edu.location || '',
        startDate: edu.startDate || 'Start Date',
        endDate: edu.graduationDate || 'Grad Date',
        gpa: edu.cgpa ? `${edu.cgpa}` : null,
        highlights: edu.description ? [edu.description] : []
      })),
      skills: groupedSkills,
      certifications: certifications.map(cert => ({
        id: Math.random().toString(),
        name: cert.name || 'Certification Name',
        issuer: cert.issuer || 'Issuer',
        date: cert.date || 'Date'
      })),
      achievements: achievements.map(ach => ({
        id: Math.random().toString(),
        title: ach.title || 'Achievement',
        organization: ach.organization || '',
        date: ach.date || '',
        description: ach.description || ''
      })),
      projects: projects.length > 0 ? projects.map(proj => ({
        id: Math.random().toString(),
        name: proj.name || 'Project Name',
        link: proj.link || '',
        description: proj.description || '',
        highlights: proj.highlights || []
      })) : achievements.map(ach => ({
        // Fallback: If no projects, map achievements to projects so old data isn't lost visually
        id: Math.random().toString(),
        name: ach.title || 'Project / Achievement',
        description: ach.organization || '',
        link: '',
        highlights: ach.description ? [ach.description] : []
      })),
      customSections: (customSections || []).map(section => ({
        id: section.id || Math.random().toString(),
        title: section.title || 'Custom Section',
        description: section.description || '',
        items: Array.isArray(section.items)
          ? section.items
          : (section.description || '').split('\n').filter(Boolean)
      }))
    };
  }, [resumeData]);

  const containerRef = React.useRef(null);
  const [scale, setScale] = React.useState(0.7);

  React.useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        // Calculate available width with some padding (40px)
        const availableWidth = containerRef.current.clientWidth - 40;
        // A4 width in pixels (approx 210mm at 96 DPI)
        const a4Width = 794; 
        const newScale = Math.min(availableWidth / a4Width, 1);
        setScale(newScale);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const renderTemplate = () => {
    const props = { data: transformedData, config: templateConfig };
    switch (templateId) {
      case '1': return <Template1 {...props} />;
      case '2': return <Template2 {...props} />;
      case '3': return <Template3 {...props} />;
      case '4': return <Template4 {...props} />;
      case '5': return <Template5 {...props} />;
      case '6': return <Template6 {...props} />;
      case '7': return <Template7 {...props} />;
      case '8': return <Template8 {...props} />;
      case '9': return <Template9 {...props} />;
      case '10': return <Template10 {...props} />;
      case '11': return <Template11 {...props} />;
      case '12': return <Template12 {...props} />;
      case '13': return <Template13 {...props} />;
      case '14': return <Template14 {...props} />;
      case '15': return <Template15 {...props} />;
      default: return <Template1 {...props} />;
    }
  };

  // A4 dimensions in pixels
  const A4_WIDTH = 794;
  const A4_HEIGHT = 1123;

  if (isPrintMode) {
    return (
      <div className="bg-white mx-auto" style={{ width: `${A4_WIDTH}px`, minHeight: `${A4_HEIGHT}px` }}>
        {renderTemplate()}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="w-full h-[calc(100vh-180px)] overflow-auto bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex justify-center py-8 custom-scrollbar"
    >
      <div 
        className="relative transition-all duration-300"
        style={{ 
          width: A4_WIDTH * scale, 
          height: A4_HEIGHT * scale 
        }}
      >
        <div 
          className="absolute top-0 left-0 bg-white shadow-2xl overflow-hidden"
          style={{ 
            width: A4_WIDTH, 
            minHeight: A4_HEIGHT,
            transform: `scale(${scale})`, 
            transformOrigin: 'top left' 
          }}
        >
          {renderTemplate()}
        </div>
      </div>
    </div>
  );
}
