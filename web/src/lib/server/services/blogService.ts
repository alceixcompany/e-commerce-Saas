import { serverFetch } from '../api';
import { Blog } from '@/types/blog';

const REVALIDATE_INTERVAL = 120; // 2 minutes

export const serverBlogService = {
  /**
   * Fetch published blogs with pagination and filtering.
   */
  getPublicBlogs: async (params: { page?: number; limit?: number; sort?: string; q?: string } = {}): Promise<{ 
      success: boolean; 
      data: Blog[]; 
      metadata: { total: number; page: number; pages: number } 
  }> => {
    const { page = 1, limit = 10, sort = '', q = '' } = params;
    const queryParams = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    
    if (sort && sort !== 'all') queryParams.set('sort', sort);
    if (q) queryParams.set('q', q);

    try {
      const response = await serverFetch<{ 
          success: boolean; 
          data: Blog[]; 
          metadata: { total: number; page: number; pages: number } 
      }>(`/public/blogs?${queryParams.toString()}`, { 
        next: { revalidate: REVALIDATE_INTERVAL } 
      });
      return response;
    } catch (error) {
      console.error('[serverBlogService] Error fetching public blogs:', error);
      return { success: false, data: [], metadata: { total: 0, page: 1, pages: 1 } };
    }
  },

  /**
   * Fetch a single blog post by its slug or ID.
   */
  getBlogBySlug: async (slugOrId: string): Promise<Blog | null> => {
    try {
      return await serverFetch<Blog>(`/public/blogs/${slugOrId}`, { 
        next: { revalidate: REVALIDATE_INTERVAL } 
      });
    } catch (error) {
      console.error(`[serverBlogService] Error fetching blog by slug (${slugOrId}):`, error);
      return null;
    }
  }
};
