import { useSelector, useDispatch } from 'react-redux'
import {
  useGetCurrentTenantQuery,
  useGetTenantSettingsQuery,
  useUpdateTenantSettingsMutation,
  useGetAvailableTenantsQuery,
  useCreateTenantMutation,
  useUpdateTenantMutation,
  useDeleteTenantMutation,
  useSwitchTenantMutation,
} from '../store/api/tenantApi'
import {
  selectCurrentTenant,
  selectAvailableTenants,
  selectTenantSettings,
  selectTenantLoading,
  selectTenantError,
  selectTenantId,
  selectTenantName,
  selectTenantDomain,
} from '../store/tenantSlice'

export const useTenant = () => {
  const dispatch = useDispatch()
  
  // Redux state selectors
  const currentTenant = useSelector(selectCurrentTenant)
  const availableTenants = useSelector(selectAvailableTenants)
  const tenantSettings = useSelector(selectTenantSettings)
  const isLoading = useSelector(selectTenantLoading)
  const error = useSelector(selectTenantError)
  const tenantId = useSelector(selectTenantId)
  const tenantName = useSelector(selectTenantName)
  const tenantDomain = useSelector(selectTenantDomain)
  
  // RTK Query hooks
  const { refetch: refetchCurrentTenant } = useGetCurrentTenantQuery(undefined, {
    skip: !tenantId,
  })
  
  const { refetch: refetchTenantSettings } = useGetTenantSettingsQuery(tenantId, {
    skip: !tenantId,
  })
  
  const [updateSettings, updateSettingsResult] = useUpdateTenantSettingsMutation()
  const {data: availableTenantsData } = useGetAvailableTenantsQuery()
  const [createTenant, createTenantResult] = useCreateTenantMutation()
  const [updateTenant, updateTenantResult] = useUpdateTenantMutation()
  const [deleteTenant, deleteTenantResult] = useDeleteTenantMutation()
  const [switchTenant, switchTenantResult] = useSwitchTenantMutation()
  
  // Helper functions
  const refreshTenantData = async () => {
    try {
      await refetchCurrentTenant()
      if (tenantId) {
        await refetchTenantSettings()
      }
    } catch (error) {
      console.error('Failed to refresh tenant data:', error)
    }
  }
  
  const updateTenantSettings = async (settings) => {
    if (!tenantId) {
      throw new Error('No tenant ID available')
    }
    
    try {
      await updateSettings({ tenantId, settings }).unwrap()
    } catch (error) {
      console.error('Failed to update tenant settings:', error)
      throw error
    }
  }
  
  const createNewTenant = async (tenantData) => {
    try {
      const result = await createTenant(tenantData).unwrap()
      return result
    } catch (error) {
      console.error('Failed to create tenant:', error)
      throw error
    }
  }
  
  const updateTenantData = async (tenantData) => {
    if (!tenantId) {
      throw new Error('No tenant ID available')
    }
    
    try {
      const result = await updateTenant({ tenantId, tenantData }).unwrap()
      return result
    } catch (error) {
      console.error('Failed to update tenant:', error)
      throw error
    }
  }
  
  const deleteCurrentTenant = async () => {
    if (!tenantId) {
      throw new Error('No tenant ID available')
    }
    
    try {
      await deleteTenant(tenantId).unwrap()
    } catch (error) {
      console.error('Failed to delete tenant:', error)
      throw error
    }
  }
  
  const switchToTenant = async (newTenantId) => {
    try {
      await switchTenant(newTenantId).unwrap()
    } catch (error) {
      console.error('Failed to switch tenant:', error)
      throw error
    }
  }
  
  return {
    // State
    currentTenant,
    availableTenants: availableTenantsData || [],
    tenantSettings,
    isLoading,
    error,
    tenantId,
    tenantName,
    tenantDomain,
    
    // Actions
    refreshTenantData,
    updateTenantSettings,
    createNewTenant,
    updateTenantData,
    deleteCurrentTenant,
    switchToTenant,
    
    // RTK Query results
    createTenant,
    updateTenant,
    deleteTenant,
    switchTenant,
    
    // Loading states
    isUpdateSettingsLoading: updateSettingsResult.isLoading,
    isCreateTenantLoading: createTenantResult.isLoading,
    isUpdateTenantLoading: updateTenantResult.isLoading,
    isDeleteTenantLoading: deleteTenantResult.isLoading,
    isSwitchTenantLoading: switchTenantResult.isLoading,
    
    // Error states
    updateSettingsError: updateSettingsResult.error,
    createTenantError: createTenantResult.error,
    updateTenantError: updateTenantResult.error,
    deleteTenantError: deleteTenantResult.error,
    switchTenantError: switchTenantResult.error,
  }
}
