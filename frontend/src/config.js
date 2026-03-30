export const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000' 
  : ''; // Or another default if needed, but relative paths are also an option if served from same origin

// For Spectrum, based on previous context, we'll use localhost:5000 as default
// but allow it to be easily changed here.
export const API_URL = ''; 
