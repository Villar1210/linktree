import React from 'react';
import { Save, Globe, Phone, Mail, MapPin } from 'lucide-react';
import { APP_CONFIG } from '../../constants';

const AdminSettings: React.FC = () => {
  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-serif font-bold text-gray-900">Configurações Gerais</h2>
        <p className="text-gray-500">Gerencie as informações principais do site e contatos.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8 space-y-8">
          
          {/* Company Info */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b">Identidade Visual & Empresa</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Imobiliária</label>
                <input type="text" defaultValue={APP_CONFIG.companyName} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slogan</label>
                <input type="text" defaultValue="Excelência em Alto Padrão" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" />
              </div>
            </div>
          </section>

          {/* Contact Info */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b">Canais de Contato</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone size={20} />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">WhatsApp Principal</label>
                  <input type="text" defaultValue={APP_CONFIG.whatsapp} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail size={20} />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">E-mail de Contato</label>
                  <input type="email" defaultValue={APP_CONFIG.email} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-50 text-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin size={20} />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Endereço Físico</label>
                  <input type="text" defaultValue={APP_CONFIG.address} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
            </div>
          </section>

          {/* Social Media */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b">Redes Sociais</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"><Globe size={14} /> Instagram</label>
                  <input type="text" defaultValue={APP_CONFIG.social.instagram} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
               </div>
               <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"><Globe size={14} /> Facebook</label>
                  <input type="text" defaultValue={APP_CONFIG.social.facebook} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
               </div>
               <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"><Globe size={14} /> LinkedIn</label>
                  <input type="text" defaultValue={APP_CONFIG.social.linkedin} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
               </div>
            </div>
          </section>

        </div>
        
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex justify-end">
          <button className="bg-brand-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-700 shadow-md flex items-center gap-2">
            <Save size={18} /> Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;