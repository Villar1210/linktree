import { create } from 'zustand';
import { funnelsService } from '../services/funnels.service';
import type { Funnel, Stage } from '../types/crm';

interface FunnelState {
    funnels: Funnel[];
    activeFunnel: Funnel | null;
    stages: Stage[];
    isLoading: boolean;
    error: string | null;

    fetchFunnels: () => Promise<void>;
    setActiveFunnel: (funnelId: string) => Promise<void>;
    createFunnel: (data: Partial<Funnel>) => Promise<void>;
    updateStageOrder: (stages: Stage[]) => Promise<void>;
}

export const useFunnelStore = create<FunnelState>((set, get) => ({
    funnels: [],
    activeFunnel: null,
    stages: [],
    isLoading: false,
    error: null,

    fetchFunnels: async () => {
        set({ isLoading: true });
        try {
            const funnels = await funnelsService.getActive();
            set({ funnels, isLoading: false });

            // Se não tiver funil ativo e tiver funis carregados, setar o primeiro
            if (!get().activeFunnel && funnels.length > 0) {
                get().setActiveFunnel(funnels[0].id);
            }
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    setActiveFunnel: async (funnelId) => {
        set({ isLoading: true });
        try {
            // Set active funnel object
            const funnel = get().funnels.find(f => f.id === funnelId) || null;

            // Load stages for this funnel
            const stages = await funnelsService.getStages(funnelId);

            set({ activeFunnel: funnel, stages, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    createFunnel: async (data) => {
        // Implementar criação se necessário no frontend agora
    },

    updateStageOrder: async (newStages) => {
        // Optimistic update
        set({ stages: newStages });

        try {
            await funnelsService.updateStagesOrder(
                newStages.map((s, index) => ({ id: s.id, order_index: index }))
            );
        } catch (error: any) {
            // Revert on error (complex, skipping for MVP)
            console.error('Failed to update stage order', error);
        }
    }
}));
