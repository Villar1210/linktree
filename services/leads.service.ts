import { supabase } from '../config/supabase';
import type { Lead, LeadStatus, Task } from '../types';

export const leadsService = {
    /**
     * Get all leads
     */
    async getAll(filters?: { status?: LeadStatus; assignedTo?: string }) {
        try {
            let query = supabase.from('leads').select('*');

            if (filters?.status) {
                query = query.eq('status', filters.status);
            }
            if (filters?.assignedTo) {
                query = query.eq('assigned_to', filters.assignedTo);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;

            return { data: data as Lead[], error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    /**
     * Get lead by ID
     */
    async getById(id: string) {
        try {
            const { data, error } = await supabase.from('leads').select('*').eq('id', id).single();

            if (error) throw error;

            return { data: data as Lead, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    /**
     * Create a new lead
     */
    async create(lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) {
        try {
            const { data, error } = await supabase.from('leads').insert(lead).select().single();

            if (error) throw error;

            return { data: data as Lead, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    /**
     * Update lead
     */
    async update(id: string, updates: Partial<Lead>) {
        try {
            const { data, error } = await supabase
                .from('leads')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            return { data: data as Lead, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    /**
     * Update lead status
     */
    async updateStatus(id: string, status: LeadStatus) {
        return this.update(id, { status, lastInteraction: new Date().toISOString() });
    },

    /**
     * Add note to lead
     */
    async addNote(id: string, note: string) {
        try {
            const { data: lead } = await this.getById(id);
            if (!lead) throw new Error('Lead not found');

            const notes = [...(lead.notes || []), note];
            return this.update(id, { notes });
        } catch (error) {
            return { data: null, error };
        }
    },

    /**
     * Add task to lead
     */
    async addTask(leadId: string, task: Omit<Task, 'id' | 'createdAt'>) {
        try {
            const { data: lead } = await this.getById(leadId);
            if (!lead) throw new Error('Lead not found');

            const newTask: Task = {
                ...task,
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
            };

            const tasks = [...(lead.tasks || []), newTask];
            return this.update(leadId, { tasks });
        } catch (error) {
            return { data: null, error };
        }
    },

    /**
     * Delete lead
     */
    async delete(id: string) {
        try {
            const { error } = await supabase.from('leads').delete().eq('id', id);

            if (error) throw error;

            return { error: null };
        } catch (error) {
            return { error };
        }
    },

    /**
     * Get leads by temperature (hot/warm/cold)
     */
    async getByTemperature(temperature: 'hot' | 'warm' | 'cold') {
        try {
            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .eq('temperature', temperature)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return { data: data as Lead[], error: null };
        } catch (error) {
            return { data: null, error };
        }
    },
};
