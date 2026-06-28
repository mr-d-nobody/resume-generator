import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  MapPin,
  RotateCcw,
  Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useResume } from '../contexts/ResumeContext';

const JOB_TYPES = ['', 'Full-time', 'Part-time', 'Internship', 'Contract'];
const JOBS_PER_PAGE = 8;
const DIRECT_SOURCE_NAMES = ['Remotive', 'Jobicy', 'Himalayas', 'Arbeitnow', 'Jooble', 'Adzuna'];
const LEVER_COMPANY_SLUGS = ['gohighlevel'];
const GREENHOUSE_BOARDS = [
  { token: 'figma', company: 'Figma' },
  { token: 'discord', company: 'Discord' },
  { token: 'reddit', company: 'Reddit' },
  { token: 'duolingo', company: 'Duolingo' }
];

function cleanText(value = '') {
  const html = String(value);

  // API descriptions come as HTML, so convert them into readable plain text for cards.
  if (typeof window !== 'undefined' && window.DOMParser) {
    const parsed = new window.DOMParser().parseFromString(html, 'text/html');
    const firstPass = parsed.body.textContent.replace(/\s+/g, ' ').trim();

    // Some APIs send HTML that is encoded inside HTML. Decode one extra pass.
    if (firstPass.includes('<') && firstPass.includes('>')) {
      const decoded = new window.DOMParser().parseFromString(firstPass, 'text/html');
      return decoded.body.textContent.replace(/\s+/g, ' ').trim();
    }

    return firstPass;
  }

  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function shortText(value, maxLength = 220) {
  const text = cleanText(value);
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}...` : text;
}

function normalizeJobType(value) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const normalized = String(rawValue || '').replace(/[_-]/g, ' ').trim().toLowerCase();

  if (normalized.includes('part')) return 'Part-time';
  if (normalized.includes('intern')) return 'Internship';
  if (normalized.includes('contract') || normalized.includes('freelance')) return 'Contract';
  if (normalized.includes('full')) return 'Full-time';
  return rawValue || 'Not specified';
}

function inferJobTypeFromText(value) {
  const text = String(value || '').toLowerCase();

  if (text.includes('part-time') || text.includes('part time')) return 'Part-time';
  if (text.includes('internship') || text.includes('intern ')) return 'Internship';
  if (text.includes('contract')) return 'Contract';
  if (text.includes('full-time') || text.includes('full time')) return 'Full-time';
  return 'Not specified';
}

function isRemoteJob(...values) {
  return values.some((value) => String(value || '').toLowerCase().includes('remote'));
}

function splitSkills(value = '') {
  return value
    .split(',')
    .map((skill) => skill.trim().toLowerCase())
    .filter(Boolean);
}

function extractPrimaryJobRole(title = '') {
  const cleanTitle = String(title).trim();
  if (!cleanTitle) return '';

  // Resumes often store several target roles together. Use the first readable role.
  const [firstRole] = cleanTitle
    .split(/\s*(?:[\u2022|,;]|\n|\r|\s+-\s+|\s+\/\s+)\s*/)
    .map((role) => role.trim())
    .filter(Boolean);

  return firstRole || cleanTitle;
}

function inferAdzunaCountry(location = '') {
  const normalized = location.toLowerCase();

  if (normalized.includes('india')) return 'in';
  if (normalized.includes('united kingdom') || normalized.includes('uk') || normalized.includes('england')) return 'gb';
  if (normalized.includes('canada')) return 'ca';
  if (normalized.includes('australia')) return 'au';
  if (normalized.includes('germany')) return 'de';
  if (normalized.includes('france')) return 'fr';
  if (normalized.includes('united states') || normalized.includes('usa') || normalized.includes('us')) return 'us';
  return '';
}

function normalizeRemotiveJob(job) {
  return {
    id: `remotive-${job.id}`,
    source: 'Remotive',
    title: job.title || 'Untitled role',
    company: job.company_name || 'Unknown company',
    location: job.candidate_required_location || 'Remote',
    jobType: normalizeJobType(job.job_type),
    tags: Array.isArray(job.tags) ? job.tags.slice(0, 8) : [],
    description: shortText(job.description),
    applyUrl: job.url,
    remote: true
  };
}

function normalizeJobicyJob(job) {
  return {
    id: `jobicy-${job.id || job.jobSlug}`,
    source: 'Jobicy',
    title: job.jobTitle || 'Untitled role',
    company: job.companyName || 'Unknown company',
    location: job.jobGeo || 'Remote',
    jobType: normalizeJobType(job.jobType),
    tags: [...(job.jobIndustry || []), job.jobLevel].filter(Boolean).slice(0, 8),
    description: shortText(job.jobExcerpt || job.jobDescription),
    applyUrl: job.url,
    remote: true
  };
}

function normalizeHimalayasJob(job) {
  const locations = Array.isArray(job.locationRestrictions) && job.locationRestrictions.length > 0
    ? job.locationRestrictions.join(', ')
    : 'Remote';

  return {
    id: `himalayas-${job.guid || job.applicationLink || job.title}`,
    source: 'Himalayas',
    title: job.title || 'Untitled role',
    company: job.companyName || 'Unknown company',
    location: locations,
    jobType: normalizeJobType(job.employmentType),
    tags: [...(job.categories || []), ...(job.seniority || [])].slice(0, 8),
    description: shortText(job.excerpt || job.description),
    applyUrl: job.applicationLink || job.guid,
    remote: true
  };
}

function normalizeArbeitnowJob(job) {
  return {
    id: `arbeitnow-${job.slug}`,
    source: 'Arbeitnow',
    title: job.title || 'Untitled role',
    company: job.company_name || 'Unknown company',
    location: job.location || 'Not specified',
    jobType: normalizeJobType(job.job_types),
    tags: Array.isArray(job.tags) ? job.tags.slice(0, 8) : [],
    description: shortText(job.description),
    applyUrl: job.url,
    remote: Boolean(job.remote)
  };
}

function normalizeLeverJob(job, companySlug) {
  const category = job.categories || {};
  const location = category.location || category.allLocations?.join(', ') || job.country || 'Not specified';
  const description = job.descriptionPlain || job.openingPlain || job.description || job.opening;

  return {
    id: `lever-${job.id}`,
    source: 'Lever',
    title: job.text || 'Untitled role',
    company: companySlug,
    location,
    jobType: normalizeJobType(category.commitment),
    tags: [category.department, category.team, job.workplaceType].filter(Boolean).slice(0, 8),
    description: shortText(description),
    applyUrl: job.hostedUrl || job.applyUrl,
    remote: isRemoteJob(job.workplaceType, location, job.additionalPlain, description)
  };
}

function normalizeGreenhouseJob(job, companyName) {
  const departmentNames = Array.isArray(job.departments)
    ? job.departments.map((department) => department.name).filter(Boolean)
    : [];
  const location = job.location?.name || 'Not specified';
  const description = cleanText(job.content);

  return {
    id: `greenhouse-${job.id}`,
    source: 'Greenhouse',
    title: job.title || 'Untitled role',
    company: job.company_name || companyName,
    location,
    jobType: inferJobTypeFromText(description),
    tags: departmentNames.slice(0, 8),
    description: shortText(description),
    applyUrl: job.absolute_url,
    remote: isRemoteJob(location, description)
  };
}

function normalizeJoobleJob(job) {
  const description = job.snippet || job.description;

  return {
    id: `jooble-${job.id || job.link || job.title}`,
    source: 'Jooble',
    title: job.title || 'Untitled role',
    company: job.company || 'Unknown company',
    location: job.location || 'Not specified',
    jobType: normalizeJobType(job.type || description),
    tags: [job.source, job.salary].filter(Boolean).slice(0, 8),
    description: shortText(description),
    applyUrl: job.link,
    remote: isRemoteJob(job.location, job.title, description)
  };
}

function normalizeAdzunaJob(job) {
  const location = job.location?.display_name || 'Not specified';
  const company = job.company?.display_name || 'Unknown company';
  const typeText = [job.contract_time, job.contract_type].filter(Boolean).join(' ');

  return {
    id: `adzuna-${job.id}`,
    source: 'Adzuna',
    title: job.title || 'Untitled role',
    company,
    location,
    jobType: normalizeJobType(typeText),
    tags: [job.category?.label, job.contract_type].filter(Boolean).slice(0, 8),
    description: shortText(job.description),
    applyUrl: job.redirect_url,
    remote: isRemoteJob(location, job.title, job.description)
  };
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json();
}

function makeSettledSource(name, promise) {
  return promise.then((jobs) => ({ name, jobs }));
}

async function fetchLeverJobs() {
  const results = await Promise.allSettled(
    LEVER_COMPANY_SLUGS.map((companySlug) =>
      fetchJson(`https://api.lever.co/v0/postings/${companySlug}?mode=json`)
        .then((jobs) => (jobs || []).map((job) => normalizeLeverJob(job, companySlug)))
    )
  );

  return results
    .filter((result) => result.status === 'fulfilled')
    .flatMap((result) => result.value);
}

