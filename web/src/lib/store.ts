import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import adminReducer from './slices/adminSlice';
import productReducer from './slices/productSlice';
import categoryReducer from './slices/categorySlice';
import profileReducer from './slices/profileSlice';
import contentReducer from './slices/contentSlice';
import orderReducer from './slices/orderSlice';
import blogReducer from './slices/blogSlice';
import componentReducer from './slices/componentSlice';
import pageReducer from './slices/pageSlice';

import { errorMiddleware } from './middleware/errorMiddleware';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
    product: productReducer,
    category: categoryReducer,
    profile: profileReducer,
    content: contentReducer,
    order: orderReducer,
    blog: blogReducer,
    component: componentReducer,
    pages: pageReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(errorMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

