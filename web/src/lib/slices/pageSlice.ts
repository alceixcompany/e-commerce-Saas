import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

interface Page {
    _id: string;
    title: string;
    slug: string;
    path: string;
    description: string;
    sections: any[];
    [key: string]: any; // Allow for dynamic sections like advantageSection
}

interface PageState {
    pages: Page[];
    currentPage: Page | null;
    isLoading: boolean;
    hasLoadedOnce: boolean;
    error: string | null;
}

const initialState: PageState = {
    pages: [],
    currentPage: null,
    isLoading: false,
    hasLoadedOnce: false,
    error: null
};

export const fetchPages = createAsyncThunk('pages/fetchPages', async () => {
    const response = await api.get('/pages');
    return response.data.data;
});

export const fetchPageBySlug = createAsyncThunk('pages/fetchPageBySlug', async (slug: string) => {
    const response = await api.get(`/pages/${slug}`);
    return response.data.data;
});

export const createPage = createAsyncThunk('pages/createPage', async (pageData: any) => {
    const response = await api.post('/pages', pageData);
    return response.data.data;
});

export const updatePage = createAsyncThunk('pages/updatePage', async ({ id, data }: { id: string, data: any }) => {
    const response = await api.put(`/pages/${id}`, data);
    return response.data.data;
});

export const deletePage = createAsyncThunk('pages/deletePage', async (id: string) => {
    await api.delete(`/pages/${id}`);
    return id;
});

const pageSlice = createSlice({
    name: 'pages',
    initialState,
    reducers: {
        clearCurrentPage: (state) => {
            state.currentPage = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPages.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchPages.fulfilled, (state, action) => {
                state.isLoading = false;
                state.pages = action.payload;
            })
            .addCase(fetchPages.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch pages';
            })
            .addCase(fetchPageBySlug.pending, (state) => {
                state.isLoading = true;
                state.hasLoadedOnce = false;
                state.error = null;
                state.currentPage = null;
            })
            .addCase(fetchPageBySlug.fulfilled, (state, action) => {
                state.isLoading = false;
                state.hasLoadedOnce = true;
                state.currentPage = action.payload;
            })
            .addCase(fetchPageBySlug.rejected, (state, action) => {
                state.isLoading = false;
                state.hasLoadedOnce = true;
                state.error = action.error.message || 'Failed to fetch page';
                state.currentPage = null;
            })
            .addCase(createPage.fulfilled, (state, action) => {
                state.pages.push(action.payload);
            })
            .addCase(updatePage.fulfilled, (state, action) => {
                const index = state.pages.findIndex(p => p._id === action.payload._id);
                if (index !== -1) {
                    state.pages[index] = action.payload;
                }
                if (state.currentPage?._id === action.payload._id) {
                    state.currentPage = action.payload;
                }
            })
            .addCase(deletePage.fulfilled, (state, action) => {
                state.pages = state.pages.filter(p => p._id !== action.payload);
                if (state.currentPage?._id === action.payload) {
                    state.currentPage = null;
                }
            });
    }
});

export const { clearCurrentPage } = pageSlice.actions;
export default pageSlice.reducer;