async function fetchGreenhouseJobs() {
  const results = await Promise.allSettled(
    GREENHOUSE_BOARDS.map((board) =>
      fetchJson(`https://boards-api.greenhouse.io/v1/boards/${board.token}/jobs?content=true`)
        .then((response) => (response.jobs || []).map((job) => normalizeGreenhouseJob(job, board.company)))
    )
  );

  return results
    .filter((result) => result.status === 'fulfilled')
    .flatMap((result) => result.value);
}

async function fetchJobs(filters) {
  const keyword = filters.keyword.trim();
  const location = filters.location.trim();
  const skills = splitSkills(filters.skills);
  const primaryTag = skills[0] || keyword.split(/\s+/)[0] || '';

  const remotiveParams = new URLSearchParams();
  if (keyword) remotiveParams.set('search', keyword);
  const remotiveUrl = `https://remotive.com/api/remote-jobs${remotiveParams.toString() ? `?${remotiveParams}` : ''}`;

  const jobicyParams = new URLSearchParams({ count: '50' });
  if (location) jobicyParams.set('geo', location);
  if (primaryTag) jobicyParams.set('tag', primaryTag);
  const jobicyUrl = `https://jobicy.com/api/v2/remote-jobs?${jobicyParams}`;

  const himalayasParams = new URLSearchParams({ limit: '50' });
  if (keyword) himalayasParams.set('q', keyword);
  const himalayasUrl = `/api/himalayas-jobs?${himalayasParams}`;

  const credentialedParams = new URLSearchParams();
  if (keyword) credentialedParams.set('keywords', keyword);
  if (location) credentialedParams.set('location', location);
  const adzunaCountry = inferAdzunaCountry(location);
  if (adzunaCountry) credentialedParams.set('country', adzunaCountry);

  const sourceRequests = [
    makeSettledSource('Remotive', fetchJson(remotiveUrl).then((data) => (data.jobs || []).map(normalizeRemotiveJob))),
    makeSettledSource('Jobicy', fetchJson(jobicyUrl).then((data) => (data.jobs || []).map(normalizeJobicyJob))),
    makeSettledSource('Himalayas', fetchJson(himalayasUrl).then((data) => (data.jobs || []).map(normalizeHimalayasJob))),
    makeSettledSource('Arbeitnow', fetchJson('https://www.arbeitnow.com/api/job-board-api').then((data) => (data.data || []).map(normalizeArbeitnowJob))),
    makeSettledSource('Jooble', fetchJson(`/api/jooble-jobs?${credentialedParams}`).then((data) => (data.jobs || []).map(normalizeJoobleJob))),
    makeSettledSource('Adzuna', fetchJson(`/api/adzuna-jobs?${credentialedParams}`).then((data) => (data.results || []).map(normalizeAdzunaJob))),
    makeSettledSource('Lever', fetchLeverJobs()),
    makeSettledSource('Greenhouse', fetchGreenhouseJobs())
  ];

  const results = await Promise.allSettled(sourceRequests);

  const jobs = [];
  const failedSources = [];

  results.forEach((result, index) => {
    const sourceName = [...DIRECT_SOURCE_NAMES, 'Lever', 'Greenhouse'][index];
    if (result.status === 'fulfilled') {
      jobs.push(...result.value.jobs);
    } else {
      failedSources.push(sourceName);
    }
  });

  if (failedSources.length === sourceRequests.length) {
    throw new Error('All job sources are unavailable right now. Please try again.');
  }

  return { jobs, failedSources };
}

