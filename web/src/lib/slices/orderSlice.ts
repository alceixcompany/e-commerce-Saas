import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../api';

interface OrderItem {
    name: string;
    qty: number;
    image: string;
    price: number;
    product: string;
}

interface ShippingAddress {
    address: string;
    city: string;
    postalCode: string;
    country: string;
}

interface CreateOrderPayload {
    orderItems: OrderItem[];
    shippingAddress: ShippingAddress;
    paymentMethod: string;
    itemsPrice: number;
    taxPrice: number;
    shippingPrice: number;
    totalPrice: number;
}

interface OrderState {
    order: any;
    orders: any[];
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

export const createOrder = createAsyncThunk(
    'order/create',
    async (orderData: CreateOrderPayload, { rejectWithValue }) => {
        try {
            const response = await api.post('/orders', orderData);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Create order failed'
            );
        }
    }
);

export const payOrder = createAsyncThunk(
    'order/pay',
    async ({ orderId, paymentResult }: { orderId: string; paymentResult: any }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/orders/${orderId}/pay`, paymentResult);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Pay order failed'
            );
        }
    }
);

export const getMyOrders = createAsyncThunk(
    'order/getMyOrders',
    async (params: { page?: number; limit?: number } | undefined, { rejectWithValue }) => {
        try {
            const page = params?.page || 1;
            const limit = params?.limit || 10;
            const response = await api.get(`/orders/myorders?page=${page}&limit=${limit}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Get orders failed'
            );
        }
    }
);

export const listOrders = createAsyncThunk(
    'order/listOrders',
    async (params: { page?: number; limit?: number; filter?: string; q?: string } | undefined, { rejectWithValue }) => {
        try {
            const page = params?.page || 1;
            const limit = params?.limit || 10;
            const filter = params?.filter ? `&filter=${params.filter}` : '';
            const q = params?.q ? `&q=${encodeURIComponent(params.q)}` : '';
            const response = await api.get(`/orders?page=${page}&limit=${limit}${filter}${q}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'List orders failed'
            );
        }
    }
);

export const deliverOrder = createAsyncThunk(
    'order/deliver',
    async (orderId: string, { rejectWithValue }) => {
        try {
            const response = await api.put(`/orders/${orderId}/deliver`, {});
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Update order failed'
            );
        }
    }
);

export const getOrderDetails = createAsyncThunk(
    'order/getDetails',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/orders/${id}`);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Get order details failed'
            );
        }
    }
);

export const deleteOrder = createAsyncThunk(
    'order/delete',
    async (id: string, { rejectWithValue }) => {
        try {
            await api.delete(`/orders/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Delete order failed'
            );
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
                    const newIds = new Set(data.map((o: any) => o._id));
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
                    const newIds = new Set(data.map((o: any) => o._id));
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
