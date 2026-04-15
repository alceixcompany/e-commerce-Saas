import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { CustomPage } from '@/types/page';
import { pageService } from '../services/pageService';
import { buildAsyncReducers, createInitialLoadingState, getErrorMessage, LoadingState, normalizeEntity } from '../redux-utils';
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
const mapPage = (page: CustomPage | null | undefined): CustomPage | null => {
    if (!page) return null;
    return normalizeEntity(page);
};
const mapPages = (pages: CustomPage[]): CustomPage[] =>
    pages.map(mapPage).filter((p): p is CustomPage => p !== null);
let inflightPagesRequest: ReturnType<typeof pageService.fetchPages> | null = null;
const inflightPageBySlugRequests = new Map<string, ReturnType<typeof pageService.fetchPageBySlug>>();

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
        if (inflightPagesRequest) {
            return await inflightPagesRequest;
        }

        inflightPagesRequest = pageService.fetchPages();
        return await inflightPagesRequest;
    } catch (error: unknown) {
        return rejectWithValue(getErrorMessage(error));
    } finally {
        inflightPagesRequest = null;
    }
});

export const fetchPageBySlug = createAsyncThunk('pages/fetchPageBySlug', async (slug: string, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    
    // Optimization: Skip if we are already viewing this page and it's not loading
    if (state.pages.currentPage?.slug === slug && !state.pages.loading.fetchOne) {
        return state.pages.currentPage;
    }

    try {
        if (inflightPageBySlugRequests.has(slug)) {
            return await inflightPageBySlugRequests.get(slug)!;
        }

        const request = pageService.fetchPageBySlug(slug);
        inflightPageBySlugRequests.set(slug, request);
        return await request;
    } catch (error: unknown) {
        // Return null for 404 to avoid console error splash in Redux
        const status = typeof error === 'object' && error !== null && 'response' in error
            ? (error.response as { status?: number } | undefined)?.status
            : undefined;
        if (status === 404) {
            return null;
        }
        return rejectWithValue(getErrorMessage(error));
    } finally {
        inflightPageBySlugRequests.delete(slug);
    }
});

export const createPage = createAsyncThunk('pages/createPage', async (pageData: Partial<CustomPage>, { rejectWithValue }) => {
    try {
        return await pageService.createPage(pageData);
    } catch (error: unknown) {
        return rejectWithValue(getErrorMessage(error));
    }
});

export const updatePage = createAsyncThunk('pages/updatePage', async ({ id, data }: { id: string, data: Partial<CustomPage> }, { rejectWithValue }) => {
    try {
        return await pageService.updatePage(id, data);
    } catch (error: unknown) {
        return rejectWithValue(getErrorMessage(error));
    }
});

export const deletePage = createAsyncThunk('pages/deletePage', async (id: string, { rejectWithValue }) => {
    try {
        return await pageService.deletePage(id);
    } catch (error: unknown) {
        return rejectWithValue(getErrorMessage(error));
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
