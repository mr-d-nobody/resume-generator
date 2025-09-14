import React, { useState } from 'react';
import { useResume } from '../../contexts/ResumeContext';
import { Plus, Trash2 } from 'lucide-react';

function ExperienceForm() {
  const { resumeData, addExperience, deleteExperience } = useResume();
  const [newExperience, setNewExperience] = useState({
    company: '',
    position: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewExperience(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddExperience = () => {
    if (!newExperience.company || !newExperience.position || !newExperience.startDate) {
      alert('Please fill in company, position, and start date');
      return;
    }

    // Use the addExperience action from context
    addExperience(newExperience);

    // Reset form
    setNewExperience({
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    });
  };

  const handleRemoveExperience = (index) => {
    // Use the deleteExperience action from context
    deleteExperience(index);
  };

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Professional Experience
      </h2>

      {/* Existing Experience Items */}
      {resumeData.experience.length > 0 && (
        <div className="mb-6 space-y-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Added Experience
          </h3>
          {resumeData.experience.map((exp, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md relative pr-10">
              <button
                onClick={() => handleRemoveExperience(index)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                aria-label="Remove experience"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <div className="font-medium text-gray-900 dark:text-white">{exp.position}</div>
              <div className="text-blue-600 dark:text-blue-400">{exp.company}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Experience Form */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Company *
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={newExperience.company}
              onChange={handleChange}
              className="form-input"
              placeholder="Company name"
            />
          </div>

          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Position *
            </label>
            <input
              type="text"
              id="position"
              name="position"
              value={newExperience.position}
              onChange={handleChange}
              className="form-input"
              placeholder="Job title"
            />
          </div>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={newExperience.location}
            onChange={handleChange}
            className="form-input"
            placeholder="City, Country"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date *
            </label>
            <input
              type="month"
              id="startDate"
              name="startDate"
              value={newExperience.startDate}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date
            </label>
            <input
              type="month"
              id="endDate"
              name="endDate"
              value={newExperience.endDate}
              onChange={handleChange}
              disabled={newExperience.current}
              className="form-input"
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="current"
            name="current"
            checked={newExperience.current}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="current" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            I currently work here
          </label>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows="4"
            value={newExperience.description}
            onChange={handleChange}
            className="form-input"
            placeholder="Describe your responsibilities and achievements"
          ></textarea>
        </div>

        <button
          type="button"
          onClick={handleAddExperience}
          className="btn-secondary w-full flex items-center justify-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Experience
        </button>
      </div>
    </div>
  );
}

export default ExperienceForm;