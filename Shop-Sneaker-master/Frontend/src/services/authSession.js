const AUTH_EXPIRED_EVENT = "auth-session-expired";

export const getStoredToken = () =>
  localStorage.getItem("accessToken") || localStorage.getItem("token") || "";

const decodeBase64UrlJson = (value) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  const json = atob(padded);

  return JSON.parse(json);
};

export const getTokenPayload = (token = getStoredToken()) => {
  const [encodedPayload] = String(token || "").split(".");

  if (!encodedPayload) return null;

  try {
    return decodeBase64UrlJson(encodedPayload);
  } catch {
    return null;
  }
};

export const isTokenExpired = (token = getStoredToken()) => {
  if (!token) return true;

  const payload = getTokenPayload(token);
  if (!payload?.exp) return false;

  return payload.exp <= Math.floor(Date.now() / 1000);
};

export const clearAuthSession = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const redirectToLogin = () => {
  const currentPath = `${window.location.pathname}${window.location.search}`;
  const loginPath = "/login";

  if (window.location.pathname === loginPath) return;

  const redirectParam = currentPath && currentPath !== "/" ? `?redirect=${encodeURIComponent(currentPath)}` : "";
  window.location.replace(`${loginPath}${redirectParam}`);
};

export const ensureValidAuthSession = () => {
  const token = getStoredToken();

  if (!token || isTokenExpired(token)) {
    clearAuthSession();
    return false;
  }

  return true;
};

export const handleUnauthorizedResponse = (response) => {
  if (response.status !== 401) return;

  clearAuthSession();
  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
  redirectToLogin();
};
