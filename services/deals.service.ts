import { supabase } from '../config/supabase';
import type { Deal } from '../types/crm';

export const dealsService = {
    async getByFunnel(funnelId: string) {
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .eq('funnel_id', funnelId)
            .neq('status', ' Arquivado') // Adjust status check if needed
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return data as Deal[];
    },

    async create(deal: Partial<Deal>) {
        const { data, error } = await supabase
            .from('leads')
            .insert(deal)
            .select()
            .single();

        if (error) throw error;
        return data as Deal;
    },

    async update(id: string, updates: Partial<Deal>) {
        const { data, error } = await supabase
            .from('leads')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Deal;
    },

    async moveStage(id: string, newStageId: string) {
        const { data, error } = await supabase
            .from('leads')
            .update({ stage_id: newStageId })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Deal;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('leads')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
