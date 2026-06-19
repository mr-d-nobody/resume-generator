import React, { useState } from 'react';
import { useResume } from '../../contexts/ResumeContext';
import { ArrowDown, ArrowUp, Copy, Edit2, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { normalizeCustomSection } from '../../utils/resumeSections';

const emptySection = () => ({ title: '', description: '', entries: [] });

function CustomSectionForm() {
  const {
    resumeData, addCustomSection, updateCustomSection, deleteCustomSection,
    duplicateCustomSection, moveCustomSection
  } = useResume();
  const [editingIndex, setEditingIndex] = useState(null);
  const [section, setSection] = useState(emptySection);
  const customSections = resumeData.customSections || [];

  const resetForm = () => {
    setEditingIndex(null);
    setSection(emptySection());
  };

  const addEntry = () => setSection((current) => ({
    ...current,
    entries: [...current.entries, {
      id: `custom-entry-${Date.now()}`,
      title: '',
      description: '',
      url: '',
      linkLabel: ''
    }]
  }));
  const updateEntry = (index, field, value) => setSection((current) => ({
    ...current,
    entries: current.entries.map((entry, entryIndex) =>
      entryIndex === index ? { ...entry, [field]: value } : entry
    )
  }));
  const removeEntry = (index) => setSection((current) => ({
    ...current,
    entries: current.entries.filter((_, entryIndex) => entryIndex !== index)
  }));

  const save = () => {
    if (!section.title.trim()) {
      alert('Please add a custom section heading');
      return;
    }
    const current = editingIndex === null ? null : customSections[editingIndex];
    const data = {
      ...section,
      id: current?.id || `custom-${Date.now()}`,
      type: current?.type || 'custom',
      content: section.description.split('\n').map(item => item.trim()).filter(Boolean),
      entries: section.entries
        .map(entry => ({
          ...entry,
          title: entry.title.trim(),
          description: entry.description.trim(),
          url: entry.url.trim(),
          linkLabel: entry.linkLabel.trim() || entry.title.trim() || 'Profile'
        }))
        .filter(entry => entry.title || entry.description || entry.url),
      order: current?.order ?? customSections.length,
      visible: current?.visible !== false
    };
    if (editingIndex === null) addCustomSection(data);
    else updateCustomSection(editingIndex, data);
    resetForm();
  };

  const edit = (index) => {
    const current = normalizeCustomSection(customSections[index], index);
    setEditingIndex(index);
    setSection({
      title: current.title || '',
      description: current.description || '',
      entries: Array.isArray(current.entries)
        ? current.entries
        : (current.links || []).map((link, linkIndex) => ({
          id: link.id || `legacy-entry-${linkIndex}`,
          title: link.label || '',
          description: '',
          url: link.url || '',
          linkLabel: link.label || ''
        }))
    });
  };

  return (
    <div className="card rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900">
      <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Custom Section</h2>
      <p className="mb-6 text-sm text-gray-500">Create flexible sections containing text, profile links, or both.</p>

      {customSections.length > 0 && (
        <div className="mb-6 space-y-3">
          {customSections.map((item, index) => (
            <div key={item.id || index} className="rounded-md bg-gray-50 p-4 dark:bg-gray-800">
              <div className="flex items-start justify-between gap-3">
                <div className={item.visible === false ? 'opacity-50' : ''}>
                  <div className="font-medium text-gray-900 dark:text-white">{item.title}</div>
                  {item.description && <div className="mt-1 line-clamp-2 text-sm text-gray-500">{item.description}</div>}
                  {item.entries?.length > 0 && <div className="mt-1 text-sm text-blue-600">{item.entries.map(entry => entry.title || entry.linkLabel).filter(Boolean).join(' • ')}</div>}
                </div>
                <div className="flex max-w-32 flex-wrap justify-end gap-2">
                  <button type="button" onClick={() => moveCustomSection(index, -1)} disabled={index === 0} className="text-gray-400 disabled:opacity-30" aria-label="Move up"><ArrowUp className="h-4 w-4" /></button>
                  <button type="button" onClick={() => moveCustomSection(index, 1)} disabled={index === customSections.length - 1} className="text-gray-400 disabled:opacity-30" aria-label="Move down"><ArrowDown className="h-4 w-4" /></button>
                  <button type="button" onClick={() => updateCustomSection(index, { visible: item.visible === false })} className="text-gray-400" aria-label="Toggle visibility">{item.visible === false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                  <button type="button" onClick={() => duplicateCustomSection(index)} className="text-gray-400" aria-label="Duplicate"><Copy className="h-4 w-4" /></button>
                  <button type="button" onClick={() => edit(index)} className="text-blue-500" aria-label="Edit"><Edit2 className="h-4 w-4" /></button>
                  <button type="button" onClick={() => deleteCustomSection(index)} className="text-red-500" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        <label className="form-label">
          Heading *
          <input value={section.title} onChange={(event) => setSection({ ...section, title: event.target.value })} className="form-input mt-1" placeholder="Competitive Programming Profiles" />
        </label>
        <label className="form-label">
          Content
          <textarea rows="5" value={section.description} onChange={(event) => setSection({ ...section, description: event.target.value })} className="form-input mt-1" placeholder="Optional achievements or details, one per line" />
        </label>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <div>
              <div className="form-label">Section entries</div>
              <div className="text-xs text-gray-500">Each entry keeps its details and matching profile link together.</div>
            </div>
            <button type="button" onClick={addEntry} className="btn-secondary flex shrink-0 items-center"><Plus className="mr-1 h-4 w-4" /> Add entry</button>
          </div>
          <div className="space-y-2">
            {section.entries.map((entry, index) => (
              <div key={entry.id || index} className="rounded-md border border-gray-200 p-3 dark:border-gray-700">
                <div className="grid grid-cols-[1fr_2fr_auto] gap-2">
                  <input value={entry.title} onChange={(event) => updateEntry(index, 'title', event.target.value)} className="form-input" placeholder="LeetCode" aria-label={`Entry ${index + 1} title`} />
                  <input value={entry.description} onChange={(event) => updateEntry(index, 'description', event.target.value)} className="form-input" placeholder="100+ DSA problems solved" aria-label={`Entry ${index + 1} details`} />
                  <button type="button" onClick={() => removeEntry(index)} className="p-2 text-gray-400 hover:text-red-500" aria-label={`Delete entry ${index + 1}`}><Trash2 className="h-5 w-5" /></button>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <input value={entry.linkLabel} onChange={(event) => updateEntry(index, 'linkLabel', event.target.value)} className="form-input" placeholder="View Profile" aria-label={`Entry ${index + 1} link label`} />
                  <input value={entry.url} onChange={(event) => updateEntry(index, 'url', event.target.value)} className="form-input" placeholder="leetcode.com/username" aria-label={`Entry ${index + 1} URL`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={save} className="btn-primary flex flex-1 items-center justify-center">{editingIndex === null ? <Plus className="mr-2 h-4 w-4" /> : <Edit2 className="mr-2 h-4 w-4" />}{editingIndex === null ? 'Add section' : 'Save section'}</button>
          {editingIndex !== null && <button type="button" onClick={resetForm} className="btn-secondary flex-1">Cancel</button>}
        </div>
      </div>
    </div>
  );
}

export default CustomSectionForm;
