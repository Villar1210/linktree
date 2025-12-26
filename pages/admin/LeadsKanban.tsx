import React, { useState } from 'react';
import { KanbanBoard } from '../../components/kanban/KanbanBoard';
import { Filter, Search, Plus } from 'lucide-react';
import { useFunnelStore } from '../../store/useFunnelStore';

export default function LeadsKanban() {
    const { activeFunnel } = useFunnelStore();
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-white">
            {/* Page Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-20">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Pipeline de Vendas</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {activeFunnel ? activeFunnel.name : 'Carregando funil...'}
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar oportunidades..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
                        />
                    </div>

                    {/* Filters Button */}
                    <button className="flex items-center px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium">
                        <Filter className="w-4 h-4 mr-2" />
                        Filtros
                    </button>

                    {/* New Deal Button */}
                    <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm text-sm font-medium">
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Oportunidade
                    </button>
                </div>
            </div>

            {/* Kanban Board Area */}
            <div className="flex-1 overflow-hidden bg-gray-50/30 p-4">
                <KanbanBoard />
            </div>
        </div>
    );
}
