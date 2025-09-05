import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const appApi = createApi({
  reducerPath: 'appApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8000',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      headers.set('Content-Type', 'application/json')
      
      // Add authorization header if token exists
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      
      return headers
    },
  }),
  tagTypes: ['SentLetters', 'ReceivedLetters', 'SentGrievanceLetters', 'CitizenIssues', 'Visits', 'Tenants', 'Dashboard', 'MeetingPrograms'],
  endpoints: (builder) => ({
    // ===== SENT LETTERS =====
    getSentLetters: builder.query({
      query: (params = {}) => ({
        url: '/sent-letters',
        params,
      }),
      providesTags: ['SentLetters'],
    }),

    getSentLetterById: builder.query({
      query: (letterId) => `/sent-letters/${letterId}`,
      providesTags: (result, error, letterId) => [{ type: 'SentLetters', id: letterId }],
    }),

    createSentLetter: builder.mutation({
      query: (letterData) => ({
        url: '/sent-letters',
        method: 'POST',
        body: letterData,
      }),
      invalidatesTags: ['SentLetters'],
    }),

    updateSentLetter: builder.mutation({
      query: ({ letterId, letterData }) => ({
        url: `/sent-letters/${letterId}`,
        method: 'PUT',
        body: letterData,
      }),
      invalidatesTags: (result, error, { letterId }) => [
        'SentLetters',
        { type: 'SentLetters', id: letterId },
      ],
    }),

    deleteSentLetter: builder.mutation({
      query: (letterId) => ({
        url: `/sent-letters/${letterId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SentLetters'],
    }),

    getSentLettersStatistics: builder.query({
      query: () => '/sent-letters/statistics/overview',
      providesTags: ['SentLetters'],
    }),

    // ===== RECEIVED LETTERS =====
    getReceivedLetters: builder.query({
      query: (params = {}) => ({
        url: '/letters/received',
        params,
      }),
      providesTags: ['ReceivedLetters'],
    }),

    getReceivedLetterById: builder.query({
      query: (letterId) => `/letters/received/${letterId}`,
      providesTags: (result, error, letterId) => [{ type: 'ReceivedLetters', id: letterId }],
    }),

    createReceivedLetter: builder.mutation({
      query: (letterData) => ({
        url: '/letters/received',
        method: 'POST',
        body: letterData,
      }),
      invalidatesTags: ['ReceivedLetters'],
    }),

    updateReceivedLetter: builder.mutation({
      query: ({ letterId, letterData }) => ({
        url: `/letters/received/${letterId}`,
        method: 'PUT',
        body: letterData,
      }),
      invalidatesTags: (result, error, { letterId }) => [
        'ReceivedLetters',
        { type: 'ReceivedLetters', id: letterId },
      ],
    }),

    deleteReceivedLetter: builder.mutation({
      query: (letterId) => ({
        url: `/letters/received/${letterId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ReceivedLetters'],
    }),

    getReceivedLettersStatistics: builder.query({
      query: () => '/letters/received/statistics/overview',
      providesTags: ['ReceivedLetters'],
    }),

    // ===== SENT GRIEVANCE LETTERS =====
    getSentGrievanceLetters: builder.query({
      query: (params = {}) => ({
        url: '/sent-grievance-letters',
        params,
      }),
      providesTags: ['SentGrievanceLetters'],
    }),

    getAccessibleCitizenIssues: builder.query({
      query: () => '/sent-grievance-letters/accessible-citizen-issues',
      providesTags: ['AccessibleCitizenIssues'],
    }),

    getSentGrievanceLetterById: builder.query({
      query: (letterId) => `/sent-grievance-letters/${letterId}`,
      providesTags: (result, error, letterId) => [{ type: 'SentGrievanceLetters', id: letterId }],
    }),

    createSentGrievanceLetter: builder.mutation({
      query: (letterData) => ({
        url: '/sent-grievance-letters',
        method: 'POST',
        body: letterData,
      }),
      invalidatesTags: ['SentGrievanceLetters'],
    }),

    updateSentGrievanceLetter: builder.mutation({
      query: ({ letterId, letterData }) => ({
        url: `/sent-grievance-letters/${letterId}`,
        method: 'PUT',
        body: letterData,
      }),
      invalidatesTags: (result, error, { letterId }) => [
        'SentGrievanceLetters',
        { type: 'SentGrievanceLetters', id: letterId },
      ],
    }),

    deleteSentGrievanceLetter: builder.mutation({
      query: (letterId) => ({
        url: `/sent-grievance-letters/${letterId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SentGrievanceLetters'],
    }),

    recordSentGrievanceLetterResponse: builder.mutation({
      query: ({ letterId, responseContent }) => ({
        url: `/sent-grievance-letters/${letterId}/record-response`,
        method: 'POST',
        body: { response_content: responseContent },
      }),
      invalidatesTags: (result, error, { letterId }) => [
        'SentGrievanceLetters',
        { type: 'SentGrievanceLetters', id: letterId },
      ],
    }),

    // ===== CITIZEN ISSUES =====
    getCitizenIssues: builder.query({
      query: (params = {}) => ({
        url: '/citizen-issues',
        params,
      }),
      providesTags: ['CitizenIssues'],
    }),

    getCitizenIssueById: builder.query({
      query: (issueId) => `/citizen-issues/${issueId}`,
      providesTags: (result, error, issueId) => [{ type: 'CitizenIssues', id: issueId }],
    }),

    createCitizenIssue: builder.mutation({
      query: (issueData) => ({
        url: '/citizen-issues',
        method: 'POST',
        body: issueData,
      }),
      invalidatesTags: ['CitizenIssues', 'Dashboard', 'Visits'],
    }),

    updateCitizenIssue: builder.mutation({
      query: ({ issueId, issueData }) => ({
        url: `/citizen-issues/${issueId}`,
        method: 'PUT',
        body: issueData,
      }),
      invalidatesTags: (result, error, { issueId }) => [
        'CitizenIssues',
        'Dashboard',
        'Visits',
        { type: 'CitizenIssues', id: issueId },
      ],
    }),

    deleteCitizenIssue: builder.mutation({
      query: (issueId) => ({
        url: `/citizen-issues/${issueId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CitizenIssues', 'Dashboard', 'Visits'],
    }),

    getCitizenIssuesGeoJson: builder.query({
      query: () => '/citizen-issues/geojson/all',
      providesTags: ['CitizenIssues'],
    }),

    // Get issue categories for filtering
    getIssueCategories: builder.query({
      query: () => '/citizen-issues/categories',
      providesTags: ['CitizenIssues'],
    }),

    // Get areas for filtering
    getAreas: builder.query({
      query: () => '/citizen-issues/areas',
      providesTags: ['CitizenIssues'],
    }),

    // Get available users for assignment
    getAvailableUsers: builder.query({
      query: () => '/citizen-issues/users',
      providesTags: ['CitizenIssues'],
    }),

    // Removed getMeetingParticipants as we're using manual participant entry

    // Get filtered citizen issues with advanced filtering
    getFilteredCitizenIssues: builder.query({
      query: (params) => ({
        url: '/citizen-issues/filtered',
        params,
      }),
      providesTags: ['CitizenIssues'],
    }),

    // Get FieldAgent issues (only issues they created or are assigned to)
    getFieldAgentIssues: builder.query({
      query: (params = {}) => ({
        url: '/citizen-issues/field-agent',
        params,
      }),
      providesTags: ['CitizenIssues'],
    }),

    // ===== VISITS =====
    getVisits: builder.query({
      query: (params = {}) => ({
        url: '/visits',
        params,
      }),
      providesTags: ['Visits'],
    }),

    getVisitById: builder.query({
      query: (visitId) => `/visits/${visitId}`,
      providesTags: (result, error, visitId) => [{ type: 'Visits', id: visitId }],
    }),

    createVisit: builder.mutation({
      query: (visitData) => ({
        url: '/visits',
        method: 'POST',
        body: visitData,
      }),
      invalidatesTags: ['Visits'],
    }),

    updateVisit: builder.mutation({
      query: ({ visitId, visitData }) => ({
        url: `/visits/${visitId}`,
        method: 'PUT',
        body: visitData,
      }),
      invalidatesTags: (result, error, { visitId }) => [
        'Visits',
        { type: 'Visits', id: visitId },
      ],
    }),

    deleteVisit: builder.mutation({
      query: (visitId) => ({
        url: `/visits/${visitId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Visits'],
    }),

    // Get visit statistics
    getVisitStats: builder.query({
      query: () => '/visits/stats',
      providesTags: ['Visits'],
    }),

    // Get eligible citizen issues for visits
    getEligibleCitizenIssues: builder.query({
      query: () => '/visits/eligible-issues',
      providesTags: ['Visits'],
    }),

    // Get locations for visits
    getLocations: builder.query({
      query: () => '/visits/locations',
      providesTags: ['Visits'],
    }),

    // Get assistants for visits
    getAssistants: builder.query({
      query: () => '/visits/assistants',
      providesTags: ['Visits'],
    }),

    // Validate visit data
    validateVisitData: builder.mutation({
      query: (visitData) => ({
        url: '/visits/validate',
        method: 'POST',
        body: visitData,
      }),
    }),

    // ===== TENANTS =====
    getTenants: builder.query({
      query: (params = {}) => ({
        url: '/tenants',
        params,
      }),
      providesTags: ['Tenants'],
    }),

    getTenantById: builder.query({
      query: (tenantId) => `/tenants/${tenantId}`,
      providesTags: (result, error, tenantId) => [{ type: 'Tenants', id: tenantId }],
    }),

    createTenant: builder.mutation({
      query: (tenantData) => ({
        url: '/tenants',
        method: 'POST',
        body: tenantData,
      }),
      invalidatesTags: ['Tenants'],
    }),

    updateTenant: builder.mutation({
      query: ({ tenantId, tenantData }) => ({
        url: `/tenants/${tenantId}`,
        method: 'PUT',
        body: tenantData,
      }),
      invalidatesTags: (result, error, { tenantId }) => [
        'Tenants',
        { type: 'Tenants', id: tenantId },
      ],
    }),

    deleteTenant: builder.mutation({
      query: (tenantId) => ({
        url: `/tenants/${tenantId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Tenants'],
    }),

    // ===== DASHBOARD =====
    getDashboardStats: builder.query({
      query: () => '/dashboard/stats',
      providesTags: ['Dashboard'],
    }),

    getPublicDashboardStats: builder.query({
      query: () => '/dashboard/stats/public',
      providesTags: ['Dashboard'],
    }),

    // ===== MEETING PROGRAMS =====
    getMeetingPrograms: builder.query({
      query: (params = {}) => ({
        url: '/meeting-programs',
        params,
      }),
      providesTags: ['MeetingPrograms'],
    }),

    createMeetingProgram: builder.mutation({
      query: (programData) => ({
        url: '/meeting-programs',
        method: 'POST',
        body: programData,
      }),
      invalidatesTags: ['MeetingPrograms'],
    }),

    updateMeetingProgram: builder.mutation({
      query: ({ programId, programData }) => ({
        url: `/meeting-programs/${programId}`,
        method: 'PUT',
        body: programData,
      }),
      invalidatesTags: ['MeetingPrograms'],
    }),

    deleteMeetingProgram: builder.mutation({
      query: (programId) => ({
        url: `/meeting-programs/${programId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MeetingPrograms'],
    }),

    getTodayMeetings: builder.query({
      query: () => '/meeting-programs/upcoming/today',
      providesTags: ['MeetingPrograms'],
    }),

    getMeetingKPIs: builder.query({
      query: () => '/meeting-programs/dashboard/kpis',
      providesTags: ['MeetingPrograms'],
    }),

    getMeetingStats: builder.query({
      query: () => '/meeting-programs/dashboard/stats',
      providesTags: ['MeetingPrograms'],
    }),
  }),
})

export const {
  // Sent Letters
  useGetSentLettersQuery,
  useGetSentLetterByIdQuery,
  useCreateSentLetterMutation,
  useUpdateSentLetterMutation,
  useDeleteSentLetterMutation,
  useGetSentLettersStatisticsQuery,
  
  // Received Letters
  useGetReceivedLettersQuery,
  useGetReceivedLetterByIdQuery,
  useCreateReceivedLetterMutation,
  useUpdateReceivedLetterMutation,
  useDeleteReceivedLetterMutation,
  useGetReceivedLettersStatisticsQuery,
  
  // Sent Grievance Letters
  useGetSentGrievanceLettersQuery,
  useGetAccessibleCitizenIssuesQuery,
  useGetSentGrievanceLetterByIdQuery,
  useCreateSentGrievanceLetterMutation,
  useUpdateSentGrievanceLetterMutation,
  useDeleteSentGrievanceLetterMutation,
  useRecordSentGrievanceLetterResponseMutation,
  
  // Citizen Issues
  useGetCitizenIssuesQuery,
  useGetCitizenIssueByIdQuery,
  useCreateCitizenIssueMutation,
  useUpdateCitizenIssueMutation,
  useDeleteCitizenIssueMutation,
  useGetCitizenIssuesGeoJsonQuery,
  useGetIssueCategoriesQuery,
  useGetAreasQuery,
  useGetAvailableUsersQuery,
  useGetFilteredCitizenIssuesQuery,
  useGetFieldAgentIssuesQuery,
  
  // Visits
  useGetVisitsQuery,
  useGetVisitByIdQuery,
  useCreateVisitMutation,
  useUpdateVisitMutation,
  useDeleteVisitMutation,
  useGetVisitStatsQuery,
  useGetEligibleCitizenIssuesQuery,
  useGetLocationsQuery,
  useGetAssistantsQuery,
  useValidateVisitDataMutation,
  
  // Tenants
  useGetTenantsQuery,
  useGetTenantByIdQuery,
  useCreateTenantMutation,
  useUpdateTenantMutation,
  useDeleteTenantMutation,
  
  // Dashboard
  useGetDashboardStatsQuery,
  useGetPublicDashboardStatsQuery,
  
  // Meeting Programs
  useGetMeetingProgramsQuery,
  useGetTodayMeetingsQuery,
  useGetMeetingKPIsQuery,
  useGetMeetingStatsQuery,
  useCreateMeetingProgramMutation,
  useUpdateMeetingProgramMutation,
  useDeleteMeetingProgramMutation,
} = appApi
