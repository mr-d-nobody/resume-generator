import test from 'node:test';
import assert from 'node:assert/strict';
import { PHOTO_LIMITS, validatePhotoFileMeta } from './imageUpload.js';

test('rejects unsupported, oversized, and unsafe photo metadata', () => {
  assert.match(validatePhotoFileMeta({ type: 'image/svg+xml', size: 100 }), /JPEG/);
  assert.match(validatePhotoFileMeta({ type: 'image/jpeg', size: PHOTO_LIMITS.maxBytes + 1 }), /5MB/);
  assert.match(validatePhotoFileMeta({ type: 'image/jpeg', size: 100, width: 20000, height: 20000 }), /dimensions/);
});

test('accepts normal photo metadata', () => {
  assert.equal(validatePhotoFileMeta({ type: 'image/webp', size: 200000, width: 1200, height: 800 }), '');
});
