import { useResume } from '../../contexts/ResumeContext';
import { User, Mail, Phone, MapPin, Linkedin, Globe, BriefcaseBusiness } from 'lucide-react';
import { RESUME_LIMITS } from '../../utils/resumeValidation';

function FieldError({ id, message }) {
  if (!message) return null;
  return <p id={id} className="mt-1 text-sm text-red-600" role="alert">{message}</p>;
}

function PersonalInfoForm({ validationErrors = {} }) {
  const { resumeData, updatePersonalInfo } = useResume();
  const { personalInfo } = resumeData;
  const update = (field, value) => updatePersonalInfo({ [field]: value });

  const errorProps = (path, id) => ({
    'aria-invalid': Boolean(validationErrors[path]),
    'aria-describedby': validationErrors[path] ? `${id}-error` : undefined,
  });

  return (
    <div className="card p-5 sm:p-6">
      <h2 className="mb-6 flex items-center text-xl font-semibold text-gray-900 dark:text-white">
        <User className="mr-2 h-5 w-5" /> Personal Information
      </h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="resume-first-name" className="form-label">First Name *</label>
          <input id="resume-first-name" type="text" value={personalInfo.firstName} onChange={(event) => update('firstName', event.target.value)} className="form-input" placeholder="John" required maxLength={RESUME_LIMITS.name} {...errorProps('personalInfo.firstName', 'resume-first-name')} />
          <FieldError id="resume-first-name-error" message={validationErrors['personalInfo.firstName']} />
        </div>
        <div>
          <label htmlFor="resume-last-name" className="form-label">Last Name *</label>
          <input id="resume-last-name" type="text" value={personalInfo.lastName} onChange={(event) => update('lastName', event.target.value)} className="form-input" placeholder="Doe" required maxLength={RESUME_LIMITS.name} {...errorProps('personalInfo.lastName', 'resume-last-name')} />
          <FieldError id="resume-last-name-error" message={validationErrors['personalInfo.lastName']} />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="resume-headline" className="form-label"><BriefcaseBusiness className="mr-1 inline h-4 w-4" /> Professional Headline</label>
          <input id="resume-headline" type="text" value={personalInfo.title || ''} onChange={(event) => update('title', event.target.value)} className="form-input" placeholder="Full-Stack Developer • AI/ML • Backend Developer" />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Optional. Add one role or combine specialties using separators such as • or |.</p>
        </div>

        <div>
          <label htmlFor="resume-email" className="form-label"><Mail className="mr-1 inline h-4 w-4" /> Email *</label>
          <input id="resume-email" type="email" value={personalInfo.email} onChange={(event) => update('email', event.target.value)} className="form-input" placeholder="john.doe@example.com" required maxLength={RESUME_LIMITS.email} {...errorProps('personalInfo.email', 'resume-email')} />
          <FieldError id="resume-email-error" message={validationErrors['personalInfo.email']} />
        </div>
        <div>
          <label htmlFor="resume-phone" className="form-label"><Phone className="mr-1 inline h-4 w-4" /> Phone *</label>
          <input id="resume-phone" type="tel" value={personalInfo.phone} onChange={(event) => update('phone', event.target.value)} className="form-input" placeholder="+1 (555) 123-4567" required maxLength={RESUME_LIMITS.phone} {...errorProps('personalInfo.phone', 'resume-phone')} />
          <FieldError id="resume-phone-error" message={validationErrors['personalInfo.phone']} />
        </div>
        <div>
          <label htmlFor="resume-location" className="form-label"><MapPin className="mr-1 inline h-4 w-4" /> Location</label>
          <input id="resume-location" type="text" value={personalInfo.location} onChange={(event) => update('location', event.target.value)} className="form-input" placeholder="New York, NY" maxLength={RESUME_LIMITS.short} />
        </div>
        <div>
          <label htmlFor="resume-linkedin" className="form-label"><Linkedin className="mr-1 inline h-4 w-4" /> LinkedIn</label>
          <input id="resume-linkedin" type="url" value={personalInfo.linkedin} onChange={(event) => update('linkedin', event.target.value)} className="form-input" placeholder="https://linkedin.com/in/johndoe" maxLength={RESUME_LIMITS.url} {...errorProps('personalInfo.linkedin', 'resume-linkedin')} />
          <FieldError id="resume-linkedin-error" message={validationErrors['personalInfo.linkedin']} />
        </div>
        <div>
          <label htmlFor="resume-website" className="form-label"><Globe className="mr-1 inline h-4 w-4" /> Website</label>
          <input id="resume-website" type="url" value={personalInfo.website} onChange={(event) => update('website', event.target.value)} className="form-input" placeholder="https://johndoe.com" maxLength={RESUME_LIMITS.url} {...errorProps('personalInfo.website', 'resume-website')} />
          <FieldError id="resume-website-error" message={validationErrors['personalInfo.website']} />
        </div>
        <div>
          <label htmlFor="resume-github" className="form-label"><Globe className="mr-1 inline h-4 w-4" /> GitHub URL</label>
          <input id="resume-github" type="url" value={personalInfo.github || ''} onChange={(event) => update('github', event.target.value)} className="form-input" placeholder="https://github.com/johndoe" maxLength={RESUME_LIMITS.url} {...errorProps('personalInfo.github', 'resume-github')} />
          <FieldError id="resume-github-error" message={validationErrors['personalInfo.github']} />
        </div>
      </div>
    </div>
  );
}

export default PersonalInfoForm;
