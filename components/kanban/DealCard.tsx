import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, DollarSign, User } from 'lucide-react';
import type { Deal } from '../../types/crm';
import { formatCurrency } from '../../utils/helpers';

interface DealCardProps {
    deal: Deal;
    onClick?: () => void;
}

export function DealCard({ deal, onClick }: DealCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: deal.id,
        data: {
            type: 'Deal',
            deal,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="bg-white p-4 rounded-lg shadow-lg border-2 border-primary-500 opacity-50 cursor-grabbing"
            >
                <div className="h-4 w-2/3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 w-1/2 bg-gray-100 rounded"></div>
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onClick}
            className={`
        bg-white p-4 rounded-lg shadow-sm border border-gray-200 
        hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group
        ${isDragging ? 'opacity-0' : ''}
      `}
        >
            <div className="flex justify-between items-start mb-2 hidden">
                {/* Chips/Tags could go here */}
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                    {deal.contact?.first_name}
                </span>
            </div>

            <h4 className="text-sm font-medium text-gray-900 mb-1 group-hover:text-primary-600">
                {deal.title || deal.name}
            </h4>

            <div className="flex items-center text-xs text-gray-500 mb-3">
                {deal.contact?.first_name && (
                    <div className="flex items-center mr-3">
                        <User className="w-3 h-3 mr-1" />
                        {deal.contact.first_name} {deal.contact.last_name}
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center text-sm font-semibold text-green-600">
                    <DollarSign className="w-3 h-3 mr-0.5" />
                    {deal.value ? formatCurrency(deal.value) : '-'}
                </div>

                {deal.expected_close_date && (
                    <div className="flex items-center text-xs text-gray-400">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(deal.expected_close_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </div>
                )}
            </div>
        </div>
    );
}
