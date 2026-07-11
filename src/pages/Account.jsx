import React, { useState } from 'react';
import { CheckCircle2, Download, KeyRound, Loader2, LogOut, Mail, ShieldCheck, Trash2, User } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import PasswordInput from '../components/auth/PasswordInput';
import { useAuth } from '../contexts/AuthContext';
import { useResume } from '../contexts/ResumeContext';
import { deleteSavedResume } from '../utils/resumeApi';

export default function Account() {
  const { user, isAuthenticated, isLoading, changePassword, deleteAccount, exportAccountData, logout } = useAuth();
  const { resetResume } = useResume();
  const navigate = useNavigate();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeDeleteText, setResumeDeleteText] = useState('');
  const [accountDeleteText, setAccountDeleteText] = useState('');
  const [accountDeletePassword, setAccountDeletePassword] = useState('');
  const [dataMessage, setDataMessage] = useState('');
  const [dataError, setDataError] = useState('');
  const [isDataBusy, setIsDataBusy] = useState(false);

  if (isLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm(current => ({ ...current, [name]: value }));
    setFieldErrors(current => ({ ...current, [name]: '' }));
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setFieldErrors({});
    setIsSubmitting(true);
    try {
      const response = await changePassword(form);
      setMessage(response.detail);
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (requestError) {
      setError(requestError.message);
      setFieldErrors(requestError.fieldErrors || {});
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const downloadData = async () => {
    setDataError(''); setDataMessage(''); setIsDataBusy(true);
    try {
      const data = await exportAccountData();
      const blobUrl = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = blobUrl; link.download = 'resumebuilder-data.json'; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(blobUrl);
      setDataMessage('Your account data export is ready.');
    } catch (requestError) { setDataError(requestError.message); } finally { setIsDataBusy(false); }
  };

  const removeResume = async () => {
    if (resumeDeleteText !== 'DELETE') return;
    setDataError(''); setDataMessage(''); setIsDataBusy(true);
    try {
      await deleteSavedResume();
      localStorage.removeItem(`savedResume:${user.id}`);
      localStorage.removeItem(`resumeImportBackup:${user.id}`);
      resetResume();
      setResumeDeleteText('');
      setDataMessage('Your saved resume was deleted. Your account remains active.');
    } catch (requestError) { setDataError(requestError.message); } finally { setIsDataBusy(false); }
  };

  const removeAccount = async (event) => {
    event.preventDefault();
    if (accountDeleteText !== 'DELETE') return;
    setDataError(''); setDataMessage(''); setIsDataBusy(true);
    try {
      await deleteAccount({ password: accountDeletePassword });
      localStorage.removeItem(`savedResume:${user.id}`);
      localStorage.removeItem(`resumeImportBackup:${user.id}`);
      navigate('/', { replace: true });
    } catch (requestError) { setDataError(requestError.message); } finally { setIsDataBusy(false); }
  };

  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` || user.email[0].toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 py-12 dark:bg-gray-900">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Account settings</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Your secure workspace</h1>
            <p className="mt-2 text-slate-600 dark:text-gray-400">Manage your identity and account password.</p>
          </div>
          <button onClick={handleLogout} className="btn-secondary inline-flex items-center justify-center gap-2">
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-xl font-semibold text-white shadow-lg shadow-blue-500/20">
              {initials}
            </div>
            <h2 className="mt-5 text-xl font-semibold text-slate-950 dark:text-white">
              {[user.firstName, user.lastName].filter(Boolean).join(' ') || 'ResumeBuilder user'}
            </h2>
            <div className="mt-5 space-y-4 text-sm">
              <div className="flex items-center gap-3 text-slate-600 dark:text-gray-300">
                <Mail className="h-5 w-5 text-blue-600" />
                {user.email}
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-gray-300">
                <User className="h-5 w-5 text-blue-600" />
                User ID: {user.id}
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-gray-300">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                Password protected
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-950/50">
                <KeyRound className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Change password</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-gray-400">Use a unique password you do not use elsewhere.</p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="mt-7 space-y-5">
              {message && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  <CheckCircle2 className="h-5 w-5" /> {message}
                </div>
              )}
              {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
              <PasswordInput id="current-password" label="Current password" name="currentPassword" value={form.currentPassword} onChange={updateField} autoComplete="current-password" error={fieldErrors.currentPassword} />
              <PasswordInput id="new-password" label="New password" name="newPassword" value={form.newPassword} onChange={updateField} autoComplete="new-password" error={fieldErrors.newPassword} />
              <PasswordInput id="new-password-confirm" label="Confirm new password" name="confirmPassword" value={form.confirmPassword} onChange={updateField} autoComplete="new-password" error={fieldErrors.confirmPassword} />
              <button type="submit" disabled={isSubmitting} className="btn-primary inline-flex w-full items-center justify-center gap-2 py-3 sm:w-auto disabled:opacity-70">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Update password
              </button>
            </form>
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Your data</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-gray-400">Export or permanently remove information without contacting support.</p>
          {dataMessage && <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800" role="status">{dataMessage}</div>}
          {dataError && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{dataError}</div>}
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200 p-5 dark:border-gray-700"><h3 className="font-semibold text-slate-950 dark:text-white">Download my data</h3><p className="mt-2 text-sm text-slate-600 dark:text-gray-400">Download account details and the current saved resume as JSON.</p><button type="button" onClick={downloadData} disabled={isDataBusy} className="btn-secondary mt-4 inline-flex items-center gap-2"><Download className="h-4 w-4" /> Download JSON</button></div>
            <div className="rounded-xl border border-amber-200 p-5 dark:border-amber-800"><h3 className="font-semibold text-slate-950 dark:text-white">Delete saved resume</h3><p className="mt-2 text-sm text-slate-600 dark:text-gray-400">Your account remains active. Type DELETE to confirm.</p><label htmlFor="delete-resume-confirm" className="form-label mt-4">Confirmation</label><input id="delete-resume-confirm" value={resumeDeleteText} onChange={(event) => setResumeDeleteText(event.target.value)} className="form-input" placeholder="DELETE" autoComplete="off" /><button type="button" onClick={removeResume} disabled={resumeDeleteText !== 'DELETE' || isDataBusy} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-700 px-4 py-2 font-semibold text-white disabled:opacity-50"><Trash2 className="h-4 w-4" /> Delete resume</button></div>
            <form onSubmit={removeAccount} className="rounded-xl border border-red-200 p-5 dark:border-red-900"><h3 className="font-semibold text-red-800 dark:text-red-300">Delete account</h3><p className="mt-2 text-sm text-slate-600 dark:text-gray-400">Permanently deletes the account and saved resume. This cannot be undone.</p><div className="mt-4"><PasswordInput id="delete-account-password" label="Current password" value={accountDeletePassword} onChange={(event) => setAccountDeletePassword(event.target.value)} autoComplete="current-password" required /></div><label htmlFor="delete-account-confirm" className="form-label mt-3">Type DELETE</label><input id="delete-account-confirm" value={accountDeleteText} onChange={(event) => setAccountDeleteText(event.target.value)} className="form-input" placeholder="DELETE" autoComplete="off" /><button type="submit" disabled={accountDeleteText !== 'DELETE' || !accountDeletePassword || isDataBusy} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2 font-semibold text-white disabled:opacity-50"><Trash2 className="h-4 w-4" /> Delete account</button></form>
          </div>
        </section>
      </div>
    </div>
  );
}
