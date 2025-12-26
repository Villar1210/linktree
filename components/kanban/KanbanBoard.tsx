import React, { useEffect, useState } from 'react';
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    DropAnimation,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { DealCard } from './DealCard';
import { useFunnelStore } from '../../store/useFunnelStore';
import { useDealsStore } from '../../store/useDealsStore';
import type { Deal } from '../../types/crm';
import { Loader2 } from 'lucide-react';

interface KanbanBoardProps {
    deals?: Deal[] | any[]; // Accept external deals (filtered)
    onDealClick?: (deal: Deal) => void;
}

const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: '0.5',
            },
        },
    }),
};

export function KanbanBoard({ deals: externalDeals, onDealClick }: KanbanBoardProps) {
    const { activeFunnel, stages, fetchFunnels, isLoading: isFunnelLoading } = useFunnelStore();
    const { deals: storeDeals, fetchDeals, moveDeal, isLoading: isDealsLoading } = useDealsStore();

    // Use external deals if provided, otherwise use store deals
    const deals = externalDeals || storeDeals;

    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeDeal, setActiveDeal] = useState<Deal | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Avoid accidental drags
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        fetchFunnels();
    }, [fetchFunnels]);

    useEffect(() => {
        if (activeFunnel?.id) {
            fetchDeals(activeFunnel.id);
        }
    }, [activeFunnel?.id, fetchDeals]);

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveId(active.id as string);
        const deal = deals.find((d) => d.id === active.id);
        setActiveDeal(deal || null);
    };

    const handleDragOver = (event: DragOverEvent) => {
        // Optional: Real-time reordering logic if needed
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        const dealId = active.id as string;

        setActiveId(null);
        setActiveDeal(null);

        if (!over) return;

        const overId = over.id as string;

        // Check if dropped on a Stage column (container)
        const stage = stages.find(s => s.id === overId);

        // Check if dropped on another Deal (item)
        // If dropped on item, find which stage that item belongs to
        // Simplified MVP: Only support dropping on Column (Stage) or Item (which implies Stage)

        let targetStageId = '';

        if (stage) {
            // Dropped directly on column
            targetStageId = stage.id;
        } else {
            // Dropped on another deal? Find its stage
            const overDeal = deals.find(d => d.id === overId);
            if (overDeal) {
                targetStageId = overDeal.stage_id;
            }
        }

        if (targetStageId) {
            const currentDeal = deals.find(d => d.id === dealId);
            if (currentDeal && currentDeal.stage_id !== targetStageId) {
                moveDeal(dealId, targetStageId);
            }
        }
    };

    if (isFunnelLoading && !activeFunnel) {
        return (
            <div className="flex items-center justify-center h-full w-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (!activeFunnel) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                Nenhum funil ativo encontrado.
            </div>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-full overflow-x-auto pb-4 px-2">
                {stages.map((stage) => (
                    <KanbanColumn
                        key={stage.id}
                        stage={stage}
                        deals={deals.filter((d) => d.stage_id === stage.id)}
                        onAddDeal={(stageId) => console.log('Add deal to', stageId)}
                        onDealClick={onDealClick}
                    />
                ))}
            </div>

            <DragOverlay dropAnimation={dropAnimation}>
                {activeId && activeDeal ? <DealCard deal={activeDeal} /> : null}
            </DragOverlay>
        </DndContext>
    );
}
