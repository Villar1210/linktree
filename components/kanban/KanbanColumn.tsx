import React, { useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DealCard } from './DealCard';
import type { Stage, Deal } from '../../types/crm';
import { MoreHorizontal, Plus } from 'lucide-react';

interface KanbanColumnProps {
    stage: Stage;
    deals: Deal[];
    onAddDeal?: (stageId: string) => void;
    onDealClick?: (deal: Deal) => void;
}

export function KanbanColumn({ stage, deals, onAddDeal, onDealClick }: KanbanColumnProps) {
    const { setNodeRef } = useDroppable({
        id: stage.id,
        data: {
            type: 'Stage',
            stage
        }
    });

    const dealsIds = useMemo(() => deals.map((d) => d.id), [deals]);

    const totalValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
    const formattedTotal = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        notation: 'compact'
    }).format(totalValue);

    return (
        <div className="flex flex-col h-full min-w-[280px] w-[280px] bg-gray-50/50 rounded-xl border border-gray-200/60 ml-3 first:ml-0">
            {/* Header */}
            <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-xl sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-700 text-sm">{stage.name}</h3>
                    <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full font-medium">
                        {deals.length}
                    </span>
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={() => onAddDeal?.(stage.id)}
                        className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-primary-600 transition-colors"
                        title="Adicionar Deal"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded text-gray-400">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Summary Bar */}
            {deals.length > 0 && (
                <div className="px-3 py-1.5 bg-white border-b border-gray-50 text-[10px] uppercase tracking-wide font-semibold text-gray-400 flex justify-end">
                    Total: {formattedTotal}
                </div>
            )}

            {/* Cards Container */}
            <div
                ref={setNodeRef}
                className="flex-1 p-2 overflow-y-auto overflow-x-hidden min-h-[150px] scrollbar-thin scrollbar-thumb-gray-200"
            >
                <SortableContext items={dealsIds} strategy={verticalListSortingStrategy}>
                    <div className="flex flex-col gap-2">
                        {deals.map((deal) => (
                            <DealCard
                                key={deal.id}
                                deal={deal}
                                onClick={() => onDealClick?.(deal)}
                            />
                        ))}

                        {/* Empty state placeholder when no deals */}
                        {deals.length === 0 && (
                            <div className="h-24 border-2 border-dashed border-gray-100 rounded-lg flex items-center justify-center text-gray-300 text-xs">
                                Arraste um card aqui
                            </div>
                        )}
                    </div>
                </SortableContext>
            </div>
        </div>
    );
}
