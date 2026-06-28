function getCookie(name) {
  const prefix = `${name}=`;
  const cookie = document.cookie
    .split(';')
    .map(value => value.trim())
    .find(value => value.startsWith(prefix));
  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : '';
}

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const fallbackMessage = response.status === 404
      ? 'Authentication service is not available. Restart the Django backend and try again.'
      : response.status >= 500
        ? 'The authentication service is temporarily unavailable. Please try again.'
        : 'Something went wrong. Please try again.';
    const error = new Error(data.error || fallbackMessage);
    error.status = response.status;
    error.fieldErrors = data.fieldErrors || {};
    error.data = data;
    throw error;
  }
  return data;
}

export async function ensureCsrfCookie() {
  try {
    const response = await fetch('/api/auth/csrf', {
      credentials: 'include'
    });
    return parseResponse(response);
  } catch (error) {
    if (error.status) throw error;
    throw new Error('Cannot connect to the authentication service. Make sure the Django backend is running on port 8000.');
  }
}

export async function authRequest(path, options = {}) {
  const method = options.method || 'GET';
  const headers = { ...(options.headers || {}) };

  if (!['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase())) {
    if (!getCookie('csrftoken')) {
      await ensureCsrfCookie();
    }
    headers['X-CSRFToken'] = getCookie('csrftoken');
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(path, {
      ...options,
      method,
      headers,
      credentials: 'include'
    });
    return parseResponse(response);
  } catch (error) {
    if (error.status) throw error;
    throw new Error('Cannot connect to the authentication service. Make sure the Django backend is running on port 8000.');
  }
}

export function getSafeNextPath(value, fallback = '/') {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')
    ? value
    : fallback;
}
