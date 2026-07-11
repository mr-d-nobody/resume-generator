import { normalizeUrl } from './resumeData.js';

export const RESUME_LIMITS = Object.freeze({
  short: 120,
  name: 80,
  email: 254,
  phone: 32,
  url: 500,
  summary: 1200,
  description: 3000,
  grade: 30,
  listItems: 100,
});

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export function isValidEmail(value) {
  const email = String(value || '').trim();
  return email.length <= RESUME_LIMITS.email && EMAIL_PATTERN.test(email);
}

export function isValidPhone(value) {
  const phone = String(value || '').trim();
  if (!phone || phone.length > RESUME_LIMITS.phone || /[a-z]/i.test(phone)) return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15 && /^[+\d\s().-]+$/.test(phone);
}

export function isValidUrl(value) {
  const url = String(value || '').trim();
  return !url || (url.length <= RESUME_LIMITS.url && Boolean(normalizeUrl(url)));
}

export function isValidMonth(value) {
  return !value || MONTH_PATTERN.test(String(value));
}

export function isValidGrade(value) {
  const grade = String(value || '').trim();
  if (!grade) return true;
  if (grade.length > RESUME_LIMITS.grade) return false;
  if (/^(?:[A-F][+-]?|first class|second class|distinction)$/i.test(grade)) return true;
  const percent = grade.match(/^(\d+(?:\.\d+)?)%$/);
  if (percent) return Number(percent[1]) <= 100;
  const ratio = grade.match(/^(\d+(?:\.\d+)?)\s*\/\s*(4|5|10|100)$/);
  if (ratio) return Number(ratio[1]) <= Number(ratio[2]);
  const numeric = grade.match(/^\d+(?:\.\d+)?$/);
  return Boolean(numeric) && Number(grade) <= 10;
}

function makeResult(errors) {
  const byPath = errors.reduce((result, error) => {
    if (!result[error.path]) result[error.path] = error.message;
    return result;
  }, {});
  return { isValid: errors.length === 0, errors, byPath };
}

function addTextError(errors, value, path, label, maxLength, { required = false, section = '' } = {}) {
  const text = String(value || '').trim();
  if (required && !text) {
    errors.push({ path, section, message: `${label} is required.` });
  } else if (text.length > maxLength) {
    errors.push({ path, section, message: `${label} must be ${maxLength} characters or fewer.` });
  }
}

function addUrlError(errors, value, path, label, section) {
  if (!isValidUrl(value)) errors.push({ path, section, message: `${label} must be a valid HTTP or HTTPS URL.` });
}

