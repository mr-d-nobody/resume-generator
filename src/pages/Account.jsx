import React, { useState } from 'react';
import { CheckCircle2, KeyRound, Loader2, LogOut, Mail, ShieldCheck, User } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import PasswordInput from '../components/auth/PasswordInput';
import { useAuth } from '../contexts/AuthContext';

export default function Account() {
  const { user, isAuthenticated, isLoading, changePassword, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      </div>
    </div>
  );
}
