import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateValidatedResumeScore,
  isValidEmail,
  isValidGrade,
  isValidPhone,
  validateResumeData,
} from './resumeValidation.js';

const validResume = () => ({
  personalInfo: {
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
    phone: '+44 20 7946 0958',
    title: 'Software Engineer',
    summary: 'Builds reliable software.',
  },
  experience: [], education: [], skills: [], projects: [], certifications: [], achievements: [], customSections: [],
});

test('validates contact and grade formats', () => {
  assert.equal(isValidEmail('not-an-email'), false);
  assert.equal(isValidEmail('ada@example.com'), true);
  assert.equal(isValidPhone('phone letters'), false);
  assert.equal(isValidPhone('+1 (555) 123-4567'), true);
  assert.equal(isValidGrade('12/10'), false);
  assert.equal(isValidGrade('8.5/10'), true);
  assert.equal(isValidGrade('83', 'Percentage'), true);
  assert.equal(isValidGrade('101', 'Percentage'), false);
  assert.equal(isValidGrade('83', 'CGPA'), false);
});

test('validates an education score using its selected display type', () => {
  const data = validResume();
  data.education = [{ degree: 'Class XII', institution: 'Example School', cgpa: '83', gradeLabel: 'Percentage' }];
  assert.equal(validateResumeData(data).isValid, true);
});

test('rejects missing core fields, reversed dates, and bad URLs', () => {
  const data = validResume();
  data.personalInfo.firstName = '';
  data.personalInfo.website = 'javascript:alert(1)';
  data.experience = [{ company: 'Example', position: 'Engineer', startDate: '2025-01', endDate: '2024-01' }];
  const result = validateResumeData(data);
  assert.equal(result.isValid, false);
  assert.ok(result.byPath['personalInfo.firstName']);
  assert.ok(result.byPath['personalInfo.website']);
  assert.ok(result.byPath['experience.0.endDate']);
});

test('invalid contact information does not increase score', () => {
  const data = validResume();
  const validScore = calculateValidatedResumeScore(data);
  data.personalInfo.email = 'invalid';
  data.personalInfo.phone = 'invalid';
  assert.ok(calculateValidatedResumeScore(data) < validScore);
});

test('rejects reversed certification dates and unsafe nested links', () => {
  const data = validResume();
  data.certifications = [{ name: 'Cloud', date: '2025-01', expirationDate: '2024-01', url: 'javascript:bad' }];
  data.customSections = [{ title: 'Profiles', entries: [{ title: 'Profile', url: 'data:text/html,bad' }] }];
  const result = validateResumeData(data);
  assert.ok(result.byPath['certifications.0.expirationDate']);
  assert.ok(result.byPath['certifications.0.url']);
  assert.ok(result.byPath['customSections.0.entries.0.url']);
});

test('validates project highlights independently from the description', () => {
  const data = validResume();
  data.projects = [{ name: 'Portfolio', description: 'A valid overview.', highlights: ['x'.repeat(3001)] }];
  const result = validateResumeData(data);
  assert.ok(result.byPath['projects.0.highlights']);
});
