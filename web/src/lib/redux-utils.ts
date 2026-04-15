import { ActionReducerMapBuilder, AsyncThunk, Draft, PayloadAction } from '@reduxjs/toolkit';

/**
 * Type for granular loading states
 */
export type LoadingState = Record<string, boolean>;
type AsyncThunkConfig = { rejectValue?: unknown };
type NormalizedEntity = { _id?: string; id?: string };

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    const maybeMessage = 'message' in error ? error.message : undefined;
    if (typeof maybeMessage === 'string' && maybeMessage.trim()) {
      return maybeMessage;
    }

    const response = 'response' in error ? error.response : undefined;
    if (typeof response === 'object' && response !== null && 'data' in response) {
      const responseData = response.data;
      if (typeof responseData === 'object' && responseData !== null && 'message' in responseData) {
        const responseMessage = responseData.message;
        if (typeof responseMessage === 'string' && responseMessage.trim()) {
          return responseMessage;
        }
      }
    }
  }

  return 'Something went wrong';
};

export const normalizeEntity = <T extends NormalizedEntity>(entity: T): T & { id: string } => ({
  ...entity,
  id: entity._id || entity.id || '',
});

export const normalizeEntities = <T extends NormalizedEntity>(entities: T[]): Array<T & { id: string }> =>
  entities.map(normalizeEntity);

/**
 * Creates an initial loading state object
 */
export const createInitialLoadingState = (keys: string[]): LoadingState => {
  return keys.reduce((acc, key) => ({ ...acc, [key]: false }), {});
};

/**
 * Helper to add standard async cases to a slice builder
 */
export const buildAsyncReducers = <
  TState extends { loading: LoadingState; error: string | null },
  TPayload,
  TArg,
  TThunkConfig extends AsyncThunkConfig = AsyncThunkConfig
>(
  builder: ActionReducerMapBuilder<TState>,
  thunk: AsyncThunk<TPayload, TArg, TThunkConfig>,
  loadingKey: string,
  onFulfilled?: (state: Draft<TState>, action: PayloadAction<TPayload>) => void
) => {
  builder
    .addCase(thunk.pending, (state) => {
      state.loading[loadingKey] = true;
      state.error = null;
    })
    .addCase(thunk.fulfilled, (state, action) => {
      state.loading[loadingKey] = false;
      if (onFulfilled) {
        onFulfilled(state, action);
      }
      state.error = null;
    })
    .addCase(thunk.rejected, (state, action) => {
      state.loading[loadingKey] = false;
      state.error = typeof action.payload === 'string' ? action.payload : 'Something went wrong';
    });
};
