import { handleUnauthorizedResponse } from "@/services/authSession";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    handleUnauthorizedResponse(response);
    throw new Error(data?.message || "Unable to load brand data");
  }

  return data;
};

export const getAllBrands = () => request("/brands");
