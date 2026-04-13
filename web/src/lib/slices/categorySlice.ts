import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Category } from '@/types/category';
import { categoryService } from '../services/categoryService';
import { buildAsyncReducers, createInitialLoadingState, LoadingState } from '../redux-utils';
import { createEntityAdapter } from '@reduxjs/toolkit';
import { RootState } from '../store';

/**
 * Entity adapter for categories
 */
const categoriesAdapter = createEntityAdapter<Category>({
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

/**
 * Helper to ensure categories have an 'id' field (mapped from _id)
 */
const mapCategory = (c: any): Category => ({
  ...c,
  id: c._id || c.id,
});
const mapCategories = (categories: any[]): Category[] => categories.map(mapCategory);

interface CategoryState {
  currentCategory: Category | null;
  loading: LoadingState;
  error: string | null;
  metadata: {
    total: number;
    page: number;
    pages: number;
    totalProducts: number;
  };
  // Compatibility field
  categories: Category[];
}

const initialState: CategoryState & ReturnType<typeof categoriesAdapter.getInitialState> = categoriesAdapter.getInitialState({
  currentCategory: null,
  loading: createInitialLoadingState([
    'fetchList',
    'fetchPublic',
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
    totalProducts: 0,
  },
  categories: [],
});

// Async thunks
export const fetchCategories = createAsyncThunk(
  'category/fetchCategories',
  async (params: { page?: number; limit?: number } | undefined, { rejectWithValue }) => {
    try {
      return await categoryService.fetchCategories(params || {});
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPublicCategories = createAsyncThunk(
  'category/fetchPublicCategories',
  async (forceRefresh: boolean | undefined = false, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    // Optimization: Skip if already loaded and not forcing refresh
    if (!forceRefresh && state.category.categories.length > 0 && !state.category.loading.fetchPublic) {
      return { 
        data: state.category.categories, 
        totalProducts: state.category.metadata.totalProducts 
      };
    }
    try {
      return await categoryService.fetchPublicCategories(forceRefresh);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCategory = createAsyncThunk(
  'category/fetchCategory',
  async (id: string, { rejectWithValue }) => {
    try {
      return await categoryService.fetchCategory(id);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createCategory = createAsyncThunk(
  'category/createCategory',
  async (categoryData: Partial<Category>, { rejectWithValue }) => {
    try {
      return await categoryService.createCategory(categoryData);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCategory = createAsyncThunk(
  'category/updateCategory',
  async ({ id, data }: { id: string; data: Partial<Category> }, { rejectWithValue }) => {
    try {
      return await categoryService.updateCategory(id, data);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'category/deleteCategory',
  async (id: string, { rejectWithValue }) => {
    try {
      return await categoryService.deleteCategory(id);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const bulkDeleteCategories = createAsyncThunk(
  'category/bulkDeleteCategories',
  async (ids: string[], { rejectWithValue }) => {
    try {
      return await categoryService.bulkDeleteCategories(ids);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Categories (Admin)
    buildAsyncReducers(builder, fetchCategories, 'fetchList', (state, action) => {
        const { data, total, page, pages, totalProducts } = action.payload;
        const mappedData = mapCategories(data);
        // Admin list should always be a clean replace
        categoriesAdapter.setAll(state, mappedData);
        state.metadata = { total, page, pages, totalProducts };
        state.categories = categoriesAdapter.getSelectors().selectAll(state);
    });

    // Fetch Public Categories
    buildAsyncReducers(builder, fetchPublicCategories, 'fetchPublic', (state, action) => {
        const mappedData = mapCategories(action.payload.data);
        categoriesAdapter.setAll(state, mappedData);
        state.metadata.totalProducts = action.payload.totalProducts;
        state.categories = categoriesAdapter.getSelectors().selectAll(state);
    });

    // Fetch Category Details
    buildAsyncReducers(builder, fetchCategory, 'fetchOne', (state, action) => {
        const mappedCategory = mapCategory(action.payload);
        state.currentCategory = mappedCategory;
        categoriesAdapter.upsertOne(state, mappedCategory);
        state.categories = categoriesAdapter.getSelectors().selectAll(state);
    });

    // Create Category
    buildAsyncReducers(builder, createCategory, 'create', (state, action) => {
        const mappedCategory = mapCategory(action.payload);
        categoriesAdapter.addOne(state, mappedCategory);
        state.categories = categoriesAdapter.getSelectors().selectAll(state);
    });

    // Update Category
    buildAsyncReducers(builder, updateCategory, 'update', (state, action) => {
        const mappedCategory = mapCategory(action.payload);
        state.currentCategory = mappedCategory;
        categoriesAdapter.upsertOne(state, mappedCategory);
        state.categories = categoriesAdapter.getSelectors().selectAll(state);
    });

    // Delete Category
    buildAsyncReducers(builder, deleteCategory, 'delete', (state, action) => {
        categoriesAdapter.removeOne(state, action.payload);
        state.categories = categoriesAdapter.getSelectors().selectAll(state);
    });

    // Bulk Delete Categories
    buildAsyncReducers(builder, bulkDeleteCategories, 'delete', (state, action) => {
        categoriesAdapter.removeMany(state, action.payload);
        state.categories = categoriesAdapter.getSelectors().selectAll(state);
    });
  },
});

export const {
  selectAll: selectAllCategories,
  selectById: selectCategoryById,
  selectIds: selectCategoryIds,
} = categoriesAdapter.getSelectors((state: RootState) => state.category);

export const { clearError, clearCurrentCategory } = categorySlice.actions;
export default categorySlice.reducer;
