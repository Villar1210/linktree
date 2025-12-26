import { supabase } from '../config/supabase';
import type { Contact } from '../types/crm';

export const contactsService = {
    async getAll() {
        const { data, error } = await supabase
            .from('contacts')
            .select('*')
            .order('first_name');

        if (error) throw error;
        return data as Contact[];
    },

    async search(query: string) {
        if (!query) return [];

        // Usando o indice full-text search criado
        const { data, error } = await supabase
            .from('contacts')
            .select('*')
            .textSearch('search_vector', query) // Precisa configurar no DB ou usar ilike
            // Fallback para ilike simples enquanto não configurar search_vector computed column
            .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
            .limit(20);

        if (error) throw error;
        return data as Contact[];
    },

    async getById(id: string) {
        const { data, error } = await supabase
            .from('contacts')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Contact;
    },

    async create(contact: Partial<Contact>) {
        const { data, error } = await supabase
            .from('contacts')
            .insert(contact)
            .select()
            .single();

        if (error) throw error;
        return data as Contact;
    },

    async update(id: string, updates: Partial<Contact>) {
        const { data, error } = await supabase
            .from('contacts')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Contact;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('contacts')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
