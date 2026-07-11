import React from 'react';
import { Link } from 'react-router-dom';
import InfoPage from '../components/layout/InfoPage';

function HelpItem({ question, children }) {
  return (
    <details className="group rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm open:border-blue-300 dark:border-gray-700 dark:bg-gray-800 dark:open:border-blue-700">
      <summary className="cursor-pointer list-none pr-8 text-base font-semibold text-slate-950 marker:content-none dark:text-white">
        <span className="flex items-start justify-between gap-4">
          {question}
          <span className="select-none text-xl leading-5 text-blue-600 transition-transform group-open:rotate-45" aria-hidden="true">+</span>
        </span>
      </summary>
      <div className="mt-3 border-t border-slate-100 pt-3 text-slate-700 dark:border-gray-700 dark:text-gray-300">
        {children}
      </div>
    </details>
  );
}

export default function Help() {
  return (
    <InfoPage eyebrow="Support" title="Help" intro="Answers and recovery steps for common ResumeBuilder problems.">
      <div className="space-y-3">
        <HelpItem question="Why does the navigation show ‘Complete required fields’ or ‘Fix fields’?">
          <p>Your draft contains a missing or invalid required value, so cloud save and PDF export are paused. Select the warning to open the correct editor section and focus the first field that needs attention. Your draft remains stored on this device while you correct it.</p>
        </HelpItem>

        <HelpItem question="Why did Magic Upload reject my PDF?">
          <p>Use a text-based PDF no larger than 5MB. Password-protected, damaged, and scanned image-only PDFs may not contain readable text. Try another PDF or continue with <Link to="/builder" className="font-semibold text-blue-600">manual entry</Link>.</p>
        </HelpItem>

        <HelpItem question="Will importing a PDF replace my current resume?">
          <p>ResumeBuilder asks for confirmation before replacement and creates a local backup first. Review every extracted section after import because automated parsing can make mistakes. If the import is unsuitable, use the restore option on Magic Upload to recover the pre-import version.</p>
        </HelpItem>

        <HelpItem question="What happens when AI parsing is unavailable or its usage limit is reached?">
          <p>Your existing resume is not erased. Wait before retrying, try a smaller text-based PDF, or use manual entry immediately. Repeated clicks do not bypass temporary request limits.</p>
        </HelpItem>

        <HelpItem question="Is my PDF sent to an AI provider?">
          <p>With Magic Upload, text is extracted from the PDF in your browser and sent to the configured Gemini provider for structuring. If you do not want resume text sent to that provider, use manual entry instead. See the <Link to="/privacy" className="font-semibold text-blue-600">Privacy page</Link> for details.</p>
        </HelpItem>

        <HelpItem question="Can I add a profile photo?">
          <p>No. ResumeBuilder is intentionally a no-photo resume maker, and its templates do not include profile photos. This keeps the editing flow and generated layouts consistent.</p>
        </HelpItem>

        <HelpItem question="Why does the downloaded PDF look slightly different from the preview?">
          <p>Browser font rendering and page breaks can vary slightly during PDF generation. Check the final PDF before applying. If content moves to an extra page, shorten long sections or reduce spacing in Customize, then export again.</p>
        </HelpItem>

        <HelpItem question="Can I continue my resume on another device?">
          <p>Yes, sign in with the same account and wait for the green “Saved” status before switching devices. If a newer cloud version conflicts with local changes, ResumeBuilder asks which version to keep.</p>
        </HelpItem>

        <HelpItem question="Why are no jobs showing?">
          <p>A valid search can genuinely return no matching jobs. If one provider fails, available results still appear with a partial-results notice; if all providers fail, use Retry. Broaden the role or location only when the page reports “No jobs found,” not a provider outage.</p>
        </HelpItem>

        <HelpItem question="I forgot my password. Can I reset it?">
          <p>Self-service password reset is not currently available. If you are still signed in, change the password from <Link to="/account" className="font-semibold text-blue-600">Account settings</Link>. Otherwise, report the access problem through the <Link to="/contact" className="font-semibold text-blue-600">Contact page</Link>; account recovery cannot currently be guaranteed.</p>
        </HelpItem>

        <HelpItem question="How do I protect or download my work?">
          <p>Wait for the green “Saved” status, download the final PDF, and periodically use “Download my data” in Account settings. Browser storage helps recover interrupted work but should not be treated as a permanent backup.</p>
        </HelpItem>

        <HelpItem question="How do I delete my resume or account?">
          <p>Open <Link to="/account" className="font-semibold text-blue-600">Account settings</Link>. “Delete saved resume” removes the cloud resume but keeps the account. “Delete account” permanently removes both the account and its saved resume after confirmation.</p>
        </HelpItem>
      </div>
    </InfoPage>
  );
}
