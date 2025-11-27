import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Upload, Sparkles, MapPin, Home, DollarSign, Image as ImageIcon, X } from 'lucide-react';
import { api } from '../../services/api';
import { Property, PropertyType } from '../../types';

const PropertyForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Property>>({
    title: '',
    type: PropertyType.APARTMENT,
    price: 0,
    area: 0,
    bedrooms: 0,
    bathrooms: 0,
    suites: 0,
    address: '',
    city: '',
    state: 'SP',
    description: '',
    features: [],
    images: [],
    status: 'active',
    featured: false
  });

  const [featureInput, setFeatureInput] = useState('');

  // Simulate AI Description Generation
  const generateDescription = async () => {
    setAiLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const aiText = `Este incrível ${formData.type?.toLowerCase()} localizado em ${formData.city} oferece o equilíbrio perfeito entre conforto e sofisticação. Com ${formData.area}m² de área útil, dispõe de ${formData.bedrooms} dormitórios (sendo ${formData.suites} suítes) e acabamento de alto padrão. \n\nA localização privilegiada na ${formData.address} garante fácil acesso às principais vias da cidade. Ideal para quem busca qualidade de vida e segurança. Agende sua visita!`;
    
    setFormData(prev => ({ ...prev, description: aiText }));
    setAiLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await api.properties.create(formData);
    setLoading(false);
    navigate('/admin/properties');
  };

  const addFeature = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && featureInput) {
      e.preventDefault();
      setFormData(prev => ({ ...prev, features: [...(prev.features || []), featureInput] }));
      setFeatureInput('');
    }
  };

  const removeFeature = (idx: number) => {
    setFormData(prev => ({ ...prev, features: prev.features?.filter((_, i) => i !== idx) }));
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/properties')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-serif font-bold text-gray-900">{isEditing ? 'Editar Imóvel' : 'Novo Imóvel'}</h2>
            <p className="text-gray-500 text-sm">Preencha os dados abaixo para publicar no site.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/admin/properties')} className="px-6 py-2 border border-gray-300 rounded-xl text-gray-600 font-bold hover:bg-gray-50">
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={loading} className="px-6 py-2 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 shadow-lg shadow-brand-600/20 flex items-center gap-2">
            {loading ? 'Salvando...' : <><Save size={18} /> Publicar Imóvel</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Basic Info Card */}
          <section className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><Home size={20} className="text-brand-600"/> Informações Principais</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Título do Anúncio</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" 
                  placeholder="Ex: Apartamento de Luxo no Jardins"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tipo de Imóvel</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as any})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                  >
                    {Object.values(PropertyType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Preço (R$)</label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="number" 
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Área (m²)</label>
                    <input type="number" value={formData.area} onChange={e => setFormData({...formData, area: Number(e.target.value)})} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quartos</label>
                    <input type="number" value={formData.bedrooms} onChange={e => setFormData({...formData, bedrooms: Number(e.target.value)})} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Suítes</label>
                    <input type="number" value={formData.suites} onChange={e => setFormData({...formData, suites: Number(e.target.value)})} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none" />
                </div>
              </div>
            </div>
          </section>

          {/* Description with AI */}
          <section className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Descrição Detalhada</h3>
              <button 
                onClick={generateDescription}
                disabled={aiLoading}
                className="flex items-center gap-2 text-xs font-bold bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 py-1.5 rounded-full hover:shadow-lg transition-all transform hover:scale-105"
              >
                {aiLoading ? 'Gerando...' : <><Sparkles size={14} /> Gerar com IA</>}
              </button>
            </div>
            <textarea 
              rows={6}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none resize-none"
              placeholder="Descreva os detalhes do imóvel..."
            ></textarea>
          </section>

          {/* Images */}
          <section className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
             <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><ImageIcon size={20} className="text-brand-600"/> Mídia & Imagens</h3>
             
             <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer group">
                <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                   <Upload size={32} />
                </div>
                <p className="text-gray-900 font-bold">Clique para fazer upload</p>
                <p className="text-gray-500 text-sm">ou arraste seus arquivos aqui (JPG, PNG)</p>
             </div>

             {/* Mock Gallery Preview */}
             {formData.images && formData.images.length > 0 && (
               <div className="grid grid-cols-4 gap-4 mt-6">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
               </div>
             )}
          </section>

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Location */}
          <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><MapPin size={20} className="text-brand-600"/> Localização</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CEP</label>
                <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none" placeholder="00000-000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
                   <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none" />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                   <input type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none" />
                </div>
              </div>
            </div>
          </section>

          {/* Features Tags */}
          <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Comodidades</h3>
            <div className="flex flex-wrap gap-2 mb-4">
               {formData.features?.map((feat, idx) => (
                 <span key={idx} className="bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                   {feat} <button onClick={() => removeFeature(idx)}><X size={12} /></button>
                 </span>
               ))}
            </div>
            <input 
              type="text" 
              value={featureInput}
              onChange={e => setFeatureInput(e.target.value)}
              onKeyDown={addFeature}
              placeholder="Digite e aperte Enter..." 
              className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none text-sm" 
            />
          </section>

          {/* Visibility */}
          <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
             <h3 className="text-lg font-bold text-gray-900 mb-4">Visibilidade</h3>
             <label className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 mb-2">
                <input 
                  type="checkbox" 
                  checked={formData.featured}
                  onChange={e => setFormData({...formData, featured: e.target.checked})}
                  className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500" 
                />
                <span className="font-medium text-gray-700">Destaque na Home</span>
             </label>
             <label className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50">
                <input 
                  type="checkbox" 
                  checked={formData.status === 'active'}
                  onChange={e => setFormData({...formData, status: e.target.checked ? 'active' : 'sold'})}
                  className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500" 
                />
                <span className="font-medium text-gray-700">Imóvel Ativo no Site</span>
             </label>
          </section>

        </div>
      </div>
    </div>
  );
};

export default PropertyForm;