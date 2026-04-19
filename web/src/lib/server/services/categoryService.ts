import { publicServerFetchEnvelope, shouldFailOnCriticalPublicDataError } from '../api';
import { Category } from '@/types/category';
import { PaginatedResult } from '../serviceTypes';

const REVALIDATE_INTERVAL = 300; // 5 minutes
interface PublicCategoryMetadata {
  totalProducts: number;
}

export const serverCategoryService = {
  /**
   * Fetch all active categories for public display.
   */
  getPublicCategories: async (preview = false): Promise<PaginatedResult<Category, PublicCategoryMetadata>> => {
    try {
      const response = await publicServerFetchEnvelope<Category[]>(
          '/public/categories', 
          preview ? { cache: 'no-store' } : { next: { revalidate: REVALIDATE_INTERVAL } }
      );
      const categories = Array.isArray(response.data) ? response.data : [];
      return {
        data: categories,
        metadata: {
          total: categories.length,
          page: 1,
          pages: 1,
          totalProducts: typeof response.totalProducts === 'number' ? response.totalProducts : 0,
        },
      };
    } catch (error) {
      console.error('[serverCategoryService] Error fetching public categories:', error);
      if (shouldFailOnCriticalPublicDataError()) throw error;
      return {
        data: [],
        metadata: { total: 0, page: 1, pages: 1, totalProducts: 0 },
      };
    }
  },

  /**
   * Fetch a single category by slug.
   */
  getCategoryBySlug: async (slug: string, preview = false): Promise<Category | null> => {
    try {
      const response = await publicServerFetchEnvelope<Category[]>(
        '/public/categories',
        preview ? { cache: 'no-store' } : { next: { revalidate: REVALIDATE_INTERVAL } }
      );

      const categories = Array.isArray(response.data) ? response.data : [];
      return categories.find((category) => category.slug === slug) ?? null;
    } catch (error) {
      console.error(`[serverCategoryService] Error fetching category "${slug}":`, error);
      return null;
    }
  }
};
