import test from 'node:test';
import assert from 'node:assert/strict';
import { createJobTrackerEntry, getJobTrackerKey, getJobTrackerStorageKey, JOB_STATUSES } from './jobTracker.js';

const job = {
  id: 'remotive-123',
  source: 'Remotive',
  title: 'Frontend Developer',
  company: 'Example Co',
  applyUrl: 'https://example.com/jobs/123'
};

test('creates a stable tracker key from the job source and id', () => {
  assert.equal(getJobTrackerKey(job), 'Remotive:remotive-123');
});

test('creates a saved job entry with editable tracking fields', () => {
  const entry = createJobTrackerEntry(job);
  assert.equal(entry.status, 'saved');
  assert.equal(entry.note, '');
  assert.equal(entry.deadline, '');
  assert.deepEqual(entry.job, job);
  assert.ok(entry.savedAt);
});

test('exposes the supported application statuses', () => {
  assert.deepEqual(JOB_STATUSES.map(status => status.value), ['saved', 'applied', 'interviewing', 'rejected']);
});

test('scopes browser storage to the signed-in user', () => {
  assert.equal(getJobTrackerStorageKey(42), 'resumeBuilder:jobTracker:v1:user:42');
  assert.equal(getJobTrackerStorageKey(null), null);
});