function jobMatchesFilters(job, filters) {
  const keyword = filters.keyword.trim().toLowerCase();
  const location = filters.location.trim().toLowerCase();
  const selectedType = filters.jobType.trim().toLowerCase();
  const requiredSkills = splitSkills(filters.skills);
  const searchableText = [
    job.title,
    job.company,
    job.location,
    job.jobType,
    job.description,
    ...job.tags
  ].join(' ').toLowerCase();

  const matchesKeyword = !keyword || searchableText.includes(keyword);
  const matchesLocation = !location || job.location.toLowerCase().includes(location);
  const matchesRemote = !filters.remoteOnly || job.remote || searchableText.includes('remote');
  const matchesType = !selectedType || job.jobType.toLowerCase() === selectedType;
  const matchesSkills = requiredSkills.length === 0 || requiredSkills.some((skill) => searchableText.includes(skill));

  return matchesKeyword && matchesLocation && matchesRemote && matchesType && matchesSkills;
}

function buildPageNumbers(currentPage, totalPages) {
  const visiblePageCount = 5;
  const halfWindow = Math.floor(visiblePageCount / 2);
  let startPage = Math.max(1, currentPage - halfWindow);
  const endPage = Math.min(totalPages, startPage + visiblePageCount - 1);

  startPage = Math.max(1, endPage - visiblePageCount + 1);

  return Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index
  );
}

