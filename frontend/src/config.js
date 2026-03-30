// Production-ready API Configuration
// Use VITE_API_BASE_URL from .env file, or fallback to localhost during dev
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Export API_URL for backward compatibility across the app
export const API_URL = API_BASE_URL;
