
import React, { useState } from 'react';
import { MessageCircle, Search, MoreVertical, Paperclip, Send, Mic, Check, CheckCheck, User, Users, Megaphone, Zap, Filter, Tag, Clock, ArrowRight, Smartphone, Bot } from 'lucide-react';
import { MOCK_CHATS, MOCK_USERS, MOCK_LEADS } from '../../constants';
import { ChatConversation, LeadStatus } from '../../types';

const WhatsAppStation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'broadcast' | 'automation'>('chat');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(MOCK_CHATS[0].id);
  const [messageInput, setMessageInput] = useState('');
  const [chats, setChats] = useState(MOCK_CHATS);

  // Broadcast State
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [broadcastMessage, setBroadcastMessage] = useState('');

  const selectedChat = chats.find(c => c.id === selectedChatId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedChat) return;

    const newMessage = {
      id: `m${Date.now()}`,
      text: messageInput,
      sender: 'agent' as const,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent' as const
    };

    const updatedChats = chats.map(c => 
      c.id === selectedChatId 
      ? { ...c, messages: [...c.messages, newMessage], lastMessage: messageInput, lastActivity: 'Agora' }
      : c
    );

    setChats(updatedChats);
    setMessageInput('');
  };

  const InboxTab = () => (
    <div className="flex h-[calc(100vh-140px)] bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      
      {/* Sidebar List */}
      <div className="w-80 border-r border-gray-200 flex flex-col bg-white">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <MessageCircle size={18} />
                </div>
                <h3 className="font-bold text-gray-800">Inbox</h3>
            </div>
            <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-200 rounded-full text-gray-500"><MoreVertical size={18}/></button>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar conversa..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-500"
            />
          </div>

          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 hide-scrollbar">
             <button className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold whitespace-nowrap">Tudo</button>
             <button className="px-3 py-1 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-full text-xs font-bold whitespace-nowrap">Não Lidos</button>
             <button className="px-3 py-1 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-full text-xs font-bold whitespace-nowrap">Aguardando</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
           {chats.map(chat => (
             <div 
                key={chat.id}
                onClick={() => setSelectedChatId(chat.id)}
                className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${selectedChatId === chat.id ? 'bg-green-50/50 border-l-4 border-l-green-500' : 'border-l-4 border-l-transparent'}`}
             >
                <div className="flex justify-between items-start mb-1">
                   <div className="flex items-center gap-3">
                      <div className="relative">
                        <img src={chat.leadAvatar || `https://ui-avatars.com/api/?name=${chat.leadName}`} className="w-10 h-10 rounded-full" alt="" />
                        {chat.status === 'open' && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>}
                      </div>
                      <div>
                         <h4 className="font-bold text-gray-900 text-sm">{chat.leadName}</h4>
                         <div className="flex items-center gap-1">
                             {chat.tags.map(tag => (
                                 <span key={tag} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{tag}</span>
                             ))}
                         </div>
                      </div>
                   </div>
                   <span className="text-[10px] text-gray-400">{chat.lastActivity}</span>
                </div>
                <div className="flex justify-between items-center mt-2 pl-12">
                   <p className="text-xs text-gray-500 truncate max-w-[180px]">{chat.lastMessage}</p>
                   {chat.unreadCount > 0 && (
                       <span className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                           {chat.unreadCount}
                       </span>
                   )}
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* Chat Area */}
      {selectedChat ? (
          <div className="flex-1 flex flex-col bg-[#efeae2] relative">
              <div className="absolute inset-0 opacity-10 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] pointer-events-none"></div>
              
              {/* Header */}
              <div className="bg-white p-3 px-6 border-b border-gray-200 flex justify-between items-center z-10 shadow-sm">
                  <div className="flex items-center gap-4">
                      <img src={selectedChat.leadAvatar || `https://ui-avatars.com/api/?name=${selectedChat.leadName}`} className="w-10 h-10 rounded-full cursor-pointer" alt="" />
                      <div>
                          <h3 className="font-bold text-gray-900 cursor-pointer">{selectedChat.leadName}</h3>
                          <p className="text-xs text-gray-500">
                             {selectedChat.assignedTo 
                                ? `Atendido por: ${MOCK_USERS.find(u => u.id === selectedChat.assignedTo)?.name}` 
                                : 'Sem atendente (Fila)'}
                          </p>
                      </div>
                  </div>
                  <div className="flex gap-4 text-gray-600">
                      <button className="flex flex-col items-center gap-1 text-[10px] hover:text-green-600">
                          <CheckCheck size={18} /> Finalizar
                      </button>
                      <button className="flex flex-col items-center gap-1 text-[10px] hover:text-blue-600">
                          <Users size={18} /> Transferir
                      </button>
                      <button className="text-gray-400 hover:bg-gray-100 p-2 rounded-full"><MoreVertical size={20}/></button>
                  </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 z-10">
                  {selectedChat.messages.map(msg => (
                      <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}>
                          <div className={`max-w-[70%] p-3 rounded-lg shadow-sm text-sm relative ${msg.sender === 'user' ? 'bg-white rounded-tl-none' : 'bg-[#d9fdd3] rounded-tr-none'}`}>
                              <p className="text-gray-800">{msg.text}</p>
                              <div className="flex items-center justify-end gap-1 mt-1">
                                  <span className="text-[10px] text-gray-500">{msg.timestamp}</span>
                                  {msg.sender === 'agent' && (
                                      msg.status === 'read' ? <CheckCheck size={12} className="text-blue-500"/> : <Check size={12} className="text-gray-500"/>
                                  )}
                              </div>
                          </div>
                      </div>
                  ))}
              </div>

              {/* Quick Actions (Gatilhos) */}
              <div className="px-4 py-2 bg-gray-50 flex gap-2 overflow-x-auto z-10 border-t border-gray-200">
                  <button onClick={() => setMessageInput('Olá! Gostaria de agendar uma visita?')} className="whitespace-nowrap px-3 py-1 bg-white border border-gray-300 rounded-full text-xs hover:bg-gray-100 text-gray-600">/visita</button>
                  <button onClick={() => setMessageInput('Aqui está a localização do imóvel.')} className="whitespace-nowrap px-3 py-1 bg-white border border-gray-300 rounded-full text-xs hover:bg-gray-100 text-gray-600">/localização</button>
                  <button onClick={() => setMessageInput('Qual o melhor horário para ligarmos?')} className="whitespace-nowrap px-3 py-1 bg-white border border-gray-300 rounded-full text-xs hover:bg-gray-100 text-gray-600">/horario</button>
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="bg-white p-3 px-4 flex items-center gap-4 z-10">
                  <button type="button" className="text-gray-500 hover:text-gray-700"><Paperclip size={20}/></button>
                  <div className="flex-1 bg-white rounded-lg border border-gray-200 flex items-center px-4 py-2">
                      <input 
                        type="text" 
                        value={messageInput}
                        onChange={e => setMessageInput(e.target.value)}
                        placeholder="Digite uma mensagem" 
                        className="flex-1 outline-none text-sm"
                      />
                  </div>
                  {messageInput ? (
                       <button type="submit" className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors shadow-md">
                           <Send size={18} />
                       </button>
                  ) : (
                       <button type="button" className="text-gray-500 hover:bg-gray-100 p-2 rounded-full">
                           <Mic size={20} />
                       </button>
                  )}
              </form>
          </div>
      ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 border-b-8 border-green-500">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg mb-6">
                  <Smartphone size={40} className="text-gray-400" />
              </div>
              <h2 className="text-2xl font-light text-gray-600">WhatsApp Web Station</h2>
              <p className="text-sm text-gray-500 mt-2">Envie e receba mensagens sem precisar conectar seu celular.</p>
              <div className="mt-8 text-xs text-gray-400 flex items-center gap-2">
                  <Zap size={12} /> Criptografia de ponta a ponta
              </div>
          </div>
      )}

      {/* Right Sidebar (Mini CRM) */}
      {selectedChat && (
          <div className="w-72 border-l border-gray-200 bg-white p-6 hidden xl:block overflow-y-auto">
              <div className="text-center mb-6">
                  <img src={selectedChat.leadAvatar || `https://ui-avatars.com/api/?name=${selectedChat.leadName}`} className="w-20 h-20 rounded-full mx-auto mb-3" alt="" />
                  <h3 className="font-bold text-gray-900 text-lg">{selectedChat.leadName}</h3>
                  <p className="text-sm text-gray-500">Lead Quente 🔥</p>
              </div>

              <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Dados do Cliente</h4>
                      <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                              <span className="text-gray-500">Email:</span>
                              <span className="text-gray-900 font-medium truncate w-32 text-right">email@teste.com</span>
                          </div>
                          <div className="flex justify-between">
                              <span className="text-gray-500">Telefone:</span>
                              <span className="text-gray-900 font-medium">(11) 99999-9999</span>
                          </div>
                      </div>
                  </div>

                  <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Etiquetas</h4>
                      <div className="flex flex-wrap gap-2">
                          {selectedChat.tags.map(tag => (
                              <span key={tag} className="bg-brand-50 text-brand-600 px-3 py-1 rounded-full text-xs font-bold border border-brand-100">{tag}</span>
                          ))}
                          <button className="text-xs text-gray-400 hover:text-gray-600 px-2">+ Add</button>
                      </div>
                  </div>

                  <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Funil de Vendas</h4>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: '60%'}}></div>
                      </div>
                      <p className="text-xs text-center font-bold text-gray-600">Em Negociação</p>
                  </div>
              </div>
          </div>
      )}
    </div>
  );

  const BroadcastTab = () => (
      <div className="animate-fade-in max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white mb-8 shadow-lg relative overflow-hidden">
             <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
             <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                 <div>
                     <h2 className="text-3xl font-serif font-bold mb-2">Disparos em Massa</h2>
                     <p className="text-green-100 max-w-lg">Envie ofertas e comunicados para milhares de contatos com um clique. Segmente por tags e personalize a mensagem.</p>
                 </div>
                 <button className="bg-white text-green-700 px-6 py-3 rounded-xl font-bold hover:bg-green-50 transition-all shadow-lg flex items-center gap-2">
                     <Megaphone size={18} /> Nova Campanha
                 </button>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Creator */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                  <h3 className="font-bold text-gray-900 text-lg mb-6 flex items-center gap-2"><Send size={20} className="text-green-600"/> Criar Disparo</h3>
                  
                  <div className="space-y-6">
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">1. Selecione o Público (Tags)</label>
                          <div className="flex flex-wrap gap-2">
                              {['Investidor', 'Primeiro Imóvel', 'Luxo', 'Permuta', 'Médico', 'Advogado'].map(tag => (
                                  <button 
                                    key={tag}
                                    onClick={() => selectedTags.includes(tag) ? setSelectedTags(selectedTags.filter(t => t !== tag)) : setSelectedTags([...selectedTags, tag])}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${selectedTags.includes(tag) ? 'bg-green-100 border-green-500 text-green-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                  >
                                      {tag}
                                  </button>
                              ))}
                          </div>
                          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><Users size={12}/> {selectedTags.length > 0 ? 'Aprox. 142 contatos selecionados' : '0 contatos selecionados'}</p>
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">2. Mensagem</label>
                          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                              <textarea 
                                  className="w-full bg-transparent outline-none text-sm min-h-[120px] resize-none"
                                  placeholder="Olá [Nome], confira esta oportunidade..."
                                  value={broadcastMessage}
                                  onChange={e => setBroadcastMessage(e.target.value)}
                              ></textarea>
                              <div className="flex gap-2 mt-2">
                                  <span className="text-[10px] bg-white border border-gray-200 px-2 py-1 rounded cursor-pointer hover:bg-gray-100">Add [Nome]</span>
                                  <span className="text-[10px] bg-white border border-gray-200 px-2 py-1 rounded cursor-pointer hover:bg-gray-100">Add [Link]</span>
                              </div>
                          </div>
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">3. Agendamento</label>
                          <div className="flex gap-4">
                              <label className="flex items-center gap-2 text-sm text-gray-600">
                                  <input type="radio" name="schedule" defaultChecked className="text-green-600 focus:ring-green-500" />
                                  Enviar Agora
                              </label>
                              <label className="flex items-center gap-2 text-sm text-gray-600">
                                  <input type="radio" name="schedule" className="text-green-600 focus:ring-green-500" />
                                  Agendar
                              </label>
                          </div>
                      </div>
                  </div>

                  <div className="border-t border-gray-100 mt-8 pt-6 flex justify-end gap-3">
                      <button className="px-6 py-2 border border-gray-200 rounded-lg font-bold text-gray-500 hover:bg-gray-50">Cancelar</button>
                      <button className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 shadow-lg shadow-green-500/20">
                          Confirmar Envio
                      </button>
                  </div>
              </div>

              {/* History */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-fit">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Clock size={18} className="text-gray-400"/> Histórico Recente</h3>
                  <div className="space-y-4">
                      {[1,2,3].map(i => (
                          <div key={i} className="pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                              <div className="flex justify-between items-start mb-1">
                                  <span className="font-bold text-gray-800 text-sm">Promoção Carnaval</span>
                                  <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">Enviado</span>
                              </div>
                              <p className="text-xs text-gray-500 mb-2">Lista: Investidores • 450 contatos</p>
                              <div className="flex gap-3 text-xs">
                                  <span className="text-green-600 font-bold">98% Entregue</span>
                                  <span className="text-blue-600 font-bold">45% Lido</span>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      </div>
  );

  const AutomationTab = () => (
      <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="text-center mb-10">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                  <Bot size={32} />
              </div>
              <h2 className="text-3xl font-serif font-bold text-gray-900">Automação Inteligente</h2>
              <p className="text-gray-500">Configure robôs para atender seus clientes 24/7.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Welcome Bot */}
              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:border-green-300 transition-all group cursor-pointer relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4">
                      <div className="w-10 h-6 bg-green-500 rounded-full p-1 flex justify-end cursor-pointer"><div className="w-4 h-4 bg-white rounded-full shadow-sm"></div></div>
                  </div>
                  <div className="mb-6 bg-green-50 w-fit p-3 rounded-xl text-green-600">
                      <MessageCircle size={24} />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">Mensagem de Boas-vindas</h3>
                  <p className="text-sm text-gray-500 mb-4">Responda instantaneamente quando um novo lead entrar em contato pela primeira vez.</p>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm text-gray-600 italic">
                      "Olá! Bem-vindo à NovaMorada. Sou a assistente virtual. Digite 1 para Comprar, 2 para Alugar..."
                  </div>
              </div>

              {/* Out of Office */}
              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:border-blue-300 transition-all group cursor-pointer relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4">
                       <div className="w-10 h-6 bg-gray-300 rounded-full p-1 flex justify-start cursor-pointer"><div className="w-4 h-4 bg-white rounded-full shadow-sm"></div></div>
                  </div>
                  <div className="mb-6 bg-blue-50 w-fit p-3 rounded-xl text-blue-600">
                      <Clock size={24} />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">Fora do Expediente</h3>
                  <p className="text-sm text-gray-500 mb-4">Avise que a imobiliária está fechada e capture o contato para retorno.</p>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm text-gray-600 italic">
                      "No momento estamos fechados. Nosso horário é das 9h às 18h. Deixe seu nome que retornaremos!"
                  </div>
              </div>
          </div>
      </div>
  );

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col">
       <div className="mb-6">
          <h2 className="text-2xl font-serif font-bold text-gray-900 flex items-center gap-2">
              <MessageCircle className="text-green-600"/> WhatsApp Station
          </h2>
          <p className="text-gray-500 text-sm">Central de atendimento multi-agente e automação.</p>
       </div>

       <div className="flex gap-6 border-b border-gray-200 mb-6">
          <button 
              onClick={() => setActiveTab('chat')}
              className={`pb-4 px-4 font-bold text-sm transition-all relative flex items-center gap-2 ${activeTab === 'chat' ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
              <MessageCircle size={16} /> Bate-papo
              {activeTab === 'chat' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600 rounded-t-full"></div>}
          </button>
          <button 
              onClick={() => setActiveTab('broadcast')}
              className={`pb-4 px-4 font-bold text-sm transition-all relative flex items-center gap-2 ${activeTab === 'broadcast' ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
              <Megaphone size={16} /> Disparos em Massa
              {activeTab === 'broadcast' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600 rounded-t-full"></div>}
          </button>
          <button 
              onClick={() => setActiveTab('automation')}
              className={`pb-4 px-4 font-bold text-sm transition-all relative flex items-center gap-2 ${activeTab === 'automation' ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
              <Zap size={16} /> Automação (Bot)
              {activeTab === 'automation' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600 rounded-t-full"></div>}
          </button>
       </div>

       <div className="flex-1 overflow-hidden">
           {activeTab === 'chat' && <InboxTab />}
           {activeTab === 'broadcast' && <BroadcastTab />}
           {activeTab === 'automation' && <AutomationTab />}
       </div>
    </div>
  );
};

export default WhatsAppStation;
