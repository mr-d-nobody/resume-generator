export const TEMPLATE_CATEGORIES = [
  {
    id: 'starter-photo-experience',
    label: 'Photo Internship',
    description: 'For freshers or interns who want a photo layout and have internship or work experience.',
    parserType: 'experienced',
    hasPhoto: true,
    hasExperience: true
  },
  {
    id: 'starter-photo-no-experience',
    label: 'Photo First Step',
    description: 'For freshers or interns who want a photo layout and do not have work experience yet.',
    parserType: 'fresher',
    hasPhoto: true,
    hasExperience: false
  },
  {
    id: 'starter-no-photo-no-experience',
    label: 'Campus Starter',
    description: 'For freshers or interns without a photo and without work experience.',
    parserType: 'fresher',
    hasPhoto: false,
    hasExperience: false
  },
  {
    id: 'starter-no-photo-experience',
    label: 'Internship Ready',
    description: 'For freshers or interns without a photo who have internships, projects, or early experience.',
    parserType: 'experienced',
    hasPhoto: false,
    hasExperience: true
  }
];

export const DEFAULT_TEMPLATE_CATEGORY = 'starter-no-photo-experience';

export function getTemplateCategory(categoryId) {
  return TEMPLATE_CATEGORIES.find((category) => category.id === categoryId) || TEMPLATE_CATEGORIES[0];
}
