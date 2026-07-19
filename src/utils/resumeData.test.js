import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeResumeData, normalizeResumeLinks, transformResumeData } from './resumeData.js';

test('removes legacy profile photos from normalized and rendered resume data', () => {
  const legacyResume = {
    personalInfo: {
      firstName: 'Ada',
      photo: 'data:image/png;base64,legacy-photo',
    },
  };

  assert.equal('photo' in normalizeResumeData(legacyResume).personalInfo, false);
  assert.equal('photo' in transformResumeData(legacyResume).personal, false);
});

test('preserves the selected display mode for resume contact links', () => {
  const links = normalizeResumeLinks({
    linkedin: 'linkedin.com/in/ada',
    github: 'github.com/ada',
    linkDisplay: { linkedin: 'url' },
  });

  assert.equal(links.find((link) => link.label === 'LinkedIn').displayMode, 'url');
  assert.equal(links.find((link) => link.label === 'GitHub').displayMode, 'label');
});

test('preserves the selected education score label and defaults legacy entries to GPA', () => {
  const rendered = transformResumeData({
    education: [
      { degree: 'BSc', institution: 'Example University', cgpa: '8.5/10', gradeLabel: 'CGPA' },
      { degree: 'HSC', institution: 'Example School', cgpa: '85%' },
      { degree: 'SSC', institution: 'Example School', cgpa: 'A', gradeLabel: 'percentage' },
    ],
  });

  assert.equal(rendered.education[0].gradeLabel, 'CGPA');
  assert.equal(rendered.education[1].gradeLabel, 'GPA');
  assert.equal(rendered.education[2].gradeLabel, 'Percentage');
});

test('keeps project descriptions and genuine highlights independent', () => {
  const rendered = transformResumeData({
    projects: [{
      name: 'Sustainability Advisor',
      description: 'Tracks sustainability metrics and API usage.',
      highlights: ['React', 'Django', 'PostgreSQL', 'JWT', 'OpenAI API'],
    }],
  });

  assert.equal(rendered.projects[0].description, 'Tracks sustainability metrics and API usage.');
  assert.deepEqual(rendered.projects[0].highlights, ['React', 'Django', 'PostgreSQL', 'JWT', 'OpenAI API']);
});

test('removes highlights generated from the same legacy project description', () => {
  const rendered = transformResumeData({
    projects: [
      { name: 'Single line', description: 'Built a visualizer.', highlights: ['Built a visualizer.'] },
      { name: 'Multiple lines', description: 'React\nDjango', highlights: ['React', 'Django'] },
    ],
  });

  assert.deepEqual(rendered.projects[0].highlights, []);
  assert.deepEqual(rendered.projects[1].highlights, []);
});
