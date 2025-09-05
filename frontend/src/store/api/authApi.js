import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { setAuthenticated, logout as logoutAction } from '../authSlice'

// Simple base query with credentials for httpOnly cookies
const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:8000',
  credentials: 'include', // For httpOnly cookies
  prepareHeaders: (headers, { getState }) => {
    headers.set('Content-Type', 'application/json')
    
    // Add authorization header if token exists
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    console.log('Auth API prepareHeaders - Token found:', !!token, 'Token:', token ? token.substring(0, 20) + '...' : 'None')
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    
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
          
          console.log('Login response:', data) // Debug log
          
          // Store the access token in localStorage
          if (data.access_token) {
            localStorage.setItem('accessToken', data.access_token)
            console.log('Token stored:', data.access_token) // Debug log
          } else {
            console.warn('No access_token in response:', data) // Debug log
          }
          
          // Set auth state in both API cache and auth slice
          dispatch(authApi.util.upsertQueryData('getCurrentUser', undefined, {
            id: data.user_id,
            email: data.email,
            name: data.name,
            role: data.role,
            tenant_id: data.tenant_id,
            user_type: data.user_type,
            permissions: data.permissions || [],
          }))
          
          // Also dispatch to auth slice
          dispatch(setAuthenticated({
            user: {
              id: data.user_id,
              email: data.email,
              name: data.name,
              role: data.role,
              tenant_id: data.tenant_id,
              user_type: data.user_type,
              permissions: data.permissions || [],
            }
          }))
          
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
          
          // If the error is 401 (Unauthorized), try force logout
          if (error.status === 401) {
            console.log('Session already expired - trying force logout...')
            try {
              // Try the force logout endpoint
              await fetch('http://localhost:8000/auth/logout-force', {
                method: 'POST',
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json',
                },
              })
              console.log('Force logout successful')
            } catch (forceLogoutError) {
              console.error('Force logout also failed:', forceLogoutError)
            }
          }
        } finally {
          // Always clear local state regardless of server response
          // This ensures logout works even if the server is unreachable or returns errors
          localStorage.removeItem('accessToken')
          sessionStorage.removeItem('accessToken')
          
          // Clear all auth data
          dispatch(authApi.util.resetApiState())
          dispatch(logoutAction())
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
