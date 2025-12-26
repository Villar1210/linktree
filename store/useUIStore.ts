import { create } from 'zustand';

interface UIState {
    theme: 'light' | 'dark';
    isModalOpen: boolean;
    modalContent: React.ReactNode | null;
    isSidebarOpen: boolean;
    searchQuery: string;
    filters: {
        type?: string;
        minPrice?: number;
        maxPrice?: number;
        city?: string;
    };

    setTheme: (theme: 'light' | 'dark') => void;
    toggleTheme: () => void;
    openModal: (content: React.ReactNode) => void;
    closeModal: () => void;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    setSearchQuery: (query: string) => void;
    setFilters: (filters: UIState['filters']) => void;
    clearFilters: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    theme: 'light',
    isModalOpen: false,
    modalContent: null,
    isSidebarOpen: false,
    searchQuery: '',
    filters: {},

    setTheme: (theme) => set({ theme }),
    toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
    openModal: (content) => set({ isModalOpen: true, modalContent: content }),
    closeModal: () => set({ isModalOpen: false, modalContent: null }),
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    setSidebarOpen: (open) => set({ isSidebarOpen: open }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setFilters: (filters) => set({ filters }),
    clearFilters: () => set({ filters: {} }),
}));
