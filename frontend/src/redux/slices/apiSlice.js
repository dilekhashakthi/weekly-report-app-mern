import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Report', 'Project', 'User', 'Dashboard'],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation({
      query: (credentials) => ({
        url: '/v1/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User', 'Dashboard', 'Report'],
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/v1/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    getMe: builder.query({
      query: () => '/v1/auth/me',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation({
      query: (body) => ({
        url: '/v1/auth/profile',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    // Report endpoints
    getReports: builder.query({
      query: (params = {}) => ({
        url: '/v1/reports',
        params,
      }),
      providesTags: ['Report'],
    }),
    getReportById: builder.query({
      query: (id) => `/v1/reports/${id}`,
      providesTags: (result, error, id) => [{ type: 'Report', id }],
    }),
    getReportVersions: builder.query({
      query: (id) => `/v1/reports/${id}/versions`,
      providesTags: (result, error, id) => [{ type: 'Report', id: `${id}-versions` }],
    }),
    createReport: builder.mutation({
      query: (body) => ({
        url: '/v1/reports',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Report', 'Dashboard'],
    }),
    updateReport: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/v1/reports/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => ['Report', 'Dashboard', { type: 'Report', id }],
    }),
    deleteReport: builder.mutation({
      query: (id) => ({
        url: `/v1/reports/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Report', 'Dashboard'],
    }),
    submitReport: builder.mutation({
      query: (id) => ({
        url: `/v1/reports/${id}/submit`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => ['Report', 'Dashboard', { type: 'Report', id }],
    }),
    reviewReport: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/v1/reports/${id}/review`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { id }) => ['Report', 'Dashboard', { type: 'Report', id }],
    }),

    // Project endpoints
    getProjects: builder.query({
      query: (params = {}) => ({
        url: '/v1/projects',
        params,
      }),
      providesTags: ['Project'],
    }),
    createProject: builder.mutation({
      query: (body) => ({
        url: '/v1/projects',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Project', 'Dashboard'],
    }),
    updateProject: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/v1/projects/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: ['Project', 'Dashboard'],
    }),
    deleteProject: builder.mutation({
      query: (id) => ({
        url: `/v1/projects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Project', 'Dashboard'],
    }),

    // User endpoints
    getUsers: builder.query({
      query: () => '/v1/users',
      providesTags: ['User'],
    }),
    createUser: builder.mutation({
      query: (body) => ({
        url: '/v1/users',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User', 'Dashboard'],
    }),
    updateUser: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/v1/users/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: ['User', 'Dashboard'],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/v1/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User', 'Dashboard'],
    }),

    // Dashboard endpoints
    getDashboardSummary: builder.query({
      query: (params = {}) => ({
        url: '/v1/dashboard/summary',
        params,
      }),
      providesTags: ['Dashboard'],
    }),
    getStatusByMember: builder.query({
      query: (params = {}) => ({
        url: '/v1/dashboard/status-by-member',
        params,
      }),
      providesTags: ['Dashboard'],
    }),
    getTasksTrend: builder.query({
      query: (params = {}) => ({
        url: '/v1/dashboard/tasks-trend',
        params,
      }),
      providesTags: ['Dashboard'],
    }),
    getWorkloadByProject: builder.query({
      query: (params = {}) => ({
        url: '/v1/dashboard/workload-by-project',
        params,
      }),
      providesTags: ['Dashboard'],
    }),
    getTimeByType: builder.query({
      query: (params = {}) => ({
        url: '/v1/dashboard/time-by-type',
        params,
      }),
      providesTags: ['Dashboard'],
    }),
    getDashboardActivity: builder.query({
      query: (params = {}) => ({
        url: '/v1/dashboard/activity',
        params,
      }),
      providesTags: ['Dashboard'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useUpdateProfileMutation,
  useGetReportsQuery,
  useGetReportByIdQuery,
  useGetReportVersionsQuery,
  useCreateReportMutation,
  useUpdateReportMutation,
  useDeleteReportMutation,
  useSubmitReportMutation,
  useReviewReportMutation,
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetDashboardSummaryQuery,
  useGetStatusByMemberQuery,
  useGetTasksTrendQuery,
  useGetWorkloadByProjectQuery,
  useGetTimeByTypeQuery,
  useGetDashboardActivityQuery,
} = apiSlice;
