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

export const getReviewsForProduct = (productId) =>
  request(`/reviews/${productId}`);

export const createReview = (productId, reviewData) =>
  request(`/reviews/${productId}`, {
    method: "POST",
    body: JSON.stringify(reviewData),
  });

export const updateReview = (reviewId, reviewData) =>
  request(`/reviews/${reviewId}`, {
    method: "PUT",
    body: JSON.stringify(reviewData),
  });

export const deleteReview = (reviewId) =>
  request(`/reviews/${reviewId}`, {
    method: "DELETE",
  });

export const getAllReviewsAdmin = (query = "") =>
  request(`/admin/reviews${query}`);

export const updateReviewStatus = (reviewId, status) =>
  request(`/admin/reviews/${reviewId}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
