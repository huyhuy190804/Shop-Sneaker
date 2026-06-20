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
    throw new Error(data?.message || "Request failed");
  }

  return data;
};

export const getAllCategories = async (type = "flat") => {
  return request(`/categories${type === "tree" ? "?type=tree" : ""}`);
};

export const getCategoryById = async (id) => request(`/categories/${id}`);

export const createCategory = async (categoryData) =>
  request("/categories", {
    method: "POST",
    body: JSON.stringify(categoryData),
  });

export const updateCategory = async (id, categoryData) =>
  request(`/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(categoryData),
  });

export const deleteCategory = async (id) =>
  request(`/categories/${id}`, {
    method: "DELETE",
  });
