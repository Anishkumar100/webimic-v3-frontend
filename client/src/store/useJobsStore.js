import { create } from 'zustand';
import { api } from '../lib/api.js';

export const useJobsStore = create((set, get) => ({
  jobs: [],
  loading: false,
  error: null,
  selectedJobId: null,
  filters: { status: 'all', search: '' },
  pagination: { page: 1, total: 0, totalPages: 1 },

  // ─── FETCH ALL JOBS (called on Dashboard mount) ───────────────────────────
  fetchJobs: async () => {
    set({ loading: true, error: null });
    try {
      const { filters } = get();
      const params = new URLSearchParams({
        status: filters.status,
        search: filters.search,
        page: '1',
        limit: '50',
      });
      const data = await api.get(`/v1/jobs?${params}`);
      set({
        jobs: data.jobs,
        loading: false,
        pagination: { page: data.page, total: data.total, totalPages: data.totalPages },
      });
    } catch (err) {
      set({ loading: false, error: err.message });
    }
  },

  // ─── SUBMIT NEW JOB (called from NewJobModal) ─────────────────────────────
  submitJob: async ({ url, name, scopeMode = 'single', devicePreset = 'desktop' }) => {
    console.log('[JobsUI] Submitting job:', { url, name, scopeMode, devicePreset });
    const newJob = await api.post('/v1/jobs', { url, name, scopeMode, devicePreset });
    console.log('[JobsUI] Job created:', { id: newJob.id, status: newJob.status, queueJobId: newJob.queueJobId });
    set((state) => ({ jobs: [newJob, ...state.jobs] }));
    return newJob;
  },

  // ─── POLL JOB STATUS (called by JobDetail on interval) ────────────────────
  pollJobStatus: async (jobId) => {
    const updated = await api.get(`/v1/jobs/${jobId}/status`);
    console.log('[JobsUI] Poll status:', {
      jobId,
      status: updated.status,
      queueState: updated.queueState,
      queueAttempts: updated.queueAttempts,
      pageCount: updated.pageCount,
      error: updated.error,
    });
    set((state) => ({
      jobs: state.jobs.map((j) => j.id === jobId ? { ...j, ...updated } : j),
    }));
    return updated;
  },

  // ─── FETCH SINGLE JOB DETAIL (called by JobDetail on mount) ──────────────
  fetchJobDetail: async (jobId) => {
    const job = await api.get(`/v1/jobs/${jobId}`);
    console.log('[JobsUI] Job detail loaded:', {
      jobId,
      status: job.status,
      pageCount: job.pageCount,
      tokenSummary: job.tokens,
    });
    set((state) => ({
      jobs: state.jobs.some((j) => j.id === jobId)
        ? state.jobs.map((j) => j.id === jobId ? job : j)
        : [job, ...state.jobs],
    }));
    return job;
  },

  // ─── DELETE JOB ───────────────────────────────────────────────────────────
  deleteJob: async (jobId) => {
    await api.delete(`/v1/jobs/${jobId}`);
    set((state) => ({ jobs: state.jobs.filter((j) => j.id !== jobId) }));
  },

  // ─── RETRY JOB ────────────────────────────────────────────────────────────
  retryJob: async (jobId) => {
    const updated = await api.post(`/v1/jobs/${jobId}/retry`);
    set((state) => ({
      jobs: state.jobs.map((j) => j.id === jobId ? updated : j),
    }));
    return updated;
  },

  // ─── LEGACY METHODS (keep for backward compat with components) ────────────
  setJobs: (jobs) => set({ jobs }),
  addJob: (job) => set((state) => ({ jobs: [job, ...state.jobs] })),
  setSelectedJob: (id) => set({ selectedJobId: id }),

  // Filters
  setFilters: (partial) => set((state) => ({ filters: { ...state.filters, ...partial } })),
  resetFilters: () => set({ filters: { status: 'all', search: '' } }),
  getFilteredJobs: () => {
    const state = useJobsStore.getState();
    let filtered = [...state.jobs];
    if (state.filters.status !== 'all') {
      filtered = filtered.filter((j) => j.status === state.filters.status);
    }
    if (state.filters.search) {
      const q = state.filters.search.toLowerCase();
      filtered = filtered.filter(
        (j) => j.url.toLowerCase().includes(q) || j.name.toLowerCase().includes(q)
      );
    }
    return filtered;
  },
}));
