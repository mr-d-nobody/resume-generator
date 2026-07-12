export const JOB_TRACKER_STORAGE_KEY = 'resumeBuilder:jobTracker:v1';

export const JOB_STATUSES = [
  { value: 'saved', label: 'Saved' },
  { value: 'applied', label: 'Applied' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'rejected', label: 'Rejected' }
];

export function getJobTrackerKey(job) {
  return `${job.source || 'job'}:${job.id || job.applyUrl || job.title}`;
}

export function createJobTrackerEntry(job, status = 'saved') {
  return {
    job: { ...job },
    status,
    note: '',
    deadline: '',
    savedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function readJobTracker() {
  if (typeof localStorage === 'undefined') return {};

  try {
    const parsed = JSON.parse(localStorage.getItem(JOB_TRACKER_STORAGE_KEY) || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function writeJobTracker(tracker) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(JOB_TRACKER_STORAGE_KEY, JSON.stringify(tracker));
  } catch {
    // Private browsing or storage quotas can make localStorage unavailable.
  }
}
