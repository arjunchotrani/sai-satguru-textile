import { useQuery, useInfiniteQuery, keepPreviousData, useQueryClient } from '@tanstack/react-query';
import { fetchProducts, fetchProductsPaginated, fetchNewArrivals, fetchProductBySlug, mapBackendProduct } from '../services/products';
import { fetchCategories, fetchSubCategories } from '../services/categories';
import { fetchBrands } from '../services/brands';
import { Category, SubCategory, Product, Brand } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://sai-satguru-backend.arjunchotrani0.workers.dev';

export const useCategories = () => {
    return useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: fetchCategories,
        staleTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useSubCategories = (categoryId?: string) => {
    return useQuery<SubCategory[]>({
        queryKey: ['subCategories', categoryId],
        queryFn: async () => {
            if (!categoryId) return [];
            return fetchSubCategories(categoryId);
        },
        enabled: !!categoryId,
        staleTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useAllSubCategories = () => {
    return useQuery<SubCategory[]>({
        queryKey: ['allSubCategories'],
        queryFn: () => fetchSubCategories(),
        staleTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useBrands = () => {
    return useQuery<Brand[]>({
        queryKey: ['brands'],
        queryFn: fetchBrands,
        staleTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useProducts = (filters: {
    category_id?: string;
    sub_category_id?: string;
    brand_id?: string;
    search?: string;
    limit?: number;
    includeImages?: boolean;
    sort?: string;
}) => {
    return useQuery<Product[]>({
        queryKey: ['products', filters],
        queryFn: () => fetchProducts(filters),
        staleTime: 1000 * 60 * 5, // 5 minutes
        placeholderData: keepPreviousData,
    });
};

export const useProductsInfinite = (filters: {
    category_id?: string;
    sub_category_id?: string;
    brand_id?: string;
    search?: string;
    limit?: number;
    sort?: string;
}) => {
    return useInfiniteQuery({
        queryKey: ['productsInfinite', filters],
        queryFn: ({ pageParam = 1 }) => fetchProductsPaginated({ ...filters, page: pageParam as number }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (lastPage.products.length < lastPage.limit) {
                return undefined;
            }
            return lastPage.page + 1;
        },
        staleTime: 1000 * 60 * 5,
    });
};

export const usePaginatedProducts = (filters: {
    category_id?: string;
    sub_category_id?: string;
    brand_id?: string;
    search?: string;
    limit?: number;
    page?: number;
    sort?: string;
}) => {
    return useQuery<{ products: Product[], total: number, page: number, limit: number }>({
        queryKey: ['productsPaginated', filters],
        queryFn: () => fetchProductsPaginated(filters),
        staleTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData,
    });
};

export const useNewArrivals = (page: number = 1, limit: number = 12) => {
    return useQuery<{ products: Product[], total: number }>({
        queryKey: ['newArrivals', page],
        queryFn: () => fetchNewArrivals(page, limit, false),
        staleTime: 1000 * 30, // 30 seconds
        placeholderData: keepPreviousData,
    });
};

/**
 * Hook for Product Detail with smart initial data from cache
 */
export const useProductDetail = (slug?: string) => {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      if (!slug) throw new Error("No slug provided");
      const res = await fetch(
        `${API_BASE}/products/by-slug/${slug}`
      );
      if (res.status === 404) {
        throw new Error("Product not found");
      }
      if (!res.ok) {
        throw new Error("Failed to fetch product");
      }
      const json = await res.json();
      return mapBackendProduct(json.data);
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
};

/**
 * Prefetch utility for instant navigation
 */
export const usePrefetchData = () => {
    const queryClient = useQueryClient();

    const prefetchProduct = (slug: string) => {
        const sanitizedSlug = slug.replace(/\s+/g, '-');
        queryClient.prefetchQuery({
            queryKey: ['product', sanitizedSlug],
            queryFn: () => fetchProductBySlug(sanitizedSlug),
            staleTime: 1000 * 60 * 10,
        });
    };

    const prefetchCategories = () => {
        queryClient.prefetchQuery({
            queryKey: ['categories'],
            queryFn: fetchCategories,
            staleTime: 1000 * 60 * 60,
        });
    };

    const prefetchSubCategories = (catId: string) => {
        queryClient.prefetchQuery({
            queryKey: ['subCategories', catId],
            queryFn: () => fetchSubCategories(catId),
            staleTime: 1000 * 60 * 60,
        });
    };

    return { prefetchProduct, prefetchCategories, prefetchSubCategories };
};

