import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { CustomPage } from '@/types/page';
import { pageService } from '../services/pageService';
import { buildAsyncReducers, createInitialLoadingState, LoadingState } from '../redux-utils';
import { createEntityAdapter } from '@reduxjs/toolkit';
import { RootState } from '../store';

/**
 * Entity adapter for custom pages
 */
const pageAdapter = createEntityAdapter<CustomPage>({
  sortComparer: (a, b) => a.title.localeCompare(b.title),
});

/**
 * Helpers to ensure pages have an 'id' field
 */
const mapPage = (p: any): CustomPage | null => {
    if (!p) return null;
    return { ...p, id: p._id || p.id };
};
const mapPages = (pages: any[]): CustomPage[] =>
    pages.map(mapPage).filter((p): p is CustomPage => p !== null);

interface PageState {
    currentPage: CustomPage | null;
    loading: LoadingState;
    hasLoadedOnce: boolean;
    error: string | null;
    // Compatibility fields
    pages: CustomPage[];
}

const initialState: PageState & ReturnType<typeof pageAdapter.getInitialState> = pageAdapter.getInitialState({
    currentPage: null,
    loading: createInitialLoadingState([
        'fetchAll',
        'fetchOne',
        'create',
        'update',
        'delete'
    ]),
    hasLoadedOnce: false,
    error: null,
    pages: [],
});

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
        // Return null for 404 to avoid console error splash in Redux
        if (error.response?.status === 404) {
            return null;
        }
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
        },
        hydratePage: (state, action) => {
            if (action.payload) {
                const mappedPage = mapPage(action.payload);
                if (!mappedPage) return;
                state.currentPage = mappedPage;
                state.hasLoadedOnce = true;
                pageAdapter.upsertOne(state, mappedPage);
                state.pages = pageAdapter.getSelectors().selectAll(state);
            }
        }
    },
    extraReducers: (builder) => {
        // Fetch All
        buildAsyncReducers(builder, fetchPages, 'fetchAll', (state, action) => {
            const mappedData = mapPages(action.payload);
            pageAdapter.setAll(state, mappedData);
            state.pages = pageAdapter.getSelectors().selectAll(state);
        });

        // Fetch One (By Slug)
        buildAsyncReducers(builder, fetchPageBySlug, 'fetchOne', (state, action) => {
            const mappedPage = mapPage(action.payload);
            state.hasLoadedOnce = true;
            state.currentPage = mappedPage;
            if (mappedPage) {
                pageAdapter.upsertOne(state, mappedPage);
                state.pages = pageAdapter.getSelectors().selectAll(state);
            }
        });

        // Create
        buildAsyncReducers(builder, createPage, 'create', (state, action) => {
            const mappedPage = mapPage(action.payload);
            if (!mappedPage) return;
            pageAdapter.addOne(state, mappedPage);
            state.pages = pageAdapter.getSelectors().selectAll(state);
        });

        // Update
        buildAsyncReducers(builder, updatePage, 'update', (state, action) => {
            const mappedPage = mapPage(action.payload);
            if (!mappedPage) return;
            pageAdapter.upsertOne(state, mappedPage);
            if (state.currentPage?.id === mappedPage.id) state.currentPage = mappedPage;
            state.pages = pageAdapter.getSelectors().selectAll(state);
        });

        // Delete
        buildAsyncReducers(builder, deletePage, 'delete', (state, action) => {
            pageAdapter.removeOne(state, action.payload);
            if (state.currentPage?.id === action.payload) {
                state.currentPage = null;
            }
            state.pages = pageAdapter.getSelectors().selectAll(state);
        });
    }
});

export const {
  selectAll: selectAllPages,
  selectById: selectPageById,
  selectIds: selectPageIds,
} = pageAdapter.getSelectors((state: RootState) => state.pages);

export const { clearCurrentPage, hydratePage } = pageSlice.actions;
export default pageSlice.reducer;
