import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BriefcaseBusiness, CheckCircle2, FileDown, Layout, Search, Sparkles, UploadCloud } from 'lucide-react';
import resumeLogo from '../assets/resume-logo.svg';
import { useAuth } from '../contexts/AuthContext';

const features = [
  {
    title: 'Magic resume upload',
    description: 'Upload an existing PDF and start editing from structured resume sections.',
    icon: UploadCloud,
    accent: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
  },
  {
    title: 'Beginner-friendly editor',
    description: 'Fill one section at a time with clear labels, sensible spacing, and live updates.',
    icon: Sparkles,
    accent: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
  },
  {
    title: 'Fresh templates',
    description: 'Choose clean fresher and intern-ready formats built for quick scanning.',
    icon: Layout,
    accent: 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300'
  },
  {
    title: 'Job search built in',
    description: 'Search roles from multiple job boards without leaving your resume workspace.',
    icon: BriefcaseBusiness,
    accent: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
  },
  {
    title: 'Live resume preview',
    description: 'See exactly how your resume looks while you edit the content and layout.',
    icon: Search,
    accent: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300'
  },
  {
    title: 'PDF export ready',
    description: 'Download a polished PDF when your resume is ready to share.',
    icon: FileDown,
    accent: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
  }
];

const steps = ['Upload or start blank', 'Edit guided sections', 'Pick a template', 'Apply with confidence'];

/**
 * Home page component
 * Landing page with hero, features, and call-to-action
 */
function Home() {
  const { isAuthenticated } = useAuth();
  const destination = (path) => isAuthenticated
    ? path
    : `/signup?next=${encodeURIComponent(path)}`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <section className="grid min-w-0 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
          <div className="min-w-0">
            <div className="mb-6 inline-flex max-w-full items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-sm font-semibold leading-5 text-blue-700 shadow-sm dark:border-blue-900/70 dark:bg-gray-900 dark:text-blue-300">
              <img src={resumeLogo} alt="" className="h-5 w-5 shrink-0" />
              <span className="min-w-0 break-words">Resume builder for early-career job seekers</span>
            </div>
            <h1 className="max-w-3xl break-words text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">
              Build a clean resume and find jobs from one workspace.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 dark:text-gray-300 sm:text-lg">
              Create a professional resume, preview it instantly, choose a fresher-friendly template, and search matching roles without jumping between tools.
            </p>
            <div className="mt-7 flex min-w-0 flex-col gap-3 sm:flex-row">
            <Link
              to={destination('/builder')}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
            >
              Start Building
                <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to={destination('/templates')}
                className="inline-flex w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 sm:w-auto"
            >
              View Templates
            </Link>
          </div>
            <div className="mt-8 grid max-w-xl grid-cols-1 gap-3 text-sm text-slate-600 dark:text-gray-300 min-[420px]:grid-cols-2 sm:grid-cols-4">
              {steps.map((step) => (
                <div key={step} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/60 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none sm:p-4">
            <div className="rounded-lg bg-slate-100 p-4 dark:bg-gray-950">
              <div className="mx-auto max-w-sm rounded-md bg-white p-6 shadow-lg dark:bg-gray-900">
                <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4 dark:border-gray-800">
                  <div>
                    <div className="h-3 w-36 rounded bg-slate-950 dark:bg-white" />
                    <div className="mt-3 h-2 w-52 rounded bg-slate-200 dark:bg-gray-700" />
                    <div className="mt-2 h-2 w-44 rounded bg-slate-200 dark:bg-gray-700" />
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-600 text-white">
                    <FileDown className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-5 space-y-5">
                  {['Experience', 'Projects', 'Skills'].map((section, index) => (
                    <div key={section}>
                      <div className="mb-2 flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <span className="text-xs font-semibold uppercase text-slate-500 dark:text-gray-400">{section}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 rounded bg-slate-200 dark:bg-gray-700" />
                        <div className="h-2 w-5/6 rounded bg-slate-200 dark:bg-gray-700" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-600">Features</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                Everything you need to move from resume to application.
              </h2>
            </div>
            <Link to={destination('/jobs')} className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-300">
              Explore jobs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-900">
                  <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg ${feature.accent}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-950 dark:text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-gray-400">{feature.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-14 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Ready to create your standout resume?</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-gray-400">
                Start with your details, upload an old resume, or browse templates first.
              </p>
            </div>
            <Link
              to={destination('/builder')}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Build Your Resume
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;
