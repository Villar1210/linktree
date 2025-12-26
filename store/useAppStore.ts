import { create } from 'zustand';
import type { Property, Lead, Campaign, Job } from '../types';

interface AppState {
    properties: Property[];
    leads: Lead[];
    campaigns: Campaign[];
    jobs: Job[];
    isLoading: boolean;
    error: string | null;

    setProperties: (properties: Property[]) => void;
    addProperty: (property: Property) => void;
    updateProperty: (id: string, updates: Partial<Property>) => void;
    removeProperty: (id: string) => void;

    setLeads: (leads: Lead[]) => void;
    addLead: (lead: Lead) => void;
    updateLead: (id: string, updates: Partial<Lead>) => void;
    removeLead: (id: string) => void;

    setCampaigns: (campaigns: Campaign[]) => void;
    setJobs: (jobs: Job[]) => void;

    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearError: () => void;
}

export const useAppStore = create<AppState>((set) => ({
    properties: [],
    leads: [],
    campaigns: [],
    jobs: [],
    isLoading: false,
    error: null,

    setProperties: (properties) => set({ properties }),
    addProperty: (property) => set((state) => ({ properties: [property, ...state.properties] })),
    updateProperty: (id, updates) => set((state) => ({
        properties: state.properties.map((p) => p.id === id ? { ...p, ...updates } : p)
    })),
    removeProperty: (id) => set((state) => ({
        properties: state.properties.filter((p) => p.id !== id)
    })),

    setLeads: (leads) => set({ leads }),
    addLead: (lead) => set((state) => ({ leads: [lead, ...state.leads] })),
    updateLead: (id, updates) => set((state) => ({
        leads: state.leads.map((l) => l.id === id ? { ...l, ...updates } : l)
    })),
    removeLead: (id) => set((state) => ({
        leads: state.leads.filter((l) => l.id !== id)
    })),

    setCampaigns: (campaigns) => set({ campaigns }),
    setJobs: (jobs) => set({ jobs }),

    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),
}));
