import React, { useState } from 'react';
import { useResume } from '../../contexts/ResumeContext';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Plus, Trash2 } from 'lucide-react';

function SkillsForm() {
  const { resumeData, updateSkills } = useResume(); // better to have a separate updateSkills action
  const [newSkill, setNewSkill] = useState({
    name: '',
    level: 'Intermediate',
    category: 'Technical'
  });
  const [error, setError] = useState('');

  const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  const skillCategories = ['Technical', 'Soft Skills', 'Languages', 'Tools', 'Other'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewSkill(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'name') setError('');
  };

  const handleAddSkill = () => {
    if (!newSkill.name.trim()) {
      setError('Skill name is required.');
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

  const moveSkill = (category, skillIndex, direction) => {
    const categoryIndexes = resumeData.skills
      .map((skill, index) => ({ skill, index }))
      .filter(({ skill }) => (skill.category || 'Technical') === category)
      .map(({ index }) => index);
    const targetIndex = skillIndex + direction;
    if (targetIndex < 0 || targetIndex >= categoryIndexes.length) return;
    const updatedSkills = [...resumeData.skills];
    const from = categoryIndexes[skillIndex];
    const to = categoryIndexes[targetIndex];
    [updatedSkills[from], updatedSkills[to]] = [updatedSkills[to], updatedSkills[from]];
    updateSkills(updatedSkills);
  };

  const moveCategory = (categoryIndex, direction) => {
    const categories = Object.keys(groupedSkills);
    const targetIndex = categoryIndex + direction;
    if (targetIndex < 0 || targetIndex >= categories.length) return;
    [categories[categoryIndex], categories[targetIndex]] = [categories[targetIndex], categories[categoryIndex]];
    updateSkills(categories.flatMap((category) => groupedSkills[category]));
  };

  // Group skills by category
  const groupedSkills = resumeData.skills.reduce((acc, skill) => {
    const category = skill.category || 'Technical';
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {});

  return (
    <div className="card p-5 sm:p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
        Skills
      </h2>

      {/* Existing Skills */}
      {resumeData.skills.length > 0 && (
        <div className="mb-6">
          {Object.entries(groupedSkills).map(([category, skills], categoryIndex, categories) => (
            <div key={category} className="mb-4">
              <div className="mb-2 flex items-center gap-1">
                <h4 className="mr-1 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{category}</h4>
                <button type="button" onClick={() => moveCategory(categoryIndex, -1)} disabled={categoryIndex === 0} className="rounded p-1 text-gray-500 hover:bg-gray-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-gray-700" aria-label={`Move ${category} category up`}><ArrowUp className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => moveCategory(categoryIndex, 1)} disabled={categoryIndex === categories.length - 1} className="rounded p-1 text-gray-500 hover:bg-gray-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-gray-700" aria-label={`Move ${category} category down`}><ArrowDown className="h-3.5 w-3.5" /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, skillIndex) => (
                  <div
                    key={skill.id}
                    className="flex max-w-full items-center rounded-full bg-gray-100 px-3 py-1 dark:bg-gray-800"
                  >
                    <span className="min-w-0 break-words text-sm text-gray-800 mr-1 dark:text-gray-200">{skill.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">({skill.level})</span>
                    <button type="button" onClick={() => moveSkill(category, skillIndex, -1)} disabled={skillIndex === 0} className="ml-1 text-gray-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-30" aria-label={`Move ${skill.name} left`}><ArrowLeft className="h-3 w-3" /></button>
                    <button type="button" onClick={() => moveSkill(category, skillIndex, 1)} disabled={skillIndex === skills.length - 1} className="ml-1 text-gray-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-30" aria-label={`Move ${skill.name} right`}><ArrowRight className="h-3 w-3" /></button>
                    <button
                      type="button"
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
          <label htmlFor="skill-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Skill Name *
          </label>
          <input
            type="text"
            id="skill-name"
            name="name"
            value={newSkill.name}
            onChange={handleChange}
            className="form-input"
            placeholder="e.g. JavaScript, Project Management"
            maxLength="120"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'skill-name-error' : undefined}
          />
          {error && <p id="skill-name-error" className="mt-1 text-sm text-red-600" role="alert">{error}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="skill-level" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Proficiency Level
            </label>
            <select
              id="skill-level"
              name="level"
              value={newSkill.level}
              onChange={handleChange}
              className="form-select"
            >
              {skillLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="skill-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              id="skill-category"
              name="category"
              value={newSkill.category}
              onChange={handleChange}
              className="form-select"
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
