import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Order, CreateOrderPayload, PaymentResult } from '@/types/order';
import { orderService } from '../services/orderService';

interface OrderState {
    order: Order | null;
    orders: Order[];
    isLoading: boolean;
    error: string | null;
    success: boolean;
    metadata: {
        total: number;
        page: number;
        pages: number;
    };
}

const initialState: OrderState = {
    order: null,
    orders: [],
    isLoading: false,
    error: null,
    success: false,
    metadata: {
        total: 0,
        page: 1,
        pages: 1,
    },
};

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
            state.isLoading = false;
            state.error = null;
            state.success = false;
            state.order = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Create Order
            .addCase(createOrder.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.isLoading = false;
                state.success = true;
                state.order = action.payload;
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Pay Order
            .addCase(payOrder.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(payOrder.fulfilled, (state, action) => {
                state.isLoading = false;
                state.success = true;
                // Update the specific order in the list or current order logic
                if (state.order && state.order._id === action.payload._id) {
                    state.order = action.payload;
                }
            })
            .addCase(payOrder.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Get My Orders
            .addCase(getMyOrders.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getMyOrders.fulfilled, (state, action) => {
                state.isLoading = false;
                const { data, total, page, pages } = action.payload;
                if (page === 1) {
                    state.orders = data;
                } else {
                    const newIds = new Set(data.map((o: Order) => o._id));
                    state.orders = [
                        ...state.orders.filter(o => !newIds.has(o._id)),
                        ...data
                    ];
                }
                state.metadata = { total, page, pages };
            })
            .addCase(getMyOrders.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Admin: List Orders
            .addCase(listOrders.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(listOrders.fulfilled, (state, action) => {
                state.isLoading = false;
                const { data, total, page, pages } = action.payload;
                if (page === 1) {
                    state.orders = data;
                } else {
                    const newIds = new Set(data.map((o: Order) => o._id));
                    state.orders = [
                        ...state.orders.filter(o => !newIds.has(o._id)),
                        ...data
                    ];
                }
                state.metadata = { total, page, pages };
            })
            .addCase(listOrders.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Admin: Deliver Order
            .addCase(deliverOrder.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deliverOrder.fulfilled, (state, action) => {
                state.isLoading = false;
                state.success = true;
                if (state.order && state.order._id === action.payload._id) {
                    state.order = action.payload;
                }
                // Also update in orders list if it exists
                state.orders = state.orders.map(order =>
                    order._id === action.payload._id ? action.payload : order
                );
            })
            .addCase(deliverOrder.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Get Order Details
            .addCase(getOrderDetails.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getOrderDetails.fulfilled, (state, action) => {
                state.isLoading = false;
                state.order = action.payload;
            })
            .addCase(getOrderDetails.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Admin: Delete Order
            .addCase(deleteOrder.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteOrder.fulfilled, (state, action) => {
                state.isLoading = false;
                state.success = true;
                if (state.orders) {
                    state.orders = state.orders.filter(order => order._id !== action.payload);
                }
            })
            .addCase(deleteOrder.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { resetOrder } = orderSlice.actions;
export default orderSlice.reducer;
