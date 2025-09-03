import { configureStore } from '@reduxjs/toolkit'
import { authApi } from './api/authApi'
import { appApi } from './api/appApi'
import { sentLettersApi } from './api/sentLettersApi'
import authReducer from './authSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [appApi.reducerPath]: appApi.reducer,
    [sentLettersApi.reducerPath]: sentLettersApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serialization checks
        ignoredActions: [
          'persist/PERSIST', 
          'persist/REHYDRATE',
          // RTK Query action types that may contain non-serializable data
          /^.*\/executeQuery\/.*$/,
          /^.*\/executeMutation\/.*$/,
          /^.*\/initiate$/,
          /^.*\/queryFulfilled$/,
          /^.*\/queryRejected$/,
          /^.*\/mutationFulfilled$/,
          /^.*\/mutationRejected$/,
        ],
        // Ignore these field paths in all actions
        ignoredActionPaths: [
          'payload.timestamp',
          'meta.baseQueryMeta.request',
          'meta.baseQueryMeta.response',
          'meta.requestId',
          'meta.arg',
          'meta.fulfilledTimeStamp',
          'meta.rejectedTimeStamp',
          'meta.aborted',
          'meta.condition',
          'meta.unsubscribe',
          'meta.subscribe',
          'meta.track',
          'meta.arg.track',
          'meta.arg.subscribe',
          'meta.arg.unsubscribe',
        ],
        // Ignore these paths in the state
        ignoredPaths: [
          'authApi',
          'appApi', 
          'sentLettersApi',
        ],
      },
    }).concat(
      authApi.middleware, 
      appApi.middleware, 
      sentLettersApi.middleware
    ),
  devTools: process.env.NODE_ENV !== 'production',
})

// Export store for use in components
export default store
