import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, MessageCircle, Briefcase, Tag, User, ArrowLeft } from 'lucide-react';
import { APP_CONFIG } from '../constants';

const FunnelLinkTree: React.FC = () => {
  const links = [
    { 
      title: "Falar com Consultor", 
      subtitle: "Atendimento imediato via WhatsApp", 
      icon: MessageCircle, 
      color: "bg-green-500",
      to: `https://wa.me/${APP_CONFIG.whatsapp}`
    },
    { 
      title: "Ver Imóveis", 
      subtitle: "Encontre sua casa nova", 
      icon: Building2, 
      color: "bg-brand-600",
      to: "/properties" 
    },
    { 
      title: "Campanhas & Ofertas", 
      subtitle: "Oportunidades exclusivas", 
      icon: Tag, 
      color: "bg-amber-500",
      to: "/campaigns" 
    },
    { 
      title: "Área do Cliente", 
      subtitle: "Acompanhe seus favoritos", 
      icon: User, 
      color: "bg-purple-600",
      to: "/buyer/login" 
    },
    { 
      title: "Trabalhe Conosco", 
      subtitle: "Vagas disponíveis", 
      icon: Briefcase, 
      color: "bg-gray-700",
      to: "/jobs" 
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 relative">
        {/* Background Blur */}
        <div className="absolute top-0 left-0 w-full h-64 bg-brand-900 rounded-b-[50px] z-0"></div>

        <div className="relative z-10 w-full max-w-md">
            <div className="text-center mb-8">
                <div className="inline-block p-4 bg-white rounded-2xl shadow-xl mb-4">
                    <Building2 className="w-10 h-10 text-brand-900" />
                </div>
                <h1 className="text-2xl font-serif font-bold text-white">{APP_CONFIG.companyName}</h1>
                <p className="text-brand-200 text-sm">Central de Relacionamento</p>
            </div>

            <div className="space-y-4">
                {links.map((link, idx) => (
                    link.to.startsWith('http') ? (
                         <a 
                            key={idx}
                            href={link.to} 
                            target="_blank" 
                            rel="noreferrer"
                            className="bg-white hover:bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-md group"
                        >
                            <div className={`${link.color} text-white p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                                <link.icon size={20} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900">{link.title}</h3>
                                <p className="text-xs text-gray-500">{link.subtitle}</p>
                            </div>
                        </a>
                    ) : (
                        <Link 
                            key={idx}
                            to={link.to} 
                            className="bg-white hover:bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-md group"
                        >
                            <div className={`${link.color} text-white p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                                <link.icon size={20} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900">{link.title}</h3>
                                <p className="text-xs text-gray-500">{link.subtitle}</p>
                            </div>
                        </Link>
                    )
                ))}
            </div>

            <div className="mt-8 text-center">
                <Link to="/" className="text-gray-500 hover:text-brand-600 text-sm font-medium flex items-center justify-center gap-2">
                    <ArrowLeft size={16} /> Voltar para o Site
                </Link>
            </div>
        </div>
    </div>
  );
};

export default FunnelLinkTree;