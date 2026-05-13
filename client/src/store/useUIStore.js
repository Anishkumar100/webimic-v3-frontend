import { create } from 'zustand';

export const useUIStore = create((set) => ({
  theme: 'dark',
  activeSectionId: null,
  isNavOpen: false,
  isSidebarCollapsed: false,
  activeTab: null,
  setTheme: (theme) => set({ theme }),
  setActiveSection: (id) => set({ activeSectionId: id }),
  toggleNav: () => set((s) => ({ isNavOpen: !s.isNavOpen })),
  closeNav: () => set({ isNavOpen: false }),
  toggleSidebar: () => set((s) => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
