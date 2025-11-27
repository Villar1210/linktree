
// Enums mirroring database constraints
export enum PropertyType {
  APARTMENT = 'Apartamento',
  HOUSE = 'Casa',
  COMMERCIAL = 'Comercial',
  LAND = 'Terreno',
  LAUNCH = 'Lançamento'
}

export enum LeadStatus {
  NEW = 'Novo',
  TRIAGE = 'Em Triagem',
  QUALIFIED = 'Qualificado',
  VISIT_SCHEDULED = 'Visita',
  PROPOSAL = 'Proposta',
  NEGOTIATION = 'Negociação',
  CLOSED = 'Vendido',
  DISQUALIFIED = 'Não Qualificado', // Status para descarte (sem perfil, contato errado)
  LOST = 'Arquivado'
}

// Data Models
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'buyer' | 'agent';
  team?: 'Vendas' | 'Locação' | 'Lançamentos'; // Novo: Times
  avatar?: string;
  phone?: string;
  favorites?: string[]; // IDs of favorited properties
}

export interface LaunchDetails {
  deliveryDate: string;
  constructionProgress: number; // 0 to 100
  stage: 'Fundação' | 'Estrutura' | 'Alvenaria' | 'Acabamento';
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  suites: number;
  area: number;
  address: string;
  city: string;
  state: string;
  images: string[];
  featured: boolean;
  status: 'active' | 'sold' | 'rented';
  features: string[];
  launchDetails?: LaunchDetails; // Optional, only for launches
  campaignIds?: string[]; // IDs of campaigns this property belongs to
}

export type ActivityType = 'call' | 'meeting' | 'email' | 'visit' | 'whatsapp' | 'lunch' | 'proposal' | 'system_log';

export interface Task {
  id: string;
  title: string;
  dueDate: string; // ISO Date YYYY-MM-DD
  dueTime?: string; // HH:MM
  completed: boolean;
  type: ActivityType;
  notes?: string;
  createdAt: string;
}

export interface LeadDocument {
  id: string;
  name: string;
  url: string;
  type: 'pdf' | 'image' | 'doc';
  uploadedAt: string;
}

export interface LeadEnrichedData {
  jobTitle?: string;
  company?: string;
  linkedin?: string;
  instagram?: string;
  estimatedIncome?: string;
  location?: string;
}

// RD Station Style Profile Data
export interface LeadAddress {
  zipCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

export interface LeadPreferences {
  propertyType?: string[];
  minBedrooms?: number;
  minArea?: number;
  maxBudget?: number;
  purpose?: 'live' | 'invest';
  financing?: boolean;
  parkingSpots?: number;
}

export interface LeadProfile {
  cpf?: string;
  rg?: string;
  birthDate?: string;
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  occupation?: string;
  nationality?: string;
  children?: number;
  pets?: boolean;
  income?: number;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: LeadStatus;
  interest: string;
  notes: string[]; // Legacy simple notes
  tasks: Task[]; // New: Task Management (Activities)
  tags: string[]; // New: Segmentation Tags
  createdAt: string;
  source: 'site' | 'whatsapp' | 'instagram' | 'facebook' | 'indication' | 'portal';
  value?: number;
  
  // CRM Intelligence
  temperature?: 'hot' | 'warm' | 'cold'; // hot=compra em 30d, warm=90d, cold=curioso
  lastInteraction?: string; // ISO date
  probability?: number; // 0-100%
  assignedTo?: string; // agent id (User ID)
  lostReason?: string; // Motivo da perda (se status for LOST ou DISQUALIFIED)
  
  // Enterprise Features
  score?: number; // 0-100 Lead Scoring
  documents?: LeadDocument[]; // GED
  enrichedData?: LeadEnrichedData; // Data Enrichment
  scriptData?: Record<string, boolean>; // Persistência do roteiro de perguntas (Question Text -> Checked)
  
  // Detailed Registration (Cadastro Completo)
  profile?: LeadProfile;
  address?: LeadAddress;
  preferences?: LeadPreferences;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  discountPercentage?: number;
  validUntil: string;
  active: boolean;
  image: string;
  ctaLink: string;
}

export interface Job {
  id: string;
  title: string;
  type: 'CLT' | 'PJ' | 'Estágio';
  description: string;
  department: string;
  requirements: string[];
  benefits: string[];
  location: string;
  active: boolean;
}

// --- MARKETING & SOCIAL MEDIA ---

export interface SocialPost {
  id: string;
  content: string;
  image?: string;
  platforms: ('instagram' | 'facebook' | 'linkedin')[];
  scheduledDate: string; // ISO
  status: 'published' | 'scheduled' | 'draft';
  likes?: number;
  comments?: number;
}

export interface AdCampaign {
  id: string;
  name: string;
  platform: 'meta' | 'google';
  status: 'active' | 'paused' | 'ended';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  leads: number;
  propertyId?: string; // Linked property
  thumbnail: string;
}

// --- WHATSAPP STATION (WaSeller Clone) ---

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'agent' | 'system';
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface ChatConversation {
  id: string;
  leadId: string; // Links to CRM Lead
  leadName: string;
  leadAvatar?: string;
  lastMessage: string;
  unreadCount: number;
  lastActivity: string;
  assignedTo?: string; // Agent ID
  tags: string[];
  messages: ChatMessage[];
  status: 'open' | 'waiting' | 'closed';
}
