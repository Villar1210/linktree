
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, User, Phone, Video, CheckCircle, AlertCircle, Filter } from 'lucide-react';
import { api } from '../../services/api';
import { Lead, Task } from '../../types';

// Helper to get days in a month
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

// Helper to get day of week for the first day
const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

const AdminCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filterType, setFilterType] = useState<'all' | 'visit' | 'meeting' | 'call'>('all');

  useEffect(() => {
    const fetch = async () => {
      const data = await api.leads.getAll();
      setLeads(data);
      setLoading(false);
    };
    fetch();
  }, []);

  // Extract all tasks from all leads and flatten them into a single array with lead info
  const allTasks = leads.flatMap(lead => 
    (lead.tasks || []).map(task => ({
      ...task,
      leadName: lead.name,
      leadId: lead.id,
      leadInterest: lead.interest
    }))
  );

  // Filter tasks based on current view
  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return allTasks.filter(task => {
        if (filterType !== 'all' && task.type !== filterType) return false;
        return task.dueDate === dateStr;
    });
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const renderCalendarGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Empty cells for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50/50 border border-gray-100"></div>);
    }

    // Days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const isToday = dateStr === new Date().toISOString().split('T')[0];
      const isSelected = dateStr === selectedDate.toISOString().split('T')[0];
      const dayTasks = getTasksForDate(date);
      
      // Priority check
      const hasVisit = dayTasks.some(t => t.type === 'visit');
      const hasMeeting = dayTasks.some(t => t.type === 'meeting');

      days.push(
        <div 
          key={day} 
          onClick={() => setSelectedDate(date)}
          className={`h-24 border border-gray-100 p-2 cursor-pointer transition-all relative group ${
            isSelected ? 'bg-brand-50 border-brand-200 ring-1 ring-brand-200' : 'hover:bg-gray-50 bg-white'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className={`text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-brand-600 text-white' : 'text-gray-700'}`}>
              {day}
            </span>
            {dayTasks.length > 0 && (
               <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-1.5 rounded-full">
                 {dayTasks.length}
               </span>
            )}
          </div>
          
          <div className="mt-2 space-y-1">
             {dayTasks.slice(0, 2).map((task, idx) => (
               <div key={idx} className={`text-[10px] truncate px-1.5 py-0.5 rounded border ${
                 task.type === 'visit' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                 task.type === 'meeting' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                 'bg-gray-50 text-gray-600 border-gray-100'
               }`}>
                 {task.type === 'visit' && '📍 '}
                 {task.type === 'call' && '📞 '}
                 {task.title}
               </div>
             ))}
             {dayTasks.length > 2 && (
               <div className="text-[9px] text-gray-400 text-center">+ {dayTasks.length - 2} mais</div>
             )}
          </div>
        </div>
      );
    }

    return days;
  };

  const selectedDayTasks = getTasksForDate(selectedDate);

  const getTaskIcon = (type: string) => {
      switch(type) {
          case 'visit': return <MapPin size={16} className="text-purple-600"/>;
          case 'meeting': return <User size={16} className="text-blue-600"/>;
          case 'call': return <Phone size={16} className="text-green-600"/>;
          case 'video': return <Video size={16} className="text-orange-600"/>;
          default: return <Clock size={16} className="text-gray-600"/>;
      }
  };

  return (
    <div className="animate-fade-in h-[calc(100vh-100px)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-2xl font-serif font-bold text-gray-900 flex items-center gap-2">
             <CalendarIcon className="text-brand-600" /> Agenda do Corretor
           </h2>
           <p className="text-gray-500 text-sm">Gerencie suas visitas, reuniões e follow-ups.</p>
        </div>
        
        <div className="flex items-center gap-4">
            {/* View Filters */}
            <div className="bg-white border border-gray-200 rounded-lg p-1 flex gap-1">
                <button 
                    onClick={() => setFilterType('all')}
                    className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${filterType === 'all' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Tudo
                </button>
                <button 
                    onClick={() => setFilterType('visit')}
                    className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${filterType === 'visit' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Visitas
                </button>
                <button 
                    onClick={() => setFilterType('meeting')}
                    className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${filterType === 'meeting' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Reuniões
                </button>
            </div>

            <button className="bg-brand-600 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-brand-700 transition-colors text-sm">
                + Novo Agendamento
            </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
        
        {/* Main Calendar Grid */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
           {/* Month Navigation */}
           <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full text-gray-600"><ChevronLeft size={20}/></button>
              <h3 className="text-lg font-bold text-gray-900 capitalize">
                {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </h3>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full text-gray-600"><ChevronRight size={20}/></button>
           </div>

           {/* Days Header */}
           <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                  <div key={d} className="py-2 text-center text-xs font-bold text-gray-400 uppercase">{d}</div>
              ))}
           </div>

           {/* Grid */}
           <div className="grid grid-cols-7 flex-1 overflow-y-auto">
              {renderCalendarGrid()}
           </div>
        </div>

        {/* Sidebar Daily Agenda */}
        <div className="w-full lg:w-96 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                    {selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                    {selectedDayTasks.length} compromissos agendados
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedDayTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60">
                        <Clock size={48} className="mb-4" />
                        <p>Livre! Nenhum compromisso.</p>
                    </div>
                ) : (
                    selectedDayTasks.map((task: any) => (
                        <div key={task.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-brand-200 hover:shadow-md transition-all group relative">
                            <div className="absolute left-0 top-4 bottom-4 w-1 bg-brand-500 rounded-r-full"></div>
                            <div className="pl-3">
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded border flex items-center gap-1 uppercase tracking-wider ${
                                        task.type === 'visit' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                        task.type === 'meeting' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                        task.type === 'call' ? 'bg-green-50 text-green-700 border-green-100' :
                                        'bg-gray-50 text-gray-600 border-gray-100'
                                    }`}>
                                        {getTaskIcon(task.type)} {task.type}
                                    </span>
                                    <span className="text-xs font-bold text-gray-900">{task.dueTime || '09:00'}</span>
                                </div>
                                <h4 className="font-bold text-gray-800 text-sm mb-1">{task.title}</h4>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                    <User size={12} />
                                    <span className="font-medium">{task.leadName}</span>
                                    <span className="text-gray-300">|</span>
                                    <span className="truncate max-w-[120px]">{task.leadInterest}</span>
                                </div>
                                
                                <div className="flex gap-2 pt-2 border-t border-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="flex-1 py-1.5 bg-green-50 text-green-700 rounded text-xs font-bold hover:bg-green-100 flex items-center justify-center gap-1">
                                        <CheckCircle size={12} /> Concluir
                                    </button>
                                    <button className="flex-1 py-1.5 bg-gray-50 text-gray-600 rounded text-xs font-bold hover:bg-gray-100 flex items-center justify-center gap-1">
                                        Editar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default AdminCalendar;
