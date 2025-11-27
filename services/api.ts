import { MOCK_PROPERTIES, MOCK_LEADS, MOCK_CAMPAIGNS, MOCK_JOBS, MOCK_USERS, MOCK_DASHBOARD_DATA } from '../constants';
import { Lead, LeadStatus, Property, Job, Campaign, User } from '../types';

// Utility to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<User> => {
      await delay(800);
      
      // Simulação de login baseada no email
      let user: User;
      
      if (email.includes('admin')) {
        user = MOCK_USERS.find(u => u.role === 'admin') || MOCK_USERS[0];
      } else if (email.includes('eduardo') || email.includes('camila') || email.includes('agent')) {
        user = MOCK_USERS.find(u => u.role === 'agent') || MOCK_USERS[1];
      } else {
        user = MOCK_USERS.find(u => u.role === 'buyer') || MOCK_USERS[3];
      }

      // Persist user session simulation
      localStorage.setItem('novamorada_user', JSON.stringify(user));
      return user;
    },
    logout: () => {
      localStorage.removeItem('novamorada_user');
    },
    getCurrentUser: (): User | null => {
      const stored = localStorage.getItem('novamorada_user');
      return stored ? JSON.parse(stored) : null;
    },
    register: async (data: any) => {
      await delay(800);
      return { id: 'u5', ...data, role: 'buyer' };
    }
  },
  users: {
    getAll: async () => {
      await delay(500);
      return MOCK_USERS;
    },
    delete: async (id: string) => {
      await delay(500);
      console.log('User deleted:', id);
      return true;
    }
  },
  user: {
    getFavorites: async (userId: string) => {
       await delay(500);
       // Retorna os 2 primeiros imóveis como favoritos simulados
       return MOCK_PROPERTIES.slice(0, 2); 
    }
  },
  dashboard: {
    getStats: async () => {
      await delay(500);
      return MOCK_DASHBOARD_DATA;
    }
  },
  properties: {
    getAll: async () => {
      await delay(600);
      return MOCK_PROPERTIES;
    },
    getById: async (id: string) => {
      await delay(400);
      return MOCK_PROPERTIES.find(p => p.id === id);
    },
    create: async (data: any) => {
      console.log('Criando imóvel:', data);
      await delay(1000);
      return true;
    }
  },
  leads: {
    getAll: async () => {
      await delay(500);
      return MOCK_LEADS;
    },
    create: async (lead: Partial<Lead>) => {
      console.log('Novo lead:', lead);
      await delay(500);
      return true;
    },
    updateStatus: async (id: string, status: LeadStatus) => {
      console.log(`Updated lead ${id} to ${status}`);
      return true;
    }
  },
  campaigns: {
    getAll: async () => {
      await delay(300);
      return MOCK_CAMPAIGNS;
    },
  },
  jobs: {
    getAll: async () => {
      await delay(300);
      return MOCK_JOBS;
    },
    apply: async (jobId: string, candidate: any) => {
      console.log('Aplicando para vaga:', jobId, candidate);
      await delay(1000);
      return true;
    }
  }
};