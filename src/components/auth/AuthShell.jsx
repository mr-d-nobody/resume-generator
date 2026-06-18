import React from 'react';
import { CheckCircle2, FileText, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import resumeLogo from '../../assets/resume-logo.svg';

const benefits = [
  'Build polished, ATS-friendly resumes',
  'Keep every custom section and achievement',
  'Switch between six professional templates'
];

export default function AuthShell({ children, eyebrow, title, description }) {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-950 lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between p-12 xl:p-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(59,130,246,0.28),transparent_35%),radial-gradient(circle_at_80%_75%,rgba(14,165,233,0.2),transparent_35%)]" />
        <div className="absolute -right-24 top-24 h-80 w-80 rounded-full border border-blue-400/20" />
        <div className="absolute -right-8 top-40 h-52 w-52 rounded-full border border-cyan-300/20" />

        <Link to="/" className="relative z-10 flex items-center gap-3 text-white">
          <img src={resumeLogo} alt="" className="h-10 w-10 rounded-xl bg-white p-1.5" />
          <span className="text-xl font-semibold tracking-tight">ResumeBuilder</span>
        </Link>

        <div className="relative z-10 max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-400/10 px-4 py-2 text-sm font-medium text-blue-100">
            <Sparkles className="h-4 w-4" />
            Your career story, beautifully presented
          </div>
          <h2 className="text-4xl font-semibold leading-tight tracking-tight text-white xl:text-5xl">
            A better resume starts with a workspace that remembers you.
          </h2>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            Create an account to access secure resume tools and keep your workflow ready whenever opportunity knocks.
          </p>
          <ul className="mt-8 space-y-4">
            {benefits.map(benefit => (
              <li key={benefit} className="flex items-center gap-3 text-slate-200">
                <CheckCircle2 className="h-5 w-5 text-cyan-400" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 flex items-center gap-3 text-sm text-slate-400">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          Passwords are securely hashed and never stored as readable text.
        </div>
      </section>

      <section className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50 px-4 py-10 sm:px-8 dark:bg-gray-900">
        <div className="w-full max-w-lg">
          <Link to="/" className="mb-8 flex items-center gap-2 text-lg font-semibold text-slate-900 lg:hidden dark:text-white">
            <FileText className="h-6 w-6 text-blue-600" />
            ResumeBuilder
          </Link>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_80px_-35px_rgba(15,23,42,0.35)] sm:p-10 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">{eyebrow}</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">{title}</h1>
            <p className="mt-3 leading-7 text-slate-600 dark:text-gray-300">{description}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </section>
    </div>
  );
}
