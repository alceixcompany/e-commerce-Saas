import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Blog } from '@/types/blog';
import { blogService } from '../services/blogService';
import { buildAsyncReducers, createInitialLoadingState, getErrorMessage, LoadingState, normalizeEntities, normalizeEntity } from '../redux-utils';
import { createEntityAdapter } from '@reduxjs/toolkit';
import { RootState } from '../store';

/**
 * Entity adapter for blog posts
 */
const blogAdapter = createEntityAdapter<Blog>({
  sortComparer: (a, b) => {
      if (!a.publishedAt || !b.publishedAt) return 0;
      return b.publishedAt.localeCompare(a.publishedAt);
  },
});

/**
 * Helpers to ensure blogs have an 'id' field
 */
const mapBlog = (blog: Blog): Blog => normalizeEntity(blog);
const mapBlogs = (blogs: Blog[]): Blog[] => normalizeEntities(blogs);
const inflightAdminBlogRequests = new Map<string, ReturnType<typeof blogService.fetchAllBlogs>>();

interface BlogState {
    blog: Blog | null;
    loading: LoadingState;
    error: string | null;
    metadata: {
        total: number;
        page: number;
        pages: number;
    };
    // Compatibility fields
    blogs: Blog[];
}

const initialState: BlogState & ReturnType<typeof blogAdapter.getInitialState> = blogAdapter.getInitialState({
    blog: null,
    loading: createInitialLoadingState([
        'fetchList',
        'fetchAll',
        'fetchOne',
        'create',
        'update',
        'delete'
    ]),
    error: null,
    metadata: {
        total: 0,
        page: 1,
        pages: 1,
    },
    blogs: [],
});

