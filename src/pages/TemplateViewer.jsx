import React from 'react';
import { useParams } from 'react-router-dom';
import resumeData from '../data/resume.json';
import templateConfig from '../data/template-config.json';

// Import templates dynamically or just switch case
import Template11 from '../templates/Template11';
import Template12 from '../templates/Template12';
import Template13 from '../templates/Template13';
import Template14 from '../templates/Template14';
import Template15 from '../templates/Template15';
import Template16 from '../templates/Template16';

export default function TemplateViewer() {
  const { id } = useParams();

  const renderTemplate = () => {
    switch (id) {
      case '11': return <Template11 data={resumeData} config={templateConfig} />;
      case '12': return <Template12 data={resumeData} config={templateConfig} />;
      case '13': return <Template13 data={resumeData} config={templateConfig} />;
      case '14': return <Template14 data={resumeData} config={templateConfig} />;
      case '15': return <Template15 data={resumeData} config={templateConfig} />;
      case '16': return <Template16 data={resumeData} config={templateConfig} />;
      default: return <Template12 data={resumeData} config={templateConfig} />;
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {renderTemplate()}
    </div>
  );
}
