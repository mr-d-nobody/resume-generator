import React, { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import AuthShell from '../components/auth/AuthShell';
import PasswordInput from '../components/auth/PasswordInput';
import { useAuth } from '../contexts/AuthContext';
import { getSafeNextPath } from '../utils/authApi';

export default function Login() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = getSafeNextPath(searchParams.get('next'));
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoading && isAuthenticated) return <Navigate to={nextPath} replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(form);
      navigate(nextPath, { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to your account"
      description="Continue building resumes that make a strong first impression."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}
        <div>
          <label htmlFor="login-email" className="form-label">Email address</label>
          <input
            id="login-email"
            type="email"
            value={form.email}
            onChange={event => setForm(current => ({ ...current, email: event.target.value }))}
            className="form-input"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </div>
        <PasswordInput
          id="login-password"
          label="Password"
          value={form.password}
          onChange={event => setForm(current => ({ ...current, password: event.target.value }))}
          autoComplete="current-password"
          required
        />
        <button type="submit" disabled={isSubmitting} className="btn-primary flex w-full items-center justify-center gap-2 py-3 disabled:cursor-not-allowed disabled:opacity-70">
          {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
        <p className="text-center text-sm text-slate-600 dark:text-gray-300">
          New to ResumeBuilder?{' '}
          <Link to={`/signup?next=${encodeURIComponent(nextPath)}`} className="font-semibold text-blue-600 hover:text-blue-700">Create an account</Link>
        </p>
      </form>
    </AuthShell>
  );
}
