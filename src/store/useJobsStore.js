import { create } from 'zustand';
import { jobsMock } from '../data/jobsMock';

export const useJobsStore = create((set) => ({
  jobs: jobsMock,
  selectedJobId: null,
  filters: { status: 'all', search: '' },
  setJobs: (jobs) => set({ jobs }),
  addJob: (job) => set((state) => ({ jobs: [job, ...state.jobs] })),
  setSelectedJob: (id) => set({ selectedJobId: id }),
  setFilters: (partial) =>
    set((state) => ({ filters: { ...state.filters, ...partial } })),
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
