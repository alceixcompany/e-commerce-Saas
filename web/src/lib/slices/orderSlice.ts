import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Order, CreateOrderPayload, PaymentResult } from '@/types/order';
import { orderService } from '../services/orderService';
import { buildAsyncReducers, createInitialLoadingState, LoadingState } from '../redux-utils';
import { createEntityAdapter } from '@reduxjs/toolkit';
import { RootState } from '../store';

/**
 * Entity adapter for orders
 */
const ordersAdapter = createEntityAdapter<Order>({
  sortComparer: (a, b) => {
    if (!a.createdAt || !b.createdAt) return 0;
    return b.createdAt.localeCompare(a.createdAt);
  },
});

/**
 * Helper to ensure orders have an 'id' field (mapped from _id)
 */
const mapOrder = (o: any): Order => ({
  ...o,
  id: o._id || o.id,
});
const mapOrders = (orders: any[]): Order[] => orders.map(mapOrder);

interface OrderState {
    order: Order | null;
    loading: LoadingState;
    error: string | null;
    success: boolean;
    metadata: {
        total: number;
        page: number;
        pages: number;
    };
    // Keep for backward compatibility if needed, or remove if confident
    orders: Order[]; 
}

const initialState: OrderState & ReturnType<typeof ordersAdapter.getInitialState> = ordersAdapter.getInitialState({
    order: null,
    loading: createInitialLoadingState([
        'create',
        'pay',
        'fetchMyOrders',
        'listOrders',
        'deliver',
        'fetchOne'
    ]),
    error: null,
    success: false,
    metadata: {
        total: 0,
        page: 1,
        pages: 1,
    },
    orders: [],
});

// Async thunks
export const createOrder = createAsyncThunk(
    'order/create',
    async (orderData: CreateOrderPayload, { rejectWithValue }) => {
        try {
            return await orderService.createOrder(orderData);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const payOrder = createAsyncThunk(
    'order/pay',
    async ({ orderId, paymentResult }: { orderId: string; paymentResult: PaymentResult }, { rejectWithValue }) => {
        try {
            return await orderService.payOrder(orderId, paymentResult);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const getMyOrders = createAsyncThunk(
    'order/getMyOrders',
    async (params: { page?: number; limit?: number } | undefined, { rejectWithValue }) => {
        try {
            return await orderService.getMyOrders(params || {});
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const listOrders = createAsyncThunk(
    'order/listOrders',
    async (params: { page?: number; limit?: number; filter?: string; q?: string } | undefined, { rejectWithValue }) => {
        try {
            return await orderService.listOrders(params || {});
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const deliverOrder = createAsyncThunk(
    'order/deliver',
    async (orderId: string, { rejectWithValue }) => {
        try {
            return await orderService.deliverOrder(orderId);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const getOrderDetails = createAsyncThunk(
    'order/getDetails',
    async (id: string, { rejectWithValue }) => {
        try {
            return await orderService.getOrderDetails(id);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteOrder = createAsyncThunk(
    'order/delete',
    async (id: string, { rejectWithValue }) => {
        try {
            return await orderService.deleteOrder(id);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {
        resetOrder: (state) => {
            state.loading = createInitialLoadingState([
                'create', 'pay', 'fetchMyOrders', 'listOrders', 'deliver', 'fetchOne'
            ]);
            state.error = null;
            state.success = false;
            state.order = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // Create Order
        buildAsyncReducers(builder, createOrder, 'create', (state, action) => {
            const mappedOrder = mapOrder(action.payload);
            state.success = true;
            state.order = mappedOrder;
            ordersAdapter.addOne(state, mappedOrder);
            state.orders = ordersAdapter.getSelectors().selectAll(state);
        });

        // Pay Order
        buildAsyncReducers(builder, payOrder, 'pay', (state, action) => {
            const mappedOrder = mapOrder(action.payload);
            state.success = true;
            if (state.order && state.order.id === mappedOrder.id) {
                state.order = mappedOrder;
            }
            ordersAdapter.upsertOne(state, mappedOrder);
            state.orders = ordersAdapter.getSelectors().selectAll(state);
        });

        // Get My Orders
        buildAsyncReducers(builder, getMyOrders, 'fetchMyOrders', (state, action) => {
            const { data, total, page, pages } = action.payload;
            const mappedData = mapOrders(data);
            if (page === 1) {
                ordersAdapter.setAll(state, mappedData);
            } else {
                ordersAdapter.upsertMany(state, mappedData);
            }
            state.metadata = { total, page, pages };
            state.orders = ordersAdapter.getSelectors().selectAll(state);
        });

        // List Orders (Admin)
        buildAsyncReducers(builder, listOrders, 'listOrders', (state, action) => {
            const { data, total, page, pages } = action.payload;
            const mappedData = mapOrders(data);
            if (page === 1) {
                ordersAdapter.setAll(state, mappedData);
            } else {
                ordersAdapter.upsertMany(state, mappedData);
            }
            state.metadata = { total, page, pages };
            state.orders = ordersAdapter.getSelectors().selectAll(state);
        });

        // Deliver Order
        buildAsyncReducers(builder, deliverOrder, 'deliver', (state, action) => {
            const mappedOrder = mapOrder(action.payload);
            state.success = true;
            if (state.order && state.order.id === mappedOrder.id) {
                state.order = mappedOrder;
            }
            ordersAdapter.upsertOne(state, mappedOrder);
            state.orders = ordersAdapter.getSelectors().selectAll(state);
        });

        // Get Order Details
        buildAsyncReducers(builder, getOrderDetails, 'fetchOne', (state, action) => {
            const mappedOrder = mapOrder(action.payload);
            state.order = mappedOrder;
            ordersAdapter.upsertOne(state, mappedOrder);
            state.orders = ordersAdapter.getSelectors().selectAll(state);
        });

        // Delete Order
        buildAsyncReducers(builder, deleteOrder, 'deliver', (state, action) => {
            state.success = true;
            ordersAdapter.removeOne(state, action.payload);
            state.orders = ordersAdapter.getSelectors().selectAll(state);
        });
    },
});

export const {
  selectAll: selectAllOrders,
  selectById: selectOrderById,
  selectIds: selectOrderIds,
} = ordersAdapter.getSelectors((state: RootState) => state.order);

export const { resetOrder, clearError } = orderSlice.actions;
export default orderSlice.reducer;
