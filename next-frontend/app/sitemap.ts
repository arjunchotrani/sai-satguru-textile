import { MetadataRoute } from 'next';
import { fetchCategories, fetchSubCategories, fetchProducts, fetchBrands } from '../lib/api';

/**
 * Dynamic Sitemap Generator for Sai Satguru Textile
 * Ensures all Products, Categories, Sub-Categories, and Brands are indexed.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://saisatgurutextile.com';

  // 1. Static Pages
  const staticPages = [
    '',
    '/about',
    '/contact',
    '/collections',
    '/new-arrivals',
    '/terms-and-condition',
    '/brands',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // 2. Fetch Data in Parallel
  const [categories, subCategories, brands, { products }] = await Promise.all([
    fetchCategories(),
    fetchSubCategories(),
    fetchBrands(),
    fetchProducts(new URLSearchParams({ limit: '1000' }))
  ]);

  // 3. Category Pages
  const categoryPages = categories.map((cat) => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  // 4. Sub-Category Pages (Nested URLs)
  const subCategoryPages = subCategories.map((sub) => {
    const parentCat = categories.find(c => c.id === sub.categoryId || c.id === sub.category_id);
    const catSlug = parentCat?.slug || 'collection';
    return {
      url: `${baseUrl}/category/${catSlug}/${sub.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.85,
    };
  });

  // 5. Brand Pages
  const brandPages = brands.map((brand) => ({
    url: `${baseUrl}/brand/${brand.slug || brand.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  // 6. Product Pages
  const productPages = products.map((prod) => ({
    url: `${baseUrl}/product/${prod.slug}`,
    lastModified: prod.updatedAt ? new Date(prod.updatedAt) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [
    ...staticPages, 
    ...categoryPages, 
    ...subCategoryPages, 
    ...brandPages, 
    ...productPages
  ];
}
