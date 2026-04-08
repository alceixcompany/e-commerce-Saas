import { createSlice, createAsyncThunk, PayloadAction, createEntityAdapter } from '@reduxjs/toolkit';
import { Product } from '@/types/product';
import { productService } from '../services/productService';
import { buildAsyncReducers, createInitialLoadingState, LoadingState } from '../redux-utils';
import { RootState } from '../store';

/**
 * Entity adapter for products - normalizes products by id
 */
const productsAdapter = createEntityAdapter<Product>({
  sortComparer: (a, b) => {
    if (!a.createdAt || !b.createdAt) return 0;
    return b.createdAt.localeCompare(a.createdAt);
  },
});

/**
 * Helper to ensure products have an 'id' field (mapped from _id)
 */
const mapProduct = (p: any): Product => ({
  ...p,
  id: p._id || p.id,
});
const mapProducts = (products: any[]): Product[] => products.map((p: any) => mapProduct(p));

interface ProductState {
  products: Product[]; // Keep for compatibility or specific list needs
  currentProduct: Product | null;
  loading: LoadingState;
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

const initialState: ProductState & ReturnType<typeof productsAdapter.getInitialState> = productsAdapter.getInitialState({
  products: [],
  currentProduct: null,
  loading: createInitialLoadingState([
    'fetchList',
    'fetchOne',
    'create',
    'update',
    'delete',
    'search',
    'fetchByIds'
  ]),
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
});

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
    // Fetch Products (Admin)
    buildAsyncReducers(builder, fetchProducts, 'fetchList', (state, action) => {
      const { data, total, page, pages } = action.payload;
      const mappedData = mapProducts(data);
      if (page === 1) {
        productsAdapter.setAll(state, mappedData);
      } else {
        productsAdapter.upsertMany(state, mappedData);
      }
      state.metadata = { total, page, pages };
      state.products = productsAdapter.getSelectors().selectAll(state);
    });

    // Fetch Public Products
    buildAsyncReducers(builder, fetchPublicProducts, 'fetchList', (state, action) => {
      const { data, total, page, pages } = action.payload;
      const mappedData = mapProducts(data);
      if (page === 1) {
        productsAdapter.setAll(state, mappedData);
      } else {
        productsAdapter.upsertMany(state, mappedData);
      }
      state.metadata = { total, page, pages };
      state.products = productsAdapter.getSelectors().selectAll(state);
    });

    // Fetch Single Product
    buildAsyncReducers(builder, fetchProduct, 'fetchOne', (state, action) => {
      const mappedProduct = mapProduct(action.payload);
      state.currentProduct = mappedProduct;
      productsAdapter.upsertOne(state, mappedProduct);
      state.products = productsAdapter.getSelectors().selectAll(state);
    });

    // Fetch Product Admin
    buildAsyncReducers(builder, fetchProductAdmin, 'fetchOne', (state, action) => {
      const mappedProduct = mapProduct(action.payload);
      state.currentProduct = mappedProduct;
      productsAdapter.upsertOne(state, mappedProduct);
      state.products = productsAdapter.getSelectors().selectAll(state);
    });

    // Create Product
    buildAsyncReducers(builder, createProduct, 'create', (state, action) => {
      const mappedProduct = mapProduct(action.payload);
      productsAdapter.addOne(state, mappedProduct);
      state.products = productsAdapter.getSelectors().selectAll(state);
    });

    // Update Product
    buildAsyncReducers(builder, updateProduct, 'update', (state, action) => {
      const mappedProduct = mapProduct(action.payload);
      productsAdapter.upsertOne(state, mappedProduct);
      state.currentProduct = mappedProduct;
      state.products = productsAdapter.getSelectors().selectAll(state);
    });

    // Delete Product
    buildAsyncReducers(builder, deleteProduct, 'delete', (state, action) => {
      productsAdapter.removeOne(state, action.payload);
      state.products = productsAdapter.getSelectors().selectAll(state);
    });

    // Search Products
    buildAsyncReducers(builder, searchProducts, 'search', (state, action) => {
      const { data, total, page, pages } = action.payload;
      const mappedData = mapProducts(data);
      if (page === 1) {
        state.searchResults = mappedData;
      } else {
        const newIds = new Set(mappedData.map((p: Product) => p.id));
        state.searchResults = [
          ...state.searchResults.filter((p: Product) => !newIds.has(p.id)),
          ...mappedData
        ];
      }
      state.searchMetadata = { total, page, pages };
      productsAdapter.upsertMany(state, mappedData);
      state.products = productsAdapter.getSelectors().selectAll(state);
    });

    // Fetch Products By Ids
    buildAsyncReducers(builder, fetchProductsByIds, 'fetchByIds', (state, action) => {
      const mappedData = mapProducts(action.payload);
      productsAdapter.upsertMany(state, mappedData);
      state.products = productsAdapter.getSelectors().selectAll(state);
    });

    // Stats
    builder.addCase(fetchProductStats.fulfilled, (state, action) => {
      state.stats = action.payload;
    });
  },
});

// Selectors
export const {
  selectAll: selectAllProducts,
  selectById: selectProductById,
  selectIds: selectProductIds,
  selectEntities: selectProductEntities,
} = productsAdapter.getSelectors((state: RootState) => state.product);

export const { clearError, clearCurrentProduct, clearSearchResults } = productSlice.actions;
export default productSlice.reducer;
