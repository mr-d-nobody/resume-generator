import React from 'react';

export default function InfoPage({ eyebrow, title, intro, children }) {
  return <div className="bg-slate-50 py-12 dark:bg-gray-900 sm:py-16"><article className="mx-auto max-w-3xl px-4 sm:px-6"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">{eyebrow}</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">{title}</h1><p className="mt-4 text-lg leading-8 text-slate-600 dark:text-gray-300">{intro}</p><div className="mt-8 space-y-7 text-sm leading-7 text-slate-700 dark:text-gray-300">{children}</div></article></div>;
}
