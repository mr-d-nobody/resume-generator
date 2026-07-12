import React, { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import AuthShell from '../components/auth/AuthShell';
import PasswordInput from '../components/auth/PasswordInput';
import GoogleAuthButton from '../components/auth/GoogleAuthButton';
import { useAuth } from '../contexts/AuthContext';
import { getSafeNextPath } from '../utils/authApi';

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: ''
};

export default function SignUp() {
  const { signup, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = getSafeNextPath(searchParams.get('next'));
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoading && isAuthenticated) return <Navigate to={nextPath} replace />;

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm(current => ({ ...current, [name]: value }));
    setFieldErrors(current => ({ ...current, [name]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setFieldErrors({});
    setIsSubmitting(true);
    try {
      await signup(form);
      navigate(nextPath, { replace: true });
    } catch (requestError) {
      setError(requestError.message);
      setFieldErrors(requestError.fieldErrors || {});
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = () => navigate(nextPath, { replace: true });
  const handleGoogleError = (googleError) => setError(googleError.message);

  return (
    <AuthShell
      eyebrow="Create your account"
      title="Start building with confidence"
      description="A few details and your secure ResumeBuilder account is ready."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <GoogleAuthButton text="signup_with" onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
        <div className="relative flex items-center py-1"><div className="w-full border-t border-slate-200 dark:border-gray-700" /><span className="absolute left-1/2 -translate-x-1/2 bg-white px-3 text-xs font-semibold uppercase tracking-widest text-slate-400 dark:bg-gray-800">or</span></div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="form-label">First name</label>
            <input id="firstName" name="firstName" value={form.firstName} onChange={updateField} className="form-input" autoComplete="given-name" />
            {fieldErrors.firstName && <p className="mt-1.5 text-sm text-red-600">{fieldErrors.firstName}</p>}
          </div>
          <div>
            <label htmlFor="lastName" className="form-label">Last name</label>
            <input id="lastName" name="lastName" value={form.lastName} onChange={updateField} className="form-input" autoComplete="family-name" />
          </div>
        </div>

        <div>
          <label htmlFor="signup-email" className="form-label">Email address</label>
          <input id="signup-email" name="email" type="email" value={form.email} onChange={updateField} className="form-input" autoComplete="email" placeholder="you@example.com" />
          {fieldErrors.email && <p className="mt-1.5 text-sm text-red-600">{fieldErrors.email}</p>}
        </div>

        <PasswordInput
          id="signup-password"
          label="Password"
          name="password"
          value={form.password}
          onChange={updateField}
          autoComplete="new-password"
          placeholder="Use at least 8 characters"
          error={fieldErrors.password}
        />
        <PasswordInput
          id="confirm-password"
          label="Confirm password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={updateField}
          autoComplete="new-password"
          error={fieldErrors.confirmPassword}
        />

        <button type="submit" disabled={isSubmitting} className="btn-primary flex w-full items-center justify-center gap-2 py-3 disabled:cursor-not-allowed disabled:opacity-70">
          {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>

        <p className="text-center text-sm text-slate-600 dark:text-gray-300">
          Already have an account?{' '}
          <Link to={`/login?next=${encodeURIComponent(nextPath)}`} className="font-semibold text-blue-600 hover:text-blue-700">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}
