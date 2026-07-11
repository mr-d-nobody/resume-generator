import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return <div className="flex min-h-[65vh] items-center justify-center bg-slate-50 px-4 text-center dark:bg-gray-900"><div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">404</p><h1 className="mt-3 text-4xl font-bold text-slate-950 dark:text-white">Page not found</h1><p className="mx-auto mt-4 max-w-lg text-slate-600 dark:text-gray-300">The address may be outdated or mistyped. Your saved resume has not been changed.</p><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><Link to="/" className="btn-primary">Return home</Link><Link to="/builder" className="btn-secondary">Open resume editor</Link><Link to="/help" className="btn-secondary">Get help</Link></div></div></div>;
}
