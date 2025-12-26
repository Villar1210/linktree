

import React, { useState, useEffect } from 'react';
import { MoreHorizontal, Phone, Mail, Calendar, Filter, Flame, Snowflake, Clock, CheckCircle, MessageCircle, Instagram, Globe, LayoutList, Kanban, Plus, X, Ban, Search, User, FileText, Send, Edit3, Trash2, Tag, CheckSquare, Copy, ExternalLink, Activity, DollarSign, AlertTriangle, Sparkles, Upload, File, Linkedin, Briefcase, ChevronRight, MapPin, Coffee, FileSignature, Layers, RotateCcw, ChevronDown, ChevronUp, Home, UserCheck, ScrollText, HelpCircle, ThumbsUp, ThumbsDown, ArrowRightCircle, Play } from 'lucide-react';
import { api } from '../../services/api';
import { Lead, LeadStatus, Task, ActivityType, User as UserType } from '../../types';
import { KanbanBoard } from '../../components/kanban/KanbanBoard'; // Import KanbanBoard
import { MOCK_USERS } from '../../constants';

// --- FUNIL DE ATENDIMENTO & SCRIPTS (Baseado no PDF) ---
const FUNNEL_PHASES = {
    PROSPECTION: {
        id: 1,
        title: '1) Prospecção',
        color: 'bg-blue-600',
        statuses: [LeadStatus.NEW, LeadStatus.TRIAGE],
        questions: [
            "Você procura imóvel para moradia ou investimento?",
            "Qual região você tem preferência?",
            "Já conhece algum empreendimento na área?",
            "Qual sua expectativa de preço?",
            "Precisa de vaga? Quantos dormitórios?"
        ]
    },
    QUALIFICATION: {
        id: 2,
        title: '2) Qualificação',
        color: 'bg-cyan-500',
        statuses: [LeadStatus.QUALIFIED],
        questions: [
            "Qual sua renda familiar?",
            "Pretende financiar, usar FGTS ou comprar à vista?",
            "Já visitou algum decorado?",
            "Quando pretende se mudar ou investir?",
            "Tem mais alguém na decisão?"
        ]
    },
    OPPORTUNITY: {
        id: 3,
        title: '3) Oportunidade',
        color: 'bg-amber-500',
        statuses: [LeadStatus.VISIT_SCHEDULED, LeadStatus.PROPOSAL, LeadStatus.NEGOTIATION],
        questions: [
            "O que pesa mais: localização, metragem ou valor?",
            "Prefere planta compacta ou ampla?",
            "Posso enviar vídeo do decorado?",
            "Quer que eu simule opções de pagamento?",
            "Vamos agendar sua visita?"
        ]
    },
    CLOSING: {
        id: 4,
        title: '4) Venda (Fechamento)',
        color: 'bg-red-500',
        statuses: [LeadStatus.CLOSED],
        questions: [
            "Qual valor consegue de entrada hoje?",
            "Prefere parcelar a entrada?",
            "Podemos formalizar sua proposta?",
            "Preferência: assinatura digital ou presencial?",
            "Envio lista de documentos para adiantar?"
        ]
    }
};

// Helper to get current phase based on lead status
const getCurrentFunnelPhase = (status: LeadStatus) => {
    if (FUNNEL_PHASES.PROSPECTION.statuses.includes(status)) return FUNNEL_PHASES.PROSPECTION;
    if (FUNNEL_PHASES.QUALIFICATION.statuses.includes(status)) return FUNNEL_PHASES.QUALIFICATION;
    if (FUNNEL_PHASES.OPPORTUNITY.statuses.includes(status)) return FUNNEL_PHASES.OPPORTUNITY;
    if (FUNNEL_PHASES.CLOSING.statuses.includes(status)) return FUNNEL_PHASES.CLOSING;
    return FUNNEL_PHASES.PROSPECTION; // Default
};

// WhatsApp Scripts Template
const WHATSAPP_TEMPLATES = [
    { id: 1, title: '👋 Primeiro Contato', text: 'Olá [Nome], sou [Seu Nome] da NovaMorada. Vi seu interesse no imóvel [Imóvel] e gostaria de te passar mais detalhes. Podemos falar?' },
    { id: 2, title: '📅 Agendar Visita', text: 'Oi [Nome], tudo bem? Que tal agendarmos uma visita ao [Imóvel] neste sábado? Tenho um horário livre às 10h.' },
    { id: 3, title: '👀 Follow-up (Sumido)', text: 'Olá [Nome], ainda está buscando imóveis na região? Chegou uma nova opção que combina com seu perfil.' },
    { id: 4, title: '💰 Proposta', text: 'Olá [Nome], consegui uma condição especial para o [Imóvel]. Quando consegue falar?' },
];

const LOSS_REASONS = [
    "Preço alto / Fora do orçamento",
    "Localização não atendeu",
    "Comprou com concorrente",
    "Desistiu da compra",
    "Não responde / Contato errado",
    "Reprovado no Financiamento",
    "Outro"
];

// Pipedrive-style Activity Helper
const getActivityStatus = (tasks: Task[]): 'overdue' | 'today' | 'future' | 'none' => {
    const pending = tasks?.filter(t => !t.completed);
    if (!pending || pending.length === 0) return 'none';

    const today = new Date().toISOString().split('T')[0];
    const nextTask = pending.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

    if (nextTask.dueDate < today) return 'overdue';
    if (nextTask.dueDate === today) return 'today';
    return 'future';
};

const getNextTaskInfo = (tasks: Task[]) => {
    const pending = tasks?.filter(t => !t.completed);
    if (!pending || pending.length === 0) return null;
    return pending.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
};

