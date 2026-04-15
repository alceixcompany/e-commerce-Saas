import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ComponentInstance } from '@/types/component';
import { componentService } from '../services/componentService';
import { buildAsyncReducers, createInitialLoadingState, getErrorMessage, LoadingState, normalizeEntities, normalizeEntity } from '../redux-utils';
import { createEntityAdapter } from '@reduxjs/toolkit';
import { RootState } from '../store';

/**
 * Entity adapter for component instances
 */
const componentAdapter = createEntityAdapter<ComponentInstance>({
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

/**
 * Helpers to ensure components have an 'id' field
 */
const mapComponent = (component: ComponentInstance): ComponentInstance => normalizeEntity(component);
const mapComponents = (components: ComponentInstance[]): ComponentInstance[] => normalizeEntities(components);
const inflightComponentRequests = new Map<string, ReturnType<typeof componentService.fetchComponentInstances>>();
type ComponentInstancePayload = Pick<ComponentInstance, 'type' | 'name'> & {
    data?: ComponentInstance['data'];
};

interface ComponentState {
    currentInstance: ComponentInstance | null;
    loading: LoadingState;
    error: string | null;
    // Compatibility fields
    instances: ComponentInstance[];
}

const initialState: ComponentState & ReturnType<typeof componentAdapter.getInitialState> = componentAdapter.getInitialState({
    currentInstance: null,
    loading: createInitialLoadingState([
        'fetchAll',
        'fetchOne',
        'create',
        'update',
        'delete'
    ]),
    error: null,
    instances: [],
});

// Async thunks
export const fetchComponentInstances = createAsyncThunk(
    'component/fetchAll',
    async (type: string | undefined, { rejectWithValue }) => {
        const requestKey = type || '__all__';
        try {
            if (inflightComponentRequests.has(requestKey)) {
                return await inflightComponentRequests.get(requestKey)!;
            }

            const request = componentService.fetchComponentInstances(type);
            inflightComponentRequests.set(requestKey, request);
            return await request;
        } catch (error: unknown) {
            return rejectWithValue(getErrorMessage(error));
        } finally {
            inflightComponentRequests.delete(requestKey);
        }
    }
);

export const fetchComponentInstanceById = createAsyncThunk(
    'component/fetchById',
    async (id: string, { rejectWithValue }) => {
        try {
            return await componentService.fetchComponentInstanceById(id);
        } catch (error: unknown) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const createComponentInstance = createAsyncThunk(
    'component/create',
    async (payload: ComponentInstancePayload, { rejectWithValue }) => {
        try {
            return await componentService.createComponentInstance(payload);
        } catch (error: unknown) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const updateComponentInstance = createAsyncThunk(
    'component/update',
    async ({ id, data }: { id: string, data: ComponentInstance['data'] }, { rejectWithValue }) => {
        try {
            return await componentService.updateComponentInstance(id, data);
        } catch (error: unknown) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const deleteComponentInstance = createAsyncThunk(
    'component/delete',
    async (id: string, { rejectWithValue }) => {
        try {
            return await componentService.deleteComponentInstance(id);
        } catch (error: unknown) {
            return rejectWithValue(getErrorMessage(error));
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
        // Fetch All
        buildAsyncReducers(builder, fetchComponentInstances, 'fetchAll', (state, action) => {
            const mappedData = mapComponents(action.payload);
            componentAdapter.setAll(state, mappedData);
            state.instances = componentAdapter.getSelectors().selectAll(state);
        });

        // Fetch By Id
        buildAsyncReducers(builder, fetchComponentInstanceById, 'fetchOne', (state, action) => {
            const mappedComponent = mapComponent(action.payload);
            state.currentInstance = mappedComponent;
            componentAdapter.upsertOne(state, mappedComponent);
            state.instances = componentAdapter.getSelectors().selectAll(state);
        });

        // Create
        buildAsyncReducers(builder, createComponentInstance, 'create', (state, action) => {
            const mappedComponent = mapComponent(action.payload);
            componentAdapter.addOne(state, mappedComponent);
            state.instances = componentAdapter.getSelectors().selectAll(state);
        });

        // Update
        buildAsyncReducers(builder, updateComponentInstance, 'update', (state, action) => {
            const mappedComponent = mapComponent(action.payload);
            componentAdapter.upsertOne(state, mappedComponent);
            if (state.currentInstance?.id === mappedComponent.id) {
                state.currentInstance = mappedComponent;
            }
            state.instances = componentAdapter.getSelectors().selectAll(state);
        });

        // Delete
        buildAsyncReducers(builder, deleteComponentInstance, 'delete', (state, action) => {
            componentAdapter.removeOne(state, action.payload);
            if (state.currentInstance?.id === action.payload) {
                state.currentInstance = null;
            }
            state.instances = componentAdapter.getSelectors().selectAll(state);
        });
    }
});

export const {
  selectAll: selectAllComponents,
  selectById: selectComponentById,
  selectIds: selectComponentIds,
} = componentAdapter.getSelectors((state: RootState) => state.component);

export const { clearCurrentInstance } = componentSlice.actions;
export default componentSlice.reducer;
