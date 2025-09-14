import React from 'react';
import { useResume } from '../../contexts/ResumeContext';
import { MapPin, Phone, Mail, Globe, Linkedin, Calendar, Star } from 'lucide-react';

/**
 * Resume preview component
 * Displays a live preview of the resume based on current data
 */
function ResumePreview() {
  const { resumeData } = useResume();
  const { personalInfo, experience, education, skills } = resumeData;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString + '-01');
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  const getProficiencyStars = (level) => {
    const levels = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3, 'Expert': 4 };
    return levels[level] || 2;
  };

  const groupedSkills = skills.reduce((acc, skill) => {
    const category = skill.category || 'Technical';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {});

  const hasContent = personalInfo.firstName || personalInfo.lastName || experience.length > 0 || education.length > 0 || skills.length > 0;

  if (!hasContent) {
    return (
      <div className="text-center text-gray-500 mt-20">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
          <span className="text-2xl">ðŸ“„</span>
        </div>
        <p className="text-lg font-medium mb-2">Resume Preview</p>
        <p className="text-sm">
          Fill out the form sections to see your resume come to life
        </p>
      </div>
    );
  }

  return (
    <div className="resume-template p-8 max-w-[8.5in] mx-auto bg-white text-gray-900 shadow-lg dark:bg-white dark:text-gray-900">
      {/* Header Section */}
      <div className="border-b-2 border-blue-600 pb-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {personalInfo.firstName} {personalInfo.lastName}
            </h1>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
              {personalInfo.email && (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  {personalInfo.email}
                </div>
              )}
              {personalInfo.phone && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  {personalInfo.phone}
                </div>
              )}
              {personalInfo.location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {personalInfo.location}
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-blue-600">
              {personalInfo.linkedin && (
                <div className="flex items-center">
                  <Linkedin className="h-4 w-4 mr-1" />
                  {personalInfo.linkedin}
                </div>
              )}
              {personalInfo.website && (
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-1" />
                  {personalInfo.website}
                </div>
              )}
            </div>
          </div>
          
          {personalInfo.photo && (
            <div className="ml-6">
              <img
                src={personalInfo.photo}
                alt="Profile"
                className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200"
              />
            </div>
          )}
        </div>
        
        {personalInfo.summary && (
          <div className="mt-4">
            <p className="text-gray-700 leading-relaxed">
              {personalInfo.summary}
            </p>
          </div>
        )}
      </div>

      {/* Experience Section */}
      {experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-1">
            Professional Experience
          </h2>
          <div className="space-y-4">
            {experience.map((exp, index) => (
              <div key={index} className="">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{exp.position}</h3>
                    <p className="text-blue-600 font-medium">{exp.company}</p>
                    {exp.location && (
                      <p className="text-sm text-gray-600">{exp.location}</p>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </div>
                </div>
                {exp.description && (
                  <div className="text-gray-700 text-sm leading-relaxed">
                    {exp.description.split('\n').map((line, i) => (
                      <p key={i} className="mb-1">{line}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education Section */}
      {education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-1">
            Education
          </h2>
          <div className="space-y-3">
            {education.map((edu, index) => (
              <div key={index} className="">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{edu.degree}</h3>
                    <p className="text-blue-600 font-medium">{edu.institution}</p>
                    {edu.location && (
                      <p className="text-sm text-gray-600">{edu.location}</p>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center">
                    {edu.graduationDate && (
                      <>
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(edu.graduationDate)}
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  {edu.cgpa && <span>CGPA: {edu.cgpa}</span>}
                </div>
                {edu.description && (
                  <p className="text-gray-700 text-sm mt-1">{edu.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills Section */}
      {skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-1">
            Skills
          </h2>
          <div className="space-y-4">
            {Object.entries(groupedSkills).map(([category, categorySkills]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  {category}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {categorySkills.map((skill, index) => {
                    const stars = getProficiencyStars(skill.level);
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{skill.name}</span>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4].map(star => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= stars
                                  ? 'text-blue-500 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ResumePreview;