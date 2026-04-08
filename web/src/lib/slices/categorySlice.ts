import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Category } from '@/types/category';
import { categoryService } from '../services/categoryService';

interface CategoryState {
  categories: Category[];
  currentCategory: Category | null;
  isLoading: boolean;
  error: string | null;
  metadata: {
    total: number;
    page: number;
    pages: number;
    totalProducts: number;
  };
}

const initialState: CategoryState = {
  categories: [],
  currentCategory: null,
  isLoading: false,
  error: null,
  metadata: {
    total: 0,
    page: 1,
    pages: 1,
    totalProducts: 0,
  },
};

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
  async (forceRefresh: boolean | undefined = false, { rejectWithValue }) => {
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
    builder
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<{ data: Category[]; total: number; page: number; pages: number; totalProducts: number }>) => {
        state.isLoading = false;
        const { data, total, page, pages, totalProducts } = action.payload;
        if (page === 1) {
          state.categories = data;
        } else {
          const newIds = new Set(data.map((c: Category) => c._id));
          state.categories = [
            ...state.categories.filter(c => !newIds.has(c._id)),
            ...data
          ];
        }
        state.metadata = { total, page, pages, totalProducts };
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Public Categories
      .addCase(fetchPublicCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPublicCategories.fulfilled, (state, action: PayloadAction<{ data: Category[]; totalProducts: number }>) => {
        state.isLoading = false;
        state.categories = action.payload.data;
        state.metadata.totalProducts = action.payload.totalProducts;
        state.error = null;
      })
      .addCase(fetchPublicCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Category
      .addCase(fetchCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.isLoading = false;
        state.currentCategory = action.payload;
        state.error = null;
      })
      .addCase(fetchCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Category
      .addCase(createCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.isLoading = false;
        state.categories.unshift(action.payload);
        state.error = null;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Category
      .addCase(updateCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.isLoading = false;
        state.categories = state.categories.map((c) =>
          c._id === action.payload._id ? action.payload : c
        );
        state.currentCategory = action.payload;
        state.error = null;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete Category
      .addCase(deleteCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.categories = state.categories.filter((c) => c._id !== action.payload);
        state.error = null;
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentCategory } = categorySlice.actions;
export default categorySlice.reducer;
