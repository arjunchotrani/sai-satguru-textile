import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("admin_token");

    // Public routes that don't need a token
    const isPublicRoute = config.url?.includes("/admin/login") ||
      config.url?.includes("/admin/forgot-password") ||
      config.url?.includes("/admin/reset-password");

    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    } else if (!isPublicRoute && config.url?.startsWith("/admin")) {
      // If we're hitting an admin route without a token (and it's not a public one), reject early
      return Promise.reject(new Error("No authentication token found. Please login."));
    }

    // ✅ ONLY set JSON header when data is NOT FormData
    if (
      config.data &&
      !(config.data instanceof FormData)
    ) {
      config.headers.set("Content-Type", "application/json");
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      console.warn("Session expired or invalid. Redirecting to login...");
      localStorage.removeItem("admin_token");

      // If we are not already on the login page, redirect
      if (!window.location.hash.includes("/login")) {
        window.location.href = "/#/login";
        window.location.reload();
      }
    }
    return Promise.reject(err);
  }
);

export const reorderProductMedia = async (productId: string, imageIds: string[]) => {
  return api.put("/admin/product-images/reorder", {
    product_id: productId,
    image_ids: imageIds,
  });
};
