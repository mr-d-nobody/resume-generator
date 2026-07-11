import React from 'react';
import { Link } from 'react-router-dom';
import InfoPage from '../components/layout/InfoPage';

export default function Help() {
  return <InfoPage eyebrow="Support" title="Help" intro="Practical recovery steps for the resume workflow.">
    <section><h2 className="text-xl font-semibold text-slate-950 dark:text-white">Upload did not work</h2><p className="mt-2">Use a text-based PDF no larger than 5MB. Scanned image-only PDFs cannot currently be read. Continue in <Link to="/builder" className="font-semibold text-blue-600">manual entry</Link>; your pre-import backup remains available on the upload page.</p></section>
    <section><h2 className="text-xl font-semibold text-slate-950 dark:text-white">Resume will not save or export</h2><p className="mt-2">Return to the editor and correct the listed validation issues. Invalid drafts remain on your device, but cloud save and PDF export wait until required details are valid.</p></section>
    <section><h2 className="text-xl font-semibold text-slate-950 dark:text-white">Jobs are unavailable</h2><p className="mt-2">Use Retry. Partial-result notices identify providers that failed; a complete outage is shown separately from a valid empty search.</p></section>
    <section><h2 className="text-xl font-semibold text-slate-950 dark:text-white">Protect your work</h2><p className="mt-2">Download the PDF and periodically use Download my data in Account settings. Browser storage is a recovery aid, not a permanent backup.</p></section>
  </InfoPage>;
}
