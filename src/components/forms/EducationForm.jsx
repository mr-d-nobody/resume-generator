import React, { useState } from 'react';
import { useResume } from '../../contexts/ResumeContext';
import { Edit2, GraduationCap, Plus, Trash2 } from 'lucide-react';
import { RESUME_LIMITS, isValidGrade, isValidMonth } from '../../utils/resumeValidation';

const GRADE_LABELS = ['CGPA', 'GPA', 'Percentage'];
const emptyEducation = () => ({ degree: '', institution: '', location: '', graduationDate: '', cgpa: '', gradeLabel: 'CGPA', description: '' });

export default function EducationForm() {
  const { resumeData, addEducation, updateEducation, deleteEducation } = useResume();
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState(emptyEducation);
  const [editingIndex, setEditingIndex] = useState(null);
  const [errors, setErrors] = useState({});
  const update = (field, value) => { setDraft((current) => ({ ...current, [field]: value })); setErrors((current) => ({ ...current, [field]: '' })); };
  const reset = () => { setDraft(emptyEducation()); setEditingIndex(null); setErrors({}); setShowForm(false); };
  const edit = (index) => { setDraft({ ...emptyEducation(), ...resumeData.education[index] }); setEditingIndex(index); setErrors({}); setShowForm(true); };
  const save = () => {
    const nextErrors = {};
    if (!draft.degree.trim()) nextErrors.degree = 'Degree is required.';
    if (!draft.institution.trim()) nextErrors.institution = 'Institution is required.';
    if (draft.graduationDate && !isValidMonth(draft.graduationDate)) nextErrors.graduationDate = 'Enter a valid graduation month.';
    if (!isValidGrade(draft.cgpa, draft.gradeLabel)) nextErrors.cgpa = draft.gradeLabel === 'Percentage'
      ? 'Enter a percentage from 0 to 100, with or without the % sign.'
      : 'Enter a valid CGPA/GPA such as 8.5 or 8.5/10.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    const payload = { ...draft, id: editingIndex === null ? `education-${Date.now()}` : resumeData.education[editingIndex].id };
    if (editingIndex === null) addEducation(payload); else updateEducation(editingIndex, payload);
    reset();
  };
  const error = (field) => errors[field] && <p className="mt-1 text-sm text-red-600" role="alert">{errors[field]}</p>;

  return <div className="card p-5 sm:p-6">
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><h2 className="flex items-center text-xl font-semibold text-gray-900 dark:text-white"><GraduationCap className="mr-2 h-5 w-5" /> Education</h2>{!showForm && <button type="button" onClick={() => setShowForm(true)} className="btn-primary flex items-center justify-center"><Plus className="mr-1 h-4 w-4" /> Add Education</button>}</div>
    {resumeData.education.map((item, index) => <div key={item.id || index} className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-semibold">{item.degree}</p><p className="text-gray-600 dark:text-gray-300">{item.institution}</p></div><div className="flex gap-2"><button type="button" onClick={() => edit(index)} className="p-2 text-gray-500 hover:text-blue-600" aria-label={`Edit ${item.degree || 'education'}`}><Edit2 className="h-4 w-4" /></button><button type="button" onClick={() => deleteEducation(index)} className="p-2 text-red-500 hover:text-red-700" aria-label={`Delete ${item.degree || 'education'}`}><Trash2 className="h-4 w-4" /></button></div></div></div>)}
    {showForm && <div className="mb-4 space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
      <div><label htmlFor="education-degree" className="form-label">Degree *</label><input id="education-degree" value={draft.degree} onChange={(event) => update('degree', event.target.value)} className="form-input" maxLength={RESUME_LIMITS.short} aria-invalid={Boolean(errors.degree)} />{error('degree')}</div>
      <div><label htmlFor="education-institution" className="form-label">Institution *</label><input id="education-institution" value={draft.institution} onChange={(event) => update('institution', event.target.value)} className="form-input" maxLength={RESUME_LIMITS.short} aria-invalid={Boolean(errors.institution)} />{error('institution')}</div>
      <div><label htmlFor="education-location" className="form-label">Location</label><input id="education-location" value={draft.location} onChange={(event) => update('location', event.target.value)} className="form-input" maxLength={RESUME_LIMITS.short} /></div>
      <div className="grid gap-3 sm:grid-cols-2"><div><label htmlFor="education-graduation" className="form-label">Graduation date</label><input id="education-graduation" type="month" value={draft.graduationDate} onChange={(event) => update('graduationDate', event.target.value)} className="form-input" aria-invalid={Boolean(errors.graduationDate)} />{error('graduationDate')}</div><div><label htmlFor="education-grade" className="form-label">Academic score</label><input id="education-grade" value={draft.cgpa} onChange={(event) => update('cgpa', event.target.value)} className="form-input" placeholder="8.5/10, 85%, A" maxLength={RESUME_LIMITS.grade} aria-invalid={Boolean(errors.cgpa)} />{error('cgpa')}</div></div>
      <div><label htmlFor="education-grade-label" className="form-label">Display score as</label><select id="education-grade-label" value={GRADE_LABELS.includes(draft.gradeLabel) ? draft.gradeLabel : 'CGPA'} onChange={(event) => update('gradeLabel', event.target.value)} className="form-input"><option value="CGPA">CGPA</option><option value="GPA">GPA</option><option value="Percentage">Percentage</option></select><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Choose the label shown before this score in your resume.</p></div>
      <div><label htmlFor="education-description" className="form-label">Additional details</label><textarea id="education-description" value={draft.description} onChange={(event) => update('description', event.target.value)} className="form-input h-24" maxLength={RESUME_LIMITS.description} /></div>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={reset} className="btn-secondary">Cancel</button><button type="button" onClick={save} className="btn-primary">{editingIndex === null ? 'Add Education' : 'Save Education'}</button></div>
    </div>}
  </div>;
}
