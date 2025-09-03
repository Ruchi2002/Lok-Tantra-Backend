import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const sentLettersApi = createApi({
  reducerPath: 'sentLettersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8000',
    credentials: 'include',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['SentLetters'],
  endpoints: (builder) => ({
    // Get all sent letters with pagination and filters
    getAll: builder.query({
      query: (params = {}) => ({
        url: '/sent-letters',
        params: {
          page: params.page || 1,
          per_page: params.per_page || 10,
          search: params.search,
          status: params.status,
          priority: params.priority,
          category: params.category,
        },
      }),
      providesTags: ['SentLetters'],
    }),

    // Get letter by ID
    getById: builder.query({
      query: (id) => `/sent-letters/${id}`,
      providesTags: (result, error, id) => [{ type: 'SentLetters', id }],
    }),

    // Create new letter
    create: builder.mutation({
      query: (letterData) => ({
        url: '/sent-letters',
        method: 'POST',
        body: letterData,
      }),
      invalidatesTags: ['SentLetters'],
    }),

    // Update letter
    update: builder.mutation({
      query: ({ id, ...letterData }) => ({
        url: `/sent-letters/${id}`,
        method: 'PUT',
        body: letterData,
      }),
      invalidatesTags: (result, error, { id }) => [
        'SentLetters',
        { type: 'SentLetters', id },
      ],
    }),

    // Delete letter
    delete: builder.mutation({
      query: (id) => ({
        url: `/sent-letters/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SentLetters'],
    }),

    // Get statistics
    getStatistics: builder.query({
      query: () => '/sent-letters/statistics',
      providesTags: ['SentLetters'],
    }),

    // Get categories
    getCategories: builder.query({
      query: () => '/sent-letters/categories',
      providesTags: ['SentLetters'],
    }),

    // Get priorities
    getPriorities: builder.query({
      query: () => '/sent-letters/priorities',
      providesTags: ['SentLetters'],
    }),

    // Get statuses
    getStatuses: builder.query({
      query: () => '/sent-letters/statuses',
      providesTags: ['SentLetters'],
    }),

    // Update letter status
    updateStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/sent-letters/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        'SentLetters',
        { type: 'SentLetters', id },
      ],
    }),

    // Record response
    recordResponse: builder.mutation({
      query: ({ id, response_content }) => ({
        url: `/sent-letters/${id}/response`,
        method: 'POST',
        body: { response_content },
      }),
      invalidatesTags: (result, error, { id }) => [
        'SentLetters',
        { type: 'SentLetters', id },
      ],
    }),

    // Get overdue followups
    getOverdueFollowups: builder.query({
      query: () => '/sent-letters/overdue-followups',
      providesTags: ['SentLetters'],
    }),

    // Get followups due this week
    getFollowupsDueThisWeek: builder.query({
      query: () => '/sent-letters/followups-due-this-week',
      providesTags: ['SentLetters'],
    }),

    // Assign letter to user
    assignToUser: builder.mutation({
      query: ({ id, user_id }) => ({
        url: `/sent-letters/${id}/assign`,
        method: 'PATCH',
        body: { user_id },
      }),
      invalidatesTags: (result, error, { id }) => [
        'SentLetters',
        { type: 'SentLetters', id },
      ],
    }),
  }),
})

export const {
  useGetAllQuery,
  useGetByIdQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
  useGetStatisticsQuery,
  useGetCategoriesQuery,
  useGetPrioritiesQuery,
  useGetStatusesQuery,
  useUpdateStatusMutation,
  useRecordResponseMutation,
  useGetOverdueFollowupsQuery,
  useGetFollowupsDueThisWeekQuery,
  useAssignToUserMutation,
} = sentLettersApi
