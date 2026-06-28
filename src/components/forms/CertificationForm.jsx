import React, { useState } from 'react';
import { useResume } from '../../contexts/ResumeContext';
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2, X } from 'lucide-react';

const EMPTY_CERTIFICATION = {
  name: '',
  issuer: '',
  date: '',
  expirationDate: '',
  credentialId: '',
  url: '',
  linkLabel: 'Verify',
  description: ''
};

function CertificationForm() {
  const {
    resumeData, addCertification, updateCertification,
    deleteCertification, moveCertification
  } = useResume();
  const [draft, setDraft] = useState(EMPTY_CERTIFICATION);
  const [editingIndex, setEditingIndex] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setDraft((current) => ({ ...current, [name]: value }));
  };

  const reset = () => {
    setDraft(EMPTY_CERTIFICATION);
    setEditingIndex(null);
  };

  const save = () => {
    if (!draft.name.trim()) {
      alert('Please enter a certificate name.');
      return;
    }
    const value = {
      ...draft,
      id: editingIndex === null
        ? `certification-${Date.now()}`
        : resumeData.certifications[editingIndex].id
    };
    if (editingIndex === null) addCertification(value);
    else updateCertification(editingIndex, value);
    reset();
  };

  const edit = (certificate, index) => {
    setEditingIndex(index);
    setDraft({
      ...EMPTY_CERTIFICATION,
      ...certificate,
      credentialId: certificate.credentialId || certificate.credentialID || '',
      url: certificate.url || certificate.credentialURL || certificate.certificateURL || ''
    });
  };

  return (
    <div className="card rounded-lg bg-white p-5 shadow-sm dark:bg-gray-900 sm:p-6">
      <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">Certificates</h2>

      {resumeData.certifications.length > 0 && (
        <div className="mb-6 space-y-3">
          {resumeData.certifications.map((certificate, index) => (
            <div key={certificate.id || index} className="rounded-md bg-gray-50 p-4 dark:bg-gray-800">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white">{certificate.name}</div>
                  {certificate.issuer && <div className="text-blue-600 dark:text-blue-400">{certificate.issuer}</div>}
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {[certificate.date, certificate.expirationDate].filter(Boolean).join(' – ')}
                  </div>
                </div>
                <div className="flex shrink-0">
                  <button type="button" onClick={() => moveCertification(index, -1)} disabled={index === 0} className="p-1.5 disabled:opacity-25" aria-label="Move certificate up"><ArrowUp className="h-4 w-4" /></button>
                  <button type="button" onClick={() => moveCertification(index, 1)} disabled={index === resumeData.certifications.length - 1} className="p-1.5 disabled:opacity-25" aria-label="Move certificate down"><ArrowDown className="h-4 w-4" /></button>
                  <button type="button" onClick={() => edit(certificate, index)} className="p-1.5 text-blue-600" aria-label="Edit certificate"><Pencil className="h-4 w-4" /></button>
                  <button type="button" onClick={() => deleteCertification(index)} className="p-1.5 text-red-600" aria-label="Delete certificate"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Certificate name *
          <input name="name" value={draft.name} onChange={handleChange} className="form-input mt-1" placeholder="AWS Certified Solutions Architect" />
        </label>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Issuer
          <input name="issuer" value={draft.issuer} onChange={handleChange} className="form-input mt-1" placeholder="Amazon Web Services" />
        </label>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Issue date
          <input type="month" name="date" value={draft.date} onChange={handleChange} className="form-input mt-1" />
        </label>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Expiration date
          <input type="month" name="expirationDate" value={draft.expirationDate} onChange={handleChange} className="form-input mt-1" />
        </label>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Credential ID
          <input name="credentialId" value={draft.credentialId} onChange={handleChange} className="form-input mt-1" placeholder="ABC123XYZ" />
        </label>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Certificate URL
          <input type="text" name="url" value={draft.url} onChange={handleChange} className="form-input mt-1" placeholder="example.com/verify" />
        </label>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Link label
          <input name="linkLabel" value={draft.linkLabel} onChange={handleChange} className="form-input mt-1" placeholder="Verify" />
        </label>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 sm:col-span-2">
          Description
          <textarea name="description" value={draft.description} onChange={handleChange} className="form-input mt-1 min-h-24" placeholder="Optional details about the certificate" />
        </label>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button type="button" onClick={save} className="btn-primary flex items-center">
          {editingIndex === null ? <Plus className="mr-2 h-4 w-4" /> : <Pencil className="mr-2 h-4 w-4" />}
          {editingIndex === null ? 'Add certificate' : 'Save changes'}
        </button>
        {editingIndex !== null && (
          <button type="button" onClick={reset} className="btn-secondary flex items-center">
            <X className="mr-2 h-4 w-4" /> Cancel
          </button>
        )}
      </div>
    </div>
  );
}

export default CertificationForm;
