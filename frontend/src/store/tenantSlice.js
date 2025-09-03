import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  currentTenant: null,
  availableTenants: [],
  tenantSettings: {},
  isLoading: false,
  error: null,
}

const tenantSlice = createSlice({
  name: 'tenant',
  initialState,
  reducers: {
    setCurrentTenant: (state, action) => {
      state.currentTenant = action.payload
      state.error = null
    },
    
    setAvailableTenants: (state, action) => {
      state.availableTenants = action.payload
    },
    
    setTenantSettings: (state, action) => {
      state.tenantSettings = { ...state.tenantSettings, ...action.payload }
    },
    
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
    
    setError: (state, action) => {
      state.error = action.payload
      state.isLoading = false
    },
    
    clearError: (state) => {
      state.error = null
    },
    
    clearTenantData: (state) => {
      state.currentTenant = null
      state.availableTenants = []
      state.tenantSettings = {}
      state.error = null
    },
  },
})

export const {
  setCurrentTenant,
  setAvailableTenants,
  setTenantSettings,
  setLoading,
  setError,
  clearError,
  clearTenantData,
} = tenantSlice.actions

// Selectors
export const selectCurrentTenant = (state) => state.tenant.currentTenant
export const selectAvailableTenants = (state) => state.tenant.availableTenants
export const selectTenantSettings = (state) => state.tenant.tenantSettings
export const selectTenantLoading = (state) => state.tenant.isLoading
export const selectTenantError = (state) => state.tenant.error

// Helper selectors
export const selectTenantId = (state) => state.tenant.currentTenant?.id
export const selectTenantName = (state) => state.tenant.currentTenant?.name
export const selectTenantDomain = (state) => state.tenant.currentTenant?.domain

export default tenantSlice.reducer