export function validateResumeData(resumeData, { requireCore = true } = {}) {
  const data = resumeData || {};
  const personal = data.personalInfo || {};
  const errors = [];

  addTextError(errors, personal.firstName, 'personalInfo.firstName', 'First name', RESUME_LIMITS.name, { required: requireCore, section: 'personal' });
  addTextError(errors, personal.lastName, 'personalInfo.lastName', 'Last name', RESUME_LIMITS.name, { required: requireCore, section: 'personal' });
  addTextError(errors, personal.title, 'personalInfo.title', 'Professional headline', RESUME_LIMITS.short, { section: 'personal' });
  addTextError(errors, personal.email, 'personalInfo.email', 'Email', RESUME_LIMITS.email, { required: requireCore, section: 'personal' });
  if (personal.email && !isValidEmail(personal.email)) errors.push({ path: 'personalInfo.email', section: 'personal', message: 'Enter a valid email address.' });
  addTextError(errors, personal.phone, 'personalInfo.phone', 'Phone', RESUME_LIMITS.phone, { required: requireCore, section: 'personal' });
  if (personal.phone && !isValidPhone(personal.phone)) errors.push({ path: 'personalInfo.phone', section: 'personal', message: 'Enter a valid phone number with 7 to 15 digits.' });
  addTextError(errors, personal.location, 'personalInfo.location', 'Location', RESUME_LIMITS.short, { section: 'personal' });
  ['linkedin', 'website', 'github'].forEach((field) => addUrlError(errors, personal[field], `personalInfo.${field}`, field === 'github' ? 'GitHub URL' : `${field[0].toUpperCase()}${field.slice(1)} URL`, 'personal'));
  addTextError(errors, personal.summary, 'personalInfo.summary', 'Professional summary', RESUME_LIMITS.summary, { section: 'summary' });
  if ((data.experience || []).length > RESUME_LIMITS.listItems) errors.push({ path: 'experience', section: 'experience', message: `Experience is limited to ${RESUME_LIMITS.listItems} entries.` });
  (data.experience || []).forEach((item, index) => {
    const base = `experience.${index}`;
    addTextError(errors, item.company, `${base}.company`, `Experience ${index + 1} company`, RESUME_LIMITS.short, { required: true, section: 'experience' });
    addTextError(errors, item.position, `${base}.position`, `Experience ${index + 1} position`, RESUME_LIMITS.short, { required: true, section: 'experience' });
    addTextError(errors, item.description, `${base}.description`, `Experience ${index + 1} description`, RESUME_LIMITS.description, { section: 'experience' });
    if (!isValidMonth(item.startDate)) errors.push({ path: `${base}.startDate`, section: 'experience', message: `Experience ${index + 1} has an invalid start date.` });
    if (!isValidMonth(item.endDate)) errors.push({ path: `${base}.endDate`, section: 'experience', message: `Experience ${index + 1} has an invalid end date.` });
    if (!item.startDate) errors.push({ path: `${base}.startDate`, section: 'experience', message: `Experience ${index + 1} start date is required.` });
    if (!item.current && item.startDate && item.endDate && item.endDate < item.startDate) errors.push({ path: `${base}.endDate`, section: 'experience', message: `Experience ${index + 1} end date cannot be before its start date.` });
  });

  (data.education || []).forEach((item, index) => {
    const base = `education.${index}`;
    addTextError(errors, item.degree, `${base}.degree`, `Education ${index + 1} degree`, RESUME_LIMITS.short, { required: true, section: 'education' });
    addTextError(errors, item.institution, `${base}.institution`, `Education ${index + 1} institution`, RESUME_LIMITS.short, { required: true, section: 'education' });
    addTextError(errors, item.description, `${base}.description`, `Education ${index + 1} description`, RESUME_LIMITS.description, { section: 'education' });
    addTextError(errors, item.location, `${base}.location`, `Education ${index + 1} location`, RESUME_LIMITS.short, { section: 'education' });
    if (!isValidMonth(item.graduationDate)) errors.push({ path: `${base}.graduationDate`, section: 'education', message: `Education ${index + 1} has an invalid graduation date.` });
    if (!isValidGrade(item.cgpa)) errors.push({ path: `${base}.cgpa`, section: 'education', message: `Education ${index + 1} grade must be a valid CGPA, percentage, or letter grade.` });
  });

  (data.skills || []).forEach((item, index) => addTextError(errors, typeof item === 'string' ? item : item?.name, `skills.${index}.name`, `Skill ${index + 1}`, RESUME_LIMITS.short, { required: true, section: 'skills' }));
  (data.projects || []).forEach((item, index) => {
    const base = `projects.${index}`;
    addTextError(errors, item.name, `${base}.name`, `Project ${index + 1} name`, RESUME_LIMITS.short, { required: true, section: 'projects' });
    addTextError(errors, item.description || (item.highlights || []).join('\n'), `${base}.description`, `Project ${index + 1} description`, RESUME_LIMITS.description, { section: 'projects' });
    (item.links || []).forEach((link, linkIndex) => {
      addTextError(errors, link.label, `${base}.links.${linkIndex}.label`, `Project ${index + 1} link label`, RESUME_LIMITS.short, { section: 'projects' });
      addUrlError(errors, link.url, `${base}.links.${linkIndex}.url`, `Project ${index + 1} link ${linkIndex + 1}`, 'projects');
    });
  });
  (data.certifications || []).forEach((item, index) => {
    const base = `certifications.${index}`;
    addTextError(errors, item.name, `${base}.name`, `Certification ${index + 1} name`, RESUME_LIMITS.short, { required: true, section: 'certifications' });
    addTextError(errors, item.issuer, `${base}.issuer`, `Certification ${index + 1} issuer`, RESUME_LIMITS.short, { section: 'certifications' });
    addTextError(errors, item.description, `${base}.description`, `Certification ${index + 1} description`, RESUME_LIMITS.description, { section: 'certifications' });
    addUrlError(errors, item.url, `${base}.url`, `Certification ${index + 1} URL`, 'certifications');
    if (!isValidMonth(item.date)) errors.push({ path: `${base}.date`, section: 'certifications', message: `Certification ${index + 1} has an invalid issue date.` });
    if (!isValidMonth(item.expirationDate)) errors.push({ path: `${base}.expirationDate`, section: 'certifications', message: `Certification ${index + 1} has an invalid expiration date.` });
    if (item.date && item.expirationDate && item.expirationDate < item.date) errors.push({ path: `${base}.expirationDate`, section: 'certifications', message: `Certification ${index + 1} expiration cannot be before its issue date.` });
  });
  (data.achievements || []).forEach((item, index) => {
    const base = `achievements.${index}`;
    addTextError(errors, item.title, `${base}.title`, `Achievement ${index + 1} title`, RESUME_LIMITS.short, { required: true, section: 'achievements' });
    addTextError(errors, item.organization, `${base}.organization`, `Achievement ${index + 1} organization`, RESUME_LIMITS.short, { section: 'achievements' });
    addTextError(errors, item.description, `${base}.description`, `Achievement ${index + 1} description`, RESUME_LIMITS.description, { section: 'achievements' });
    if (!isValidMonth(item.date)) errors.push({ path: `${base}.date`, section: 'achievements', message: `Achievement ${index + 1} has an invalid date.` });
  });
  (data.customSections || []).forEach((item, index) => {
    addTextError(errors, item.title, `customSections.${index}.title`, `Custom section ${index + 1} heading`, RESUME_LIMITS.short, { required: true, section: 'custom' });
    addTextError(errors, item.description, `customSections.${index}.description`, `Custom section ${index + 1} description`, RESUME_LIMITS.description, { section: 'custom' });
    (item.entries || []).forEach((entry, entryIndex) => {
      addTextError(errors, entry.title, `customSections.${index}.entries.${entryIndex}.title`, `Custom entry ${entryIndex + 1} title`, RESUME_LIMITS.short, { section: 'custom' });
      addTextError(errors, entry.description, `customSections.${index}.entries.${entryIndex}.description`, `Custom entry ${entryIndex + 1} description`, RESUME_LIMITS.description, { section: 'custom' });
      addUrlError(errors, entry.url, `customSections.${index}.entries.${entryIndex}.url`, `Custom entry ${entryIndex + 1} URL`, 'custom');
    });
  });

  return makeResult(errors);
}