// Fetch published blogs (Public)
export const fetchBlogs = createAsyncThunk(
    'blogs/fetchBlogs',
    async (
        params: { page?: number; limit?: number; sort?: string; q?: string } | undefined,
        { getState, rejectWithValue }
    ) => {
        const safeParams = params || {};
        const state = getState() as RootState;
        const requestedPage = Number(safeParams.page || 1);
        const requestedLimit = Number(safeParams.limit || 10);
        const isDefaultSort = !safeParams.sort || safeParams.sort === 'latest';
        const hasQuery = !!safeParams.q;

        if (
            requestedPage === 1 &&
            isDefaultSort &&
            !hasQuery &&
            state.blog.blogs.length >= requestedLimit &&
            !state.blog.loading.fetchList
        ) {
            return {
                data: state.blog.blogs.slice(0, requestedLimit),
                total: state.blog.metadata.total || state.blog.blogs.length,
                page: 1,
                pages: state.blog.metadata.pages || 1,
            };
        }

        try {
            return await blogService.fetchBlogs(safeParams);
        } catch (error: unknown) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

// Fetch ALL blogs (Admin)
export const fetchAllBlogs = createAsyncThunk('blogs/fetchAllBlogs', async (params: { page?: number; limit?: number; q?: string } | undefined, { rejectWithValue }) => {
    const requestKey = JSON.stringify(params || {});
    try {
        if (inflightAdminBlogRequests.has(requestKey)) {
            return await inflightAdminBlogRequests.get(requestKey)!;
        }

        const request = blogService.fetchAllBlogs(params || {});
        inflightAdminBlogRequests.set(requestKey, request);
        return await request;
    } catch (error: unknown) {
        return rejectWithValue(getErrorMessage(error));
    } finally {
        inflightAdminBlogRequests.delete(requestKey);
    }
});

// Fetch Single Blog
export const fetchBlogBySlug = createAsyncThunk('blogs/fetchBlogBySlug', async (slugOrId: string, { rejectWithValue }) => {
    try {
        return await blogService.fetchBlogBySlug(slugOrId);
    } catch (error: unknown) {
        return rejectWithValue(getErrorMessage(error));
    }
});

// Create Blog
export const createBlog = createAsyncThunk('blogs/createBlog', async (blogData: Partial<Blog>, { rejectWithValue }) => {
    try {
        return await blogService.createBlog(blogData);
    } catch (error: unknown) {
        return rejectWithValue(getErrorMessage(error));
    }
});

// Update Blog
export const updateBlog = createAsyncThunk('blogs/updateBlog', async ({ id, data }: { id: string; data: Partial<Blog> }, { rejectWithValue }) => {
    try {
        return await blogService.updateBlog(id, data);
    } catch (error: unknown) {
        return rejectWithValue(getErrorMessage(error));
    }
});

// Delete Blog
export const deleteBlog = createAsyncThunk('blogs/deleteBlog', async (id: string, { rejectWithValue }) => {
    try {
        return await blogService.deleteBlog(id);
    } catch (error: unknown) {
        return rejectWithValue(getErrorMessage(error));
    }
});

// Bulk Delete Blogs
export const bulkDeleteBlogs = createAsyncThunk('blogs/bulkDeleteBlogs', async (ids: string[], { rejectWithValue }) => {
    try {
        return await blogService.bulkDeleteBlogs(ids);
    } catch (error: unknown) {
        return rejectWithValue(getErrorMessage(error));
    }
});

const blogSlice = createSlice({
    name: 'blog',
    initialState,
    reducers: {
        clearBlogError: (state) => {
            state.error = null;
        },
        resetBlogState: (state) => {
            state.blog = null;
        }
    },
    extraReducers: (builder) => {
        // Fetch Published
        buildAsyncReducers(builder, fetchBlogs, 'fetchList', (state, action) => {
            const { data, total, page, pages } = action.payload;
            const mappedData = mapBlogs(data);
            if (Number(page) === 1) {
                blogAdapter.setAll(state, mappedData);
            } else {
                blogAdapter.upsertMany(state, mappedData);
            }
            state.metadata = { total, page, pages };
            state.blogs = blogAdapter.getSelectors().selectAll(state);
        });

        // Fetch All (Admin)
        buildAsyncReducers(builder, fetchAllBlogs, 'fetchAll', (state, action) => {
            const { data, total, page, pages } = action.payload;
            const mappedData = mapBlogs(data);
            if (Number(page) === 1) {
                blogAdapter.setAll(state, mappedData);
            } else {
                blogAdapter.upsertMany(state, mappedData);
            }
            state.metadata = { total, page, pages };
            state.blogs = blogAdapter.getSelectors().selectAll(state);
        });

        // Fetch Single
        buildAsyncReducers(builder, fetchBlogBySlug, 'fetchOne', (state, action) => {
            const mappedBlog = mapBlog(action.payload.data);
            state.blog = mappedBlog;
            blogAdapter.upsertOne(state, mappedBlog);
            state.blogs = blogAdapter.getSelectors().selectAll(state);
        });

        // Create
        buildAsyncReducers(builder, createBlog, 'create', (state, action) => {
            const mappedBlog = mapBlog(action.payload.data);
            blogAdapter.addOne(state, mappedBlog);
            state.blogs = blogAdapter.getSelectors().selectAll(state);
        });

        // Update
        buildAsyncReducers(builder, updateBlog, 'update', (state, action) => {
            const mappedBlog = mapBlog(action.payload.data);
            state.blog = mappedBlog;
            blogAdapter.upsertOne(state, mappedBlog);
            state.blogs = blogAdapter.getSelectors().selectAll(state);
        });

        // Delete
        buildAsyncReducers(builder, deleteBlog, 'delete', (state, action) => {
            blogAdapter.removeOne(state, action.payload);
            state.blogs = blogAdapter.getSelectors().selectAll(state);
        });

        // Bulk Delete
        buildAsyncReducers(builder, bulkDeleteBlogs, 'delete', (state, action) => {
            blogAdapter.removeMany(state, action.payload);
            state.blogs = blogAdapter.getSelectors().selectAll(state);
        });
    },
});

export const {
  selectAll: selectAllBlogs,
  selectById: selectBlogById,
  selectIds: selectBlogIds,
} = blogAdapter.getSelectors((state: RootState) => state.blog);

export const { clearBlogError, resetBlogState } = blogSlice.actions;
export default blogSlice.reducer;
