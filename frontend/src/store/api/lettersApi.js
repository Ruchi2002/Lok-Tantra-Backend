import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Base query with authentication
const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:8000',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    headers.set('Content-Type', 'application/json')
    
    // Add authorization header if token exists
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    console.log('Letters API prepareHeaders - Token found:', !!token, 'Token:', token ? token.substring(0, 20) + '...' : 'None')
    console.log('Letters API prepareHeaders - Full token:', token)
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
      console.log('Letters API prepareHeaders - Authorization header set')
    } else {
      console.log('Letters API prepareHeaders - No token found, not setting Authorization header')
    }
    
    return headers
  },
});

export const lettersApi = createApi({
  reducerPath: 'lettersApi',
  baseQuery,
  tagTypes: ['Letters', 'LetterStatistics'],
  endpoints: (builder) => ({
    // Received Letters
    getReceivedLetters: builder.query({
      query: (params = {}) => ({
        url: '/letters/received/',
        method: 'GET',
        params: {
          page: params.page || 1,
          per_page: params.per_page || 20,
          search: params.search,
          status: params.status,
          priority: params.priority,
          category: params.category,
          date_from: params.date_from,
          date_to: params.date_to,
        },
      }),
      providesTags: (result) =>
        result && result.letters
          ? [
              ...result.letters.map(({ id }) => ({ type: 'Letters', id: `received-${id}` })),
              { type: 'Letters', id: 'received-list' },
            ]
          : [{ type: 'Letters', id: 'received-list' }],
    }),

    getReceivedLetter: builder.query({
      query: (id) => `/letters/received/${id}`,
      providesTags: (result, error, id) => [{ type: 'Letters', id: `received-${id}` }],
    }),

    createReceivedLetter: builder.mutation({
      query: (letterData) => ({
        url: '/letters/received/',
        method: 'POST',
        body: letterData,
      }),
      invalidatesTags: [{ type: 'Letters', id: 'received-list' }],
    }),

    updateReceivedLetter: builder.mutation({
      query: ({ id, ...letterData }) => ({
        url: `/letters/received/${id}`,
        method: 'PUT',
        body: letterData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Letters', id: `received-${id}` },
        { type: 'Letters', id: 'received-list' },
      ],
    }),

    deleteReceivedLetter: builder.mutation({
      query: (id) => ({
        url: `/letters/received/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Letters', id: 'received-list' }],
    }),

    // Sent Letters (Public Interest)
    getSentLettersPublicInterest: builder.query({
      query: (params = {}) => ({
        url: '/sent-letters/',
        method: 'GET',
        params: {
          page: params.page || 1,
          per_page: params.per_page || 20,
          search: params.search,
          status: params.status,
          priority: params.priority,
          category: params.category,
          date_from: params.date_from,
          date_to: params.date_to,
        },
      }),
      providesTags: (result) =>
        result && result.letters
          ? [
              ...result.letters.map(({ id }) => ({ type: 'Letters', id: `sent-${id}` })),
              { type: 'Letters', id: 'sent-list' },
            ]
          : [{ type: 'Letters', id: 'sent-list' }],
    }),

    getSentLetterPublicInterest: builder.query({
      query: (id) => `/sent-letters/${id}`,
      providesTags: (result, error, id) => [{ type: 'Letters', id: `sent-${id}` }],
    }),

    createSentLetterPublicInterest: builder.mutation({
      query: (letterData) => ({
        url: '/sent-letters/',
        method: 'POST',
        body: letterData,
      }),
      invalidatesTags: [{ type: 'Letters', id: 'sent-list' }],
    }),

    updateSentLetterPublicInterest: builder.mutation({
      query: ({ id, ...letterData }) => ({
        url: `/sent-letters/${id}`,
        method: 'PUT',
        body: letterData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Letters', id: `sent-${id}` },
        { type: 'Letters', id: 'sent-list' },
      ],
    }),

    deleteSentLetterPublicInterest: builder.mutation({
      query: (id) => ({
        url: `/sent-letters/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Letters', id: 'sent-list' }],
    }),

    // Sent Letters (Public Grievance)
    getSentLettersPublicGrievance: builder.query({
      query: (params = {}) => ({
        url: '/letters/public-grievance',
        method: 'GET',
        params: {
          page: params.page || 1,
          per_page: params.per_page || 20,
          search: params.search,
          status: params.status,
          priority: params.priority,
          category: params.category,
        },
      }),
      providesTags: (result) =>
        result && result.letters
          ? [
              ...result.letters.map(({ id }) => ({ type: 'Letters', id: `public-grievance-${id}` })),
              { type: 'Letters', id: 'public-grievance-list' },
            ]
          : [{ type: 'Letters', id: 'public-grievance-list' }],
    }),

    getSentLetterPublicGrievance: builder.query({
      query: (id) => `/letters/public-grievance/${id}`,
      providesTags: (result, error, id) => [{ type: 'Letters', id: `public-grievance-${id}` }],
    }),

    createSentLetterPublicGrievance: builder.mutation({
      query: (letterData) => ({
        url: '/letters/public-grievance',
        method: 'POST',
        body: letterData,
      }),
      invalidatesTags: [{ type: 'Letters', id: 'public-grievance-list' }],
    }),

    updateSentLetterPublicGrievance: builder.mutation({
      query: ({ id, ...letterData }) => ({
        url: `/letters/public-grievance/${id}`,
        method: 'PUT',
        body: letterData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Letters', id: `public-grievance-${id}` },
        { type: 'Letters', id: 'public-grievance-list' },
      ],
    }),

    deleteSentLetterPublicGrievance: builder.mutation({
      query: (id) => ({
        url: `/letters/public-grievance/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Letters', id: 'public-grievance-list' }],
    }),

    // Letter Statistics
    getLettersStatistics: builder.query({
      query: () => '/letters/received/statistics/overview',
      providesTags: ['LetterStatistics'],
    }),

    getSentLettersStatistics: builder.query({
      query: () => '/sent-letters/statistics',
      providesTags: ['SentLetterStatistics'],
    }),
  }),
});

// Export hooks for use in components
export const {
  // Received Letters
  useGetReceivedLettersQuery,
  useGetReceivedLetterQuery,
  useCreateReceivedLetterMutation,
  useUpdateReceivedLetterMutation,
  useDeleteReceivedLetterMutation,

  // Sent Letters (Public Interest)
  useGetSentLettersPublicInterestQuery,
  useGetSentLetterPublicInterestQuery,
  useCreateSentLetterPublicInterestMutation,
  useUpdateSentLetterPublicInterestMutation,
  useDeleteSentLetterPublicInterestMutation,

  // Sent Letters (Public Grievance)
  useGetSentLettersPublicGrievanceQuery,
  useGetSentLetterPublicGrievanceQuery,
  useCreateSentLetterPublicGrievanceMutation,
  useUpdateSentLetterPublicGrievanceMutation,
  useDeleteSentLetterPublicGrievanceMutation,

  // Statistics
  useGetLettersStatisticsQuery,
} = lettersApi;
