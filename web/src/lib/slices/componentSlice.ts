import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ComponentInstance } from '@/types/component';
import { componentService } from '../services/componentService';

interface ComponentState {
    instances: ComponentInstance[];
    currentInstance: ComponentInstance | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: ComponentState = {
    instances: [],
    currentInstance: null,
    isLoading: false,
    error: null,
};

// Async thunks
export const fetchComponentInstances = createAsyncThunk(
    'component/fetchAll',
    async (type: string | undefined, { rejectWithValue }) => {
        try {
            return await componentService.fetchComponentInstances(type);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchComponentInstanceById = createAsyncThunk(
    'component/fetchById',
    async (id: string, { rejectWithValue }) => {
        try {
            return await componentService.fetchComponentInstanceById(id);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const createComponentInstance = createAsyncThunk(
    'component/create',
    async (payload: { type: string, name: string, data?: any }, { rejectWithValue }) => {
        try {
            return await componentService.createComponentInstance(payload);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateComponentInstance = createAsyncThunk(
    'component/update',
    async ({ id, data }: { id: string, data: any }, { rejectWithValue }) => {
        try {
            return await componentService.updateComponentInstance(id, data);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteComponentInstance = createAsyncThunk(
    'component/delete',
    async (id: string, { rejectWithValue }) => {
        try {
            return await componentService.deleteComponentInstance(id);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const componentSlice = createSlice({
    name: 'component',
    initialState,
    reducers: {
        clearCurrentInstance: (state) => {
            state.currentInstance = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch All
            .addCase(fetchComponentInstances.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchComponentInstances.fulfilled, (state, action) => {
                state.isLoading = false;
                state.instances = action.payload;
            })
            .addCase(fetchComponentInstances.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Fetch By Id
            .addCase(fetchComponentInstanceById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchComponentInstanceById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentInstance = action.payload;
            })
            .addCase(fetchComponentInstanceById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Create
            .addCase(createComponentInstance.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createComponentInstance.fulfilled, (state, action) => {
                state.isLoading = false;
                state.instances.unshift(action.payload);
            })
            .addCase(createComponentInstance.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Update
            .addCase(updateComponentInstance.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateComponentInstance.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.instances.findIndex(i => i._id === action.payload._id);
                if (index !== -1) {
                    state.instances[index] = action.payload;
                }
                if (state.currentInstance?._id === action.payload._id) {
                    state.currentInstance = action.payload;
                }
            })
            .addCase(updateComponentInstance.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Delete
            .addCase(deleteComponentInstance.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteComponentInstance.fulfilled, (state, action) => {
                state.isLoading = false;
                state.instances = state.instances.filter(i => i._id !== action.payload);
                if (state.currentInstance?._id === action.payload) {
                    state.currentInstance = null;
                }
            })
            .addCase(deleteComponentInstance.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    }
});

export const { clearCurrentInstance } = componentSlice.actions;
export default componentSlice.reducer;
