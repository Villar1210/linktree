import { supabase } from '../config/supabase';
import type { Property, PropertyType } from '../types';

export const propertiesService = {
    /**
     * Get all active properties
     */
    async getAll(filters?: {
        type?: PropertyType;
        minPrice?: number;
        maxPrice?: number;
        city?: string;
    }) {
        try {
            let query = supabase.from('properties').select('*').eq('status', 'active');

            if (filters?.type) {
                query = query.eq('type', filters.type);
            }
            if (filters?.minPrice) {
                query = query.gte('price', filters.minPrice);
            }
            if (filters?.maxPrice) {
                query = query.lte('price', filters.maxPrice);
            }
            if (filters?.city) {
                query = query.eq('city', filters.city);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;

            return { data: data as Property[], error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    /**
     * Get a single property by ID
     */
    async getById(id: string) {
        try {
            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            return { data: data as Property, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    /**
     * Get featured properties
     */
    async getFeatured() {
        try {
            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .eq('featured', true)
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(6);

            if (error) throw error;

            return { data: data as Property[], error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    /**
     * Create a new property (admin only)
     */
    async create(property: Omit<Property, 'id' | 'created_at' | 'updated_at'>) {
        try {
            const { data, error } = await supabase
                .from('properties')
                .insert(property)
                .select()
                .single();

            if (error) throw error;

            return { data: data as Property, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    /**
     * Update an existing property
     */
    async update(id: string, updates: Partial<Property>) {
        try {
            const { data, error } = await supabase
                .from('properties')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            return { data: data as Property, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    /**
     * Delete a property
     */
    async delete(id: string) {
        try {
            const { error } = await supabase.from('properties').delete().eq('id', id);

            if (error) throw error;

            return { error: null };
        } catch (error) {
            return { error };
        }
    },

    /**
     * Search properties
     */
    async search(searchTerm: string) {
        try {
            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`)
                .eq('status', 'active')
                .limit(20);

            if (error) throw error;

            return { data: data as Property[], error: null };
        } catch (error) {
            return { data: null, error };
        }
    },
};
