/**
 * Centralized API configuration and URL builder.
 * Eliminates double slashes (//) and normalizes backend endpoints regardless of trailing slashes in env variables.
 */

const rawBaseUrl = (import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api').trim();

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