export default function FindJobs() {
  const { resumeData } = useResume();
  const { user } = useAuth();
  const canViewSourceDiagnostics = String(user?.id || '') === '3';
  const defaultFilters = useMemo(() => ({
    keyword: extractPrimaryJobRole(resumeData?.personalInfo?.title),
    location: '',
    remoteOnly: true,
    jobType: '',
    skills: ''
  }), [resumeData?.personalInfo?.title]);

  const [filters, setFilters] = useState(defaultFilters);
  const [jobs, setJobs] = useState([]);
  const [failedSources, setFailedSources] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const visibleJobs = useMemo(
    () => jobs.filter((job) => jobMatchesFilters(job, filters)),
    [jobs, filters]
  );
  const totalPages = Math.max(1, Math.ceil(visibleJobs.length / JOBS_PER_PAGE));
  const activePage = Math.min(currentPage, totalPages);
  const pageStartIndex = (activePage - 1) * JOBS_PER_PAGE;
  const paginatedJobs = useMemo(
    () => visibleJobs.slice(pageStartIndex, pageStartIndex + JOBS_PER_PAGE),
    [visibleJobs, pageStartIndex]
  );
  const pageNumbers = useMemo(
    () => buildPageNumbers(activePage, totalPages),
    [activePage, totalPages]
  );
  const visibleStart = visibleJobs.length === 0 ? 0 : pageStartIndex + 1;
  const visibleEnd = Math.min(pageStartIndex + JOBS_PER_PAGE, visibleJobs.length);

  const updateFilter = (event) => {
    const { name, type, checked, value } = event.target;
    setFilters((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const loadJobs = async (event) => {
    event?.preventDefault();
    setStatus('loading');
    setError('');
    setFailedSources([]);

    try {
      const result = await fetchJobs(filters);
      setJobs(result.jobs);
      setFailedSources(result.failedSources);
      setCurrentPage(1);
      setStatus('success');
    } catch (fetchError) {
      setJobs([]);
      setError(fetchError.message || 'Unable to fetch jobs right now.');
      setStatus('error');
    }
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    setCurrentPage(1);
  };

  useEffect(() => {
    setFilters(defaultFilters);
  }, [defaultFilters]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, jobs]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  useEffect(() => {
    loadJobs();
    // The first search should use the resume-powered defaults once the page opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 dark:bg-gray-900 sm:py-10">
      <div className="mx-auto max-w-7xl px-3 min-[390px]:px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Find Jobs</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-950 dark:text-white min-[390px]:text-3xl">Jobs matched to your resume</h1>
            <p className="mt-2 max-w-2xl text-gray-600 dark:text-gray-400">
              Search remote and on-site roles from trusted job boards, then refine them here.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            <BriefcaseBusiness className="h-4 w-4 text-blue-600" />
            {status === 'success' ? `${visibleJobs.length} matching jobs` : 'Live job search'}
          </div>
        </div>

        <form onSubmit={loadJobs} className="card mb-8 p-4 min-[390px]:p-5 sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_0.8fr]">
            <div>
              <label htmlFor="job-keyword" className="form-label">Job role / keyword</label>
              <input
                id="job-keyword"
                name="keyword"
                value={filters.keyword}
                onChange={updateFilter}
                className="form-input"
                placeholder="e.g. Full Stack Developer"
              />
            </div>
            <div>
              <label htmlFor="job-location" className="form-label">Location</label>
              <input
                id="job-location"
                name="location"
                value={filters.location}
                onChange={updateFilter}
                className="form-input"
                placeholder="e.g. India, USA, Europe"
              />
            </div>
            <div>
              <label htmlFor="job-type" className="form-label">Job type</label>
              <select id="job-type" name="jobType" value={filters.jobType} onChange={updateFilter} className="form-select">
                {JOB_TYPES.map((type) => (
                  <option key={type || 'all'} value={type}>{type || 'Any type'}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <label htmlFor="job-skills" className="form-label">Skills</label>
              <input
                id="job-skills"
                name="skills"
                value={filters.skills}
                onChange={updateFilter}
                className="form-input"
                placeholder="React, Python, AWS"
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                <input
                  type="checkbox"
                  name="remoteOnly"
                  checked={filters.remoteOnly}
                  onChange={updateFilter}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Remote
              </label>
              <button type="button" onClick={resetFilters} className="btn-secondary inline-flex w-full items-center justify-center gap-2 sm:w-auto">
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
              <button type="submit" disabled={status === 'loading'} className="btn-primary inline-flex w-full items-center justify-center gap-2 disabled:opacity-70 sm:w-auto">
                {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Search Jobs
              </button>
            </div>
          </div>
        </form>

        {status === 'loading' && (
          <div className="card flex items-center justify-center gap-3 p-10 text-blue-600 dark:text-blue-400">
            <Loader2 className="h-6 w-6 animate-spin" />
            Finding jobs for you...
          </div>
        )}

        {status === 'error' && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5" />
              <div>
                <h2 className="font-semibold">Could not load jobs</h2>
                <p className="mt-1 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {canViewSourceDiagnostics && status === 'success' && failedSources.length > 0 && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
            Source check for user 3: {failedSources.join(', ')} did not respond.
          </div>
        )}

        {status === 'success' && visibleJobs.length === 0 && (
          <div className="card p-10 text-center">
            <BriefcaseBusiness className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-4 text-xl font-semibold text-gray-950 dark:text-white">No jobs found</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
              Try a broader keyword, fewer skills, or a wider location.
            </p>
          </div>
        )}

        {status === 'success' && visibleJobs.length > 0 && (
          <>
            <div className="mb-4 flex flex-col gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Showing {visibleStart}-{visibleEnd} of {visibleJobs.length} jobs
              </p>
              <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={activePage === 1}
                  className="inline-flex min-h-9 flex-1 items-center justify-center gap-1 rounded-lg border border-gray-200 px-3 text-sm font-semibold text-gray-700 transition hover:border-blue-300 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-45 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-500 dark:hover:text-blue-300 min-[390px]:flex-none"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                {pageNumbers.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setCurrentPage(pageNumber)}
                    aria-current={activePage === pageNumber ? 'page' : undefined}
                    className={`min-h-9 min-w-9 rounded-lg px-3 text-sm font-semibold transition ${
                      activePage === pageNumber
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/25'
                        : 'border border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-600 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-500 dark:hover:text-blue-300'
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={activePage === totalPages}
                  className="inline-flex min-h-9 flex-1 items-center justify-center gap-1 rounded-lg border border-gray-200 px-3 text-sm font-semibold text-gray-700 transition hover:border-blue-300 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-45 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-500 dark:hover:text-blue-300 min-[390px]:flex-none"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              {paginatedJobs.map((job) => (
                <article key={job.id} className="card flex flex-col p-4 min-[390px]:p-5 sm:p-6">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                      {job.source}
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                      {job.jobType}
                    </span>
                  </div>

                  <h2 className="mobile-safe-text text-lg font-semibold text-gray-950 dark:text-white min-[390px]:text-xl">{job.title}</h2>
                  <p className="mt-1 font-medium text-gray-700 dark:text-gray-300">{job.company}</p>

                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    {job.location}
                  </div>

                  {job.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {job.tags.map((tag) => (
                        <span key={`${job.id}-${tag}`} className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-900 dark:text-gray-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="mt-4 flex-1 text-sm leading-6 text-gray-600 dark:text-gray-400">{job.description || 'Open the original post to read the full job description.'}</p>

                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary mt-5 inline-flex w-full items-center justify-center gap-2 sm:w-auto"
                  >
                    Apply Now
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
