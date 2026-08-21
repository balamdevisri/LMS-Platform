/**
 * Centralized API configuration and URL builder.
 * Dynamically resolves backend API endpoints in both local development and production domains (e.g. kaizenq.in, www.kaizenq.in).
 */

const getBaseUrl = (): string => {
  const envApiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL;
  if (envApiUrl && envApiUrl.trim()) {
    return envApiUrl.trim();
  }

  // If running in browser and NOT localhost/127.0.0.1, use relative origin with /api
  if (
    typeof window !== 'undefined' &&
    window.location &&
    window.location.hostname &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    return `${window.location.origin}/api`;
  }

  return 'http://localhost:5000/api';
};

const rawBaseUrl = getBaseUrl();

// Strip any trailing slashes
const cleanUrl = rawBaseUrl.replace(/\/+$/, '');

// Ensure /api is preserved or appended if pointing to backend root
export const API_BASE_URL = cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;

/**
 * Builds a clean, fully-qualified API URL without redundant slashes.
 * @param endpoint - Relative or leading-slash path (e.g. '/courses' or 'courses?status=published')
 */
export const buildApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.trim().replace(/^\/+/, '');
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

export default {
  API_BASE_URL,
  buildApiUrl,
};

