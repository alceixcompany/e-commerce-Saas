import { serverFetch } from '../api';
import { Category } from '@/types/category';

const REVALIDATE_INTERVAL = 300; // 5 minutes

export const serverCategoryService = {
  /**
   * Fetch all active categories for public display.
   */
  getPublicCategories: async (): Promise<{ success: boolean; data: Category[]; metadata: { total: number } }> => {
    try {
      const response = await serverFetch<{ success: boolean; data: Category[]; metadata: { total: number } }>(
          '/public/categories', 
          { next: { revalidate: REVALIDATE_INTERVAL } }
      );
      return response;
    } catch (error) {
      console.error('[serverCategoryService] Error fetching public categories:', error);
      return { success: false, data: [], metadata: { total: 0 } };
    }
  },

  /**
   * Fetch a single category by slug.
   */
  getCategoryBySlug: async (slug: string): Promise<Category | null> => {
    try {
      const response = await serverFetch<{ success: boolean; data: Category }>(
        `/public/categories/${slug}`,
        { next: { revalidate: REVALIDATE_INTERVAL } }
      );
      return response.data;
    } catch {
      return null;
    }
  }
};
