import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Filter, MapPin, Bed, Bath, Maximize, Heart, Map as MapIcon, Grid, List } from 'lucide-react';
import { api } from '../services/api';
import { Property, PropertyType } from '../types';
import { MOCK_CAMPAIGNS } from '../constants';

const Properties: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialType = searchParams.get('type') || 'all';
  const campaignId = searchParams.get('campaignId');
  const [filterType, setFilterType] = useState<string>(initialType);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  useEffect(() => {
    const fetchProps = async () => {
      const data = await api.properties.getAll();
      setProperties(data);
      setLoading(false);
    };
    fetchProps();
  }, []);

  // Sync state with URL changes
  useEffect(() => {
    setFilterType(searchParams.get('type') || 'all');
  }, [searchParams]);

  const handleFilterClick = (type: string) => {
    if (campaignId) {
       // Se estiver vendo uma campanha, clicar em um filtro deve remover a campanha e filtrar pelo tipo
       setSearchParams({ type });
    } else {
        if (type === 'all') {
          searchParams.delete('type');
          setSearchParams(searchParams);
        } else {
          setSearchParams({ type });
        }
    }
  };

  const filtered = properties.filter(p => {
    // If campaign filter is active, only show properties from that campaign
    if (campaignId) {
      return p.campaignIds?.includes(campaignId);
    }
    // Otherwise filter by type
    if (filterType === 'all') return true;
    return p.type === filterType;
  });

  // Helper function to pluralize category names for the header
  const getHeaderTitle = () => {
    const count = filtered.length;
    
    if (campaignId) {
        const campaign = MOCK_CAMPAIGNS.find(c => c.id === campaignId);
        return campaign ? `${campaign.title}` : 'Campanha';
    }

    if (filterType === 'all') return `${count} imóveis encontrados`;
    
    // Pluralization logic
    let typeName = filterType;
    if (filterType === 'Comercial') typeName = 'Imóveis Comerciais';
    else if (filterType === 'Terreno') typeName = 'Terrenos';
    else typeName = `${filterType}s`; // Casa -> Casas, Apartamento -> Apartamentos

    return `${count} ${typeName} encontrados`;
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Subheader Filters */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
             
             {/* Main Filter Pills */}
             <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto hide-scrollbar">
                <button 
                  onClick={() => handleFilterClick('all')}
                  className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${filterType === 'all' && !campaignId ? 'bg-brand-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  Todos
                </button>
                {Object.values(PropertyType).map(type => (
                  <button 
                    key={type}
                    onClick={() => handleFilterClick(type)}
                    className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${filterType === type && !campaignId ? 'bg-brand-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {type}
                  </button>
                ))}
             </div>

             {/* View Toggle & More Filters */}
             <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm font-bold hover:bg-gray-50 transition-colors">
                  <Filter size={16} /> Mais Filtros
                </button>
                
                <div className="h-8 w-px bg-gray-300 mx-2 hidden md:block"></div>

                <div className="bg-gray-100 p-1 rounded-lg flex gap-1">
                   <button 
                     onClick={() => setViewMode('grid')}
                     className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-brand-900' : 'text-gray-400 hover:text-gray-600'}`}
                   >
                     <Grid size={18} />
                   </button>
                   <button 
                     onClick={() => setViewMode('map')}
                     className={`p-2 rounded-md transition-all ${viewMode === 'map' ? 'bg-white shadow-sm text-brand-900' : 'text-gray-400 hover:text-gray-600'}`}
                   >
                     <MapIcon size={18} />
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
            {campaignId && (
                <Link to="/campaigns" className="text-sm text-brand-600 hover:underline mb-2 inline-block">
                    &larr; Voltar para Campanhas
                </Link>
            )}
            <h1 className="text-2xl font-serif font-bold text-gray-900">
               {getHeaderTitle()}
            </h1>
            {campaignId && (
                <p className="text-gray-500 mt-1">Exibindo ofertas exclusivas desta campanha.</p>
            )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-900"></div>
          </div>
        ) : viewMode === 'map' ? (
           <div className="bg-gray-200 rounded-3xl h-[600px] flex items-center justify-center relative overflow-hidden border border-gray-300">
              <img 
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80" 
                alt="Map View Placeholder"
                className="w-full h-full object-cover opacity-50 grayscale"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/30 backdrop-blur-sm">
                 <MapIcon size={64} className="text-gray-500 mb-4" />
                 <h3 className="text-2xl font-bold text-gray-800">Visualização no Mapa</h3>
                 <p className="text-gray-600 mb-6">Integração com Google Maps API necessária.</p>
                 <button onClick={() => setViewMode('grid')} className="bg-brand-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-brand-800 transition-all">
                    Voltar para Lista
                 </button>
              </div>
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map(property => (
              <div key={property.id} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col">
                <div className="relative h-56 overflow-hidden">
                  <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <button className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white text-gray-400 hover:text-red-500 transition-colors shadow-sm z-10">
                    <Heart size={16} />
                  </button>
                  <div className="absolute top-3 left-3 bg-gray-900/90 backdrop-blur px-2 py-1 rounded-md text-white text-[10px] font-bold uppercase tracking-wider">
                    {property.status === 'active' ? 'Disponível' : property.status}
                  </div>
                  <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-gray-900/80 to-transparent">
                     <p className="text-white font-bold text-xl">{property.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                  </div>
                </div>
                
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-2">
                     <span className="text-brand-600 text-[10px] font-bold uppercase tracking-wider">{property.type}</span>
                     {property.featured && <span className="flex items-center gap-1 text-amber-500 text-[10px] font-bold"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Destaque</span>}
                  </div>
                  
                  <Link to={`/properties/${property.id}`} className="block mb-1">
                    <h3 className="text-base font-bold text-gray-900 hover:text-brand-600 transition-colors line-clamp-1" title={property.title}>{property.title}</h3>
                  </Link>
                  
                  <div className="flex items-center gap-1 text-gray-500 text-xs mb-4">
                    <MapPin size={12} className="text-gray-400" />
                    <span className="truncate">{property.city}, {property.state}</span>
                  </div>

                  <div className="mt-auto pt-3 border-t border-gray-50">
                    <div className="flex justify-between text-gray-500">
                      <div className="flex items-center gap-1" title="Quartos">
                        <Bed size={14} className="text-gray-400" />
                        <span className="text-xs font-bold">{property.bedrooms}</span>
                      </div>
                      <div className="flex items-center gap-1" title="Banheiros">
                        <Bath size={14} className="text-gray-400" />
                        <span className="text-xs font-bold">{property.bathrooms}</span>
                      </div>
                      <div className="flex items-center gap-1" title="Área">
                        <Maximize size={14} className="text-gray-400" />
                        <span className="text-xs font-bold">{property.area} m²</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
                <div className="col-span-1 sm:col-span-2 lg:col-span-4 py-12 text-center text-gray-500 bg-white rounded-2xl border border-dashed border-gray-300">
                    <p className="text-lg">Nenhum imóvel encontrado nesta categoria.</p>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties;