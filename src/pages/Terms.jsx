import React from 'react';
import InfoPage from '../components/layout/InfoPage';

export default function Terms() {
  return <InfoPage eyebrow="Legal" title="Terms of use" intro="Use ResumeBuilder as an editing tool and verify every output before applying for a job.">
    <section><h2 className="text-xl font-semibold text-slate-950 dark:text-white">Your responsibility</h2><p className="mt-2">You are responsible for the accuracy and legality of resume content. AI extraction can omit or misclassify information, so review the editor and final PDF carefully.</p></section>
    <section><h2 className="text-xl font-semibold text-slate-950 dark:text-white">Job listings</h2><p className="mt-2">Listings come from independent providers. ResumeBuilder does not employ the listed companies, guarantee that a role is current, or process applications. Verify the destination before sharing personal information.</p></section>
    <section><h2 className="text-xl font-semibold text-slate-950 dark:text-white">Availability</h2><p className="mt-2">The application may be unavailable when hosting or third-party job and AI providers fail. Keep your downloaded resume and use the data-export option for your own backup.</p></section>
  </InfoPage>;
}
