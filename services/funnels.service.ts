import { supabase } from '../config/supabase';
import type { Funnel, Stage } from '../types/crm';

export const funnelsService = {
    // --- FUNNELS ---

    async getAll() {
        const { data, error } = await supabase
            .from('funnels')
            .select('*')
            .order('name');

        if (error) throw error;
        return data as Funnel[];
    },

    async getActive() {
        const { data, error } = await supabase
            .from('funnels')
            .select('*')
            .eq('is_active', true)
            .order('name');

        if (error) throw error;
        return data as Funnel[];
    },

    async getById(id: string) {
        const { data, error } = await supabase
            .from('funnels')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Funnel;
    },

    async create(funnel: Partial<Funnel>) {
        const { data, error } = await supabase
            .from('funnels')
            .insert(funnel)
            .select()
            .single();

        if (error) throw error;
        return data as Funnel;
    },

    async update(id: string, updates: Partial<Funnel>) {
        const { data, error } = await supabase
            .from('funnels')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Funnel;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('funnels')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // --- STAGES ---

    async getStages(funnelId: string) {
        const { data, error } = await supabase
            .from('stages')
            .select('*')
            .eq('funnel_id', funnelId)
            .order('order_index');

        if (error) throw error;
        return data as Stage[];
    },

    async updateStagesOrder(stages: { id: string; order_index: number }[]) {
        // Supabase RPC or multiple updates
        // For now using multiple updates, can be optimized later
        const updates = stages.map((s) =>
            supabase.from('stages').update({ order_index: s.order_index }).eq('id', s.id)
        );

        await Promise.all(updates);
    },

    async createStage(stage: Partial<Stage>) {
        const { data, error } = await supabase
            .from('stages')
            .insert(stage)
            .select()
            .single();

        if (error) throw error;
        return data as Stage;
    }
};
