import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../api';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Product {
  _id: string;
  name: string;
  category: Category | string;
  shortDescription?: string;
  price: number;
  discountedPrice?: number;
  stock: number;
  sku: string;
  image: string;
  mainImage?: string;
  images?: string[];
  shippingWeight: number;
  status: 'active' | 'inactive';
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  material?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductState {
  products: Product[];
  currentProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  stats: {
    newArrivals: 0,
    bestSellers: 0,
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
// Fetch all products (admin - includes inactive)
export const fetchProducts = createAsyncThunk(
  'product/fetchProducts',
  async (params: { page?: number; limit?: number; category?: string; q?: string } | undefined, { rejectWithValue }) => {
    try {
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const category = params?.category && params.category !== 'all' ? `&category=${params.category}` : '';
      const q = params?.q ? `&q=${encodeURIComponent(params.q)}` : '';

      const response = await api.get(`/products?page=${page}&limit=${limit}${category}${q}`);
      if (response.data.success) {
        return response.data;
      }
      return rejectWithValue(response.data.message || 'Failed to fetch products');
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch products'
      );
    }
  }
);

// Fetch public products (only active products)
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
  } | undefined, { rejectWithValue }) => {
    try {
      const page = params?.page || 1;
      const limit = params?.limit || 12;
      const tag = params?.tag ? `&tag=${params.tag}` : '';
      const category = params?.category && params.category !== 'all' ? `&category=${params.category}` : '';
      const sort = params?.sort ? `&sort=${params.sort}` : '';
      const minPrice = params?.minPrice ? `&minPrice=${params.minPrice}` : '';
      const maxPrice = params?.maxPrice ? `&maxPrice=${params.maxPrice}` : '';

      const response = await api.get(`/public/products?page=${page}&limit=${limit}${tag}${category}${sort}${minPrice}${maxPrice}`);
      if (response.data.success) {
        return response.data;
      }
      return rejectWithValue(response.data.message || 'Failed to fetch public products');
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch public products'
      );
    }
  }
);

export const fetchProduct = createAsyncThunk(
  'product/fetchProduct',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/public/products/${id}`);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message || 'Failed to fetch product');
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch product'
      );
    }
  }
);

// Fetch product for admin (includes inactive products)
export const fetchProductAdmin = createAsyncThunk(
  'product/fetchProductAdmin',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/products/${id}`);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message || 'Failed to fetch product');
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch product'
      );
    }
  }
);

export const createProduct = createAsyncThunk(
  'product/createProduct',
  async (productData: Partial<Product>, { rejectWithValue }) => {
    try {
      console.log('Sending product data to backend:', JSON.stringify(productData, null, 2));
      const response = await api.post('/products', productData);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message || 'Failed to create product');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create product';
      const missingFields = error.response?.data?.missingFields;
      const fullMessage = missingFields
        ? `${errorMessage}. Missing fields: ${missingFields.join(', ')}`
        : errorMessage;
      console.error('Product creation error:', {
        message: fullMessage,
        response: error.response?.data,
        sentData: productData,
        missingFields: missingFields,
      });
      console.error('Full error object:', error);
      return rejectWithValue(fullMessage);
    }
  }
);

export const updateProduct = createAsyncThunk(
  'product/updateProduct',
  async ({ id, data }: { id: string; data: Partial<Product> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/products/${id}`, data);
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message || 'Failed to update product');
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update product'
      );
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'product/deleteProduct',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/products/${id}`);
      if (response.data.success) {
        return id;
      }
      return rejectWithValue(response.data.message || 'Failed to delete product');
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to delete product'
      );
    }
  }
);

// Fetch product stats
export const fetchProductStats = createAsyncThunk(
  'product/fetchProductStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/public/products/stats');
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message || 'Failed to fetch product stats');
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch product stats'
      );
    }
  }
);

// Search products
export const searchProducts = createAsyncThunk(
  'product/searchProducts',
  async ({ query, page = 1, limit = 10 }: { query: string; page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/public/products/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
      if (response.data.success) {
        return response.data;
      }
      return rejectWithValue(response.data.message || 'Failed to search products');
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to search products'
      );
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
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<any>) => {
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
      .addCase(fetchPublicProducts.fulfilled, (state, action: PayloadAction<any>) => {
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
      .addCase(searchProducts.fulfilled, (state, action: PayloadAction<any>) => {
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
      });
  },
});

export const { clearError, clearCurrentProduct, clearSearchResults } = productSlice.actions;
export default productSlice.reducer;

