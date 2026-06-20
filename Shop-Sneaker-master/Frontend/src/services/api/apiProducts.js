import { getStoredToken, handleUnauthorizedResponse } from "@/services/authSession";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const getAuthHeaders = () => {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const request = async (path, options = {}) => {
  const { headers, ...requestOptions } = options;
  const response = await fetch(`${API_URL}${path}`, {
    ...requestOptions,
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    handleUnauthorizedResponse(response);
    throw new Error(data?.message || "Unable to complete product request");
  }

  return data;
};

export const getProducts = async () => {
  return request("/products");
};

export const getProductById = async (id) => {
  return request(`/products/${id}`);
};

export const createProduct = async (payload) =>
  request("/products", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

export const updateProduct = async (id, payload) =>
  request(`/products/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

export const deleteProduct = async (id) =>
  request(`/products/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

export const createVariant = async (productId, payload) =>
  request(`/products/${productId}/variants`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

export const updateVariant = async (productId, variantId, payload) =>
  request(`/products/${productId}/variants/${variantId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

export const deleteVariant = async (productId, variantId) =>
  request(`/products/${productId}/variants/${variantId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
