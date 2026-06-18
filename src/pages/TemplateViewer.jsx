import React from 'react';
import { useParams } from 'react-router-dom';
import resumeData from '../data/resume.json';
import templateConfig from '../data/template-config.json';

// Import templates dynamically or just switch case
import Template1 from '../templates/Template1';
import Template2 from '../templates/Template2';
import Template3 from '../templates/Template3';
import Template4 from '../templates/Template4';
import Template5 from '../templates/Template5';
import Template6 from '../templates/Template6';
import Template7 from '../templates/Template7';
import Template8 from '../templates/Template8';
import Template9 from '../templates/Template9';
import Template10 from '../templates/Template10';
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
      case '1': return <Template1 data={resumeData} config={templateConfig} />;
      case '2': return <Template2 data={resumeData} config={templateConfig} />;
      case '3': return <Template3 data={resumeData} config={templateConfig} />;
      case '4': return <Template4 data={resumeData} config={templateConfig} />;
      case '5': return <Template5 data={resumeData} config={templateConfig} />;
      case '6': return <Template6 data={resumeData} config={templateConfig} />;
      case '7': return <Template7 data={resumeData} config={templateConfig} />;
      case '8': return <Template8 data={resumeData} config={templateConfig} />;
      case '9': return <Template9 data={resumeData} config={templateConfig} />;
      case '10': return <Template10 data={resumeData} config={templateConfig} />;
      case '11': return <Template11 data={resumeData} config={templateConfig} />;
      case '12': return <Template12 data={resumeData} config={templateConfig} />;
      case '13': return <Template13 data={resumeData} config={templateConfig} />;
      case '14': return <Template14 data={resumeData} config={templateConfig} />;
      case '15': return <Template15 data={resumeData} config={templateConfig} />;
      case '16': return <Template16 data={resumeData} config={templateConfig} />;
      default: return <div>Template Not Found</div>;
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {renderTemplate()}
    </div>
  );
}
