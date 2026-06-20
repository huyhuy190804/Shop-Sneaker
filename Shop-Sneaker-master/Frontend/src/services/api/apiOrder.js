import { getStoredToken, handleUnauthorizedResponse } from "@/services/authSession";

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

export const getAdminOrders = ({ page = 1, limit = 10, status } = {}) => {
  const params = new URLSearchParams();

  if (status && status !== "ALL") {
    params.set("status", status);
  }

  params.set("page", String(page));
  params.set("limit", String(limit));

  return request(`/orders/admin/all?${params.toString()}`);
};

export const getOrderById = (id) => request(`/orders/${id}`);

export const getAdminOrderById = getOrderById;

export const getMyOrders = () => request("/orders");

export const createOrder = ({ shippingAddress, paymentMethod, shippingMethod }) =>
  request("/orders", {
    method: "POST",
    body: JSON.stringify({ shippingAddress, paymentMethod, shippingMethod }),
  });

export const confirmPayment = (id, { paymentResult } = {}) =>
  request(`/orders/${id}/confirm-payment`, {
    method: "POST",
    body: JSON.stringify({ paymentResult }),
  });

export const updateAdminOrderStatus = ({ id, status }) =>
  request(`/orders/admin/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
