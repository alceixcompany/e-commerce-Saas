import { ActionReducerMapBuilder, AsyncThunk } from '@reduxjs/toolkit';

/**
 * Type for granular loading states
 */
export type LoadingState = Record<string, boolean>;

/**
 * Creates an initial loading state object
 */
export const createInitialLoadingState = (keys: string[]): LoadingState => {
  return keys.reduce((acc, key) => ({ ...acc, [key]: false }), {});
};

/**
 * Helper to add standard async cases to a slice builder
 */
export const buildAsyncReducers = <TState extends { loading: LoadingState; error: string | null }, TPayload, TArg>(
  builder: ActionReducerMapBuilder<TState>,
  thunk: AsyncThunk<TPayload, TArg, any>,
  loadingKey: string,
  onFulfilled?: (state: any, action: { payload: TPayload }) => void
) => {
  builder
    .addCase(thunk.pending, (state: any) => {
      state.loading[loadingKey] = true;
      state.error = null;
    })
    .addCase(thunk.fulfilled, (state: any, action) => {
      state.loading[loadingKey] = false;
      if (onFulfilled) {
        onFulfilled(state, action);
      }
      state.error = null;
    })
    .addCase(thunk.rejected, (state: any, action) => {
      state.loading[loadingKey] = false;
      state.error = action.payload as string;
    });
};
