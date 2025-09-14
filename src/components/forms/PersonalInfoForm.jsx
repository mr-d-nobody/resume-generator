import React from 'react';
import { useResume } from '../../contexts/ResumeContext';
import { User, Mail, Phone, MapPin, Linkedin, Globe, Camera } from 'lucide-react';

/**
 * Personal information form component
 * Handles basic contact details and optional photo upload
 */
function PersonalInfoForm() {
  const { resumeData, updatePersonalInfo } = useResume();
  const { personalInfo } = resumeData;

  const handleInputChange = (field, value) => {
    updatePersonalInfo({ [field]: value });
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updatePersonalInfo({ photo: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
        <User className="h-5 w-5 mr-2" />
        Personal Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Photo Upload */}
        <div className="md:col-span-2">
          <label className="form-label">
            <Camera className="h-4 w-4 inline mr-1" />
            Profile Photo (Optional)
          </label>
          <div className="flex items-center space-x-4">
            {personalInfo.photo && (
              <img
                src={personalInfo.photo}
                alt="Profile"
                className="h-20 w-20 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="form-input"
            />
          </div>
        </div>

        {/* First Name */}
        <div>
          <label className="form-label">First Name *</label>
          <input
            type="text"
            value={personalInfo.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className="form-input"
            placeholder="John"
            required
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="form-label">Last Name *</label>
          <input
            type="text"
            value={personalInfo.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className="form-input"
            placeholder="Doe"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="form-label">
            <Mail className="h-4 w-4 inline mr-1" />
            Email *
          </label>
          <input
            type="email"
            value={personalInfo.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="form-input"
            placeholder="john.doe@example.com"
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label className="form-label">
            <Phone className="h-4 w-4 inline mr-1" />
            Phone *
          </label>
          <input
            type="tel"
            value={personalInfo.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="form-input"
            placeholder="+1 (555) 123-4567"
            required
          />
        </div>

        {/* Location */}
        <div>
          <label className="form-label">
            <MapPin className="h-4 w-4 inline mr-1" />
            Location
          </label>
          <input
            type="text"
            value={personalInfo.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="form-input"
            placeholder="New York, NY"
          />
        </div>

        {/* LinkedIn */}
        <div>
          <label className="form-label">
            <Linkedin className="h-4 w-4 inline mr-1" />
            LinkedIn
          </label>
          <input
            type="url"
            value={personalInfo.linkedin}
            onChange={(e) => handleInputChange('linkedin', e.target.value)}
            className="form-input"
            placeholder="https://linkedin.com/in/johndoe"
          />
        </div>

        {/* Website */}
        <div>
          <label className="form-label">
            <Globe className="h-4 w-4 inline mr-1" />
            Website
          </label>
          <input
            type="url"
            value={personalInfo.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            className="form-input"
            placeholder="https://johndoe.com"
          />
        </div>

        {/* Summary */}
        <div className="md:col-span-2">
          <label className="form-label">Professional Summary</label>
          <textarea
            value={personalInfo.summary}
            onChange={(e) => handleInputChange('summary', e.target.value)}
            className="form-input h-32 resize-none"
            placeholder="Write a brief professional summary highlighting your key skills and experience..."
          />
        </div>
      </div>
    </div>
  );
}

export default PersonalInfoForm;