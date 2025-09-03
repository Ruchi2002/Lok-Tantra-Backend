import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticated: (state, action) => {
      state.isAuthenticated = true
      state.isLoading = false
      state.user = action.payload?.user || null
    },
    
    logout: (state) => {
      state.isAuthenticated = false
      state.isLoading = false
      state.user = null
    },
    
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
  },
})

export const {
  setAuthenticated,
  logout,
  setLoading,
} = authSlice.actions

// Selectors
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectIsLoading = (state) => state.auth.isLoading
export const selectUser = (state) => state.auth.user

export default authSlice.reducer
