export const JOB_TRACKER_STORAGE_KEY = 'resumeBuilder:jobTracker:v1';

export function getJobTrackerStorageKey(userId) {
  return userId ? `${JOB_TRACKER_STORAGE_KEY}:user:${userId}` : null;
}

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

export function readJobTracker(userId) {
  const storageKey = getJobTrackerStorageKey(userId);
  if (!storageKey || typeof localStorage === 'undefined') return {};

  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function writeJobTracker(tracker, userId) {
  const storageKey = getJobTrackerStorageKey(userId);
  if (!storageKey || typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(storageKey, JSON.stringify(tracker));
  } catch {
    // Private browsing or storage quotas can make localStorage unavailable.
  }
}
