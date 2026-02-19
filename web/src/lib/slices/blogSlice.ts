import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

interface Blog {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    image: string;
    author: {
        _id: string;
        name: string;
    };
    tags: string[];
    isPublished: boolean;
    publishedAt: string;
    views: number;
    createdAt: string;
}

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
        const page = params?.page || 1;
        const limit = params?.limit || 10;
        const sort = params?.sort ? `&sort=${params.sort}` : '';
        const q = params?.q ? `&q=${encodeURIComponent(params.q)}` : '';

        const response = await api.get(`/blogs?page=${page}&limit=${limit}${sort}${q}`);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch blogs');
    }
});

// Fetch ALL blogs (Admin)
export const fetchAllBlogs = createAsyncThunk('blogs/fetchAllBlogs', async (params: { page?: number; limit?: number; q?: string } | undefined, { rejectWithValue }) => {
    try {
        const page = params?.page || 1;
        const limit = params?.limit || 10;
        const q = params?.q ? `&q=${encodeURIComponent(params.q)}` : '';
        const response = await api.get(`/blogs/all?page=${page}&limit=${limit}${q}`);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch blogs');
    }
});

// Fetch Single Blog
export const fetchBlogBySlug = createAsyncThunk('blogs/fetchBlogBySlug', async (slugOrId: string, { rejectWithValue }) => {
    try {
        const response = await api.get(`/blogs/${slugOrId}`);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch blog');
    }
});

// Create Blog
export const createBlog = createAsyncThunk('blogs/createBlog', async (blogData: any, { rejectWithValue }) => {
    try {
        const response = await api.post('/blogs', blogData);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to create blog');
    }
});

// Update Blog
export const updateBlog = createAsyncThunk('blogs/updateBlog', async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
        const response = await api.put(`/blogs/${id}`, data);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update blog');
    }
});

// Delete Blog
export const deleteBlog = createAsyncThunk('blogs/deleteBlog', async (id: string, { rejectWithValue }) => {
    try {
        await api.delete(`/blogs/${id}`);
        return id;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to delete blog');
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
