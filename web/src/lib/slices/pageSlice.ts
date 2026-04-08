import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { CustomPage } from '@/types/page';
import { pageService } from '../services/pageService';

interface PageState {
    pages: CustomPage[];
    currentPage: CustomPage | null;
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

export const fetchPages = createAsyncThunk('pages/fetchPages', async (_, { rejectWithValue }) => {
    try {
        return await pageService.fetchPages();
    } catch (error: any) {
        return rejectWithValue(error.message);
    }
});

export const fetchPageBySlug = createAsyncThunk('pages/fetchPageBySlug', async (slug: string, { rejectWithValue }) => {
    try {
        return await pageService.fetchPageBySlug(slug);
    } catch (error: any) {
        return rejectWithValue(error.message);
    }
});

export const createPage = createAsyncThunk('pages/createPage', async (pageData: Partial<CustomPage>, { rejectWithValue }) => {
    try {
        return await pageService.createPage(pageData);
    } catch (error: any) {
        return rejectWithValue(error.message);
    }
});

export const updatePage = createAsyncThunk('pages/updatePage', async ({ id, data }: { id: string, data: Partial<CustomPage> }, { rejectWithValue }) => {
    try {
        return await pageService.updatePage(id, data);
    } catch (error: any) {
        return rejectWithValue(error.message);
    }
});

export const deletePage = createAsyncThunk('pages/deletePage', async (id: string, { rejectWithValue }) => {
    try {
        return await pageService.deletePage(id);
    } catch (error: any) {
        return rejectWithValue(error.message);
    }
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
                state.error = action.payload as string || 'Failed to fetch pages';
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
                state.error = action.payload as string || 'Failed to fetch page';
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
