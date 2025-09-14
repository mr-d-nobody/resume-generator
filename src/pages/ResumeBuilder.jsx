import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PersonalInfoForm from '../components/forms/PersonalInfoForm';
import ExperienceForm from '../components/forms/ExperienceForm';
import EducationForm from '../components/forms/EducationForm';
import SkillsForm from '../components/forms/SkillsForm';
import CertificationForm from '../components/forms/CertificationForm';
import AchievementForm from '../components/forms/AchievementForm';
import ResumePreview from '../components/preview/ResumePreview';
import { User, Briefcase, GraduationCap, Code, Award, Trophy, Eye, Download } from 'lucide-react';

function ResumeBuilder() {
  const [activeTab, setActiveTab] = useState('personal');

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User, component: PersonalInfoForm },
    { id: 'experience', label: 'Experience', icon: Briefcase, component: ExperienceForm },
    { id: 'education', label: 'Education', icon: GraduationCap, component: EducationForm },
    { id: 'skills', label: 'Skills', icon: Code, component: SkillsForm },
    { id: 'certifications', label: 'Certifications', icon: Award, component: CertificationForm },
    { id: 'achievements', label: 'Achievements', icon: Trophy, component: AchievementForm },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Build Your Resume
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Create a professional resume in minutes with our easy-to-use builder
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="card p-3 mb-4">
              <nav className="flex flex-wrap gap-2" aria-label="Resume sections">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors w-[calc(33%-0.5rem)] sm:w-auto ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Active Form Component */}
            <div className="transition-all duration-200">
              {ActiveComponent && <ActiveComponent />}
            </div>

            {/* Action Buttons */}
            <div className="card p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="btn-secondary flex items-center justify-center">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Resume
                </button>
                <Link to="/download" className="btn-primary flex items-center justify-center">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Link>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="lg:sticky lg:top-8">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Live Preview
                </h2>
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Auto-updating</span>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg min-h-[600px] shadow-sm overflow-auto">
                <ResumePreview />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeBuilder;