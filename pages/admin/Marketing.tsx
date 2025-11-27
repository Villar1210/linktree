
import React, { useState } from 'react';
import { Instagram, Facebook, Linkedin, Plus, Image as ImageIcon, Calendar, Send, MoreHorizontal, TrendingUp, BarChart3, Users, DollarSign, Target, CheckCircle, Zap } from 'lucide-react';
import { MOCK_MARKETING_POSTS, MOCK_ADS, MOCK_PROPERTIES } from '../../constants';
import { SocialPost } from '../../types';

const Marketing: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'social' | 'ads'>('social');
  const [posts, setPosts] = useState(MOCK_MARKETING_POSTS);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  
  // New Post State
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram']);

  // Ads State
  const [showAdWizard, setShowAdWizard] = useState(false);
  const [selectedPropertyForAd, setSelectedPropertyForAd] = useState('');
  const [adBudget, setAdBudget] = useState(20);

  const togglePlatform = (p: string) => {
    if (selectedPlatforms.includes(p)) {
        setSelectedPlatforms(selectedPlatforms.filter(plat => plat !== p));
    } else {
        setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  const handleCreatePost = (e: React.FormEvent) => {
      e.preventDefault();
      const newPost: SocialPost = {
          id: `p${Date.now()}`,
          content: newPostContent,
          image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Mock Image
          platforms: selectedPlatforms as any,
          scheduledDate: new Date().toISOString(),
          status: 'scheduled'
      };
      setPosts([newPost, ...posts]);
      setShowNewPostModal(false);
      setNewPostContent('');
  };

  const SocialMediaTab = () => (
    <div className="animate-fade-in">
        {/* Connected Accounts */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
            <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm min-w-[200px]">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white flex items-center justify-center">
                    <Instagram size={20} />
                </div>
                <div>
                    <p className="font-bold text-sm text-gray-900">@novamorada</p>
                    <p className="text-xs text-green-600 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Conectado</p>
                </div>
            </div>
            <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm min-w-[200px]">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <Facebook size={20} />
                </div>
                <div>
                    <p className="font-bold text-sm text-gray-900">Nova Morada</p>
                    <p className="text-xs text-green-600 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Conectado</p>
                </div>
            </div>
            <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm min-w-[200px] opacity-60">
                <div className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center">
                    <Linkedin size={20} />
                </div>
                <div>
                    <p className="font-bold text-sm text-gray-900">Conectar</p>
                    <p className="text-xs text-gray-500">LinkedIn Page</p>
                </div>
            </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 text-lg">Timeline de Publicações</h3>
            <button 
                onClick={() => setShowNewPostModal(true)}
                className="bg-brand-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-brand-700 shadow-lg shadow-brand-500/20"
            >
                <Plus size={18} /> Novo Post
            </button>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
            {posts.map(post => (
                <div key={post.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex gap-4 items-start">
                    <img src={post.image} alt="Post" className="w-24 h-24 object-cover rounded-lg bg-gray-100" />
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            {post.platforms.includes('instagram') && <Instagram size={14} className="text-pink-600" />}
                            {post.platforms.includes('facebook') && <Facebook size={14} className="text-blue-600" />}
                            {post.platforms.includes('linkedin') && <Linkedin size={14} className="text-blue-700" />}
                            <span className="text-xs text-gray-400">• {new Date(post.scheduledDate).toLocaleDateString()}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ml-auto ${
                                post.status === 'published' ? 'bg-green-100 text-green-700' : 
                                post.status === 'scheduled' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                                {post.status === 'published' ? 'Publicado' : 'Agendado'}
                            </span>
                        </div>
                        <p className="text-sm text-gray-800 line-clamp-2 mb-3">{post.content}</p>
                        
                        {post.status === 'published' && (
                            <div className="flex gap-4 text-xs text-gray-500 font-medium">
                                <span>❤️ {post.likes} Curtidas</span>
                                <span>💬 {post.comments} Comentários</span>
                            </div>
                        )}
                    </div>
                    <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={20} /></button>
                </div>
            ))}
        </div>
    </div>
  );

  const AdsManagerTab = () => (
    <div className="animate-fade-in">
        {/* Ads Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Investimento Total</p>
                <h3 className="text-2xl font-bold text-gray-900">R$ 1.240</h3>
                <span className="text-xs text-red-500 flex items-center gap-1 mt-1"><TrendingUp size={12} className="rotate-180"/> +12% esse mês</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Alcance (Pessoas)</p>
                <h3 className="text-2xl font-bold text-gray-900">18.1k</h3>
                <span className="text-xs text-green-500 flex items-center gap-1 mt-1"><Users size={12}/> +5% novos</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Cliques no Link</p>
                <h3 className="text-2xl font-bold text-gray-900">1.310</h3>
                <span className="text-xs text-green-500 flex items-center gap-1 mt-1"><Target size={12}/> CTR 3.2%</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Custo por Lead</p>
                <h3 className="text-2xl font-bold text-gray-900">R$ 14,50</h3>
                <span className="text-xs text-gray-500 flex items-center gap-1 mt-1"><DollarSign size={12}/> Média de mercado</span>
            </div>
        </div>

        {/* Easy Ads Creator (Zionic Style) */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white mb-10 relative overflow-hidden shadow-xl">
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                    <div className="bg-white/20 w-fit px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-sm border border-white/20 flex items-center gap-2">
                        <Zap size={14} className="text-yellow-300" /> Impulsionamento Inteligente
                    </div>
                    <h2 className="text-3xl font-serif font-bold mb-2">Venda mais rápido com IA</h2>
                    <p className="text-blue-100 max-w-lg">Selecione um imóvel e nossa inteligência artificial cria e gerencia seus anúncios no Facebook e Instagram automaticamente.</p>
                </div>
                <button 
                    onClick={() => setShowAdWizard(true)}
                    className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg hover:scale-105 whitespace-nowrap"
                >
                    Impulsionar Imóvel Agora
                </button>
            </div>
        </div>

        {/* Active Campaigns */}
        <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2"><BarChart3 size={20} className="text-gray-400"/> Campanhas Ativas</h3>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 font-medium uppercase tracking-wider">
                    <tr>
                        <th className="px-6 py-4">Campanha</th>
                        <th className="px-6 py-4">Plataforma</th>
                        <th className="px-6 py-4">Gasto</th>
                        <th className="px-6 py-4">Resultados</th>
                        <th className="px-6 py-4">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {MOCK_ADS.map(ad => (
                        <tr key={ad.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <img src={ad.thumbnail} className="w-10 h-10 rounded object-cover" alt="" />
                                    <span className="font-bold text-gray-900">{ad.name}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                {ad.platform === 'meta' ? (
                                    <div className="flex gap-1"><Facebook size={16} className="text-blue-600"/><Instagram size={16} className="text-pink-600"/></div>
                                ) : (
                                    <div className="flex gap-1 font-bold text-gray-600">Google Ads</div>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                <p className="font-bold text-gray-900">R$ {ad.spent}</p>
                                <p className="text-xs text-gray-400">de R$ {ad.budget}/dia</p>
                            </td>
                            <td className="px-6 py-4">
                                <p className="font-bold text-green-600">{ad.leads} Leads</p>
                                <p className="text-xs text-gray-400">{ad.clicks} cliques</p>
                            </td>
                            <td className="px-6 py-4">
                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold uppercase flex items-center w-fit gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Ativo
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="mb-8">
        <h2 className="text-2xl font-serif font-bold text-gray-900">Marketing Digital</h2>
        <p className="text-gray-500">Central de redes sociais e tráfego pago.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200 mb-8">
        <button 
            onClick={() => setActiveTab('social')}
            className={`pb-4 px-2 font-bold text-sm transition-all relative ${activeTab === 'social' ? 'text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
            Gestão de Redes Sociais
            {activeTab === 'social' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-600 rounded-t-full"></div>}
        </button>
        <button 
            onClick={() => setActiveTab('ads')}
            className={`pb-4 px-2 font-bold text-sm transition-all relative ${activeTab === 'ads' ? 'text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
            Meta Ads & Tráfego
            {activeTab === 'ads' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-600 rounded-t-full"></div>}
        </button>
      </div>

      {activeTab === 'social' ? <SocialMediaTab /> : <AdsManagerTab />}

      {/* New Post Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[600px]">
                {/* Editor Side */}
                <div className="flex-1 p-8 flex flex-col">
                    <h3 className="font-bold text-xl text-gray-900 mb-6">Criar Publicação</h3>
                    
                    <div className="flex gap-3 mb-6">
                        <button 
                            onClick={() => togglePlatform('instagram')}
                            className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1 w-24 transition-all ${selectedPlatforms.includes('instagram') ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-gray-100 text-gray-400 hover:bg-gray-50'}`}
                        >
                            <Instagram size={20} />
                            <span className="text-xs font-bold">Feed</span>
                        </button>
                        <button 
                            onClick={() => togglePlatform('facebook')}
                            className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1 w-24 transition-all ${selectedPlatforms.includes('facebook') ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 text-gray-400 hover:bg-gray-50'}`}
                        >
                            <Facebook size={20} />
                            <span className="text-xs font-bold">Page</span>
                        </button>
                    </div>

                    <textarea 
                        className="w-full flex-1 bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none resize-none focus:ring-2 focus:ring-brand-200 mb-4"
                        placeholder="Escreva sua legenda aqui..."
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                    ></textarea>

                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex items-center justify-center text-gray-400 gap-2 hover:bg-gray-50 cursor-pointer transition-colors mb-6">
                        <ImageIcon size={20} /> Adicionar Foto/Vídeo
                    </div>

                    <div className="flex justify-between items-center mt-auto">
                         <div className="flex items-center gap-2 text-gray-500 text-sm font-bold bg-gray-100 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-gray-200">
                             <Calendar size={16} /> Agendar
                         </div>
                         <div className="flex gap-3">
                             <button onClick={() => setShowNewPostModal(false)} className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg">Cancelar</button>
                             <button onClick={handleCreatePost} className="px-6 py-2 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700">Agendar Post</button>
                         </div>
                    </div>
                </div>

                {/* Preview Side */}
                <div className="w-full md:w-[350px] bg-gray-100 p-8 flex items-center justify-center border-l border-gray-200">
                    <div className="bg-white w-full rounded-xl shadow-lg overflow-hidden border border-gray-200 max-w-[280px]">
                        <div className="p-3 flex items-center gap-2 border-b border-gray-50">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-500 p-[2px]">
                                <div className="w-full h-full bg-white rounded-full p-[2px]">
                                    <img src="https://i.pravatar.cc/150?u=admin" className="w-full h-full rounded-full" alt=""/>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-gray-900">novamorada</span>
                        </div>
                        <div className="aspect-square bg-gray-200 flex items-center justify-center text-gray-400">
                            <ImageIcon size={32} />
                        </div>
                        <div className="p-3">
                            <div className="flex gap-3 mb-2 text-gray-700">
                                <div className="hover:text-red-500 cursor-pointer"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg></div>
                                <div><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg></div>
                                <div><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg></div>
                            </div>
                            <p className="text-xs text-gray-900 mb-1 font-bold">12 curtidas</p>
                            <p className="text-xs text-gray-800 line-clamp-3">
                                <span className="font-bold mr-1">novamorada</span>
                                {newPostContent || 'Sua legenda aparecerá aqui...'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Ad Wizard Modal */}
      {showAdWizard && (
          <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-8">
                  <div className="flex justify-between items-center mb-8">
                      <div>
                          <h3 className="font-bold text-2xl text-gray-900">Impulsionar Imóvel</h3>
                          <p className="text-gray-500">Crie uma campanha profissional em segundos.</p>
                      </div>
                      <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1">
                          <Facebook size={14} /> Meta Ads
                      </div>
                  </div>

                  <div className="space-y-6">
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">1. Selecione o Imóvel</label>
                          <select 
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                            value={selectedPropertyForAd}
                            onChange={(e) => setSelectedPropertyForAd(e.target.value)}
                          >
                              <option value="">Selecione um imóvel...</option>
                              {MOCK_PROPERTIES.map(p => (
                                  <option key={p.id} value={p.id}>{p.title} ({p.city})</option>
                              ))}
                          </select>
                      </div>

                      {selectedPropertyForAd && (
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex gap-4 items-center">
                              <img src={MOCK_PROPERTIES.find(p => p.id === selectedPropertyForAd)?.images[0]} className="w-16 h-16 rounded-lg object-cover" alt="" />
                              <div>
                                  <p className="font-bold text-sm text-gray-900">{MOCK_PROPERTIES.find(p => p.id === selectedPropertyForAd)?.title}</p>
                                  <p className="text-xs text-green-600 font-bold mt-1">✓ Imagens e texto otimizados automaticamente</p>
                              </div>
                          </div>
                      )}

                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">2. Orçamento Diário</label>
                          <div className="flex items-center gap-4">
                              <input 
                                type="range" 
                                min="10" 
                                max="200" 
                                step="5"
                                value={adBudget}
                                onChange={(e) => setAdBudget(Number(e.target.value))}
                                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                              />
                              <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg font-bold text-gray-900 min-w-[100px] text-center">
                                  R$ {adBudget},00
                              </div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-400 mt-2">
                              <span>Alcance est: <b className="text-gray-600">{(adBudget * 85).toLocaleString()} pessoas</b></span>
                              <span>Cliques est: <b className="text-gray-600">{(adBudget * 0.8).toFixed(0)} - {(adBudget * 1.5).toFixed(0)}</b></span>
                          </div>
                      </div>
                  </div>

                  <div className="flex gap-3 mt-10">
                      <button onClick={() => setShowAdWizard(false)} className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-500 hover:bg-gray-50">Cancelar</button>
                      <button 
                        onClick={() => {
                            alert('Campanha enviada para a Meta! (Simulação)');
                            setShowAdWizard(false);
                        }}
                        className="flex-2 w-2/3 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                      >
                          Lançar Campanha <Send size={18} />
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Marketing;