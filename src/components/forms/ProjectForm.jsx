import React, { useState } from 'react';
import { useResume } from '../../contexts/ResumeContext';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { inferLinkLabel, normalizeProjectLinks } from '../../utils/resumeData';

const emptyProject = () => ({
  name: '',
  description: '',
  links: []
});

function ProjectForm() {
  const { resumeData, addProject, updateProject, deleteProject } = useResume();
  const [editingIndex, setEditingIndex] = useState(null);
  const [draft, setDraft] = useState(emptyProject);

  const updateLink = (index, field, value) => {
    setDraft((current) => ({
      ...current,
      links: current.links.map((link, linkIndex) =>
        linkIndex === index ? { ...link, [field]: value } : link
      )
    }));
  };

  const addLink = () => {
    setDraft((current) => ({
      ...current,
      links: [...current.links, {
        id: `project-link-${Date.now()}`,
        label: '',
        url: ''
      }]
    }));
  };

  const removeLink = (index) => {
    setDraft((current) => ({
      ...current,
      links: current.links.filter((_, linkIndex) => linkIndex !== index)
    }));
  };

  const reset = () => {
    setEditingIndex(null);
    setDraft(emptyProject());
  };

  const save = () => {
    if (!draft.name.trim()) {
      alert('Please fill in project name');
      return;
    }

    const links = draft.links
      .filter((link) => link.url.trim())
      .map((link) => ({
        ...link,
        label: link.label.trim() || inferLinkLabel(link.url, 'Live Demo')
      }));
    const data = {
      ...draft,
      id: editingIndex === null
        ? `project-${Date.now()}`
        : resumeData.projects[editingIndex].id,
      links,
      highlights: draft.description.split('\n').map((item) => item.trim()).filter(Boolean)
    };

    if (editingIndex === null) addProject(data);
    else updateProject(editingIndex, data);
    reset();
  };

  const edit = (index) => {
    const project = resumeData.projects[index];
    setEditingIndex(index);
    setDraft({
      name: project.name || '',
      description: project.description || (project.highlights || []).join('\n'),
      links: normalizeProjectLinks(project)
    });
  };

  return (
    <div className="card rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900">
      <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">Projects</h2>

      {resumeData.projects.length > 0 && (
        <div className="mb-6 space-y-3">
          {resumeData.projects.map((project, index) => (
            <div key={project.id || index} className="rounded-md bg-gray-50 p-4 dark:bg-gray-800">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{project.name}</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    {normalizeProjectLinks(project).map((link) => link.label).join(' • ')}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => edit(index)} className="text-gray-400 hover:text-blue-500" aria-label="Edit project"><Edit2 className="h-4 w-4" /></button>
                  <button type="button" onClick={() => deleteProject(index)} className="text-gray-400 hover:text-red-500" aria-label="Delete project"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Project name *
          <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className="form-input mt-1" placeholder="E-Commerce Dashboard" />
        </label>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Project links</div>
              <div className="text-xs text-gray-500">Use labels such as Live Demo, GitHub, Case Study, or Documentation.</div>
            </div>
            <button type="button" onClick={addLink} className="btn-secondary flex items-center"><Plus className="mr-1 h-4 w-4" /> Add link</button>
          </div>
          <div className="space-y-2">
            {draft.links.map((link, index) => (
              <div key={link.id || index} className="grid grid-cols-[1fr_2fr_auto] gap-2">
                <input value={link.label} onChange={(event) => updateLink(index, 'label', event.target.value)} className="form-input" placeholder="Live Demo" aria-label={`Project link ${index + 1} label`} />
                <input value={link.url} onChange={(event) => updateLink(index, 'url', event.target.value)} className="form-input" placeholder="example.com/project" aria-label={`Project link ${index + 1} URL`} />
                <button type="button" onClick={() => removeLink(index)} className="p-2 text-gray-400 hover:text-red-500" aria-label={`Delete project link ${index + 1}`}><Trash2 className="h-5 w-5" /></button>
              </div>
            ))}
          </div>
        </div>

        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
          <textarea rows="4" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} className="form-input mt-1" placeholder="Add each highlight on a new line" />
        </label>

        <div className="flex gap-3">
          <button type="button" onClick={save} className="btn-primary flex flex-1 items-center justify-center">
            {editingIndex === null ? <Plus className="mr-2 h-4 w-4" /> : <Edit2 className="mr-2 h-4 w-4" />}
            {editingIndex === null ? 'Add project' : 'Save project'}
          </button>
          {editingIndex !== null && <button type="button" onClick={reset} className="btn-secondary flex-1">Cancel</button>}
        </div>
      </div>
    </div>
  );
}

export default ProjectForm;
