import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import adminReducer from './slices/adminSlice';
import productReducer from './slices/productSlice';
import categoryReducer from './slices/categorySlice';
import profileReducer from './slices/profileSlice';
import contentReducer from './slices/contentSlice';
import orderReducer from './slices/orderSlice';
import blogReducer from './slices/blogSlice';

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
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

