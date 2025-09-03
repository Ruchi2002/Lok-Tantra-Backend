import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Use the same base query as authApi for consistency
const baseQuery = fetchBaseQuery({
  baseURL: 'http://localhost:8000',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const csrfToken = sessionStorage.getItem('csrfToken')
    if (csrfToken) {
      headers.set('X-CSRF-Token', csrfToken)
    }
    
    if (headers.get('content-type') === null) {
      headers.set('content-type', 'application/json')
    }
    
    return headers
  },
})

export const tenantApi = createApi({
  reducerPath: 'tenantApi',
  baseQuery,
  tagTypes: ['Tenant', 'TenantSettings'],
  endpoints: (builder) => ({
    // Get current tenant info
    getCurrentTenant: builder.query({
      query: () => '/tenants/me',
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch({ type: 'tenant/setCurrentTenant', payload: data })
        } catch (error) {
          console.error('Failed to get current tenant:', error)
        }
      },
      providesTags: ['Tenant'],
    }),
    
    // Get tenant settings
    getTenantSettings: builder.query({
      query: (tenantId) => `/tenants/${tenantId}/settings`,
      async onQueryStarted(tenantId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch({ type: 'tenant/setTenantSettings', payload: data })
        } catch (error) {
          console.error('Failed to get tenant settings:', error)
        }
      },
      providesTags: ['TenantSettings'],
    }),
    
    // Update tenant settings
    updateTenantSettings: builder.mutation({
      query: ({ tenantId, settings }) => ({
        url: `/tenants/${tenantId}/settings`,
        method: 'PUT',
        body: settings,
      }),
      async onQueryStarted({ tenantId, settings }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch({ type: 'tenant/setTenantSettings', payload: data })
        } catch (error) {
          console.error('Failed to update tenant settings:', error)
        }
      },
      invalidatesTags: ['TenantSettings'],
    }),
    
    // Get available tenants (for super admin)
    getAvailableTenants: builder.query({
      query: () => '/tenants',
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch({ type: 'tenant/setAvailableTenants', payload: data })
        } catch (error) {
          console.error('Failed to get available tenants:', error)
        }
      },
      providesTags: ['Tenant'],
    }),
    
    // Create new tenant (super admin only)
    createTenant: builder.mutation({
      query: (tenantData) => ({
        url: '/tenants',
        method: 'POST',
        body: tenantData,
      }),
      invalidatesTags: ['Tenant'],
    }),
    
    // Update tenant (super admin only)
    updateTenant: builder.mutation({
      query: ({ tenantId, tenantData }) => ({
        url: `/tenants/${tenantId}`,
        method: 'PUT',
        body: tenantData,
      }),
      invalidatesTags: ['Tenant'],
    }),
    
    // Delete tenant (super admin only)
    deleteTenant: builder.mutation({
      query: (tenantId) => ({
        url: `/tenants/${tenantId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Tenant'],
    }),
    
    // Switch tenant context
    switchTenant: builder.mutation({
      query: (tenantId) => ({
        url: `/tenants/${tenantId}/switch`,
        method: 'POST',
      }),
      async onQueryStarted(tenantId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch({ type: 'tenant/setCurrentTenant', payload: data })
        } catch (error) {
          console.error('Failed to switch tenant:', error)
        }
      },
      invalidatesTags: ['Tenant', 'TenantSettings'],
    }),
  }),
})

export const {
  useGetCurrentTenantQuery,
  useGetTenantSettingsQuery,
  useUpdateTenantSettingsMutation,
  useGetAvailableTenantsQuery,
  useCreateTenantMutation,
  useUpdateTenantMutation,
  useDeleteTenantMutation,
  useSwitchTenantMutation,
} = tenantApi
