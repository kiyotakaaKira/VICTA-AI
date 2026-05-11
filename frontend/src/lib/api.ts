import axios from 'axios';

/**
 * Axios instance with the backend base URL pre-configured.
 * Use this in server components or API routes.
 */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Creates an authenticated axios instance by attaching the Clerk JWT.
 * Use this in client components via the useAuth() hook pattern.
 */
export const createAuthenticatedApi = (token: string) => {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  // Response interceptor — unwrap .data from success responses
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const message =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        'An unexpected error occurred.';
      return Promise.reject(new Error(message));
    }
  );

  return instance;
};

export default api;
