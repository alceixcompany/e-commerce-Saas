import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '@/types/product';
import { Category } from '@/types/category';
import { productService } from '../services/productService';

interface ProductState {
  products: Product[];
  currentProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  stats: {
    newArrivals: number;
    bestSellers: number;
  };
  metadata: {
    total: number;
    page: number;
    pages: number;
  };
  searchResults: Product[];
  searchMetadata: {
    total: number;
    page: number;
    pages: number;
  };
}

const initialState: ProductState = {
  products: [],
  currentProduct: null,
  isLoading: false,
  error: null,
  stats: {
    newArrivals: 0,
    bestSellers: 0,
  },
  metadata: {
    total: 0,
    page: 1,
    pages: 1,
  },
  searchResults: [],
  searchMetadata: {
    total: 0,
    page: 1,
    pages: 1,
  },
};

// Async thunks
export const fetchProducts = createAsyncThunk(
  'product/fetchProducts',
  async (params: { page?: number; limit?: number; category?: string; q?: string } | undefined, { rejectWithValue }) => {
    try {
      return await productService.fetchProducts(params);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPublicProducts = createAsyncThunk(
  'product/fetchPublicProducts',
  async (params: {
    page?: number;
    limit?: number;
    tag?: string;
    category?: string;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
    minimal?: boolean;
    q?: string;
  } | undefined, { rejectWithValue }) => {
    try {
      return await productService.fetchPublicProducts(params);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProduct = createAsyncThunk(
  'product/fetchProduct',
  async (id: string, { rejectWithValue }) => {
    try {
      return await productService.fetchProduct(id);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProductAdmin = createAsyncThunk(
  'product/fetchProductAdmin',
  async (id: string, { rejectWithValue }) => {
    try {
      return await productService.fetchProductAdmin(id);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createProduct = createAsyncThunk(
  'product/createProduct',
  async (productData: Partial<Product>, { rejectWithValue }) => {
    try {
      return await productService.createProduct(productData);
    } catch (error: any) {
      // Specialized error handling for missing fields if needed, 
      // but contentService already throws Error with message.
      return rejectWithValue(error.message);
    }
  }
);

export const updateProduct = createAsyncThunk(
  'product/updateProduct',
  async ({ id, data }: { id: string; data: Partial<Product> }, { rejectWithValue }) => {
    try {
      return await productService.updateProduct(id, data);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'product/deleteProduct',
  async (id: string, { rejectWithValue }) => {
    try {
      return await productService.deleteProduct(id);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProductStats = createAsyncThunk(
  'product/fetchProductStats',
  async (_, { rejectWithValue }) => {
    try {
      return await productService.fetchProductStats();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchProducts = createAsyncThunk(
  'product/searchProducts',
  async (params: { query: string; page?: number; limit?: number; minimal?: boolean }, { rejectWithValue }) => {
    try {
      return await productService.searchProducts(params);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProductsByIds = createAsyncThunk(
  'product/fetchProductsByIds',
  async (ids: string[], { rejectWithValue }) => {
    try {
      return await productService.fetchProductsByIds(ids);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchMetadata = {
        total: 0,
        page: 1,
        pages: 1,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<{ data: Product[]; total: number; page: number; pages: number }>) => {
        state.isLoading = false;
        const { data, total, page, pages } = action.payload;
        if (page === 1) {
          state.products = data;
        } else {
          const newIds = new Set(data.map((p: Product) => p._id));
          state.products = [
            ...state.products.filter(p => !newIds.has(p._id)),
            ...data
          ];
        }
        state.metadata = { total, page, pages };
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Public Products
      .addCase(fetchPublicProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPublicProducts.fulfilled, (state, action: PayloadAction<{ data: Product[]; total: number; page: number; pages: number }>) => {
        state.isLoading = false;
        const { data, total, page, pages } = action.payload;
        if (page === 1) {
          state.products = data;
        } else {
          const newIds = new Set(data.map((p: Product) => p._id));
          state.products = [
            ...state.products.filter(p => !newIds.has(p._id)),
            ...data
          ];
        }
        state.metadata = { total, page, pages };
        state.error = null;
      })
      .addCase(fetchPublicProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Product
      .addCase(fetchProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
        state.error = null;
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Product Admin
      .addCase(fetchProductAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductAdmin.fulfilled, (state, action: PayloadAction<Product>) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
        state.error = null;
      })
      .addCase(fetchProductAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Product
      .addCase(createProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.isLoading = false;
        state.products.unshift(action.payload);
        state.error = null;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Product
      .addCase(updateProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.isLoading = false;
        state.products = state.products.map((p) =>
          p._id === action.payload._id ? action.payload : p
        );
        state.currentProduct = action.payload;
        state.error = null;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete Product
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.products = state.products.filter((p) => p._id !== action.payload);
        state.error = null;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Product Stats
      .addCase(fetchProductStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      // Search Products
      .addCase(searchProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(searchProducts.fulfilled, (state, action: PayloadAction<{ data: Product[]; total: number; page: number; pages: number }>) => {
        state.isLoading = false;
        const { data, total, page, pages } = action.payload;

        if (page === 1) {
          state.searchResults = data;
        } else {
          // Filter out duplicates just in case
          const newIds = new Set(data.map((p: Product) => p._id));
          state.searchResults = [
            ...state.searchResults.filter(p => !newIds.has(p._id)),
            ...data
          ];
        }

        state.searchMetadata = { total, page, pages };
        state.error = null;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Products By Ids
      .addCase(fetchProductsByIds.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProductsByIds.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.isLoading = false;
        // Merge with existing products avoiding duplicates
        const newIds = new Set(action.payload.map(p => p._id));
        state.products = [
          ...state.products.filter(p => !newIds.has(p._id)),
          ...action.payload
        ];
      })
      .addCase(fetchProductsByIds.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentProduct, clearSearchResults } = productSlice.actions;
export default productSlice.reducer;
