import React, { useState } from 'react';
import { useResume } from '../../contexts/ResumeContext';
import { Plus, Trash2 } from 'lucide-react';

function SkillsForm() {
  const { resumeData, updateSkills } = useResume(); // better to have a separate updateSkills action
  const [newSkill, setNewSkill] = useState({
    name: '',
    level: 'Intermediate',
    category: 'Technical'
  });

  const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  const skillCategories = ['Technical', 'Soft Skills', 'Languages', 'Tools', 'Other'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewSkill(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSkill = () => {
    if (!newSkill.name.trim()) {
      alert('Please enter a skill name');
      return;
    }

    const updatedSkills = [...resumeData.skills, { ...newSkill, id: Date.now() }];
    updateSkills(updatedSkills); // call the context function
    setNewSkill({ name: '', level: 'Intermediate', category: 'Technical' });
  };

  const handleRemoveSkill = (id) => {
    const updatedSkills = resumeData.skills.filter(skill => skill.id !== id);
    updateSkills(updatedSkills);
  };

  // Group skills by category
  const groupedSkills = resumeData.skills.reduce((acc, skill) => {
    const category = skill.category || 'Technical';
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {});

  return (
    <div className="card p-6 bg-gray-900 text-white">
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        Skills
      </h2>

      {/* Existing Skills */}
      {resumeData.skills.length > 0 && (
        <div className="mb-6">
          {Object.entries(groupedSkills).map(([category, skills]) => (
            <div key={category} className="mb-4">
              <h4 className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-2">
                {category}
              </h4>
              <div className="flex flex-wrap gap-2">
                {skills.map(skill => (
                  <div
                    key={skill.id}
                    className="bg-gray-800 px-3 py-1 rounded-full flex items-center"
                  >
                    <span className="text-sm text-gray-200 mr-1">{skill.name}</span>
                    <span className="text-xs text-gray-400">({skill.level})</span>
                    <button
                      onClick={() => handleRemoveSkill(skill.id)}
                      className="ml-2 text-gray-500 hover:text-red-400"
                      aria-label="Remove skill"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Skill */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Skill Name *
          </label>
          <input
            type="text"
            name="name"
            value={newSkill.name}
            onChange={handleChange}
            className="form-input bg-gray-700 text-white border-gray-600"
            placeholder="e.g. JavaScript, Project Management"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Proficiency Level
            </label>
            <select
              name="level"
              value={newSkill.level}
              onChange={handleChange}
              className="form-select bg-gray-700 text-white border-gray-600"
            >
              {skillLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Category
            </label>
            <select
              name="category"
              value={newSkill.category}
              onChange={handleChange}
              className="form-select bg-gray-700 text-white border-gray-600"
            >
              {skillCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddSkill}
          className="btn-primary w-full flex items-center justify-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Skill
        </button>
      </div>
    </div>
  );
}

export default SkillsForm;
