// API Configuration utility
// In production (Vercel), set NEXT_PUBLIC_API_URL to https://farmmate-bsz6.onrender.com
// In development, set NEXT_PUBLIC_API_URL to http://localhost:5000

export const RENDER_URL = 'https://farmmate-bsz6.onrender.com';
export const LOCAL_URL = 'http://localhost:5000';

export const getApiBaseUrl = () => {
  // Use the explicit full API URL from environment variable
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) return apiUrl.replace(/\/$/, '');

  // In production/Vercel environment, default to Render URL
  if (typeof window !== 'undefined') {
    // Client-side check: if the host is not localhost, use Render URL
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return RENDER_URL;
    }
  }
  
  // Check for Vercel environment
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
    return RENDER_URL;
  }
  
  // Check for preview/deployment branches on Vercel
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' || process.env.VERCEL_ENV === 'preview') {
    return RENDER_URL;
  }

  // Fallback for local development
  return LOCAL_URL;
};

export const getApiUrl = (endpoint) => {
  const base = getApiBaseUrl().replace(/\/$/, '');
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}/api${path}`;
};

export const getErrorMessage = () => {
  const base = getApiBaseUrl();
  return `Unable to connect to server. Please make sure the backend server is running on ${base}`;
};

// Helper to get base URL without /api (for image paths etc.)
export const getBaseUrl = () => {
  return getApiBaseUrl();
};

// Export a helper to create fetch options with defaults
export const createFetchOptions = (options = {}) => {
  return {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };
};