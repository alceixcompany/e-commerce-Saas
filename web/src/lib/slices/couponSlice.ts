import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import { Coupon, CouponPayload } from '@/types/coupon';
import { couponService } from '../services/couponService';
import { buildAsyncReducers, createInitialLoadingState, getErrorMessage, LoadingState, normalizeEntities, normalizeEntity } from '../redux-utils';
import { RootState } from '../store';

/**
 * Entity adapter for coupons
 */
const couponsAdapter = createEntityAdapter<Coupon>({
  sortComparer: (a, b) => {
    if (!a.createdAt || !b.createdAt) return 0;
    return b.createdAt.localeCompare(a.createdAt);
  },
});

/**
 * Helper to ensure coupons have an 'id' field (mapped from _id)
 */
const mapCoupon = (coupon: Coupon): Coupon => normalizeEntity(coupon);
const mapCoupons = (coupons: Coupon[]): Coupon[] => normalizeEntities(coupons);
const inflightCouponRequests = new Map<string, ReturnType<typeof couponService.fetchCoupons>>();

interface CouponState {
  loading: LoadingState;
  error: string | null;
  metadata: {
    total: number;
    page: number;
    pages: number;
  };
  coupons: Coupon[];
}

const initialState: CouponState & ReturnType<typeof couponsAdapter.getInitialState> = couponsAdapter.getInitialState({
  loading: createInitialLoadingState(['fetchList', 'create', 'delete', 'validate']),
  error: null,
  metadata: {
    total: 0,
    page: 1,
    pages: 1,
  },
  coupons: [],
});

// Async thunks
export const fetchCoupons = createAsyncThunk(
  'coupon/fetchCoupons',
  async (params: { page?: number; limit?: number } | undefined, { rejectWithValue }) => {
    const requestKey = JSON.stringify(params || {});
    try {
      if (inflightCouponRequests.has(requestKey)) {
        return await inflightCouponRequests.get(requestKey)!;
      }

      const request = couponService.fetchCoupons(params || {});
      inflightCouponRequests.set(requestKey, request);
      return await request;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    } finally {
      inflightCouponRequests.delete(requestKey);
    }
  }
);

export const createCoupon = createAsyncThunk(
  'coupon/createCoupon',
  async (couponData: CouponPayload, { rejectWithValue }) => {
    try {
      return await couponService.createCoupon(couponData);
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteCoupon = createAsyncThunk(
  'coupon/deleteCoupon',
  async (id: string, { rejectWithValue }) => {
    try {
      return await couponService.deleteCoupon(id);
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const bulkDeleteCoupons = createAsyncThunk(
  'coupon/bulkDeleteCoupons',
  async (ids: string[], { rejectWithValue }) => {
    try {
      return await couponService.bulkDeleteCoupons(ids);
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const couponSlice = createSlice({
  name: 'coupon',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Coupons
    buildAsyncReducers(builder, fetchCoupons, 'fetchList', (state, action) => {
      const { data, total, page, pages } = action.payload;
      const mappedData = mapCoupons(data);
      // Admin list should always be a clean replace
      couponsAdapter.setAll(state, mappedData);
      state.metadata = { total, page, pages };
      state.coupons = couponsAdapter.getSelectors().selectAll(state);
    });

    // Create Coupon
    buildAsyncReducers(builder, createCoupon, 'create', (state, action) => {
      const mappedCoupon = mapCoupon(action.payload);
      couponsAdapter.addOne(state, mappedCoupon);
      state.coupons = couponsAdapter.getSelectors().selectAll(state);
    });

    // Delete Coupon
    buildAsyncReducers(builder, deleteCoupon, 'delete', (state, action) => {
      couponsAdapter.removeOne(state, action.payload);
      state.coupons = couponsAdapter.getSelectors().selectAll(state);
    });

    // Bulk Delete Coupons
    buildAsyncReducers(builder, bulkDeleteCoupons, 'delete', (state, action) => {
      couponsAdapter.removeMany(state, action.payload);
      state.coupons = couponsAdapter.getSelectors().selectAll(state);
    });
  },
});

export const {
  selectAll: selectAllCoupons,
  selectById: selectCouponById,
} = couponsAdapter.getSelectors((state: RootState) => state.coupon);

export const { clearError } = couponSlice.actions;
export default couponSlice.reducer;
