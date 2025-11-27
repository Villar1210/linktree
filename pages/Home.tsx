import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Key, Home as HomeIcon, Star, Phone, Map, HardHat, Calendar, MapPin, Maximize, ArrowLeft, ChevronLeft, ChevronRight, Quote, Scale, ClipboardCheck, HandCoins, Bed, Bath, Percent } from 'lucide-react';
import { MOCK_PROPERTIES, MOCK_CAMPAIGNS, APP_CONFIG } from '../constants';
import { PropertyType } from '../types';

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1600596542815-3ad19fb2a258?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
];

const Home: React.FC = () => {
  // Search State
  const [searchPurpose, setSearchPurpose] = useState<'buy' | 'rent' | 'launch'>('buy');
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Remove slice to show all featured properties in carousel
  const featuredProperties = MOCK_PROPERTIES.filter(p => p.featured && p.type !== PropertyType.LAUNCH);
  const launchProperties = MOCK_PROPERTIES.filter(p => p.type === PropertyType.LAUNCH);
  // Ready properties (Not launches)
  const readyProperties = MOCK_PROPERTIES.filter(p => p.type !== PropertyType.LAUNCH);
  
  // Logic to show up to 2 active campaigns
  const activeCampaigns = MOCK_CAMPAIGNS.slice(0, 2);
  const isSingleCampaign = activeCampaigns.length === 1;
  
  const launchCarouselRef = useRef<HTMLDivElement>(null);
  const featuredCarouselRef = useRef<HTMLDivElement>(null);
  const readyCarouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = 300; // Ajustado para o tamanho do novo card
      const newScrollLeft = direction === 'left' 
        ? ref.current.scrollLeft - scrollAmount 
        : ref.current.scrollLeft + scrollAmount;
      
      ref.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const lifestyles = [
    { title: "Apartamentos", type: PropertyType.APARTMENT, image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", count: 42 },
    { title: "Casas", type: PropertyType.HOUSE, image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", count: 28 },
    { title: "Coberturas", type: PropertyType.APARTMENT, image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", count: 12 },
    { title: "Investimentos", type: PropertyType.COMMERCIAL, image: "https://images.unsplash.com/photo-1460472178825-e5240623afd5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", count: 15 },
  ];

  return (
    <div className="bg-gray-50">
      {/* Hero Section - Inclusive & Dynamic */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background Images with Fade Effect */}
        <div className="absolute inset-0 z-0 bg-gray-900">
          {HERO_IMAGES.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${index === heroIndex ? 'opacity-100' : 'opacity-0'}`}
            >
              <img 
                src={img} 
                alt="Hero" 
                className={`w-full h-full object-cover transition-transform duration-[10000ms] ease-linear ${index === heroIndex ? 'scale-110' : 'scale-100'}`}
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-gray-900/30"></div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10 pt-20 text-center md:text-left">
          <div className="max-w-4xl mx-auto md:mx-0 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <span className="inline-block px-4 py-1.5 rounded-full bg-brand-600 text-white text-xs font-bold tracking-widest uppercase mb-6 shadow-lg">
              Seu novo lar está aqui
            </span>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight drop-shadow-xl">
              Encontre o lugar ideal para <br className="hidden md:block" />
              <span className="text-brand-400">sua história acontecer.</span>
            </h1>
            <p className="text-xl text-gray-200 mb-10 font-medium max-w-2xl mx-auto md:mx-0 leading-relaxed drop-shadow-md">
              Do primeiro apartamento à casa dos sonhos. Temos as melhores opções para todos os momentos da sua vida.
            </p>
            
            {/* Search Bar Container */}
            <div className="max-w-4xl mx-auto md:mx-0">
              
              {/* Search Tabs */}
              <div className="flex gap-1 ml-4 mb-0 relative z-20">
                <button 
                  onClick={() => setSearchPurpose('buy')}
                  className={`px-8 py-3 rounded-t-xl text-sm font-bold transition-all ${
                    searchPurpose === 'buy' 
                    ? 'bg-white text-brand-900' 
                    : 'bg-gray-900/40 text-white hover:bg-gray-900/60 backdrop-blur-sm'
                  }`}
                >
                  Comprar
                </button>
                <button 
                  onClick={() => setSearchPurpose('rent')}
                  className={`px-8 py-3 rounded-t-xl text-sm font-bold transition-all ${
                    searchPurpose === 'rent' 
                    ? 'bg-white text-brand-900' 
                    : 'bg-gray-900/40 text-white hover:bg-gray-900/60 backdrop-blur-sm'
                  }`}
                >
                  Alugar
                </button>
                <button 
                  onClick={() => setSearchPurpose('launch')}
                  className={`px-8 py-3 rounded-t-xl text-sm font-bold transition-all flex items-center gap-2 ${
                    searchPurpose === 'launch' 
                    ? 'bg-white text-brand-900' 
                    : 'bg-gray-900/40 text-white hover:bg-gray-900/60 backdrop-blur-sm'
                  }`}
                >
                  {searchPurpose !== 'launch' && <Star size={12} className="text-amber-400 fill-amber-400" />}
                  Lançamentos
                </button>
              </div>

              {/* Main Search Object */}
              <div className={`bg-white p-2 shadow-2xl border-4 border-white/20 relative z-10 ${searchPurpose === 'buy' ? 'rounded-b-2xl rounded-tr-2xl rounded-tl-none' : 'rounded-2xl'}`}>
                <div className="flex flex-col md:flex-row gap-2">
                  <div className="flex-1 px-4 py-2 border-b md:border-b-0 md:border-r border-gray-100">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1"><Map size={12}/> Onde você quer morar?</label>
                    <input 
                      type="text" 
                      placeholder="Bairro ou Cidade" 
                      className="w-full bg-transparent border-none outline-none text-gray-900 font-semibold placeholder-gray-400 text-base"
                    />
                  </div>
                  <div className="flex-1 px-4 py-2 border-b md:border-b-0 md:border-r border-gray-100">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1"><HomeIcon size={12}/> Tipo de Imóvel</label>
                    <select className="w-full bg-transparent border-none outline-none text-gray-900 font-semibold cursor-pointer text-base bg-white">
                      <option>Todos os tipos</option>
                      <option>Apartamento</option>
                      <option>Casa</option>
                      <option>Terreno</option>
                      <option>Comercial</option>
                    </select>
                  </div>
                  <button className="bg-brand-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-700 transition-all flex items-center justify-center gap-2 min-w-[140px] shadow-lg">
                    <Search size={20} /> Buscar
                  </button>
                </div>
              </div>
            </div>
            
            {/* Quick Links */}
            <div className="mt-8 flex flex-wrap gap-6 justify-center md:justify-start text-white/90 text-sm font-medium">
              <span className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer"><Star size={16} className="text-yellow-400 fill-yellow-400" /> Plantão de Vendas</span>
              <span className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer"><Key size={16} className="text-brand-300" /> Aluguel sem fiador</span>
              <span className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer"><HomeIcon size={16} className="text-brand-300" /> Financiamento facilitado</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <div className="bg-white py-12 border-b border-gray-100 relative z-20 -mt-8 mx-4 md:mx-12 rounded-2xl shadow-xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-100">
          <div>
            <p className="text-3xl md:text-4xl font-serif font-bold text-brand-900 mb-1">15+</p>
            <p className="text-gray-500 text-xs uppercase tracking-wider font-bold">Anos de Mercado</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-serif font-bold text-brand-900 mb-1">5.000+</p>
            <p className="text-gray-500 text-xs uppercase tracking-wider font-bold">Imóveis Vendidos</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-serif font-bold text-brand-900 mb-1">10k+</p>
            <p className="text-gray-500 text-xs uppercase tracking-wider font-bold">Clientes Felizes</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-serif font-bold text-brand-900 mb-1">Top 3</p>
            <p className="text-gray-500 text-xs uppercase tracking-wider font-bold">Imobiliária da Região</p>
          </div>
        </div>
      </div>
      
      {/* Featured Collection (Carousel) */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <span className="text-brand-600 font-bold tracking-widest text-xs uppercase bg-white border border-brand-100 px-3 py-1 rounded-full mb-4 inline-block shadow-sm">Oportunidades</span>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mt-2 leading-tight">Destaques da Semana</h2>
              <p className="text-gray-500 mt-4 text-lg font-light">Imóveis selecionados com o melhor custo-benefício do mercado.</p>
            </div>
            
            {/* Featured Navigation */}
            <div className="flex items-center gap-4">
              <div className="flex gap-4">
                  <button 
                    onClick={() => scrollCarousel(featuredCarouselRef, 'left')}
                    className="w-12 h-12 rounded-full border border-gray-300 bg-white hover:bg-gray-50 hover:shadow-lg text-gray-600 flex items-center justify-center transition-all"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    onClick={() => scrollCarousel(featuredCarouselRef, 'right')}
                    className="w-12 h-12 rounded-full bg-brand-900 text-white flex items-center justify-center hover:bg-brand-800 transition-all shadow-lg shadow-brand-900/20"
                  >
                    <ChevronRight size={24} />
                  </button>
              </div>
              <Link to="/properties" className="hidden md:flex group items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-full text-gray-900 font-bold hover:border-brand-600 hover:text-brand-600 transition-all shadow-sm">
                Ver todos <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          {/* Featured Carousel */}
          <div 
            ref={featuredCarouselRef}
            className="flex overflow-x-auto gap-6 pb-12 hide-scrollbar snap-x snap-mandatory"
            style={{ scrollBehavior: 'smooth' }}
          >
            {featuredProperties.map((property) => (
              <Link 
                to={`/properties/${property.id}`} 
                key={property.id} 
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-brand-200 transition-all flex flex-col min-w-[280px] w-[280px] h-[420px] snap-center shadow-sm hover:shadow-2xl hover:-translate-y-1"
              >
                {/* Image Section */}
                <div className="relative h-48 w-full flex-shrink-0">
                  <img 
                    src={property.images[0]} 
                    alt={property.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-brand-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm">
                      Destaque
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5 flex flex-col flex-1 justify-between">
                   <div>
                      <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">{property.type}</span>
                          <div className="flex items-center gap-1 text-[10px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
                            <MapPin size={10} /> {property.city}
                          </div>
                      </div>

                      <h3 className="text-lg font-serif font-bold text-gray-900 mb-1 group-hover:text-brand-600 transition-colors leading-tight line-clamp-2">
                        {property.title}
                      </h3>
                      <p className="text-gray-500 text-xs mb-4 line-clamp-2">
                        {property.description}
                      </p>
                   </div>
                   
                   <div>
                     {/* Features Mini */}
                     <div className="flex gap-3 text-gray-400 text-xs mb-4 border-t border-gray-50 pt-3">
                        <span className="flex items-center gap-1"><Maximize size={12}/> {property.area}m²</span>
                        <span className="flex items-center gap-1"><Key size={12}/> {property.bedrooms}q</span>
                     </div>

                     <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-brand-900">
                          {property.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-all">
                           <ArrowRight size={14} />
                        </div>
                     </div>
                   </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Lançamentos Section (Dark Mode Carousel) */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 p-32 bg-brand-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
         <div className="absolute bottom-0 left-0 p-32 bg-brand-900/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
         
         <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
               <div className="max-w-xl">
                  <span className="text-amber-400 font-bold tracking-widest text-xs uppercase mb-2 block flex items-center gap-2">
                     <HardHat size={14} /> Em Obras & Lançamentos
                  </span>
                  <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">Breve Lançamento</h2>
                  <p className="text-gray-400 text-lg font-light">Invista na planta com facilidade. Condições exclusivas de parcelamento direto com a construtora.</p>
               </div>
               
               {/* Launch Carousel Navigation */}
               <div className="flex gap-4">
                  <button 
                    onClick={() => scrollCarousel(launchCarouselRef, 'left')}
                    className="w-12 h-12 rounded-full border border-gray-600 hover:bg-gray-800 hover:border-amber-500 text-white flex items-center justify-center transition-all"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    onClick={() => scrollCarousel(launchCarouselRef, 'right')}
                    className="w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-600 text-gray-900 flex items-center justify-center transition-all shadow-lg shadow-amber-500/20"
                  >
                    <ChevronRight size={24} />
                  </button>
               </div>
            </div>

            {/* Launch Carousel Container */}
            <div 
              ref={launchCarouselRef}
              className="flex overflow-x-auto gap-6 pb-8 hide-scrollbar snap-x snap-mandatory"
              style={{ scrollBehavior: 'smooth' }}
            >
               {launchProperties.map(launch => (
                  <Link 
                    to={`/properties/${launch.id}`} 
                    key={launch.id} 
                    className="group bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-amber-500/50 transition-all flex flex-col min-w-[280px] w-[280px] h-[420px] snap-center shadow-lg hover:shadow-2xl"
                  >
                     <div className="relative h-48 w-full flex-shrink-0">
                        <img src={launch.images[0]} alt={launch.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                        <div className="absolute top-3 left-3">
                           <span className="bg-amber-500 text-gray-900 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Lançamento</span>
                        </div>
                     </div>
                     <div className="p-5 flex flex-col flex-1 justify-between">
                        <div>
                            <h3 className="text-lg font-serif font-bold text-white mb-1 group-hover:text-amber-400 transition-colors leading-tight line-clamp-2">{launch.title}</h3>
                            <p className="text-gray-400 text-xs mb-4 line-clamp-2">{launch.description}</p>
                        </div>
                        
                        <div>
                            {launch.launchDetails && (
                            <div className="space-y-3 mb-4">
                                <div>
                                    <div className="flex justify-between text-[10px] text-gray-500 mb-1 uppercase tracking-wider font-bold">
                                        <span>Obras</span>
                                        <span>{launch.launchDetails.constructionProgress}%</span>
                                    </div>
                                    <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-amber-500" style={{ width: `${launch.launchDetails.constructionProgress}%` }}></div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                                    <Calendar size={12} className="text-amber-500" />
                                    Entrega: <span className="font-bold text-gray-300">{launch.launchDetails.deliveryDate}</span>
                                </div>
                            </div>
                            )}
                            
                            <div className="pt-4 border-t border-gray-700 flex justify-between items-center">
                            <span className="text-sm font-bold text-white">{launch.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-gray-900 transition-all">
                                <ArrowRight size={14} />
                            </div>
                            </div>
                        </div>
                     </div>
                  </Link>
               ))}
               
               {/* Call to Action Card in Carousel */}
               <div className="min-w-[280px] w-[280px] h-[420px] bg-gradient-to-br from-brand-900 to-gray-800 rounded-2xl p-6 border border-gray-700 flex flex-col justify-center items-center text-center relative overflow-hidden group shadow-xl snap-center">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                  <HardHat size={32} className="text-gray-500 mb-4 group-hover:text-amber-400 transition-colors" />
                  <h3 className="text-lg font-bold text-white mb-2">Quer saber antes?</h3>
                  <p className="text-gray-400 text-sm mb-6">Entre na lista VIP e receba tabelas de pré-lançamento.</p>
                  <button className="w-full bg-gray-700 border border-gray-600 hover:bg-gray-600 text-white text-sm py-2.5 rounded-lg font-bold transition-all">
                     Cadastrar Interesse
                  </button>
               </div>
            </div>
         </div>
      </section>

      {/* Prontos para Morar Section (New Carousel - Light Theme) */}
      <section className="py-24 bg-brand-50 relative overflow-hidden">
         <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
               <div className="max-w-xl">
                  <span className="text-brand-600 font-bold tracking-widest text-xs uppercase mb-2 block flex items-center gap-2">
                     <Key size={14} /> Chaves na Mão
                  </span>
                  <h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 mb-6">Prontos para Morar</h2>
                  <p className="text-gray-500 text-lg font-light">Não quer esperar? Confira nossa seleção de imóveis prontos, novos e seminovos.</p>
               </div>
               
               {/* Ready Carousel Navigation */}
               <div className="flex gap-4">
                  <button 
                    onClick={() => scrollCarousel(readyCarouselRef, 'left')}
                    className="w-12 h-12 rounded-full border border-gray-300 bg-white hover:bg-white hover:shadow-lg text-gray-600 flex items-center justify-center transition-all"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    onClick={() => scrollCarousel(readyCarouselRef, 'right')}
                    className="w-12 h-12 rounded-full bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center transition-all shadow-lg shadow-brand-500/20"
                  >
                    <ChevronRight size={24} />
                  </button>
               </div>
            </div>

            {/* Ready Carousel Container */}
            <div 
              ref={readyCarouselRef}
              className="flex overflow-x-auto gap-6 pb-8 hide-scrollbar snap-x snap-mandatory"
              style={{ scrollBehavior: 'smooth' }}
            >
               {readyProperties.map(property => (
                  <Link 
                    to={`/properties/${property.id}`} 
                    key={property.id} 
                    className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-brand-400 transition-all flex flex-col min-w-[280px] w-[280px] h-[420px] snap-center shadow-md hover:shadow-xl hover:-translate-y-1"
                  >
                     <div className="relative h-48 w-full flex-shrink-0">
                        <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute top-3 left-3">
                           <span className="bg-white text-brand-900 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm border border-gray-100">Pronto</span>
                        </div>
                     </div>
                     <div className="p-5 flex flex-col flex-1 justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{property.type}</span>
                                <div className="flex items-center gap-1 text-[10px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                                    <MapPin size={10} /> {property.city}
                                </div>
                            </div>
                            <h3 className="text-lg font-serif font-bold text-gray-900 mb-1 group-hover:text-brand-600 transition-colors leading-tight line-clamp-2">{property.title}</h3>
                            <p className="text-gray-500 text-xs mb-4 line-clamp-2">{property.description}</p>
                        </div>
                        
                        <div className="mt-auto">
                            <div className="flex gap-3 text-gray-400 text-xs mb-4 border-t border-gray-100 pt-3">
                                <span className="flex items-center gap-1"><Bed size={12}/> {property.bedrooms}</span>
                                <span className="flex items-center gap-1"><Bath size={12}/> {property.bathrooms}</span>
                                <span className="flex items-center gap-1"><Maximize size={12}/> {property.area}m²</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-brand-900">{property.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-all">
                                    <ArrowRight size={14} />
                                </div>
                            </div>
                        </div>
                     </div>
                  </Link>
               ))}
               
               {/* Call to Action Card in Carousel */}
               <div className="min-w-[280px] w-[280px] h-[420px] bg-white rounded-2xl p-6 border-2 border-dashed border-gray-300 flex flex-col justify-center items-center text-center group hover:border-brand-400 transition-all snap-center">
                  <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center text-brand-600 mb-4 group-hover:scale-110 transition-transform">
                      <Search size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Não encontrou?</h3>
                  <p className="text-gray-500 text-sm mb-6">Temos mais opções exclusivas fora do site.</p>
                  <Link to="/properties" className="w-full bg-white border border-gray-300 hover:border-brand-600 hover:text-brand-600 text-gray-600 text-sm py-2.5 rounded-lg font-bold transition-all">
                     Ver Estoque Completo
                  </Link>
               </div>
            </div>
         </div>
      </section>

      {/* Lifestyle Section (Functional Filters) */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
             <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">Busque pelo seu Momento</h2>
             <p className="text-gray-500 text-lg">Entendemos que cada fase da vida pede um lar diferente.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {lifestyles.map((style, idx) => (
              <Link to={`/properties?type=${style.type}`} key={idx} className="relative h-80 rounded-3xl overflow-hidden group cursor-pointer shadow-lg block">
                <img src={style.image} alt={style.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/90 group-hover:to-brand-900/90 transition-colors"></div>
                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <h3 className="text-xl font-serif font-bold text-white mb-1">{style.title}</h3>
                  <div className="flex items-center justify-between text-gray-300 text-sm">
                    <span>{style.count} opções</span>
                    <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-brand-600 font-bold tracking-widest text-xs uppercase mb-2 block">Soluções Completas</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">Muito além da venda</h2>
            <p className="text-gray-500 text-lg">Oferecemos suporte completo para garantir a segurança e o sucesso do seu negócio imobiliário.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Service 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all text-center group">
              <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Scale size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Assessoria Jurídica</h3>
              <p className="text-gray-500 leading-relaxed">
                Análise documental completa e suporte contratual para garantir que sua transação seja 100% segura e transparente.
              </p>
            </div>

            {/* Service 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all text-center group">
              <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <ClipboardCheck size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Avaliação de Imóveis</h3>
              <p className="text-gray-500 leading-relaxed">
                Laudos precisos baseados em dados de mercado para você vender ou alugar pelo preço justo e no menor tempo.
              </p>
            </div>

            {/* Service 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all text-center group">
              <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <HandCoins size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Financiamento</h3>
              <p className="text-gray-500 leading-relaxed">
                Parceria com os principais bancos. Cuidamos de toda a aprovação de crédito para você focar no que importa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Campaign Banner - Dynamic Layout */}
      {activeCampaigns.length > 0 && (
        <section className="py-24 container mx-auto px-4">
          <div className={`grid gap-8 ${!isSingleCampaign ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
            {activeCampaigns.map((campaign) => (
              <div key={campaign.id} className={`relative overflow-hidden bg-gray-900 text-white shadow-2xl ${isSingleCampaign ? 'rounded-[3rem]' : 'rounded-[2rem] h-full flex flex-col justify-end group'}`}>
                 
                 {/* Background Image */}
                 <div className="absolute inset-0">
                   <img 
                      src={campaign.image} 
                      alt="Campaign" 
                      className={`w-full h-full object-cover mix-blend-overlay transition-transform duration-700 ${isSingleCampaign ? 'opacity-30' : 'opacity-40 group-hover:scale-105'}`} 
                   />
                 </div>

                 {/* Content Wrapper */}
                 <div className={`relative z-10 ${isSingleCampaign ? 'p-10 md:p-24 flex flex-col md:flex-row items-center justify-between gap-16' : 'p-8 md:p-12 h-full flex flex-col justify-end'}`}>
                   
                   <div className={isSingleCampaign ? 'max-w-2xl' : ''}>
                     <span className="text-amber-400 font-bold tracking-widest uppercase text-sm mb-4 block">Oportunidade</span>
                     <h2 className={`${isSingleCampaign ? 'text-4xl md:text-6xl' : 'text-3xl md:text-4xl'} font-serif font-bold mb-6 leading-none`}>
                        {campaign.title}
                     </h2>
                     <p className={`${isSingleCampaign ? 'text-xl mb-10' : 'text-base mb-8 line-clamp-3'} text-gray-200 font-light`}>
                        {campaign.description}
                     </p>
                     
                     <div className="flex gap-4">
                       <Link 
                        to={`/properties?campaignId=${campaign.id}`}
                        className="bg-white text-brand-900 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-xl shadow-white/10 flex items-center gap-2 text-sm"
                       >
                         Ver Ofertas <ArrowRight size={16} />
                       </Link>
                     </div>
                   </div>

                   {/* Discount Bubble (Conditional Layout) */}
                   {campaign.discountPercentage && (
                     <div className={isSingleCampaign ? 'hidden md:block' : 'absolute top-8 right-8'}>
                       <div className={`${isSingleCampaign ? 'w-48 h-48 border-2 bg-amber-400/10' : 'w-24 h-24 bg-white/10 border'} rounded-full border-amber-400/50 flex items-center justify-center backdrop-blur-md`}>
                         <div className="text-center">
                           <span className={`block font-bold text-amber-400 mb-0 leading-none ${isSingleCampaign ? 'text-5xl' : 'text-2xl'}`}>
                              -{campaign.discountPercentage}%
                           </span>
                           <span className={`text-amber-200 uppercase tracking-widest font-bold ${isSingleCampaign ? 'text-sm' : 'text-[10px]'}`}>OFF</span>
                         </div>
                       </div>
                     </div>
                   )}
                 </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="pb-24 pt-0 bg-gray-50">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-8">Vamos conversar?</h2>
          <p className="text-gray-600 mb-12 text-xl font-light">
             Nossa equipe está pronta para te atender, seja para comprar, vender ou alugar. Sem burocracia e com total transparência.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a 
              href={`https://wa.me/${APP_CONFIG.whatsapp}`} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-center gap-3 bg-green-600 text-white px-10 py-5 rounded-xl font-bold hover:bg-green-700 transition-all shadow-xl shadow-green-600/30 transform hover:-translate-y-1"
            >
              <Phone size={22} /> Chamar no WhatsApp
            </a>
            <Link to="/contact" className="flex items-center justify-center gap-3 bg-white text-gray-900 border border-gray-200 px-10 py-5 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm hover:shadow-md">
              Agendar Visita
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;