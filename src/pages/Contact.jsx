import React from 'react';
import InfoPage from '../components/layout/InfoPage';

export default function Contact() {
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL;
  return <InfoPage eyebrow="Support" title="Contact" intro="Contact is handled directly, without a third-party form or tracking service.">
    <section><h2 className="text-xl font-semibold text-slate-950 dark:text-white">Get help</h2>{contactEmail ? <p className="mt-2">Email <a className="font-semibold text-blue-600" href={`mailto:${contactEmail}`}>{contactEmail}</a>. Include the page, what you expected, and the exact error message. Never send your password.</p> : <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">A support email has not been configured yet. The site owner should set <code>VITE_CONTACT_EMAIL</code> to an address they actively monitor before launch.</p>}</section>
    <section><h2 className="text-xl font-semibold text-slate-950 dark:text-white">Privacy requests</h2><p className="mt-2">You can export or delete your data immediately from Account settings. Contact support only if those controls fail.</p></section>
  </InfoPage>;
}
