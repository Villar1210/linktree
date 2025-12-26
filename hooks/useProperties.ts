import { useState, useEffect } from 'react';
import { propertiesService } from '../services/properties.service';
import { useAppStore } from '../store/useAppStore';
import type { Property, PropertyType } from '../types';
import toast from 'react-hot-toast';

interface UsePropertiesOptions {
    autoFetch?: boolean;
    filters?: {
        type?: PropertyType;
        minPrice?: number;
        maxPrice?: number;
        city?: string;
    };
}

export function useProperties(options: UsePropertiesOptions = {}) {
    const { autoFetch = true, filters } = options;
    const { properties, setProperties, setLoading, setError } = useAppStore();
    const [localLoading, setLocalLoading] = useState(false);

    const fetchProperties = async () => {
        setLocalLoading(true);
        setLoading(true);
        setError(null);

        const { data, error } = await propertiesService.getAll(filters);

        if (error) {
            const errorMessage = 'Erro ao carregar imóveis';
            setError(errorMessage);
            toast.error(errorMessage);
        } else if (data) {
            setProperties(data);
        }

        setLocalLoading(false);
        setLoading(false);
    };

    useEffect(() => {
        if (autoFetch) {
            fetchProperties();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoFetch, JSON.stringify(filters)]);

    return {
        properties,
        loading: localLoading,
        refetch: fetchProperties,
    };
}

export function useProperty(id: string) {
    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProperty = async () => {
            setLoading(true);
            const { data, error } = await propertiesService.getById(id);

            if (error) {
                setError('Imóvel não encontrado');
                toast.error('Imóvel não encontrado');
            } else if (data) {
                setProperty(data);
            }

            setLoading(false);
        };

        if (id) {
            fetchProperty();
        }
    }, [id]);

    return { property, loading, error };
}
