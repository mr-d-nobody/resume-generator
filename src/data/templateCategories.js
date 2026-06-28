export const TEMPLATE_CATEGORIES = [
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
