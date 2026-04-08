import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Blog } from '@/types/blog';
import { blogService } from '../services/blogService';

interface BlogState {
    blogs: Blog[];
    blog: Blog | null;
    isLoading: boolean;
    error: string | null;
    metadata: {
        total: number;
        page: number;
        pages: number;
    };
}

const initialState: BlogState = {
    blogs: [],
    blog: null,
    isLoading: false,
    error: null,
    metadata: {
        total: 0,
        page: 1,
        pages: 1,
    },
};

// Fetch published blogs (Public)
export const fetchBlogs = createAsyncThunk('blogs/fetchBlogs', async (params: { page?: number; limit?: number; sort?: string; q?: string } | undefined, { rejectWithValue }) => {
    try {
        return await blogService.fetchBlogs(params || {});
    } catch (error: any) {
        return rejectWithValue(error.message);
    }
});

// Fetch ALL blogs (Admin)
export const fetchAllBlogs = createAsyncThunk('blogs/fetchAllBlogs', async (params: { page?: number; limit?: number; q?: string } | undefined, { rejectWithValue }) => {
    try {
        return await blogService.fetchAllBlogs(params || {});
    } catch (error: any) {
        return rejectWithValue(error.message);
    }
});

// Fetch Single Blog
export const fetchBlogBySlug = createAsyncThunk('blogs/fetchBlogBySlug', async (slugOrId: string, { rejectWithValue }) => {
    try {
        return await blogService.fetchBlogBySlug(slugOrId);
    } catch (error: any) {
        return rejectWithValue(error.message);
    }
});

// Create Blog
export const createBlog = createAsyncThunk('blogs/createBlog', async (blogData: Partial<Blog>, { rejectWithValue }) => {
    try {
        return await blogService.createBlog(blogData);
    } catch (error: any) {
        return rejectWithValue(error.message);
    }
});

// Update Blog
export const updateBlog = createAsyncThunk('blogs/updateBlog', async ({ id, data }: { id: string; data: Partial<Blog> }, { rejectWithValue }) => {
    try {
        return await blogService.updateBlog(id, data);
    } catch (error: any) {
        return rejectWithValue(error.message);
    }
});

// Delete Blog
export const deleteBlog = createAsyncThunk('blogs/deleteBlog', async (id: string, { rejectWithValue }) => {
    try {
        return await blogService.deleteBlog(id);
    } catch (error: any) {
        return rejectWithValue(error.message);
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
        builder
            // Fetch Published
            .addCase(fetchBlogs.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchBlogs.fulfilled, (state, action) => {
                state.isLoading = false;
                const { data, total, page, pages } = action.payload;
                if (page === 1) {
                    state.blogs = data;
                } else {
                    const newIds = new Set(data.map((b: Blog) => b._id));
                    state.blogs = [
                        ...state.blogs.filter(b => !newIds.has(b._id)),
                        ...data
                    ];
                }
                state.metadata = { total, page, pages };
            })
            .addCase(fetchBlogs.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Fetch All (Admin)
            .addCase(fetchAllBlogs.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchAllBlogs.fulfilled, (state, action) => {
                state.isLoading = false;
                const { data, total, page, pages } = action.payload;
                if (page === 1) {
                    state.blogs = data;
                } else {
                    const newIds = new Set(data.map((b: Blog) => b._id));
                    state.blogs = [
                        ...state.blogs.filter(b => !newIds.has(b._id)),
                        ...data
                    ];
                }
                state.metadata = { total, page, pages };
            })
            .addCase(fetchAllBlogs.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Fetch Single
            .addCase(fetchBlogBySlug.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchBlogBySlug.fulfilled, (state, action) => {
                state.isLoading = false;
                state.blog = action.payload.data;
            })
            .addCase(fetchBlogBySlug.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Create
            .addCase(createBlog.fulfilled, (state, action) => {
                state.blogs.unshift(action.payload.data);
            })
            // Delete
            .addCase(deleteBlog.fulfilled, (state, action) => {
                state.blogs = state.blogs.filter(b => b._id !== action.payload);
            });
    },
});

export const { clearBlogError, resetBlogState } = blogSlice.actions;
export default blogSlice.reducer;
