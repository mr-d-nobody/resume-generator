function getCookie(name) {
  const prefix = `${name}=`;
  const cookie = document.cookie
    .split(';')
    .map(value => value.trim())
    .find(value => value.startsWith(prefix));
  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : '';
}

export function getCsrfToken() {
  return getCookie('csrftoken');
}

async function fetchWithTimeout(path, options = {}, timeoutMs = 12000) {
  const controller = new AbortController();
  const externalSignal = options.signal;
  const abortFromCaller = () => controller.abort(externalSignal.reason);
  externalSignal?.addEventListener('abort', abortFromCaller, { once: true });
  const timer = setTimeout(() => controller.abort(new DOMException('Request timed out', 'TimeoutError')), timeoutMs);
  try {
    return await fetch(path, { ...options, signal: controller.signal });
  } catch (error) {
    if (!externalSignal?.aborted && controller.signal.aborted) throw new Error('Request timed out. Please try again.');
    throw error;
  } finally {
    clearTimeout(timer);
    externalSignal?.removeEventListener('abort', abortFromCaller);
  }
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
    const response = await fetchWithTimeout('/api/auth/csrf', {
      credentials: 'include'
    });
    return parseResponse(response);
  } catch (error) {
    if (error.status) throw error;
    if (error.message?.startsWith('Request timed out')) throw error;
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
    const response = await fetchWithTimeout(path, {
      ...options,
      method,
      headers,
      credentials: 'include'
    });
    return parseResponse(response);
  } catch (error) {
    if (error.status) throw error;
    if (error.message?.startsWith('Request timed out')) throw error;
    throw new Error('Cannot connect to the authentication service. Make sure the Django backend is running on port 8000.');
  }
}

export function getSafeNextPath(value, fallback = '/') {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')
    ? value
    : fallback;
}
