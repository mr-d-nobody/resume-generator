import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeResumeData, transformResumeData } from './resumeData.js';

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
