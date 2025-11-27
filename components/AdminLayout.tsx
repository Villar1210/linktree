import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building, Users, Megaphone, Settings, LogOut, Briefcase, Shield, BarChart2, MessageCircle, Calendar } from 'lucide-react';
import { APP_CONFIG } from '../constants';
import { api } from '../services/api';
import { User } from '../types';

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = api.auth.getCurrentUser();
    if (!currentUser) {
      navigate('/buyer/login');
      return;
    }
    // Security check: Only admin or agent can access this layout
    if (currentUser.role === 'buyer') {
      navigate('/buyer/dashboard');
      return;
    }
    setUser(currentUser);
  }, [navigate]);

  const handleLogout = () => {
    api.auth.logout();
    navigate('/');
  };

  const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
    const active = location.pathname === to;
    return (
      <Link 
        to={to} 
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
          active 
            ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' 
            : 'text-gray-500 hover:bg-gray-100 hover:text-brand-600'
        }`}
      >
        <Icon size={20} />
        <span className="font-medium text-sm">{label}</span>
      </Link>
    );
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r hidden md:flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-serif font-bold text-brand-900">{APP_CONFIG.companyName}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
              {user.role === 'admin' ? 'Administrador' : 'Corretor'}
            </span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Geral</div>
          <NavItem to="/admin" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/admin/calendar" icon={Calendar} label="Agenda" />
          <NavItem to="/admin/properties" icon={Building} label="Imóveis" />
          <NavItem to="/admin/crm" icon={Users} label="CRM & Leads" />
          
          <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider mt-4">Comunicação</div>
          <NavItem to="/admin/whatsapp" icon={MessageCircle} label="WhatsApp Station" />
          <NavItem to="/admin/marketing" icon={BarChart2} label="Marketing Digital" />
          <NavItem to="/admin/campaigns" icon={Megaphone} label="Campanhas" />
          
          {/* Admin Only Section */}
          {user.role === 'admin' && (
            <>
              <div className="mt-6 px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Gestão</div>
              <NavItem to="/admin/users" icon={Shield} label="Usuários & Acesso" />
              <NavItem to="/admin/jobs" icon={Briefcase} label="Vagas & RH" />
              <NavItem to="/admin/settings" icon={Settings} label="Configurações" />
            </>
          )}
        </nav>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <img src={user.avatar} alt="" className="w-8 h-8 rounded-full border border-gray-200" />
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut size={18} />
            <span className="font-medium text-sm">Sair do Sistema</span>
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 md:hidden">
          <span className="font-bold text-lg">Menu Admin</span>
          {/* Mobile toggle would go here */}
        </header>
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;