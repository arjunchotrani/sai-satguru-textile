import { useQuery, useInfiniteQuery, keepPreviousData, useQueryClient } from '@tanstack/react-query';
import { fetchProducts, fetchProductsPaginated, fetchNewArrivals, fetchProductById } from '../services/products';
import { fetchCategories, fetchSubCategories } from '../services/categories';
import { fetchBrands } from '../services/brands';
import { Category, SubCategory, Product, Brand } from '../types';

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
export const useProductDetail = (id?: string) => {
    const queryClient = useQueryClient();
    const sanitizedId = id?.replace(/\s+/g, '-');

    return useQuery<Product | null>({
        queryKey: ['product', sanitizedId],
        queryFn: () => sanitizedId ? fetchProductById(sanitizedId) : Promise.resolve(null),
        enabled: !!sanitizedId,
        staleTime: 1000 * 60 * 10, // 10 minutes
        initialData: () => {
            if (!sanitizedId) return undefined;

            // Try to find product in other queries to show it instantly
            const allProductsQueries = queryClient.getQueriesData<Product[]>({ queryKey: ['products'] });
            for (const [_, data] of allProductsQueries) {
                const found = data?.find(p => p.id === sanitizedId);
                if (found) return found;
            }

            const newArrivalsQueries = queryClient.getQueriesData<{ products: Product[] }>({ queryKey: ['newArrivals'] });
            for (const [_, data] of newArrivalsQueries) {
                const found = data?.products.find(p => p.id === sanitizedId);
                if (found) return found;
            }

            return undefined;
        }
    });
};

/**
 * Prefetch utility for instant navigation
 */
export const usePrefetchData = () => {
    const queryClient = useQueryClient();

    const prefetchProduct = (id: string) => {
        const sanitizedId = id.replace(/\s+/g, '-');
        queryClient.prefetchQuery({
            queryKey: ['product', sanitizedId],
            queryFn: () => fetchProductById(sanitizedId),
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

