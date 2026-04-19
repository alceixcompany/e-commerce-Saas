import { publicServerFetch, publicServerFetchEnvelope } from '../api';
import { Blog } from '@/types/blog';
import { normalizePaginatedResult, PaginatedResult } from '../serviceTypes';
import { buildTaggedFetchOptions } from '../cache';

const REVALIDATE_INTERVAL = 120; // 2 minutes

export const serverBlogService = {
  /**
   * Fetch published blogs with pagination and filtering.
   */
  getPublicBlogs: async (params: { page?: number; limit?: number; sort?: string; q?: string } = {}, preview = false): Promise<PaginatedResult<Blog>> => {
    const { page = 1, limit = 10, sort = '', q = '' } = params;
    const queryParams = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    
    if (sort && sort !== 'all') queryParams.set('sort', sort);
    if (q) queryParams.set('q', q);

    try {
      const response = await publicServerFetchEnvelope<Blog[]>(`/blogs?${queryParams.toString()}`, preview
        ? buildTaggedFetchOptions([], REVALIDATE_INTERVAL, true)
        : buildTaggedFetchOptions(['blogs'], REVALIDATE_INTERVAL));
      return normalizePaginatedResult({
        data: Array.isArray(response.data) ? response.data : [],
        total: typeof response.total === 'number' ? response.total : 0,
        page: typeof response.page === 'number' ? response.page : 1,
        pages: typeof response.pages === 'number' ? response.pages : 1,
      });
    } catch (error) {
      console.error('[serverBlogService] Error fetching public blogs:', error);
      return normalizePaginatedResult<Blog>(undefined);
    }
  },

  /**
   * Fetch a single blog post by its slug or ID.
   */
  getBlogBySlug: async (slugOrId: string, preview = false): Promise<Blog | null> => {
    try {
      return await publicServerFetch<Blog>(`/blogs/${slugOrId}`, { 
        ...buildTaggedFetchOptions(['blogs', `blog:${slugOrId}`], REVALIDATE_INTERVAL, preview)
      });
    } catch (error) {
      console.error(`[serverBlogService] Error fetching blog by slug (${slugOrId}):`, error);
      return null;
    }
  },

  listPublicBlogSlugs: async (): Promise<string[]> => {
    try {
      const response = await publicServerFetchEnvelope<Blog[]>('/blogs?limit=1000', {
        ...buildTaggedFetchOptions(['blogs'], REVALIDATE_INTERVAL)
      });

      return (Array.isArray(response.data) ? response.data : [])
        .map((blog) => blog.slug)
        .filter((slug): slug is string => typeof slug === 'string' && slug.length > 0);
    } catch (error) {
      console.error('[serverBlogService] Error listing public blog slugs:', error);
      return [];
    }
  }
};
