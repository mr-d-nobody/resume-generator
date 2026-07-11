/* global process */
import test from 'node:test';
import assert from 'node:assert/strict';
import { getAppOrigin, normalizePayload } from './export-pdf.js';

test('PDF rendering requires a fixed allowlisted origin', () => {
  const previousOrigin = process.env.PDF_RENDER_ORIGIN;
  const previousAllowed = process.env.PDF_RENDER_ALLOWED_ORIGINS;
  try {
    process.env.PDF_RENDER_ORIGIN = 'https://resume.example/path';
    process.env.PDF_RENDER_ALLOWED_ORIGINS = 'https://resume.example';
    assert.equal(getAppOrigin(), 'https://resume.example');
    process.env.PDF_RENDER_ALLOWED_ORIGINS = 'https://other.example';
    assert.throws(() => getAppOrigin(), /allowlisted/);
  } finally {
    if (previousOrigin === undefined) delete process.env.PDF_RENDER_ORIGIN; else process.env.PDF_RENDER_ORIGIN = previousOrigin;
    if (previousAllowed === undefined) delete process.env.PDF_RENDER_ALLOWED_ORIGINS; else process.env.PDF_RENDER_ALLOWED_ORIGINS = previousAllowed;
  }
});

test('PDF payload only accepts known template IDs', () => {
  assert.equal(normalizePayload({ templateId: '16' }).selectedTemplate, '16');
  assert.equal(normalizePayload({ templateId: '../../admin' }).selectedTemplate, '12');
});
