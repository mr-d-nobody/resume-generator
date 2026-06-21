import { authRequest } from './authApi';

export function fetchSavedResume() {
  return authRequest('/api/resume');
}

export function saveResume(data, expectedRevision = 0) {
  return authRequest('/api/resume', {
    method: 'PUT',
    body: JSON.stringify({ data, expectedRevision })
  });
}
