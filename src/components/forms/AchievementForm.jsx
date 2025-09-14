import React, { useState } from 'react';
import { useResume } from '../../contexts/ResumeContext';
import { Plus, Trash2 } from 'lucide-react';

function AchievementForm() {
  const { resumeData, addAchievement, deleteAchievement } = useResume();
  const [newAchievement, setNewAchievement] = useState({
    title: '',
    date: '',
    organization: '',
    description: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewAchievement(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddAchievement = () => {
    if (!newAchievement.title) {
      alert('Please fill in achievement title');
      return;
    }

    // Use the addAchievement action from context
    addAchievement(newAchievement);

    // Reset form
    setNewAchievement({
      title: '',
      date: '',
      organization: '',
      description: ''
    });
  };

  const handleRemoveAchievement = (index) => {
    // Use the deleteAchievement action from context
    deleteAchievement(index);
  };

  return (
    <div className="card p-6 bg-white dark:bg-gray-900 shadow-sm rounded-lg">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
        <span className="mr-2">Achievements</span>
      </h2>

      {/* Existing Achievement Items */}
      {resumeData.achievements.length > 0 && (
        <div className="mb-6 space-y-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Added Achievements
          </h3>
          {resumeData.achievements.map((achievement, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md relative pr-10">
              <button
                onClick={() => handleRemoveAchievement(index)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                aria-label="Remove achievement"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <div className="font-medium text-gray-900 dark:text-white">{achievement.title}</div>
              {achievement.organization && (
                <div className="text-blue-600 dark:text-blue-400">{achievement.organization}</div>
              )}
              {achievement.date && (
                <div className="text-sm text-gray-500 dark:text-gray-400">{achievement.date}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add New Achievement Form */}
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Achievement Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={newAchievement.title}
            onChange={handleChange}
            className="form-input"
            placeholder="e.g. Employee of the Year"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="organization" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Organization/Issuer
            </label>
            <input
              type="text"
              id="organization"
              name="organization"
              value={newAchievement.organization}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g. ABC Company"
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date
            </label>
            <input
              type="month"
              id="date"
              name="date"
              value={newAchievement.date}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows="3"
            value={newAchievement.description}
            onChange={handleChange}
            className="form-input"
            placeholder="Describe your achievement and its significance"
          ></textarea>
        </div>

        <div className="mt-4">
          <button
            onClick={handleAddAchievement}
            className="btn-primary flex items-center justify-center w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Achievement
          </button>
        </div>
      </div>
    </div>
  );
}

export default AchievementForm;