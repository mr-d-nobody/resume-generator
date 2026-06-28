import React, { useState } from 'react';
import { useResume } from '../../contexts/ResumeContext';
import { GraduationCap, Plus, Trash2, Calendar } from 'lucide-react';

function EducationForm() {
  const { resumeData, addEducation, deleteEducation } = useResume();
  const { education } = resumeData;

  const [showAddForm, setShowAddForm] = useState(false);
  const [newEducation, setNewEducation] = useState({
    degree: '',
    institution: '',
    location: '',
    graduationDate: '',
    cgpa: '',
    description: ''
  });

  const handleAddEducation = () => {
    if (!newEducation.degree || !newEducation.institution) return;
    addEducation({ ...newEducation, id: Date.now() });
    setNewEducation({
      degree: '',
      institution: '',
      location: '',
      graduationDate: '',
      cgpa: '',
      description: ''
    });
    setShowAddForm(false);
  };

  const handleChangeNew = (field, value) => {
    setNewEducation(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="card p-5 sm:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
          <GraduationCap className="h-5 w-5 mr-2" /> Education
        </h2>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center justify-center"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Education
          </button>
        )}
      </div>

      {/* Existing Education */}
      {education.map((edu, index) => (
        <div key={edu.id || index} className="border border-gray-200 p-4 rounded-lg mb-4 bg-gray-50 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold">{edu.degree}</p>
              <p className="text-gray-600 dark:text-gray-300">{edu.institution}</p>
            </div>
            <button
              onClick={() => deleteEducation(index)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}

      {/* Add New Education Form */}
      {showAddForm && (
        <div className="border border-gray-200 p-4 rounded-lg mb-4 bg-gray-50 space-y-2 dark:border-gray-700 dark:bg-gray-800">
          <input
            type="text"
            value={newEducation.degree}
            onChange={(e) => handleChangeNew('degree', e.target.value)}
            placeholder="Degree *"
            className="form-input w-full"
          />
          <input
            type="text"
            value={newEducation.institution}
            onChange={(e) => handleChangeNew('institution', e.target.value)}
            placeholder="Institution *"
            className="form-input w-full"
          />
          <input
            type="text"
            value={newEducation.location}
            onChange={(e) => handleChangeNew('location', e.target.value)}
            placeholder="Location"
            className="form-input w-full"
          />
          <input
            type="month"
            value={newEducation.graduationDate}
            onChange={(e) => handleChangeNew('graduationDate', e.target.value)}
            className="form-input w-full"
          />
          <input
            type="text"
            value={newEducation.cgpa}
            onChange={(e) => handleChangeNew('cgpa', e.target.value)}
            placeholder="CGPA"
            className="form-input w-full"
          />
          <textarea
            value={newEducation.description}
            onChange={(e) => handleChangeNew('description', e.target.value)}
            placeholder="Additional details"
            className="form-input w-full h-24"
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              onClick={() => setShowAddForm(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleAddEducation}
              className="btn-primary"
            >
              Add Education
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EducationForm;
