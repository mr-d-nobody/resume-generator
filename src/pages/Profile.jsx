import React from 'react';
import { useResume } from '../contexts/ResumeContext';
import { useNavigate } from 'react-router-dom';
import { User, Trash2, Edit3, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui';

function Profile() {
  const { resumeData, resetResume } = useResume();
  const navigate = useNavigate();

  const hasData = resumeData?.personalInfo?.firstName || resumeData?.experience?.length > 0;

  const handleClearProfile = () => {
    if (window.confirm('Are you sure you want to clear your saved profile? This will erase all your extracted resume data.')) {
      resetResume();
      localStorage.removeItem('savedResume');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <User className="mr-3 w-8 h-8 text-blue-600" />
              Your Profile Data
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              This data is securely saved in your browser's local storage.
            </p>
          </div>
          
          {hasData && (
            <div className="mt-4 md:mt-0 flex gap-4">
              <Button onClick={() => navigate('/builder')} className="flex items-center gap-2">
                <Edit3 size={18} />
                Builder
              </Button>
              <Button variant="danger" onClick={handleClearProfile} className="flex items-center gap-2 bg-red-100 text-red-600 hover:bg-red-200 border-transparent">
                <Trash2 size={18} />
                Clear Data
              </Button>
            </div>
          )}
        </div>

        {!hasData ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center border border-gray-200 dark:border-gray-700">
            <AlertCircle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No Profile Data Found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              You haven't uploaded or built a resume yet. Let's get started!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/magic')} className="px-8">
                Upload Resume ✨
              </Button>
              <Button variant="secondary" onClick={() => navigate('/builder')} className="px-8 flex items-center justify-center gap-2">
                <Edit3 size={18} />
                Builder
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Quick Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200 dark:divide-gray-700 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="p-6 text-center">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Experience</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{resumeData.experience?.length || 0}</p>
              </div>
              <div className="p-6 text-center">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Education</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{resumeData.education?.length || 0}</p>
              </div>
              <div className="p-6 text-center">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Projects</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{resumeData.projects?.length || 0}</p>
              </div>
              <div className="p-6 text-center">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Skills</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{resumeData.skills?.length || 0}</p>
              </div>
            </div>

            {/* Raw Data Preview */}
            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Raw JSON Payload</h3>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle2 size={14} />
                  Saved Locally
                </span>
              </div>
              <div className="bg-gray-900 rounded-lg p-6 overflow-auto max-h-[600px] custom-scrollbar">
                <pre className="text-green-400 font-mono text-sm">
                  {JSON.stringify(resumeData, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Profile;
