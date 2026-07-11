import React from 'react';
import InfoPage from '../components/layout/InfoPage';

export default function Privacy() {
  return <InfoPage eyebrow="Legal" title="Privacy" intro="This page explains what ResumeBuilder stores and where resume information is sent.">
    <section><h2 className="text-xl font-semibold text-slate-950 dark:text-white">Information stored</h2><p className="mt-2">Your account email, hashed password, session, and current saved resume are stored by the application backend. A device-local copy and pre-import backup may also be stored in your browser so interrupted requests do not erase your work.</p></section>
    <section><h2 className="text-xl font-semibold text-slate-950 dark:text-white">AI upload</h2><p className="mt-2">When you choose Magic Upload and confirm import, PDF text is extracted in your browser and sent to the configured Gemini API for structuring. Do not use Magic Upload if you do not want resume text sent to that provider; manual entry remains available.</p></section>
    <section><h2 className="text-xl font-semibold text-slate-950 dark:text-white">Job search and export</h2><p className="mt-2">Job searches contact the providers named in the results and may expose search terms and network metadata to them. PDF generation may occur on the application server or locally in your browser.</p></section>
    <section><h2 className="text-xl font-semibold text-slate-950 dark:text-white">Your controls</h2><p className="mt-2">Account settings lets you download your stored data, delete the saved resume, or permanently delete the account. Deleting the account also deletes its saved resume.</p></section>
  </InfoPage>;
}
