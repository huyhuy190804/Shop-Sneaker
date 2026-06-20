const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

/**
 * Get token from localStorage (try multiple keys)
 */
const getToken = () => {
  return (
    localStorage.getItem("accessToken") || localStorage.getItem("token") || ""
  );
};

/**
 * Handle 401 Unauthorized error
 */
const handle401Error = () => {
  // Clear all auth-related data
  localStorage.removeItem("token");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  localStorage.removeItem("refreshToken");

  // Redirect to login
  window.location.href = "/login";
};

/**
 * Shared request function for all API calls
 * @param {string} path - API endpoint path (e.g., "/products")
 * @param {object} options - Fetch options
 * @returns {Promise} - Response data
 */
export const request = async (path, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  // Add authorization token if available
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  // Handle 401 Unauthorized
  if (response.status === 401) {
    handle401Error();
    throw new Error("Unauthorized - redirecting to login");
  }

  // Handle other errors
  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
};

/**
 * Get authorization headers (for cases where headers are needed separately)
 */
export const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Persist authentication session
 */
export const persistAuthSession = (payload = {}) => {
  const token = payload.accessToken || payload.token || payload.jwt || "";
  const user = payload.user || payload.profile || null;

  if (token) {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("token", token);
  }

  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  }

  return { token, user };
};