interface LeadColumnProps {
    status: LeadStatus;
    title: string;
    color: string;
    leads: Lead[];
    onDrop: (status: LeadStatus) => void;
    onDragStart: (id: string) => void;
    onLeadClick: (lead: Lead) => void;
}

const LeadCard: React.FC<{ lead: Lead, compact?: boolean, onDragStart?: (id: string) => void, onClick?: () => void }> = ({ lead, compact, onDragStart, onClick }) => {
    const getSourceIcon = (source: string) => {
        switch (source) {
            case 'instagram': return <Instagram size={12} className="text-pink-600" />;
            case 'whatsapp': return <MessageCircle size={12} className="text-green-600" />;
            default: return <Globe size={12} className="text-blue-600" />;
        }
    };

    const handleDragStart = (e: React.DragEvent) => {
        if (onDragStart) {
            onDragStart(lead.id);
            e.dataTransfer.effectAllowed = "move";
        }
    };

    // Pipedrive Activity Logic
    const activityStatus = getActivityStatus(lead.tasks);
    const nextTask = getNextTaskInfo(lead.tasks);

    // Days in Stage Calculation (Mocked via lastInteraction)
    const getDaysInStage = () => {
        const lastDate = new Date(lead.lastInteraction || lead.createdAt);
        const diffTime = Math.abs(new Date().getTime() - lastDate.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const daysInStage = getDaysInStage();
    const isStagnant = daysInStage > 5;

    // Get Assigned Agent Avatar
    const agent = MOCK_USERS.find(u => u.id === lead.assignedTo);

    return (
        <div
            draggable={!compact}
            onDragStart={handleDragStart}
            onClick={onClick}
            className={`bg-white rounded-lg shadow-sm border hover:shadow-md transition-all group ${compact ? 'p-3 flex items-center justify-between border-gray-200 w-full' : 'p-3 cursor-pointer active:cursor-grabbing hover:border-brand-400'} ${!compact && isStagnant ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-transparent'}`}
        >
            <div className={compact ? 'flex items-center gap-3 w-full' : ''}>
                <div className="flex justify-between items-start mb-2 w-full">
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-900 text-sm truncate max-w-[150px]">{lead.name}</h4>
                            {/* Temperature Icons */}
                            {lead.temperature === 'hot' && <Flame size={12} className="text-red-500 fill-red-500" />}
                            {lead.temperature === 'cold' && <Snowflake size={12} className="text-blue-300" />}
                        </div>
                        {compact ? (
                            <div className="text-xs text-gray-500 truncate max-w-[200px] flex items-center gap-2">
                                <span className="font-bold text-brand-600">{lead.interest}</span>
                                <span>•</span>
                                <span>{new Date(lead.createdAt).toLocaleDateString('pt-BR')}</span>
                            </div>
                        ) : (
                            <p className="text-[11px] text-gray-500 mt-0.5 truncate max-w-[180px]">{lead.interest}</p>
                        )}
                    </div>

                    {/* Agent Avatar or Activity */}
                    {!compact && (
                        <div className="ml-2 flex-shrink-0 flex items-center gap-1">
                            {agent && (
                                <img src={agent.avatar} title={`Responsável: ${agent.name}`} className="w-5 h-5 rounded-full border border-gray-200" alt="" />
                            )}
                            {activityStatus === 'overdue' && <div className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-sm" title="Atividade Atrasada"><Clock size={12} /></div>}
                            {activityStatus === 'today' && <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center shadow-sm" title="Para Hoje"><Calendar size={12} /></div>}
                            {activityStatus === 'future' && <div className="w-5 h-5 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center" title="Agendado"><ChevronRight size={14} /></div>}
                            {activityStatus === 'none' && <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-500 border border-amber-200 flex items-center justify-center animate-pulse" title="Sem atividade agendada!"><AlertTriangle size={12} /></div>}
                        </div>
                    )}
                </div>
            </div>

            {!compact && (
                <>
                    {/* Next Action Text (Focus of the Day) */}
                    {nextTask ? (
                        <div className={`mt-2 text-[10px] flex items-center gap-1.5 px-2 py-1.5 rounded border ${activityStatus === 'overdue' ? 'bg-red-50 border-red-100 text-red-700' :
                            activityStatus === 'today' ? 'bg-green-50 border-green-100 text-green-700' :
                                'bg-gray-50 border-gray-100 text-gray-500'
                            }`}>
                            {nextTask.type === 'call' && <Phone size={10} />}
                            {nextTask.type === 'meeting' && <User size={10} />}
                            {nextTask.type === 'visit' && <MapPin size={10} />}
                            {nextTask.type === 'email' && <Mail size={10} />}
                            {nextTask.type === 'whatsapp' && <MessageCircle size={10} />}
                            <span className="truncate font-bold">{nextTask.title}</span>
                            <span className="ml-auto opacity-70">
                                {new Date(nextTask.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                            </span>
                        </div>
                    ) : (
                        <div className="mt-2 text-[10px] text-amber-600 bg-amber-50 border border-amber-100 px-2 py-1.5 rounded flex items-center gap-1">
                            <AlertTriangle size={10} />
                            <span>Sem próxima ação</span>
                        </div>
                    )}

                    {/* Footer Info */}
                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-50">
                        {lead.value && (
                            <div className="text-[11px] font-bold text-gray-700">
                                {lead.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </div>
                        )}
                        <div className="ml-auto text-[10px] text-gray-400 flex items-center gap-2">
                            <span title="Dias no estágio" className={`${isStagnant ? 'text-red-500 font-bold' : ''}`}>{daysInStage}d</span>
                            {getSourceIcon(lead.source)}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const LeadColumn: React.FC<LeadColumnProps> = ({ status, title, color, leads, onDrop, onDragStart, onLeadClick }) => {
    const columnLeads = leads.filter(l => l.status === status);
    // Calculate column total value
    const totalValue = columnLeads.reduce((acc, curr) => acc + (curr.value || 0), 0);

    const [isOver, setIsOver] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsOver(true);
    };

    const handleDragLeave = () => {
        setIsOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsOver(false);
        onDrop(status);
    };

    return (
        <div
            className={`flex-shrink-0 w-80 rounded-xl bg-gray-100 flex flex-col max-h-full border transition-colors duration-200 ${isOver ? 'bg-gray-200 border-gray-300 ring-2 ring-brand-200' : 'border-gray-200'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className={`p-3 border-b-2 flex flex-col ${color}`}>
                <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">{title}</h3>
                    <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">{columnLeads.length}</span>
                </div>
                <div className="text-xs text-gray-500 font-medium">
                    {totalValue > 0 ? totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0'}
                </div>
            </div>

            <div className="p-2 space-y-2 overflow-y-auto flex-1 custom-scrollbar min-h-[100px]">
                {columnLeads.map(lead => (
                    <LeadCard key={lead.id} lead={lead} onDragStart={onDragStart} onClick={() => onLeadClick(lead)} />
                ))}
                {columnLeads.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50 py-8">
                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center mb-2">
                            <Plus size={20} />
                        </div>
                        <span className="text-xs">Arraste aqui</span>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Profile Form Components (Unchanged) ---
const ProfileSection: React.FC<{ title: string, icon: any, isOpen: boolean, toggle: () => void, children: React.ReactNode }> = ({ title, icon: Icon, isOpen, toggle, children }) => (
    <div className="bg-white border border-gray-200 rounded-lg mb-4 overflow-hidden">
        <button onClick={toggle} className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
                <Icon className="text-gray-500" size={18} />
                <span className="font-bold text-gray-700 text-sm">{title}</span>
            </div>
            {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>
        {isOpen && (
            <div className="p-4">
                {children}
            </div>
        )}
    </div>
);

const FormInput: React.FC<{ label: string, value: string | number | undefined, onChange?: (val: string) => void, type?: string, placeholder?: string }> = ({ label, value, onChange, type = "text", placeholder }) => (
    <div className="mb-3">
        <label className="block text-xs font-bold text-gray-500 mb-1">{label}</label>
        <input
            type={type}
            value={value || ''}
            onChange={e => onChange && onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:border-brand-500 outline-none bg-white"
        />
    </div>
);

const FormSelect: React.FC<{ label: string, value: string | undefined, options: { label: string, value: string }[], onChange?: (val: string) => void }> = ({ label, value, options, onChange }) => (
    <div className="mb-3">
        <label className="block text-xs font-bold text-gray-500 mb-1">{label}</label>
        <select
            value={value || ''}
            onChange={e => onChange && onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:border-brand-500 outline-none bg-white"
        >
            <option value="">Selecione...</option>
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    </div>
);

// --- Lead Detail Modal ---
const LeadDetailModal: React.FC<{ lead: Lead, onClose: () => void, onUpdate: (updated: Lead) => void }> = ({ lead, onClose, onUpdate }) => {
    const [localLead, setLocalLead] = useState(lead);
    const [activeMainTab, setActiveMainTab] = useState<'activity' | 'profile' | 'files'>('activity');
    const currentFunnelPhase = getCurrentFunnelPhase(localLead.status);
    const [profileSections, setProfileSections] = useState({ personal: true, address: true, professional: false, preferences: false });
    const [activeActionTab, setActiveActionTab] = useState<'schedule' | 'whatsapp'>('schedule');
    const [quickNote, setQuickNote] = useState('');
    const [actionType, setActionType] = useState<ActivityType>('call');
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDate, setTaskDate] = useState(new Date().toISOString().split('T')[0]);
    const [whatsappMessage, setWhatsappMessage] = useState('');

    const systemLogs = [
        { type: 'system_log', content: { title: 'Lead Criado' }, date: localLead.createdAt, id: 'sys1' },
        { type: 'system_log', content: { title: 'Status alterado para ' + localLead.status }, date: localLead.lastInteraction || localLead.createdAt, id: 'sys2' }
    ];

    const timelineItems = [
        ...(localLead.notes?.map((n, i) => ({ type: 'note', content: n, date: localLead.createdAt, id: `n${i}` })) || []),
        ...(localLead.tasks?.map(t => ({ type: 'task', content: t, date: t.createdAt || localLead.createdAt, id: t.id })) || []),
        ...systemLogs
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const handleAddActivity = (e: React.FormEvent) => {
        e.preventDefault();
        const newTask: Task = {
            id: `t${Date.now()}`,
            title: taskTitle || `Nova ${actionType}`,
            dueDate: taskDate,
            completed: false,
            type: actionType,
            notes: quickNote,
            createdAt: new Date().toISOString()
        };
        const updatedLead = { ...localLead, tasks: [newTask, ...(localLead.tasks || [])], lastInteraction: new Date().toISOString() };
        setLocalLead(updatedLead);
        onUpdate(updatedLead);
        setTaskTitle('');
        setQuickNote('');
    };

    const markTaskDone = (taskId: string) => {
        const updatedTasks = localLead.tasks?.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
        const updatedLead = { ...localLead, tasks: updatedTasks };
        setLocalLead(updatedLead);
        onUpdate(updatedLead);
    };

    const applyWhatsAppTemplate = (template: string) => {
        let msg = template;
        msg = msg.replace('[Nome]', localLead.name.split(' ')[0]);
        msg = msg.replace('[Imóvel]', localLead.interest || 'imóvel');
        msg = msg.replace('[Seu Nome]', 'Eduardo');
        setWhatsappMessage(msg);
    };

    const handleSendWhatsApp = () => {
        if (!localLead.phone) return;
        const phone = localLead.phone.replace(/\D/g, '');
        const encoded = encodeURIComponent(whatsappMessage);
        window.open(`https://wa.me/55${phone}?text=${encoded}`, '_blank');
        const newTask: Task = {
            id: `t${Date.now()}`,
            title: 'Mensagem WhatsApp enviada',
            dueDate: new Date().toISOString().split('T')[0],
            completed: true,
            type: 'whatsapp',
            notes: whatsappMessage,
            createdAt: new Date().toISOString()
        };
        const updatedLead = { ...localLead, tasks: [newTask, ...(localLead.tasks || [])], lastInteraction: new Date().toISOString() };
        setLocalLead(updatedLead);
        onUpdate(updatedLead);
        setWhatsappMessage('');
    };

    const handleScriptCheck = (question: string, checked: boolean) => {
        const updatedScriptData = { ...(localLead.scriptData || {}), [question]: checked };
        const updatedLead = { ...localLead, scriptData: updatedScriptData };
        setLocalLead(updatedLead);
        onUpdate(updatedLead);
    };

    const updateProfile = (section: string, field: string, value: any) => {
        setLocalLead(prev => ({ ...prev, [section]: { ...(prev as any)[section], [field]: value } }));
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'call': return <Phone size={14} />;
            case 'email': return <Mail size={14} />;
            case 'meeting': return <User size={14} />;
            case 'visit': return <MapPin size={14} />;
            case 'whatsapp': return <MessageCircle size={14} />;
            default: return <CheckCircle size={14} />;
        }
    };

    return (
        <div className="absolute inset-0 z-50 bg-gray-900/40 backdrop-blur-sm flex justify-end animate-fade-in">
            <div className="w-full max-w-6xl bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
                <div className="bg-gray-900 px-6 py-2 flex justify-between items-center text-white text-xs font-bold uppercase tracking-wider">
                    {Object.values(FUNNEL_PHASES).map((phase, idx) => (
                        <div key={phase.id} className={`flex items-center gap-2 ${currentFunnelPhase.id >= phase.id ? 'opacity-100 text-white' : 'opacity-30 text-gray-400'}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${currentFunnelPhase.id >= phase.id ? 'border-white bg-white/20' : 'border-gray-600'}`}>
                                {currentFunnelPhase.id > phase.id ? <CheckCircle size={14} /> : phase.id}
                            </div>
                            <span className="hidden md:inline">{phase.title.split(') ')[1]}</span>
                            {idx < 3 && <div className="w-12 h-0.5 bg-white/20 mx-2 hidden md:block"></div>}
                        </div>
                    ))}
                </div>
                <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${localLead.temperature === 'hot' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                            {localLead.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 leading-tight">{localLead.name}</h2>
                            <p className="text-sm text-gray-500">{localLead.value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} • {localLead.interest}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button onClick={() => setActiveMainTab('activity')} className={`px-4 py-1.5 rounded text-sm font-bold transition-all ${activeMainTab === 'activity' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>Atividades</button>
                            <button onClick={() => setActiveMainTab('profile')} className={`px-4 py-1.5 rounded text-sm font-bold transition-all ${activeMainTab === 'profile' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>Dados do Cliente</button>
                            <button onClick={() => setActiveMainTab('files')} className={`px-4 py-1.5 rounded text-sm font-bold transition-all ${activeMainTab === 'files' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>Arquivos</button>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X size={24} /></button>
                    </div>
                </div>
                <div className="flex-1 flex overflow-hidden">
                    {activeMainTab === 'activity' && (
                        <>
                            <div className="flex-1 bg-gray-50 flex flex-col border-r border-gray-200">
                                <div className="bg-white border-b border-gray-200 shadow-sm">
                                    <div className="flex px-4 pt-2">
                                        <button onClick={() => setActiveActionTab('schedule')} className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeActionTab === 'schedule' ? 'border-brand-600 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Agendar / Nota</button>
                                        <button onClick={() => setActiveActionTab('whatsapp')} className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeActionTab === 'whatsapp' ? 'border-green-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}><MessageCircle size={16} className={activeActionTab === 'whatsapp' ? 'text-green-500' : ''} /> Enviar WhatsApp</button>
                                    </div>
                                    {activeActionTab === 'schedule' && (
                                        <div className="p-4 bg-gray-50/50">
                                            <div className="flex gap-4 mb-4 text-sm font-bold text-gray-500">
                                                <button onClick={() => setActionType('call')} className={`flex items-center gap-2 pb-1 border-b-2 transition-colors ${actionType === 'call' ? 'text-gray-900 border-brand-600' : 'border-transparent hover:text-gray-700'}`}><Phone size={14} /> Ligação</button>
                                                <button onClick={() => setActionType('meeting')} className={`flex items-center gap-2 pb-1 border-b-2 transition-colors ${actionType === 'meeting' ? 'text-gray-900 border-brand-600' : 'border-transparent hover:text-gray-700'}`}><User size={14} /> Reunião</button>
                                                <button onClick={() => setActionType('visit')} className={`flex items-center gap-2 pb-1 border-b-2 transition-colors ${actionType === 'visit' ? 'text-gray-900 border-brand-600' : 'border-transparent hover:text-gray-700'}`}><MapPin size={14} /> Visita</button>
                                            </div>
                                            <form onSubmit={handleAddActivity}>
                                                <input type="text" placeholder={`Assunto da ${actionType}...`} className="w-full font-bold text-gray-900 placeholder-gray-400 outline-none mb-2 bg-transparent" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} />
                                                <div className="flex gap-2 mb-3">
                                                    <input type="date" className="bg-white border border-gray-200 rounded px-2 py-1 text-sm text-gray-700 outline-none" value={taskDate} onChange={e => setTaskDate(e.target.value)} />
                                                    <input type="text" placeholder="Adicionar nota..." className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-sm outline-none" value={quickNote} onChange={e => setQuickNote(e.target.value)} />
                                                </div>
                                                <button type="submit" className="bg-gray-900 text-white px-4 py-1.5 rounded font-bold text-sm hover:bg-black">Agendar</button>
                                            </form>
                                        </div>
                                    )}
                                    {activeActionTab === 'whatsapp' && (
                                        <div className="p-4 bg-green-50/30">
                                            <div className="flex gap-2 mb-3 overflow-x-auto pb-2 custom-scrollbar">
                                                {WHATSAPP_TEMPLATES.map(template => (
                                                    <button key={template.id} onClick={() => applyWhatsAppTemplate(template.text)} className="whitespace-nowrap px-3 py-1.5 bg-white border border-green-200 text-green-700 rounded-full text-xs font-bold hover:bg-green-50 transition-colors shadow-sm">{template.title}</button>
                                                ))}
                                            </div>
                                            <textarea value={whatsappMessage} onChange={(e) => setWhatsappMessage(e.target.value)} className="w-full h-24 p-3 border border-gray-200 rounded-lg text-sm mb-3 focus:ring-2 focus:ring-green-500 outline-none resize-none" placeholder="Digite sua mensagem..."></textarea>
                                            <button onClick={handleSendWhatsApp} disabled={!whatsappMessage} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700 flex items-center gap-2 shadow-lg"><Send size={14} /> Abrir WhatsApp Web</button>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                    {localLead.tasks?.some(t => !t.completed) && (
                                        <div className="mb-6">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Planejado</h4>
                                            <div className="space-y-2">
                                                {localLead.tasks.filter(t => !t.completed).map(task => (
                                                    <div key={task.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-start gap-3 hover:border-brand-300 transition-colors group">
                                                        <button onClick={() => markTaskDone(task.id)} className="mt-0.5 w-5 h-5 rounded border border-gray-300 hover:bg-green-50 hover:border-green-500 transition-colors flex items-center justify-center text-white hover:text-green-600">
                                                            <CheckCircle size={14} className="opacity-0 group-hover:opacity-100" />
                                                        </button>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between">
                                                                <span className="font-bold text-gray-800 text-sm flex items-center gap-2">{getActivityIcon(task.type)} {task.title}</span>
                                                                <span className={`text-xs font-medium ${new Date(task.dueDate) < new Date() ? 'text-red-500' : 'text-gray-400'}`}>{new Date(task.dueDate).toLocaleDateString()}</span>
                                                            </div>
                                                            {task.notes && <p className="text-xs text-gray-500 mt-1">{task.notes}</p>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Histórico</h4>
                                        <div className="relative border-l-2 border-gray-200 ml-3 space-y-6 pl-6 pb-4">
                                            {timelineItems.map((item: any) => (
                                                <div key={item.id} className="relative">
                                                    <div className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${item.type === 'note' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-200 text-gray-500'}`}>
                                                        {item.type === 'note' ? <FileText size={12} /> : getActivityIcon(item.content.type)}
                                                    </div>
                                                    {item.type === 'note' ? (
                                                        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-sm text-gray-700"><p>{item.content}</p><span className="text-xs text-yellow-600/60 mt-2 block">{new Date(item.date).toLocaleString()}</span></div>
                                                    ) : (
                                                        <div className={`text-sm ${item.content.completed ? 'opacity-75' : ''}`}>
                                                            <p className="font-bold text-gray-800 flex items-center gap-2"><span className={item.content.completed ? 'line-through text-gray-500' : ''}>{item.content.title}</span></p>
                                                            <p className="text-xs text-gray-400">{new Date(item.date).toLocaleString()}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-96 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
                                <div className="flex-1 overflow-y-auto p-6">
                                    <div className="mb-8 bg-brand-50 rounded-xl p-4 border border-brand-100 shadow-sm">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-sm font-bold text-brand-900 flex items-center gap-2"><ScrollText size={16} /> Roteiro: {currentFunnelPhase.title.split(') ')[1]}</h3>
                                        </div>
                                        <div className="space-y-2">
                                            {currentFunnelPhase.questions.map((q, idx) => (
                                                <label key={idx} className="flex items-start gap-2 cursor-pointer hover:bg-white/50 p-1.5 rounded transition-colors select-none">
                                                    <input type="checkbox" checked={localLead.scriptData?.[q] || false} onChange={(e) => handleScriptCheck(q, e.target.checked)} className="mt-1 rounded text-brand-600" />
                                                    <span className={`text-xs leading-tight ${localLead.scriptData?.[q] ? 'text-brand-900 font-medium line-through opacity-70' : 'text-brand-800'}`}>{q}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    {/* ... Other Sidebar widgets ... */}
                                    <div className="mb-6">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Negócio</h3>
                                        <div className="font-bold text-gray-900 border-b border-gray-100 pb-1 flex items-center gap-2 mb-2">
                                            <DollarSign size={14} className="text-gray-400" />
                                            {localLead.value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                    {activeMainTab === 'profile' && (
                        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
                            <div className="max-w-3xl mx-auto">
                                <ProfileSection title="Dados Pessoais" icon={User} isOpen={profileSections.personal} toggle={() => setProfileSections(prev => ({ ...prev, personal: !prev.personal }))}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormInput label="Nome" value={localLead.name} onChange={(v) => setLocalLead({ ...localLead, name: v })} />
                                        <FormInput label="CPF" value={localLead.profile?.cpf} onChange={(v) => updateProfile('profile', 'cpf', v)} />
                                        <FormInput label="Nascimento" value={localLead.profile?.birthDate} onChange={(v) => updateProfile('profile', 'birthDate', v)} type="date" />
                                    </div>
                                </ProfileSection>
                                <ProfileSection title="Endereço" icon={MapPin} isOpen={profileSections.address} toggle={() => setProfileSections(prev => ({ ...prev, address: !prev.address }))}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormInput label="Cidade" value={localLead.address?.city} onChange={(v) => updateProfile('address', 'city', v)} />
                                        <FormInput label="Estado" value={localLead.address?.state} onChange={(v) => updateProfile('address', 'state', v)} />
                                    </div>
                                </ProfileSection>
                            </div>
                        </div>
                    )}
                    {activeMainTab === 'files' && (
                        <div className="flex-1 bg-gray-50 p-8 flex flex-col items-center justify-center text-gray-400">
                            <FileText className="text-gray-300 mb-2" size={48} />
                            <p>Área de Arquivos</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

import { useDealsStore } from '../../store/useDealsStore';
import { useFunnelStore } from '../../store/useFunnelStore';

const CRM: React.FC = () => {
    const { deals: leads, fetchDeals, addDeal, updateDeal, moveDeal: storeMoveDeal } = useDealsStore();
    const { deals: leads, fetchDeals, addDeal, updateDeal } = useDealsStore();
    const { activeFunnel, fetchFunnels, stages } = useFunnelStore();
    // const [leads, setLeads] = useState<Lead[]>([]); // Removed local state
    const [currentUser, setCurrentUser] = useState<UserType | null>(null);
    const [viewMode, setViewMode] = useState<'pipeline' | 'inbox'>('pipeline');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Advanced Filter State
    const [filterOwner, setFilterOwner] = useState<string>('me');
    const [filterTemperature, setFilterTemperature] = useState<string>('all');
    const [filterSource, setFilterSource] = useState<string>('all');

    // Loss Reason Modal State
    const [lossModalOpen, setLossModalOpen] = useState(false);
    const [pendingDropStatus, setPendingDropStatus] = useState<LeadStatus | null>(null);
    const [selectedLossReason, setSelectedLossReason] = useState(LOSS_REASONS[0]);
    const [actionTargetId, setActionTargetId] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            const user = api.auth.getCurrentUser();
            setCurrentUser(user);

            // Initialize Stores
            await fetchFunnels();
            // fetchDeals will be triggered by activeFunnel effect below

            if (user?.role === 'admin') setFilterOwner('all');
            else setFilterOwner('me');
        };
        init();
    }, []);

    useEffect(() => {
        if (activeFunnel?.id) {
            fetchDeals(activeFunnel.id);
        }
    }, [activeFunnel?.id]);

    const getVisibleLeads = () => {
        let filtered = leads;
        if (searchTerm) {
            filtered = filtered.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()) || l.email.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (currentUser) {
            if (filterOwner === 'me') filtered = filtered.filter(l => l.assignedTo === currentUser.id);
            else if (filterOwner !== 'all') filtered = filtered.filter(l => l.assignedTo === filterOwner);
        }
        if (filterTemperature !== 'all') filtered = filtered.filter(l => l.temperature === filterTemperature);
        if (filterSource !== 'all') filtered = filtered.filter(l => l.source === filterSource);
        return filtered;
    };

    const visibleLeads = getVisibleLeads();
    const pipelineValue = visibleLeads.filter(l => l.status !== LeadStatus.CLOSED && l.status !== LeadStatus.LOST && l.status !== LeadStatus.DISQUALIFIED).reduce((acc, curr) => acc + (curr.value || 0), 0);

    const handleDragStart = (id: string) => setDraggedLeadId(id);

    const handleDropLead = (newStatus: LeadStatus) => {
        if (newStatus === LeadStatus.LOST || newStatus === LeadStatus.DISQUALIFIED) {
            setPendingDropStatus(newStatus);
            setActionTargetId(draggedLeadId);
            setLossModalOpen(true);
        } else {
            if (draggedLeadId) executeLeadMove(draggedLeadId, newStatus);
        }
    };

    const startService = (lead: Lead) => {
        if (stages.length > 0) {
            // Assign to first stage of the funnel
            updateDeal(lead.id, {
                stage_id: stages[0].id,
                status: LeadStatus.TRIAGE
            });
            setSelectedLead(lead);
            setViewMode('pipeline');
        } else {
            console.error("No stages available in active funnel");
            // Fallback or alert
        }
    };

    const executeLeadMove = (id: string, newStatus: LeadStatus, reason?: string) => {
        // Map LeadStatus to Stage ID (Needs mapping logic if we want to keep LeadStatus enum or direct stage UUID)
        // For Dynamic Kanban, we move by Stage ID.
        // However, CRM legacy 'LeadStatus' might not map 1:1 to new Stages if we are mixing.
        // But since we are full dynamic now, 'newStatus' here passed from LeadColumn (legacy) is problematic.
        // BUT for KanbanBoard (New), it calls internal move.
        // This function 'executeLeadMove' is used by LeadDetailModal and others?
        // Let's assume for now we just update the lead locally via store update for non-critical status fields
        // OR we find the stage corresponding to the status.

        // For MVP: If utilizing new store, we normally pass stageId.
        // If we receive legacy status, we might need to ignore or map it.

        if (id && activeFunnel) {
            // If we have a status, we try to find a stage with that name?
            // This is tricky. Let's just update the deal properties.
            updateDeal(id, { status: newStatus as any, lostReason: reason });
            setDraggedLeadId(null);
            setActionTargetId(null);
        }
    };

    const confirmLoss = () => {
        if (pendingDropStatus && actionTargetId) {
            executeLeadMove(actionTargetId, pendingDropStatus, selectedLossReason);
            setLossModalOpen(false);
            setPendingDropStatus(null);
            setActionTargetId(null);
        }
    };

    // handleAddLead updated to use store
    const handleAddLead = async (e: React.FormEvent) => {
        e.preventDefault();
        const newLead: Partial<Lead> = {
            name: 'Novo Interessado',
            email: 'interessado@email.com',
            phone: '11999999999',
            status: LeadStatus.NEW,
            interest: 'Interesse Geral',
            source: 'whatsapp',
            temperature: 'warm',
            // funnel_id: activeFunnel?.id // Should add this if we have active funnel
        };
        if (activeFunnel && stages.length > 0) {
            (newLead as any).funnel_id = activeFunnel.id;
            (newLead as any).stage_id = stages[0].id;
        }

        await addDeal(newLead as any);
        setIsModalOpen(false);
        if (viewMode !== 'inbox') setViewMode('inbox');
    };

    const handleLeadUpdate = (updatedLead: Lead) => {
        updateDeal(updatedLead.id, updatedLead as any);
        setSelectedLead(updatedLead);
    };

    const resetFilters = () => {
        setSearchTerm('');
        setFilterTemperature('all');
        setFilterSource('all');
        if (currentUser?.role === 'admin') setFilterOwner('all');
        else setFilterOwner('me');
    };

    const newLeadsInbox = visibleLeads.filter(l => l.status === LeadStatus.NEW);

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col relative">
            {/* Header Controls */}
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-serif font-bold text-gray-900">Pipeline de Vendas</h2>
                        <p className="text-gray-500 text-sm">Gestão focada em atividades (Activity-Based Selling).</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-200 shadow-sm hidden md:flex">
                            <button onClick={() => setViewMode('inbox')} className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'inbox' ? 'bg-brand-50 text-brand-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>
                                <LayoutList size={18} />
                                {newLeadsInbox.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{newLeadsInbox.length}</span>}
                            </button>
                            <button onClick={() => setViewMode('pipeline')} className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'pipeline' ? 'bg-brand-50 text-brand-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>
                                <Kanban size={18} />
                            </button>
                        </div>
                        <button onClick={() => setIsModalOpen(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-green-600/20 hover:bg-green-700 transition-colors text-sm whitespace-nowrap">
                            <Plus size={18} /> Novo Negócio
                        </button>
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="flex flex-col lg:flex-row gap-4 bg-white p-3 rounded-xl border border-gray-200 shadow-sm items-center">
                    <div className="flex items-center gap-4 border-r border-gray-100 pr-4 mr-2">
                        <div>
                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Valor em Pipeline</p>
                            <p className="font-bold text-lg text-brand-600">{pipelineValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}</p>
                        </div>
                    </div>
                    <div className="flex-1 flex gap-3 overflow-x-auto pb-2 lg:pb-0 w-full">
                        <div className="relative min-w-[150px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-brand-500 outline-none" />
                        </div>
                        {currentUser?.role === 'admin' && (
                            <select value={filterOwner} onChange={(e) => setFilterOwner(e.target.value)} className="bg-gray-50 border border-gray-200 text-gray-700 py-2 pl-3 pr-8 rounded-lg text-sm font-medium outline-none">
                                <option value="all">Todos os Donos</option>
                                <option value="me">Meus Negócios</option>
                                {MOCK_USERS.filter(u => u.role === 'agent').map(agent => (
                                    <option key={agent.id} value={agent.id}>{agent.name}</option>
                                ))}
                            </select>
                        )}
                        <select value={filterTemperature} onChange={(e) => setFilterTemperature(e.target.value)} className="bg-gray-50 border border-gray-200 text-gray-700 py-2 pl-3 pr-8 rounded-lg text-sm font-medium outline-none">
                            <option value="all">Temperatura</option>
                            <option value="hot">🔥 Quentes</option>
                            <option value="warm">☀️ Mornos</option>
                            <option value="cold">❄️ Frios</option>
                        </select>
                        <select value={filterSource} onChange={(e) => setFilterSource(e.target.value)} className="bg-gray-50 border border-gray-200 text-gray-700 py-2 pl-3 pr-8 rounded-lg text-sm font-medium outline-none">
                            <option value="all">Origem</option>
                            <option value="whatsapp">WhatsApp</option>
                            <option value="instagram">Instagram</option>
                            <option value="site">Site</option>
                        </select>
                        {(searchTerm || filterTemperature !== 'all' || filterSource !== 'all') && (
                            <button onClick={resetFilters} className="text-xs text-red-500 hover:underline flex items-center gap-1"><RotateCcw size={12} /> Limpar</button>
                        )}
                    </div>
                </div>
            </div>

            {/* INBOX MODE */}
            {viewMode === 'inbox' && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex-1 flex flex-col animate-fade-in">
                    <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                <Clock className="text-brand-600" /> Caixa de Entrada
                            </h3>
                            <p className="text-sm text-gray-500">Leads novos sem dono ou qualificação.</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {newLeadsInbox.map(lead => (
                            <div key={lead.id} className="flex items-center gap-4 p-4 bg-white border border-gray-100 hover:border-brand-200 hover:shadow-md rounded-xl transition-all group">
                                <div className="flex-1">
                                    <LeadCard lead={lead} compact={true} onClick={() => setSelectedLead(lead)} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => startService(lead)}
                                        className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-bold shadow-lg shadow-green-600/20"
                                        title="Iniciar Atendimento e Mover para Funil"
                                    >
                                        <MessageCircle size={18} /> Iniciar Atendimento
                                    </button>
                                </div>
                            </div>
                        ))}
                        {newLeadsInbox.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                <CheckCircle size={48} className="mb-4 text-green-200" />
                                {/* PIPELINE MODE (Updated Columns) */}
                                {viewMode === 'pipeline' && (
                                    <div className="flex-1 overflow-hidden">
                                        <KanbanBoard onDealClick={setSelectedLead} deals={visibleLeads} />
                                    </div>
                                )}
                                <LeadColumn
                                    status={LeadStatus.PROPOSAL}
                                    title="Proposta"
                                    color="border-amber-500"
                                    leads={visibleLeads}
                                    onDrop={handleDropLead}
                                    onDragStart={handleDragStart}
                                    onLeadClick={setSelectedLead}
                                />
                                <LeadColumn
                                    status={LeadStatus.NEGOTIATION}
                                    title="Negociação"
                                    color="border-orange-500"
                                    leads={visibleLeads}
                                    onDrop={handleDropLead}
                                    onDragStart={handleDragStart}
                                    onLeadClick={setSelectedLead}
                                />
                                <LeadColumn
                                    status={LeadStatus.CLOSED}
                                    title="Vendido"
                                    color="border-green-500 bg-green-50/30"
                                    leads={visibleLeads}
                                    onDrop={handleDropLead}
                                    onDragStart={handleDragStart}
                                    onLeadClick={setSelectedLead}
                                />
                                <div className="w-px bg-gray-300 mx-2"></div>
                                <LeadColumn
                                    status={LeadStatus.DISQUALIFIED}
                                    title="Não Qualificado"
                                    color="border-gray-400 bg-gray-100/50 opacity-80"
                                    leads={visibleLeads}
                                    onDrop={handleDropLead}
                                    onDragStart={handleDragStart}
                                    onLeadClick={setSelectedLead}
                                />
                                <LeadColumn
                                    status={LeadStatus.LOST}
                                    title="Perdidos"
                                    color="border-red-300 bg-red-50/30 opacity-80"
                                    leads={visibleLeads}
                                    onDrop={handleDropLead}
                                    onDragStart={handleDragStart}
                                    onLeadClick={setSelectedLead}
                                />
                            </div>
          </div >
      )}

                    {/* New Lead Modal (Unchanged) */}
                    {
                        isModalOpen && (
                            <div className="absolute inset-0 z-50 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                                <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-gray-900">Novo Negócio</h3>
                                        <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                                    </div>
                                    <form onSubmit={handleAddLead} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Nome do Contato</label>
                                            <input type="text" className="w-full border rounded-lg px-3 py-2" placeholder="Nome" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Telefone</label>
                                            <input type="text" className="w-full border rounded-lg px-3 py-2" placeholder="(00) 00000-0000" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Imóvel de Interesse</label>
                                            <input type="text" className="w-full border rounded-lg px-3 py-2" placeholder="Ex: Apartamento Centro" />
                                        </div>
                                        <button className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700">Criar Negócio</button>
                                    </form>
                                </div>
                            </div>
                        )
                    }

                    {/* Loss Reason Modal (Required for Lost/Disqualified) */}
                    {
                        lossModalOpen && (
                            <div className="absolute inset-0 z-50 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                                <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border-2 border-red-100">
                                    <div className="text-center mb-6">
                                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 text-red-500">
                                            <AlertTriangle size={24} />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">Motivo da Perda</h3>
                                        <p className="text-sm text-gray-500">Por que este negócio não avançou?</p>
                                    </div>

                                    <div className="space-y-2 mb-6">
                                        {LOSS_REASONS.map(reason => (
                                            <label key={reason} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                                <input
                                                    type="radio"
                                                    name="lossReason"
                                                    className="text-brand-600 focus:ring-brand-500"
                                                    checked={selectedLossReason === reason}
                                                    onChange={() => setSelectedLossReason(reason)}
                                                />
                                                <span className="text-sm font-medium text-gray-700">{reason}</span>
                                            </label>
                                        ))}
                                    </div>

                                    <div className="flex gap-3">
                                        <button onClick={() => setLossModalOpen(false)} className="flex-1 py-2 border border-gray-300 rounded-lg font-bold text-gray-600 hover:bg-gray-50">Cancelar</button>
                                        <button onClick={confirmLoss} className="flex-1 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700">Confirmar</button>
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    {
                        selectedLead && (
                            <LeadDetailModal
                                lead={selectedLead}
                                onClose={() => setSelectedLead(null)}
                                onUpdate={handleLeadUpdate}
                            />
                        )
                    }
                </div >
            );
};

            export default CRM;
