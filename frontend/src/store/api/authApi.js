import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Simple base query with credentials for httpOnly cookies
const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:8000',
  credentials: 'include', // For httpOnly cookies
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json')
    return headers
  },
})

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQuery,
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    // Login
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          
          // Set auth state directly in the API cache
          dispatch(authApi.util.upsertQueryData('getCurrentUser', undefined, {
            id: data.user_id,
            email: data.email,
            name: data.name,
            role: data.role,
            tenant_id: data.tenant_id,
            user_type: data.user_type,
            permissions: data.permissions || [],
          }))
          
          // Set authenticated state
          dispatch({ type: 'auth/setAuthenticated' })
          
        } catch (error) {
          console.error('Login failed:', error)
        }
      },
      invalidatesTags: ['Auth'],
    }),
    
    // Logout
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          // Clear all auth data
          dispatch(authApi.util.resetApiState())
          dispatch({ type: 'auth/logout' })
        }
      },
      invalidatesTags: ['Auth'],
    }),
    
    // Get current user (with caching)
    getCurrentUser: builder.query({
      query: () => '/auth/me',
      providesTags: ['Auth'],
    }),
    
    // Change password
    changePassword: builder.mutation({
      query: (passwordData) => ({
        url: '/auth/change-password',
        method: 'POST',
        body: passwordData,
      }),
    }),
    
    // Password reset
    requestPasswordReset: builder.mutation({
      query: (email) => ({
        url: '/auth/password-reset',
        method: 'POST',
        body: { email },
      }),
    }),
    
    confirmPasswordReset: builder.mutation({
      query: (resetData) => ({
        url: '/auth/password-reset/confirm',
        method: 'POST',
        body: resetData,
      }),
    }),
  }),
})

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useChangePasswordMutation,
  useRequestPasswordResetMutation,
  useConfirmPasswordResetMutation,
} = authApi
