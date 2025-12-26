import { create } from 'zustand';
import { dealsService } from '../services/deals.service';
import type { Deal } from '../types/crm';

interface DealsState {
    deals: Deal[];
    isLoading: boolean;
    error: string | null;

    fetchDeals: (funnelId: string) => Promise<void>;
    moveDeal: (dealId: string, newStageId: string) => Promise<void>;
    addDeal: (deal: Partial<Deal>) => Promise<void>;
    updateDeal: (id: string, updates: Partial<Deal>) => Promise<void>;
}

export const useDealsStore = create<DealsState>((set, get) => ({
    deals: [],
    isLoading: false,
    error: null,

    fetchDeals: async (funnelId) => {
        set({ isLoading: true });
        try {
            const deals = await dealsService.getByFunnel(funnelId);
            set({ deals, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    moveDeal: async (dealId, newStageId) => {
        // Optimistic update
        set(state => ({
            deals: state.deals.map(d =>
                d.id === dealId ? { ...d, stage_id: newStageId } : d
            )
        }));

        try {
            await dealsService.moveStage(dealId, newStageId);
        } catch (error: any) {
            // Revert handle handled by toast usually
            set({ error: error.message });
            // In a real app we would revert the state here
        }
    },

    addDeal: async (dealData) => {
        set({ isLoading: true });
        try {
            const newDeal = await dealsService.create(dealData);
            set(state => ({
                deals: [newDeal, ...state.deals],
                isLoading: false
            }));
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    updateDeal: async (id, updates) => {
        // Update local state first
        set(state => ({
            deals: state.deals.map(d => d.id === id ? { ...d, ...updates } : d)
        }));

        await dealsService.update(id, updates);
    }
}));
