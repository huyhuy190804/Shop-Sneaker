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

const notifyCartUpdated = () => {
  window.dispatchEvent(new Event("cart-updated"));
};

/**
 * Wrapper helper để notify cart update và handle error
 */
const handleCartResponse = async (promise) => {
  try {
    const data = await promise;
    notifyCartUpdated();
    return data;
  } catch (error) {
    console.error("Cart operation failed:", error.message);
    // 401 error sẽ được handle ở apiClient, không cần rethrow
    if (error.message.includes("Unauthorized")) {
      throw error; // Let 401 propagate để redirect tới login
    }
    throw error; // Rethrow để component handle
  }
};

export const getCart = () => request("/cart");

export const addToCart = ({ productId, variantId, quantity = 1 }) =>
  handleCartResponse(
    request("/cart/add", {
      method: "POST",
      body: JSON.stringify({ productId, variantId, quantity }),
    }),
  );

export const updateCartItemQuantity = ({ productId, variantId, quantity }) =>
  handleCartResponse(
    request("/cart/update", {
      method: "PUT",
      body: JSON.stringify({ productId, variantId, quantity }),
    }),
  );

export const removeCartItem = ({ productId, variantId }) =>
  handleCartResponse(
    request(`/cart/remove/${productId}/${variantId}`, {
      method: "DELETE",
    }),
  );

export const clearCart = () =>
  handleCartResponse(
    request("/cart/clear", {
      method: "DELETE",
    }),
  );

export const applyCouponToCart = (couponCode) =>
  handleCartResponse(
    request("/cart/apply-coupon", {
      method: "POST",
      body: JSON.stringify({ couponCode }),
    }),
  );
