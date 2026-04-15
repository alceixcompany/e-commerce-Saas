import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import { Product } from '@/types/product';
import { productService } from '../services/productService';
import { buildAsyncReducers, createInitialLoadingState, getErrorMessage, LoadingState, normalizeEntities, normalizeEntity } from '../redux-utils';
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
const mapProduct = (product: Product): Product => normalizeEntity(product);
const mapProducts = (products: Product[]): Product[] => normalizeEntities(products);

const inflightPublicProducts = new Map<string, ReturnType<typeof productService.fetchPublicProducts>>();
const inflightSearchProducts = new Map<string, ReturnType<typeof productService.searchProducts>>();
let inflightProductStats: ReturnType<typeof productService.fetchProductStats> | null = null;
const inflightAdminProductRequests = new Map<string, ReturnType<typeof productService.fetchProducts>>();
const inflightProductsByIdsRequests = new Map<string, ReturnType<typeof productService.fetchProductsByIds>>();

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
    const requestKey = JSON.stringify(params || {});
    try {
      if (inflightAdminProductRequests.has(requestKey)) {
        return await inflightAdminProductRequests.get(requestKey)!;
      }

      const request = productService.fetchProducts(params);
      inflightAdminProductRequests.set(requestKey, request);
      return await request;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    } finally {
      inflightAdminProductRequests.delete(requestKey);
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
    const requestKey = JSON.stringify(params || {});
    try {
      if (inflightPublicProducts.has(requestKey)) {
        return await inflightPublicProducts.get(requestKey)!;
      }

      const request = productService.fetchPublicProducts(params);
      inflightPublicProducts.set(requestKey, request);
      return await request;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    } finally {
      inflightPublicProducts.delete(requestKey);
    }
  }
);

export const fetchProduct = createAsyncThunk(
  'product/fetchProduct',
  async (id: string, { rejectWithValue }) => {
    try {
      return await productService.fetchProduct(id);
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchProductAdmin = createAsyncThunk(
  'product/fetchProductAdmin',
  async (id: string, { rejectWithValue }) => {
    try {
      return await productService.fetchProductAdmin(id);
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createProduct = createAsyncThunk(
  'product/createProduct',
  async (productData: Partial<Product>, { rejectWithValue }) => {
    try {
      return await productService.createProduct(productData);
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateProduct = createAsyncThunk(
  'product/updateProduct',
  async ({ id, data }: { id: string; data: Partial<Product> }, { rejectWithValue }) => {
    try {
      return await productService.updateProduct(id, data);
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'product/deleteProduct',
  async (id: string, { rejectWithValue }) => {
    try {
      return await productService.deleteProduct(id);
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const bulkDeleteProducts = createAsyncThunk(
  'product/bulkDeleteProducts',
  async (ids: string[], { rejectWithValue }) => {
    try {
      return await productService.bulkDeleteProducts(ids);
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchProductStats = createAsyncThunk(
  'product/fetchProductStats',
  async (_, { rejectWithValue }) => {
    try {
      if (inflightProductStats) {
        return await inflightProductStats;
      }

      inflightProductStats = productService.fetchProductStats();
      return await inflightProductStats;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    } finally {
      inflightProductStats = null;
    }
  }
);

export const searchProducts = createAsyncThunk(
  'product/searchProducts',
  async (params: { query: string; page?: number; limit?: number; minimal?: boolean }, { rejectWithValue }) => {
    const requestKey = JSON.stringify(params);
    try {
      if (inflightSearchProducts.has(requestKey)) {
        return await inflightSearchProducts.get(requestKey)!;
      }

      const request = productService.searchProducts(params);
      inflightSearchProducts.set(requestKey, request);
      return await request;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    } finally {
      inflightSearchProducts.delete(requestKey);
    }
  }
);

export const fetchProductsByIds = createAsyncThunk(
  'product/fetchProductsByIds',
  async (ids: string[], { rejectWithValue }) => {
    const requestKey = [...ids].sort().join(',');
    try {
      if (inflightProductsByIdsRequests.has(requestKey)) {
        return await inflightProductsByIdsRequests.get(requestKey)!;
      }

      const request = productService.fetchProductsByIds(ids);
      inflightProductsByIdsRequests.set(requestKey, request);
      return await request;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    } finally {
      inflightProductsByIdsRequests.delete(requestKey);
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
    resetProducts: (state) => {
      productsAdapter.removeAll(state);
      state.products = [];
      state.metadata = {
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
      // Admin list should always be a clean replace
      productsAdapter.setAll(state, mappedData);
      state.metadata = { total, page, pages };
      state.products = productsAdapter.getSelectors().selectAll(state);
    });

    // Fetch Public Products
    buildAsyncReducers(builder, fetchPublicProducts, 'fetchList', (state, action) => {
      const { data, total, page, pages } = action.payload;
      const mappedData = mapProducts(data);
      if (Number(page) === 1) {
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

    // Bulk Delete Products
    buildAsyncReducers(builder, bulkDeleteProducts, 'delete', (state, action) => {
      productsAdapter.removeMany(state, action.payload);
      state.products = productsAdapter.getSelectors().selectAll(state);
    });

    // Search Products
    buildAsyncReducers(builder, searchProducts, 'search', (state, action) => {
      const { data, total, page, pages } = action.payload;
      const mappedData = mapProducts(data);
      if (Number(page) === 1) {
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

export const { clearError, clearCurrentProduct, clearSearchResults, resetProducts } = productSlice.actions;
export default productSlice.reducer;
