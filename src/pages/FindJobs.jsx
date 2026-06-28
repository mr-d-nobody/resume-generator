import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, BriefcaseBusiness, ExternalLink, Loader2, MapPin, RotateCcw, Search } from 'lucide-react';
import { useResume } from '../contexts/ResumeContext';

const JOB_TYPES = ['', 'Full-time', 'Part-time', 'Internship', 'Contract'];

function cleanText(value = '') {
  const html = String(value);

  // API descriptions come as HTML, so convert them into readable plain text for cards.
  if (typeof window !== 'undefined' && window.DOMParser) {
    const parsed = new window.DOMParser().parseFromString(html, 'text/html');
    return parsed.body.textContent.replace(/\s+/g, ' ').trim();
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

function extractSkillNames(skills = []) {
  return skills
    .map((skill) => (typeof skill === 'string' ? skill : skill?.name))
    .filter(Boolean)
    .slice(0, 8);
}

function splitSkills(value = '') {
  return value
    .split(',')
    .map((skill) => skill.trim().toLowerCase())
    .filter(Boolean);
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

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json();
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

  const [remotiveResult, jobicyResult] = await Promise.allSettled([
    fetchJson(remotiveUrl),
    fetchJson(jobicyUrl)
  ]);

  const jobs = [];
  const failedSources = [];

  if (remotiveResult.status === 'fulfilled') {
    jobs.push(...(remotiveResult.value.jobs || []).map(normalizeRemotiveJob));
  } else {
    failedSources.push('Remotive');
  }

  if (jobicyResult.status === 'fulfilled') {
    jobs.push(...(jobicyResult.value.jobs || []).map(normalizeJobicyJob));
  } else {
    failedSources.push('Jobicy');
  }

  if (failedSources.length === 2) {
    throw new Error('Both job sources are unavailable right now. Please try again.');
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

export default function FindJobs() {
  const { resumeData } = useResume();
  const resumeSkills = useMemo(() => extractSkillNames(resumeData?.skills), [resumeData?.skills]);
  const defaultFilters = useMemo(() => ({
    keyword: resumeData?.personalInfo?.title || '',
    location: '',
    remoteOnly: true,
    jobType: '',
    skills: resumeSkills.join(', ')
  }), [resumeData?.personalInfo?.title, resumeSkills]);

  const [filters, setFilters] = useState(defaultFilters);
  const [jobs, setJobs] = useState([]);
  const [failedSources, setFailedSources] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const visibleJobs = useMemo(
    () => jobs.filter((job) => jobMatchesFilters(job, filters)),
    [jobs, filters]
  );

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
      setStatus('success');
    } catch (fetchError) {
      setJobs([]);
      setError(fetchError.message || 'Unable to fetch jobs right now.');
      setStatus('error');
    }
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  useEffect(() => {
    setFilters(defaultFilters);
  }, [defaultFilters]);

  useEffect(() => {
    loadJobs();
    // The first search should use the resume-powered defaults once the page opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-10 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Find Jobs</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950 dark:text-white">Remote roles matched to your resume</h1>
            <p className="mt-2 max-w-2xl text-gray-600 dark:text-gray-400">
              Search live roles from Remotive and Jobicy, then refine them with filters on this page.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            <BriefcaseBusiness className="h-4 w-4 text-blue-600" />
            {status === 'success' ? `${visibleJobs.length} matching jobs` : 'Live job search'}
          </div>
        </div>

        <form onSubmit={loadJobs} className="card mb-8 p-5 sm:p-6">
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
              <button type="button" onClick={resetFilters} className="btn-secondary inline-flex items-center justify-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
              <button type="submit" disabled={status === 'loading'} className="btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-70">
                {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Search Jobs
              </button>
            </div>
          </div>
        </form>

        {status === 'loading' && (
          <div className="card flex items-center justify-center gap-3 p-10 text-blue-600 dark:text-blue-400">
            <Loader2 className="h-6 w-6 animate-spin" />
            Fetching fresh jobs...
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

        {status === 'success' && failedSources.length > 0 && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
            {failedSources.join(' and ')} could not be reached, so these results are from the remaining source.
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
          <div className="grid gap-5 lg:grid-cols-2">
            {visibleJobs.map((job) => (
              <article key={job.id} className="card flex flex-col p-6">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                    {job.source}
                  </span>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                    {job.jobType}
                  </span>
                </div>

                <h2 className="text-xl font-semibold text-gray-950 dark:text-white">{job.title}</h2>
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
        )}
      </div>
    </div>
  );
}
