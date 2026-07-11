import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useResume } from '../contexts/ResumeContext';
import { useAuth } from '../contexts/AuthContext';
import { extractTextFromPDF, parseResumeWithAI } from '../utils/ResumeParser';
import { UploadCloud, Sparkles, Loader2, CheckCircle, AlertCircle, CloudUpload, RotateCcw } from 'lucide-react';
import { DEFAULT_TEMPLATE_CATEGORY, TEMPLATE_CATEGORIES, getTemplateCategory } from '../data/templateCategories';

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

function isPdf(file) {
  return file?.type === 'application/pdf' || file?.name?.toLowerCase().endsWith('.pdf');
}

export default function MagicUpload() {
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(DEFAULT_TEMPLATE_CATEGORY);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [backupAvailable, setBackupAvailable] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const resume = useResume();
  const {
    resumeData, selectedTemplate, customization, templateCategory,
    saveResumeNow, setTemplateCategory, loadResume,
  } = resume;
  const backupKey = `resumeImportBackup:${user?.id || 'guest'}`;

  useEffect(() => setBackupAvailable(Boolean(localStorage.getItem(backupKey))), [backupKey]);

  const resetSelection = () => {
    setSelectedFile(null);
    setErrorMessage('');
    setStatus('idle');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const selectFile = (file) => {
    setErrorMessage('');
    if (!isPdf(file)) {
      setSelectedFile(null);
      setErrorMessage('Please upload a valid PDF file.');
      setStatus('error');
      return;
    }
    if (!file.size) {
      setSelectedFile(null);
      setErrorMessage('The selected PDF is empty.');
      setStatus('error');
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setSelectedFile(null);
      setErrorMessage('Please upload a PDF no larger than 5MB.');
      setStatus('error');
      return;
    }
    setSelectedFile(file);
    setStatus('idle');
  };

  const createBackup = () => {
    const payload = { resumeData, selectedTemplate, customization, templateCategory };
    localStorage.setItem(backupKey, JSON.stringify({ createdAt: new Date().toISOString(), payload }));
    setBackupAvailable(true);
  };

  const restoreBackup = async () => {
    try {
      const backup = JSON.parse(localStorage.getItem(backupKey) || '{}');
      if (!backup.payload) throw new Error('No import backup is available.');
      loadResume(backup.payload);
      try {
        await saveResumeNow(backup.payload);
      } catch {
        // The local restoration is intentionally kept even if cloud validation/network save fails.
      }
      setErrorMessage('Your pre-import resume has been restored on this device.');
      setStatus('idle');
    } catch (error) {
      setErrorMessage(error.message || 'Could not restore the import backup.');
      setStatus('error');
    }
  };

  const processFile = async () => {
    if (!selectedFile) return;
    try {
      createBackup();
      setStatus('reading');
      await new Promise((resolve) => setTimeout(resolve, 50));
      const rawText = await extractTextFromPDF(selectedFile);
      if (!rawText.trim()) throw new Error('No readable text was found. Scanned/image-only PDFs must be entered manually.');

      setStatus('parsing');
      const category = getTemplateCategory(selectedCategory);
      const parsedData = await parseResumeWithAI(rawText, category.parserType);
      const uploadedProfileLinks = Array.isArray(parsedData.personalInfo?.links)
        ? parsedData.personalInfo.links.filter((link) => link?.url)
        : [];
      const customSections = Array.isArray(parsedData.customSections)
        ? parsedData.customSections.map((section, index) => ({
            id: section?.id || `upload-custom-${Date.now()}-${index}`,
            type: 'custom',
            title: typeof section?.title === 'string' && section.title.trim() ? section.title.trim() : 'Custom Section',
            description: Array.isArray(section?.description) ? section.description.filter(Boolean).join('\n') : String(section?.description || section?.content || '').trim(),
            content: Array.isArray(section?.content) ? section.content.filter(Boolean) : String(section?.description || section?.content || '').split('\n').filter(Boolean),
            links: Array.isArray(section?.links) ? section.links.filter((link) => link?.url) : [],
            entries: Array.isArray(section?.entries) ? section.entries.filter((entry) => entry?.title || entry?.description || entry?.url) : [],
            order: Number.isFinite(section?.order) ? section.order : index,
            visible: section?.visible !== false,
          })).filter((section) => section.description || section.links.length || section.entries.length)
        : [];
      if (uploadedProfileLinks.length) {
        customSections.push({
          id: `upload-profile-links-${Date.now()}`, type: 'custom', title: 'Profiles', description: '', content: [], links: [],
          entries: uploadedProfileLinks.map((link, index) => ({ id: `upload-profile-entry-${index}`, title: link.label || 'Profile', description: '', url: link.url, linkLabel: link.label || 'Profile' })),
          order: customSections.length, visible: true,
        });
      }

      const payload = {
        resumeData: {
          personalInfo: { ...(parsedData.personalInfo || {}), links: [] },
          experience: parsedData.experience || [], education: parsedData.education || [], skills: parsedData.skills || [],
          projects: parsedData.projects || [], certifications: parsedData.certifications || [], achievements: parsedData.achievements || [],
          customSections, languages: [],
        },
        templateCategory: category.id,
      };
      setStatus('saving');
      await saveResumeNow(payload);
      setTemplateCategory(category.id);
      setStatus('success');
      setTimeout(() => navigate('/templates'), 1500);
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || 'Something went wrong during parsing. Your previous resume backup is still available.');
      setStatus('error');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const canChoose = status === 'idle' || status === 'error';

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-gray-50 p-4 py-8 dark:bg-gray-900 sm:py-12">
      <div className="w-full max-w-2xl">
        <div className="mb-6 text-center sm:mb-8">
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-blue-100 p-3 dark:bg-blue-900"><Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" /></div>
          <h1 className="mb-3 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Magic Upload</h1>
          <p className="text-base leading-7 text-gray-600 dark:text-gray-400 sm:text-lg">Upload an existing PDF to extract its text into editable resume sections. The extracted text is sent to the configured AI provider; use manual entry if you prefer not to use AI.</p>
          <Link to="/builder" className="mt-3 inline-flex font-semibold text-blue-600 hover:text-blue-700">Skip upload and enter details manually</Link>
        </div>

        {backupAvailable && (
          <div className="mb-5 flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
            <span>A restorable pre-import resume backup is available on this device.</span>
            <button type="button" onClick={restoreBackup} className="inline-flex items-center justify-center gap-2 rounded-md bg-amber-700 px-3 py-2 font-semibold text-white"><RotateCcw className="h-4 w-4" /> Restore backup</button>
          </div>
        )}

        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="mb-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">Choose your fresher / intern template category</p>
          <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
            {TEMPLATE_CATEGORIES.map((category) => (
              <button key={category.id} type="button" onClick={() => setSelectedCategory(category.id)} disabled={!canChoose} aria-pressed={selectedCategory === category.id} className={`rounded-lg border p-3 text-left transition sm:p-4 ${selectedCategory === category.id ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-sm dark:bg-blue-900/30 dark:text-blue-100' : 'border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'} ${!canChoose ? 'cursor-not-allowed opacity-70' : ''}`}>
                <span className="block text-sm font-semibold">{category.label}</span><span className="mt-1 block text-xs opacity-80">{category.description}</span>
              </button>
            ))}
          </div>
        </div>

        <div
          role="button"
          tabIndex={canChoose ? 0 : -1}
          aria-label="Choose or drop a PDF resume"
          onClick={() => canChoose && !selectedFile && fileInputRef.current?.click()}
          onKeyDown={(event) => {
            if (canChoose && !selectedFile && (event.key === 'Enter' || event.key === ' ')) {
              event.preventDefault(); fileInputRef.current?.click();
            }
          }}
          onDragEnter={(event) => { event.preventDefault(); if (canChoose) setIsDragging(true); }}
          onDragOver={(event) => { event.preventDefault(); if (canChoose) setIsDragging(true); }}
          onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setIsDragging(false); }}
          onDrop={(event) => { event.preventDefault(); setIsDragging(false); if (canChoose) selectFile(event.dataTransfer.files?.[0]); }}
          className={`rounded-xl border-2 border-dashed bg-white p-6 text-center transition-all dark:bg-gray-800 sm:p-10 ${isDragging ? 'border-blue-600 bg-blue-100 ring-4 ring-blue-100 dark:bg-blue-900/30 dark:ring-blue-950' : canChoose ? 'cursor-pointer border-gray-300 hover:border-blue-500 hover:bg-blue-50 dark:border-gray-600 dark:hover:bg-blue-900/20' : 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'}`}
        >
          <input type="file" ref={fileInputRef} onChange={(event) => selectFile(event.target.files?.[0])} accept="application/pdf,.pdf" className="sr-only" />

          {status === 'idle' && !selectedFile && <div className="flex flex-col items-center"><UploadCloud className="mb-4 h-16 w-16 text-gray-400" /><h2 className="mb-2 text-xl font-medium text-gray-900 dark:text-white">Click or drag PDF here</h2><p className="text-gray-500 dark:text-gray-400">Maximum file size: 5MB</p></div>}
          {status === 'idle' && selectedFile && (
            <div onClick={(event) => event.stopPropagation()} className="flex flex-col items-center">
              <CheckCircle className="mb-3 h-14 w-14 text-emerald-600" /><h2 className="text-xl font-semibold text-gray-900 dark:text-white">Ready to import</h2><p className="mt-1 break-all text-sm text-gray-600 dark:text-gray-300">{selectedFile.name}</p>
              <p className="mt-4 max-w-md text-sm text-amber-700 dark:text-amber-300">Importing replaces the active resume after creating a restorable local backup.</p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row"><button type="button" onClick={processFile} className="btn-primary">Import and replace</button><button type="button" onClick={resetSelection} className="btn-secondary">Choose another file</button></div>
            </div>
          )}
          {status === 'reading' && <div className="flex flex-col items-center text-blue-600" role="status"><Loader2 className="mb-4 h-16 w-16 animate-spin" /><h2 className="text-xl font-medium">Reading PDF…</h2><p className="text-sm">Extracting text locally in your browser.</p></div>}
          {status === 'parsing' && <div className="flex flex-col items-center text-purple-600" role="status"><Sparkles className="mb-4 h-16 w-16 animate-pulse" /><h2 className="text-xl font-medium">Structuring your resume…</h2><p className="text-sm">This may take a moment. Your existing resume is backed up.</p></div>}
          {status === 'saving' && <div className="flex flex-col items-center text-blue-600" role="status"><CloudUpload className="mb-4 h-16 w-16" /><h2 className="text-xl font-medium">Validating and saving…</h2></div>}
          {status === 'success' && <div className="flex flex-col items-center text-green-600" role="status"><CheckCircle className="mb-4 h-16 w-16" /><h2 className="text-xl font-medium">Import complete</h2><p className="text-sm">Opening templates…</p></div>}
          {status === 'error' && (
            <div onClick={(event) => event.stopPropagation()} className="flex flex-col items-center text-red-600" role="alert"><AlertCircle className="mb-4 h-16 w-16" /><h2 className="text-xl font-medium">Import could not be completed</h2><p className="mb-4 text-sm">{errorMessage}</p><div className="flex flex-col gap-3 sm:flex-row"><button type="button" onClick={resetSelection} className="rounded-md bg-red-100 px-4 py-2 font-semibold text-red-700 hover:bg-red-200">Try another PDF</button><Link to="/builder" className="rounded-md border border-red-300 px-4 py-2 font-semibold text-red-700">Continue with manual entry</Link></div></div>
          )}
        </div>
      </div>
    </div>
  );
}