export function validateResumeSection(resumeData, section) {
  const result = validateResumeData(resumeData);
  return makeResult(result.errors.filter((error) => error.section === section));
}

export function calculateValidatedResumeScore(resumeData) {
  const data = resumeData || {};
  const personal = data.personalInfo || {};
  const checks = [
    Boolean(String(personal.firstName || '').trim()) && String(personal.firstName).trim().length <= RESUME_LIMITS.name,
    Boolean(String(personal.lastName || '').trim()) && String(personal.lastName).trim().length <= RESUME_LIMITS.name,
    isValidEmail(personal.email),
    isValidPhone(personal.phone),
    Boolean(String(personal.title || '').trim()) && String(personal.title).trim().length <= RESUME_LIMITS.short,
    Boolean(String(personal.summary || '').trim()) && String(personal.summary).trim().length <= RESUME_LIMITS.summary,
    (data.education || []).length > 0 && !validateResumeSection(data, 'education').errors.length,
    (data.skills || []).length > 0 && !validateResumeSection(data, 'skills').errors.length,
    (data.projects || []).length > 0 && !validateResumeSection(data, 'projects').errors.length,
    ((data.experience || []).length > 0 && !validateResumeSection(data, 'experience').errors.length)
      || ((data.certifications || []).length > 0 && !validateResumeSection(data, 'certifications').errors.length),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}
