import React, { useState } from 'react';
import { useResume } from '../../contexts/ResumeContext';
import { Plus, Trash2 } from 'lucide-react';

function CertificationForm() {
  const { resumeData, addCertification, deleteCertification } = useResume();
  const [newCertification, setNewCertification] = useState({
    name: '',
    issuer: '',
    date: '',
    expirationDate: '',
    credentialID: '',
    credentialURL: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewCertification(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddCertification = () => {
    if (!newCertification.name || !newCertification.issuer) {
      alert('Please fill in certification name and issuer');
      return;
    }

    // Use the addCertification action from context
    addCertification(newCertification);

    // Reset form
    setNewCertification({
      name: '',
      issuer: '',
      date: '',
      expirationDate: '',
      credentialID: '',
      credentialURL: ''
    });
  };

  const handleRemoveCertification = (index) => {
    // Use the deleteCertification action from context
    deleteCertification(index);
  };

  return (
    <div className="card p-6 bg-white dark:bg-gray-900 shadow-sm rounded-lg">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Certifications
      </h2>

      {/* Existing Certification Items */}
      {resumeData.certifications.length > 0 && (
        <div className="mb-6 space-y-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Added Certifications
          </h3>
          {resumeData.certifications.map((cert, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md relative pr-10">
              <button
                onClick={() => handleRemoveCertification(index)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                aria-label="Remove certification"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <div className="font-medium text-gray-900 dark:text-white">{cert.name}</div>
              <div className="text-blue-600 dark:text-blue-400">{cert.issuer}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {cert.date && `Issued: ${cert.date}`}
                {cert.expirationDate && ` • Expires: ${cert.expirationDate}`}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Certification Form */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Certification Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={newCertification.name}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g. AWS Certified Solutions Architect"
            />
          </div>

          <div>
            <label htmlFor="issuer" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Issuing Organization *
            </label>
            <input
              type="text"
              id="issuer"
              name="issuer"
              value={newCertification.issuer}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g. Amazon Web Services"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Issue Date
            </label>
            <input
              type="month"
              id="date"
              name="date"
              value={newCertification.date}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div>
            <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Expiration Date
            </label>
            <input
              type="month"
              id="expirationDate"
              name="expirationDate"
              value={newCertification.expirationDate}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="credentialID" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Credential ID
            </label>
            <input
              type="text"
              id="credentialID"
              name="credentialID"
              value={newCertification.credentialID}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g. ABC123XYZ"
            />
          </div>

          <div>
            <label htmlFor="credentialURL" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Credential URL
            </label>
            <input
              type="url"
              id="credentialURL"
              name="credentialURL"
              value={newCertification.credentialURL}
              onChange={handleChange}
              className="form-input"
              placeholder="https://example.com/verify"
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={handleAddCertification}
            className="btn-primary flex items-center justify-center w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Certification
          </button>
        </div>
      </div>
    </div>
  );
}

export default CertificationForm;