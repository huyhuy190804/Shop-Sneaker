import {
  getStoredToken,
  handleUnauthorizedResponse,
} from "@/services/authSession";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const request = async (path, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const token = getStoredToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    handleUnauthorizedResponse(response);
    throw new Error(data?.message || "Request failed");
  }

  return data;
};

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

export const loginWithGoogle = async ({ idToken }) => {
  const googleLoginPath =
    import.meta.env.VITE_GOOGLE_LOGIN_PATH || "/auth/google";

  const data = await request(googleLoginPath, {
    method: "POST",
    body: JSON.stringify({
      idToken,
    }),
  });

  return persistAuthSession(data);
};

export const loginWithEmail = async ({ email, password }) => {
  const data = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  return persistAuthSession(data);
};

export const getUserProfile = () => request("/users/profile");

export const updateUserProfile = ({ name, email, phone, shippingAddresses }) =>
  request("/users/profile", {
    method: "PUT",
    body: JSON.stringify({
      name,
      email,
      phone,
      shippingAddresses,
    }),
  });

export const getWishlist = () => request("/users/wishlist");

export const addToWishlist = ({ productId }) =>
  request("/users/wishlist", {
    method: "POST",
    body: JSON.stringify({ productId }),
  });

export const removeFromWishlist = ({ productId }) =>
  request(`/users/wishlist/${productId}`, {
    method: "DELETE",
  });

export const getAdminUsers = ({ page = 1, limit = 10 } = {}) =>
  request(`/users?page=${page}&limit=${limit}`);

export const getAdminUserById = (id) => request(`/users/${id}`);

export const updateAdminUserRole = ({ id, role }) =>
  request(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify({ role }),
  });

export const deleteAdminUser = (id) =>
  request(`/users/${id}`, {
    method: "DELETE",
  });
