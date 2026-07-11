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
