import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from "./api";

import { Category, SubCategory, Product as ProductType } from "../types";

/* ================= TYPES ================= */
// Extending/Overriding Product locally if needed to match API response exactly if types.ts is different
export type Product = ProductType & {
    sub_category_id: string | null; // API returns snake_case
    images?: string[];
};
// export type Category = { id: string; name: string };
// export type SubCategory = { id: string; name: string; category_id: string };

/* ================= HOOKS ================= */

export const useCategories = () => {
    return useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const { data } = await api.get("/admin/categories");
            return (data.data || []) as Category[];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes (Data rarely changes)
    });
};

export const useSubCategories = () => {
    return useQuery({
        queryKey: ["subCategories"],
        queryFn: async () => {
            const { data } = await api.get("/admin/subcategories");
            return (data.data || []) as SubCategory[];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useBrands = () => {
    return useQuery({
        queryKey: ["brands"],
        queryFn: async () => {
            const { data } = await api.get("/admin/brands");
            return (data.data || []) as { id: string; name: string }[];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useInvalidateBrands = () => {
    const queryClient = useQueryClient();
    return () => {
        queryClient.invalidateQueries({ queryKey: ["brands"] });
        queryClient.invalidateQueries({ queryKey: ["products"] });
    };
};

export const useProducts = (params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    subCategoryId?: string;
    brand?: string; // ✅ Brand Filter
    brandType?: string; // ✅ Brand Type Filter
    refreshId?: number; // ✅ Cache buster
}) => {
    return useQuery({
        queryKey: ["products", params], // Key changes when refreshId changes
        queryFn: async () => {
            const { data } = await api.get("/admin/products", {
                params: {
                    page: params?.page || 1,
                    limit: params?.limit || 10,
                    search: params?.search || "",
                    category_id: params?.categoryId || "",
                    sub_category_id: params?.subCategoryId || "",
                    brand: params?.brand || "", // ✅ Pass to API
                    brand_type: params?.brandType || "", // ✅ Pass to API
                    _: params?.refreshId, // ✅ Force fresh backend fetch
                },
            });
            // Return shape: { success: true, data: [...], total: 100, page: 1, limit: 10 }
            return data;
        },
        placeholderData: (previousData) => previousData, // Keep previous data while fetching new
        staleTime: 1000 * 30, // 30s (Reduced from 1 min)
    });
};

export const useProduct = (id?: string) => {
    return useQuery({
        queryKey: ["product", id],
        queryFn: async () => {
            const { data } = await api.get(`/admin/products/${id}`);
            return data.data as Product;
        },
        enabled: !!id,
    });
};

// Helper to invalidate queries after mutations
export const useInvalidateProducts = () => {
    const queryClient = useQueryClient();
    return () => queryClient.invalidateQueries({ queryKey: ["products"] });
};

export const useInvalidateCategories = () => {
    const queryClient = useQueryClient();
    return () => {
        queryClient.invalidateQueries({ queryKey: ["categories"] });
        // Also invalidate products as they depend on categories
        queryClient.invalidateQueries({ queryKey: ["products"] });
    };
};

export const useInvalidateSubCategories = () => {
    const queryClient = useQueryClient();
    return () => {
        queryClient.invalidateQueries({ queryKey: ["subCategories"] });
        // Also invalidate products as they depend on subcategories
        queryClient.invalidateQueries({ queryKey: ["products"] });
    };
};

/* ================= ANALYTICS & DASHBOARD HOOKS ================= */

export const useDashboardStats = () => {
    return useQuery({
        queryKey: ["dashboardStats"],
        queryFn: async () => {
            const { data } = await api.get("/admin/dashboard");
            return data;
        },
        staleTime: 1000 * 60 * 5, // Cache stats for 5 mins (polling handles updates)
        refetchInterval: 1000 * 30, // Poll every 30s instead of 10s to save resources
        enabled: !!localStorage.getItem("admin_token"),
    });
};

export const useEnquiries = () => {
    return useQuery({
        queryKey: ["enquiries"],
        queryFn: async () => {
            const { data } = await api.get("/enquiries");
            // The API routes might be /admin/enquiries or /enquiries. 
            // Enquiries.tsx used api.get("/enquiries"). sticking to that.
            return (data.data || []) as any[];
        },
    });
};

export const useInvalidateEnquiries = () => {
    const queryClient = useQueryClient();
    return () => queryClient.invalidateQueries({ queryKey: ["enquiries"] });
};

export const useAnalytics = (range: 7 | 30) => {
    return useQuery({
        queryKey: ["analytics", range],
        queryFn: async () => {
            const { data } = await api.get("/admin/analytics", {
                params: { range }
            });
            return data.data; // Matches fetchAnalytics in analytics.ts
        },
        placeholderData: (previousData) => previousData,
        enabled: !!localStorage.getItem("admin_token"),
    });
};

/* ================= ARCHIVED PRODUCTS ================= */
export const useArchivedProducts = (params?: { page?: number; limit?: number; search?: string }) => {
    return useQuery({
        queryKey: ["archived-products", params],
        queryFn: async () => {
            const { data } = await api.get("/admin/products", {
                params: {
                    page: params?.page || 1,
                    limit: params?.limit || 50,
                    search: params?.search || "",
                    status: "archived",
                },
            });
            return data;
        },
    });
};

export const useRestoreProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await api.put(`/admin/products/restore/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["archived-products"] });
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
    });
};
