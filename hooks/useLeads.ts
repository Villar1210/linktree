import { useState, useEffect } from 'react';
import { leadsService } from '../services/leads.service';
import { useAppStore } from '../store/useAppStore';
import type { LeadStatus } from '../types';
import toast from 'react-hot-toast';

interface UseLeadsOptions {
    autoFetch?: boolean;
    filters?: {
        status?: LeadStatus;
        assignedTo?: string;
    };
}

export function useLeads(options: UseLeadsOptions = {}) {
    const { autoFetch = true, filters } = options;
    const { leads, setLeads, setLoading } = useAppStore();
    const [localLoading, setLocalLoading] = useState(false);

    const fetchLeads = async () => {
        setLocalLoading(true);
        setLoading(true);

        const { data, error } = await leadsService.getAll(filters);

        if (error) {
            toast.error('Erro ao carregar leads');
        } else if (data) {
            setLeads(data);
        }

        setLocalLoading(false);
        setLoading(false);
    };

    const updateLeadStatus = async (leadId: string, status: LeadStatus) => {
        const { error } = await leadsService.updateStatus(leadId, status);

        if (error) {
            toast.error('Erro ao atualizar status');
            return false;
        }

        toast.success('Status atualizado!');
        await fetchLeads(); // Refetch to update cache
        return true;
    };

    const addNote = async (leadId: string, note: string) => {
        const { error } = await leadsService.addNote(leadId, note);

        if (error) {
            toast.error('Erro ao adicionar nota');
            return false;
        }

        toast.success('Nota adicionada!');
        await fetchLeads();
        return true;
    };

    useEffect(() => {
        if (autoFetch) {
            fetchLeads();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoFetch, JSON.stringify(filters)]);

    return {
        leads,
        loading: localLoading,
        refetch: fetchLeads,
        updateLeadStatus,
        addNote,
    };
}
