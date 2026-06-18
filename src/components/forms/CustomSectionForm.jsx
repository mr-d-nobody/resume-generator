import React, { useState } from 'react';
import { useResume } from '../../contexts/ResumeContext';
import { Edit2, Plus, Trash2 } from 'lucide-react';

function CustomSectionForm() {
  const { resumeData, addCustomSection, updateCustomSection, deleteCustomSection } = useResume();
  const [editingIndex, setEditingIndex] = useState(null);
  const [section, setSection] = useState({
    title: '',
    description: ''
  });

  const customSections = resumeData.customSections || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSection(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setEditingIndex(null);
    setSection({ title: '', description: '' });
  };

  const handleAddOrUpdate = () => {
    if (!section.title.trim()) {
      alert('Please add a custom section heading');
      return;
    }

    const data = {
      ...section,
      id: editingIndex !== null ? customSections[editingIndex].id : Date.now().toString()
    };

    if (editingIndex !== null) {
      updateCustomSection(editingIndex, data);
    } else {
      addCustomSection(data);
    }

    resetForm();
  };

  const handleEdit = (index) => {
    const current = customSections[index];
    setEditingIndex(index);
    setSection({
      title: current.title || '',
      description: current.description || ''
    });
  };

  const handleDelete = (index) => {
    deleteCustomSection(index);
    if (editingIndex === index) {
      resetForm();
    }
  };

  return (
    <div className="card p-6 bg-white dark:bg-gray-900 shadow-sm rounded-lg">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Custom Section
      </h2>

      {customSections.length > 0 && (
        <div className="mb-6 space-y-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Added Custom Sections
          </h3>
          {customSections.map((item, index) => (
            <div key={item.id || index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md relative pr-16 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition">
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={() => handleEdit(index)}
                  className="text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400"
                  aria-label="Edit custom section"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                  aria-label="Remove custom section"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="font-medium text-gray-900 dark:text-white">{item.title}</div>
              {item.description && (
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                  {item.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="custom-title" className="form-label">
            Heading *
          </label>
          <input
            type="text"
            id="custom-title"
            name="title"
            value={section.title}
            onChange={handleChange}
            className="form-input"
            placeholder="e.g. Competitive & Analytical"
          />
        </div>

        <div>
          <label htmlFor="custom-description" className="form-label">
            Content
          </label>
          <textarea
            id="custom-description"
            name="description"
            rows="6"
            value={section.description}
            onChange={handleChange}
            className="form-input"
            placeholder="Add each point on a new line, e.g.&#10;Solved 800+ DSA problems across LeetCode and Codeforces&#10;Specialized in graph algorithms, DP, and greedy techniques"
          />
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleAddOrUpdate}
            className="btn-primary flex items-center justify-center flex-1"
          >
            {editingIndex !== null ? <Edit2 className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            {editingIndex !== null ? 'Update Section' : 'Add Section'}
          </button>

          {editingIndex !== null && (
            <button
              onClick={resetForm}
              className="btn-secondary flex items-center justify-center flex-1"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomSectionForm;
