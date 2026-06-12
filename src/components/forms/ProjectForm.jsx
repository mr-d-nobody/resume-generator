import React, { useState } from 'react';
import { useResume } from '../../contexts/ResumeContext';
import { Plus, Trash2 } from 'lucide-react';

function ProjectForm() {
  const { resumeData, addProject, deleteProject } = useResume();
  const [newProject, setNewProject] = useState({
    name: '',
    link: '',
    description: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProject(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddProject = () => {
    if (!newProject.name) {
      alert('Please fill in project name');
      return;
    }

    // Projects array is used by templates
    addProject({
      ...newProject,
      id: Date.now().toString(),
      highlights: newProject.description.split('\n').filter(h => h.trim() !== '') // If they type multiple lines
    });

    setNewProject({
      name: '',
      link: '',
      description: ''
    });
  };

  const handleRemoveProject = (index) => {
    deleteProject(index);
  };

  return (
    <div className="card p-6 bg-white dark:bg-gray-900 shadow-sm rounded-lg">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
        <span className="mr-2">Projects</span>
      </h2>

      {resumeData.projects.length > 0 && (
        <div className="mb-6 space-y-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Added Projects
          </h3>
          {resumeData.projects.map((project, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md relative pr-10">
              <button
                onClick={() => handleRemoveProject(index)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                aria-label="Remove project"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <div className="font-medium text-gray-900 dark:text-white">{project.name}</div>
              {project.link && (
                <div className="text-blue-600 dark:text-blue-400 text-sm">{project.link}</div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Project Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={newProject.name}
            onChange={handleChange}
            className="form-input"
            placeholder="e.g. E-Commerce Dashboard"
          />
        </div>

        <div>
          <label htmlFor="link" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Project Link (Optional)
          </label>
          <input
            type="url"
            id="link"
            name="link"
            value={newProject.link}
            onChange={handleChange}
            className="form-input"
            placeholder="e.g. https://github.com/my-project"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows="3"
            value={newProject.description}
            onChange={handleChange}
            className="form-input"
            placeholder="Describe your project. (Tip: Use new lines for bullet points)"
          ></textarea>
        </div>

        <div className="mt-4">
          <button
            onClick={handleAddProject}
            className="btn-primary flex items-center justify-center w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProjectForm;
