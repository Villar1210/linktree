import { supabase } from '../config/supabase';
import type { Activity } from '../types/crm';

export const activitiesService = {
    async getByDeal(dealId: string) {
        const { data, error } = await supabase
            .from('activities')
            .select('*, user:users(name, avatar)') // Assumindo relação com users
            .eq('deal_id', dealId)
            .order('timestamp', { ascending: false });

        if (error) throw error;
        return data as Activity[];
    },

    async getByContact(contactId: string) {
        const { data, error } = await supabase
            .from('activities')
            .select('*, user:users(name, avatar)')
            .eq('contact_id', contactId)
            .order('timestamp', { ascending: false });

        if (error) throw error;
        return data as Activity[];
    },

    async create(activity: Partial<Activity>) {
        // Pegar usuário atual se não fornecido
        if (!activity.user_id) {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) activity.user_id = user.id;
        }

        const { data, error } = await supabase
            .from('activities')
            .insert(activity)
            .select('*, user:users(name, avatar)')
            .single();

        if (error) throw error;
        return data as Activity;
    }
};
