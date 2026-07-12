import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
let googleScriptPromise;

function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  if (googleScriptPromise) return googleScriptPromise;

  googleScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.google), { once: true });
      existingScript.addEventListener('error', reject, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return googleScriptPromise;
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path fill="#4285F4" d="M21.6 12.23c0-.72-.06-1.42-.18-2.09H12v3.96h5.38a4.6 4.6 0 0 1-1.99 3.02v2.51h3.22c1.89-1.74 2.99-4.3 2.99-7.4Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.37l-3.22-2.51c-.9.6-2.04.96-3.4.96-2.61 0-4.83-1.76-5.63-4.13H3.04v2.59A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.37 13.95a6 6 0 0 1 0-3.9V7.46H3.04a10 10 0 0 0 0 9.08l3.33-2.59Z" />
      <path fill="#EA4335" d="M12 5.92c1.47 0 2.79.5 3.83 1.49l2.87-2.87C16.96 2.96 14.7 2 12 2a10 10 0 0 0-8.96 5.46l3.33 2.59C7.17 7.68 9.39 5.92 12 5.92Z" />
    </svg>
  );
}

export default function GoogleAuthButton({ onSuccess, onError, text = 'continue_with' }) {
  const { loginWithGoogle } = useAuth();
  const buttonRef = useRef(null);
  const [isLoading, setIsLoading] = useState(Boolean(googleClientId));

  const handleCredential = useCallback(async (response) => {
    setIsLoading(true);
    try {
      await loginWithGoogle(response.credential);
      onSuccess?.();
    } catch (error) {
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [loginWithGoogle, onError, onSuccess]);

  useEffect(() => {
    if (!googleClientId) return undefined;
    let isMounted = true;

    loadGoogleScript()
      .then(google => {
        if (!isMounted || !buttonRef.current) return;
        google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleCredential
        });
        buttonRef.current.innerHTML = '';
        google.accounts.id.renderButton(buttonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text,
          shape: 'rectangular',
          width: Math.min(buttonRef.current.clientWidth || 400, 400)
        });
        setIsLoading(false);
      })
      .catch(() => {
        if (isMounted) {
          setIsLoading(false);
          onError?.(new Error('Google sign-in could not load. Please try again or use email and password.'));
        }
      });

    return () => { isMounted = false; };
  }, [handleCredential, onError, text]);

  if (!googleClientId) {
    return (
      <button
        type="button"
        onClick={() => onError?.(new Error('Google sign-in is not configured yet. Add VITE_GOOGLE_CLIENT_ID to enable it.'))}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
      >
        <GoogleMark />
        {text === 'signup_with' ? 'Sign up with Google' : 'Continue with Google'}
      </button>
    );
  }

  return (
    <div className="relative flex min-h-11 w-full items-center justify-center" ref={buttonRef}>
      {isLoading && <Loader2 className="absolute h-5 w-5 animate-spin text-blue-600" />}
    </div>
  );
}
