
import { Property, PropertyType, Lead, LeadStatus, Campaign, Job, User, SocialPost, AdCampaign, ChatConversation } from './types';

// Mock Properties
export const MOCK_PROPERTIES: Property[] = [
  // --- DESTAQUES & LUXO ---
  {
    id: '1',
    title: 'Residencial Vista do Parque',
    description: 'Apartamento aconchegante ideal para famílias. Próximo a escolas e supermercados, com ampla área de lazer e baixo condomínio.',
    price: 450000,
    type: PropertyType.APARTMENT,
    bedrooms: 3,
    bathrooms: 2,
    suites: 1,
    area: 88,
    address: 'Rua das Flores, 123',
    city: 'São Paulo',
    state: 'SP',
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1484154218962-a1c002085d2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
    ],
    featured: true,
    status: 'active',
    features: ['Salão de Festas', 'Playground', 'Portaria 24h', 'Varanda Grill'],
    campaignIds: ['c1']
  },
  {
    id: '2',
    title: 'Casa Jardim Botânico',
    description: 'Sobrado em bairro tranquilo. Quintal espaçoso, churrasqueira e ótima iluminação natural. Perfeito para quem busca sossego.',
    price: 850000,
    type: PropertyType.HOUSE,
    bedrooms: 3,
    bathrooms: 3,
    suites: 1,
    area: 180,
    address: 'Rua do Bosque, 45',
    city: 'Curitiba',
    state: 'PR',
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1598228723793-52759bba239c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
    ],
    featured: true,
    status: 'active',
    features: ['Quintal', 'Churrasqueira', 'Garagem Coberta', 'Ar Condicionado']
  },
  {
    id: '10',
    title: 'Cobertura Diamond Hill',
    description: 'A definição de exclusividade. Cobertura duplex com design de interiores assinado, terraço gourmet e jacuzzi com vista para o skyline.',
    price: 3100000,
    type: PropertyType.APARTMENT,
    bedrooms: 3,
    bathrooms: 4,
    suites: 3,
    area: 210,
    address: 'Al. Lorena, 800',
    city: 'São Paulo',
    state: 'SP',
    images: [
      'https://images.unsplash.com/photo-1502005229766-3c8ef95a5d78?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
    ],
    featured: true,
    status: 'active',
    features: ['Jacuzzi Privativa', 'Pé direito duplo', 'Portaria Blindada', 'Automação de Luzes']
  },
  {
    id: '3',
    title: 'Studio Smart Centro',
    description: 'Compacto, funcional e moderno. Ideal para investimento ou primeira moradia. Ao lado do metrô e universidades.',
    price: 280000,
    type: PropertyType.APARTMENT,
    bedrooms: 1,
    bathrooms: 1,
    suites: 0,
    area: 32,
    address: 'Av. Ipiranga, 200',
    city: 'São Paulo',
    state: 'SP',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
    ],
    featured: false,
    status: 'active',
    features: ['Coworking', 'Lavanderia Coletiva', 'Academia', 'Bicicletário'],
    campaignIds: ['c1']
  },
  
  // --- NOVOS IMÓVEIS ---
  {
    id: '11',
    title: 'Casa de Vila Reformada',
    description: 'Charme e segurança em vila fechada no coração de Pinheiros. Totalmente reformada, pronta para morar.',
    price: 1250000,
    type: PropertyType.HOUSE,
    bedrooms: 2,
    bathrooms: 2,
    suites: 1,
    area: 110,
    address: 'Rua dos Pinheiros, 100',
    city: 'São Paulo',
    state: 'SP',
    images: [
      'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
    ],
    featured: true,
    status: 'active',
    features: ['Vila Fechada', 'Jardim de Inverno', 'Home Office', 'Cozinha Americana']
  },
  {
    id: '12',
    title: 'Apartamento Familiar Tatuapé',
    description: 'Ótima planta, sala ampliada e varanda envidraçada. Condomínio com lazer completo para crianças.',
    price: 620000,
    type: PropertyType.APARTMENT,
    bedrooms: 3,
    bathrooms: 2,
    suites: 1,
    area: 94,
    address: 'Rua Tuiuti, 500',
    city: 'São Paulo',
    state: 'SP',
    images: [
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
    ],
    featured: false,
    status: 'active',
    features: ['Piscina Aquecida', 'Brinquedoteca', '2 Vagas', 'Depósito'],
    campaignIds: ['c1']
  },
  // --- LANÇAMENTOS ---
  {
    id: '4',
    title: 'Horizon Residence',
    description: 'O futuro chegou. Empreendimento na planta com alto potencial de valorização. Lazer completo.',
    price: 590000,
    type: PropertyType.LAUNCH,
    bedrooms: 2,
    bathrooms: 2,
    suites: 1,
    area: 65,
    address: 'Av. Brasil, 200',
    city: 'Curitiba',
    state: 'PR',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
    ],
    featured: true,
    status: 'active',
    features: ['Piscina', 'Pet Place', 'Mercado Autônomo', 'Rooftop'],
    launchDetails: {
      deliveryDate: 'Dezembro/2026',
      constructionProgress: 35,
      stage: 'Estrutura'
    },
    campaignIds: ['c2']
  },
  {
    id: 'l2',
    title: 'Viva Vida Club',
    description: 'Condomínio clube completo para sua família. Entrada facilitada e uso do FGTS. Garanta sua unidade.',
    price: 240000,
    type: PropertyType.LAUNCH,
    bedrooms: 2,
    bathrooms: 1,
    suites: 0,
    area: 45,
    address: 'Rua da Alegria, 500',
    city: 'Campinas',
    state: 'SP',
    images: [
      'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
    ],
    featured: true,
    status: 'active',
    features: ['Quadra Poliesportiva', 'Churrasqueiras', 'Playground', 'Segurança 24h'],
    launchDetails: {
      deliveryDate: 'Junho/2025',
      constructionProgress: 70,
      stage: 'Acabamento'
    },
    campaignIds: ['c1']
  },
  {
    id: 'l3',
    title: 'Reserva da Mata',
    description: 'Condomínio fechado de casas com segurança 24h e contato direto com a natureza. O equilíbrio perfeito.',
    price: 890000,
    type: PropertyType.LAUNCH,
    bedrooms: 3,
    bathrooms: 3,
    suites: 1,
    area: 120,
    address: 'Estrada do Vinho, 1500',
    city: 'São Roque',
    state: 'SP',
    images: [
      'https://images.unsplash.com/photo-1600596542815-3ad19fb2a258?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
    ],
    featured: true,
    status: 'active',
    features: ['Lago Privativo', 'Trilha', 'Clube de Campo', 'Horta Comunitária'],
    launchDetails: {
      deliveryDate: 'Outubro/2025',
      constructionProgress: 45,
      stage: 'Alvenaria'
    },
    campaignIds: ['c2']
  },
  {
    id: 'l4',
    title: 'Urban Sky Studios',
    description: 'Studios inteligentes no centro financeiro. Alta rentabilidade para locação short-stay. Gestão completa.',
    price: 350000,
    type: PropertyType.LAUNCH,
    bedrooms: 1,
    bathrooms: 1,
    suites: 0,
    area: 28,
    address: 'Av. Paulista, 2000',
    city: 'São Paulo',
    state: 'SP',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
    ],
    featured: false,
    status: 'active',
    features: ['Lavanderia OMO', 'Coworking', 'Rooftop Bar', 'Academia Panorâmica'],
    launchDetails: {
      deliveryDate: 'Janeiro/2026',
      constructionProgress: 15,
      stage: 'Fundação'
    },
    campaignIds: ['c2']
  },
  {
    id: 'l5',
    title: 'Ocean View Residence',
    description: 'Apartamentos de alto padrão frente mar. Acabamento premium e vista eterna para o oceano.',
    price: 1800000,
    type: PropertyType.LAUNCH,
    bedrooms: 4,
    bathrooms: 4,
    suites: 4,
    area: 240,
    address: 'Av. Atlântica, 100',
    city: 'Balneário Camboriú',
    state: 'SC',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
    ],
    featured: true,
    status: 'active',
    features: ['Heliponto', 'Marina', 'Spa Internacional', 'Cinema'],
    launchDetails: {
      deliveryDate: 'Março/2025',
      constructionProgress: 85,
      stage: 'Acabamento'
    },
    campaignIds: ['c2']
  }
];

// Helper for dates
const getRelativeDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
};

// Mock Leads for CRM with Pipedrive Data
export const MOCK_LEADS: Lead[] = [
  {
    id: 'l1',
    name: 'Roberto Silva',
    email: 'roberto@email.com',
    phone: '11999998888',
    status: LeadStatus.NEW,
    interest: 'Residencial Vista do Parque',
    notes: ['Interessado em usar FGTS', 'Primeiro imóvel'],
    tasks: [
      { id: 't1', title: 'Ligar para qualificar', dueDate: getRelativeDate(-2), completed: false, type: 'call', createdAt: getRelativeDate(-5) }
    ],
    tags: ['FGTS', 'Primeiro Imóvel'],
    createdAt: getRelativeDate(-5),
    source: 'site',
    value: 450000,
    temperature: 'hot',
    probability: 20,
    score: 35,
    assignedTo: 'u2', // Eduardo
    enrichedData: {
        jobTitle: 'Analista de Sistemas',
        company: 'Tech Solutions',
        estimatedIncome: 'R$ 8.000',
        location: 'São Paulo, SP'
    },
    scriptData: {
        "Você procura imóvel para moradia ou investimento?": true,
        "Qual região você tem preferência?": true
    }
  },
  {
    id: 'l2',
    name: 'Ana Souza',
    email: 'ana.medica@email.com',
    phone: '11988887777',
    status: LeadStatus.VISIT_SCHEDULED,
    interest: 'Casa Jardim Botânico',
    notes: ['Visita marcada para Sábado 10h', 'Procura casa com quintal'],
    tasks: [
         { id: 't2', title: 'Confirmar Visita', dueDate: getRelativeDate(0), completed: false, type: 'whatsapp', createdAt: getRelativeDate(-1) }
    ],
    tags: ['Médica', 'Permuta'],
    createdAt: getRelativeDate(-10),
    source: 'whatsapp',
    value: 850000,
    temperature: 'hot',
    probability: 60,
    score: 85,
    assignedTo: 'u2', // Eduardo
    documents: [
        { id: 'd1', name: 'RG_CNH.pdf', url: '#', type: 'pdf', uploadedAt: '2023-10-21' },
        { id: 'd2', name: 'Comprovante_Renda.pdf', url: '#', type: 'pdf', uploadedAt: '2023-10-21' }
    ],
    // RICH DATA FOR ANA SOUZA (RD Station Style)
    profile: {
        cpf: '123.456.789-00',
        birthDate: '1988-05-15',
        maritalStatus: 'married',
        occupation: 'Médica Pediatra',
        children: 2,
        pets: true,
        income: 25000,
        nationality: 'Brasileira'
    },
    address: {
        zipCode: '04500-000',
        street: 'Rua das Acácias',
        number: '120',
        complement: 'Apto 45',
        neighborhood: 'Moema',
        city: 'São Paulo',
        state: 'SP'
    },
    preferences: {
        propertyType: ['Casa', 'Sobrado'],
        minBedrooms: 3,
        minArea: 150,
        maxBudget: 950000,
        purpose: 'live',
        financing: true,
        parkingSpots: 2
    },
    scriptData: {
        "Qual sua renda familiar?": true,
        "Pretende financiar, usar FGTS ou comprar à vista?": true
    }
  },
  {
    id: 'l3',
    name: 'Carlos Mendez',
    email: 'carlos@invest.com',
    phone: '41999990000',
    status: LeadStatus.PROPOSAL,
    interest: 'Horizon Residence',
    notes: ['Investidor', 'Proposta à vista com desconto'],
    tasks: [
      { id: 't3', title: 'Enviar minuta do contrato', dueDate: getRelativeDate(2), completed: false, type: 'email', createdAt: getRelativeDate(-3) }
    ],
    tags: ['Investidor', 'À Vista'],
    createdAt: getRelativeDate(-15),
    source: 'instagram',
    value: 590000,
    temperature: 'warm',
    probability: 80,
    score: 92,
    assignedTo: 'u3' // Camila
  },
  {
    id: 'l4',
    name: 'Mariana Lima',
    email: 'mari@email.com',
    phone: '11977776666',
    status: LeadStatus.NEW,
    interest: 'Viva Vida Club',
    notes: ['Quer saber valor de entrada', 'Contato via formulário'],
    tasks: [], // No Task (YELLOW WARNING)
    tags: [],
    createdAt: getRelativeDate(-1),
    source: 'facebook',
    value: 240000,
    temperature: 'cold',
    probability: 10,
    score: 15,
    assignedTo: 'u2'
  },
  {
    id: 'l5',
    name: 'Pedro Oliveira',
    email: 'pedro@eng.com',
    phone: '11966665555',
    status: LeadStatus.NEGOTIATION,
    interest: 'Cobertura Diamond Hill',
    notes: ['Aprovou financiamento', 'Discutindo valor final'],
    tasks: [
      { id: 't5', title: 'Reunião com diretoria', dueDate: getRelativeDate(1), completed: false, type: 'meeting', createdAt: getRelativeDate(-5) }
    ],
    tags: ['Luxo', 'Financiamento'],
    createdAt: getRelativeDate(-30),
    source: 'indication',
    value: 3100000,
    temperature: 'hot',
    probability: 90,
    score: 95,
    assignedTo: 'u3'
  }
];

// Mock Campaigns
export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'c1',
    title: 'Festival do Primeiro Imóvel',
    description: 'Sua chance de sair do aluguel. Entrada facilitada em até 60x e documentação grátis nos imóveis selecionados.',
    discountPercentage: 5,
    validUntil: '2023-11-30',
    active: true,
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    ctaLink: '/campaigns/primeiro-imovel'
  },
  {
    id: 'c2',
    title: 'Mês do Investidor',
    description: 'Lançamentos com tabela zero e alta rentabilidade projetada.',
    validUntil: '2023-12-15',
    active: true,
    image: 'https://images.unsplash.com/photo-1460472178825-e5240623afd5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    ctaLink: '/campaigns/investidor'
  }
];

export const MOCK_JOBS: Job[] = [
  { 
    id: 'j1', 
    title: 'Corretor de Imóveis', 
    type: 'PJ', 
    description: 'Buscamos profissionais proativos para atuar em vendas e locação.', 
    department: 'Vendas',
    requirements: ['CRECI Ativo ou Estágio', 'Veículo próprio é diferencial', 'Boa comunicação'],
    benefits: ['Comissões atrativas', 'Leads qualificados', 'Treinamento constante'],
    location: 'São Paulo - SP',
    active: true
  },
  { 
    id: 'j2', 
    title: 'Assistente Administrativo', 
    type: 'CLT', 
    description: 'Apoio à equipe de vendas e gestão de contratos.', 
    department: 'Administrativo',
    requirements: ['Ensino Médio Completo', 'Pacote Office', 'Organização'],
    benefits: ['Plano de Saúde', 'Vale Refeição', 'Vale Transporte'],
    location: 'São Paulo - SP',
    active: true
  },
];

// Mock Users for Management
export const MOCK_USERS: User[] = [
  { 
    id: 'u1', 
    name: 'Daniel Villar', 
    email: 'admin@novamorada.com.br', 
    role: 'admin', 
    avatar: 'https://i.pravatar.cc/150?u=admin',
    phone: '(11) 99999-9999',
    team: 'Vendas'
  },
  { 
    id: 'u2', 
    name: 'Eduardo Santos', 
    email: 'eduardo@novamorada.com.br', 
    role: 'agent', 
    avatar: 'https://i.pravatar.cc/150?u=eduardo',
    phone: '(11) 98888-8888',
    team: 'Vendas'
  },
  { 
    id: 'u3', 
    name: 'Camila Torres', 
    email: 'camila@novamorada.com.br', 
    role: 'agent', 
    avatar: 'https://i.pravatar.cc/150?u=camila',
    phone: '(11) 97777-7777',
    team: 'Lançamentos'
  },
  { 
    id: 'u4', 
    name: 'Cliente Vip', 
    email: 'cliente@email.com', 
    role: 'buyer', 
    avatar: 'https://i.pravatar.cc/150?u=buyer',
    favorites: ['1', '2'],
    phone: '(11) 96666-6666'
  }
];

// --- DASHBOARD DATA (Advanced Command Center) ---
export const MOCK_DASHBOARD_DATA = {
  financials: {
    vgv: 12500000, // 12.5M
    commissions: 625000, // 5%
    avgTicket: 850000,
    conversionRate: 3.8,
    revenueData: [
      { month: 'Jan', revenue: 800000, target: 700000 },
      { month: 'Fev', revenue: 950000, target: 750000 },
      { month: 'Mar', revenue: 1200000, target: 900000 },
      { month: 'Abr', revenue: 1100000, target: 950000 },
      { month: 'Mai', revenue: 1400000, target: 1000000 },
      { month: 'Jun', revenue: 1800000, target: 1100000 },
    ]
  },
  funnel: [
    { stage: 'Leads', count: 1240, fill: '#60a5fa' },
    { stage: 'Atendimentos', count: 850, fill: '#3b82f6' },
    { stage: 'Visitas', count: 420, fill: '#2563eb' },
    { stage: 'Propostas', count: 120, fill: '#1d4ed8' },
    { stage: 'Vendas', count: 45, fill: '#1e40af' },
  ],
  topAgents: [
    { id: 1, name: 'Eduardo Santos', sales: 4200000, deals: 8, lost: 12, avgTicket: 525000, avgTime: '18 dias', avatar: 'https://i.pravatar.cc/150?u=eduardo' },
    { id: 2, name: 'Camila Torres', sales: 3100000, deals: 5, lost: 8, avgTicket: 620000, avgTime: '24 dias', avatar: 'https://i.pravatar.cc/150?u=camila' },
    { id: 3, name: 'Roberto Lima', sales: 2800000, deals: 6, lost: 15, avgTicket: 466000, avgTime: '15 dias', avatar: 'https://i.pravatar.cc/150?u=roberto' },
  ],
  activities: [
    { id: 1, user: 'Eduardo Santos', action: 'vendeu', target: 'Residencial Vista do Parque', time: '2h atrás', type: 'sale' },
    { id: 2, user: 'Camila Torres', action: 'agendou visita', target: 'Casa Jardim Botânico', time: '4h atrás', type: 'visit' },
    { id: 3, user: 'Sistema', action: 'recebeu novo lead', target: 'Campanha Facebook', time: '5h atrás', type: 'lead' },
    { id: 4, user: 'Roberto Lima', action: 'enviou proposta', target: 'Cobertura Diamond', time: '1d atrás', type: 'proposal' },
  ],
  leadSources: [
    { name: 'Google Ads', value: 40, fill: '#4285F4' },
    { name: 'Instagram', value: 25, fill: '#E1306C' },
    { name: 'Portal', value: 20, fill: '#34A853' },
    { name: 'Indicação', value: 15, fill: '#FBBC05' },
  ],
  propertyTypes: [
    { name: 'Apartamentos', value: 65, fill: '#0ea5e9' },
    { name: 'Casas', value: 25, fill: '#8b5cf6' },
    { name: 'Comercial', value: 10, fill: '#64748b' },
  ]
};

// --- MOCK MARKETING DATA ---

export const MOCK_MARKETING_POSTS: SocialPost[] = [
  {
    id: 'p1',
    content: 'Oportunidade única no Jardim Botânico! Casa com 3 quartos e área gourmet. Agende sua visita. #imoveis #curitiba',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    platforms: ['instagram', 'facebook'],
    scheduledDate: getRelativeDate(1) + 'T10:00:00',
    status: 'scheduled'
  },
  {
    id: 'p2',
    content: 'Acabou de ser vendido! Parabéns aos novos proprietários do Cobertura Diamond Hill. 🥂',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    platforms: ['instagram', 'linkedin'],
    scheduledDate: getRelativeDate(-2) + 'T14:30:00',
    status: 'published',
    likes: 245,
    comments: 12
  }
];

export const MOCK_ADS: AdCampaign[] = [
  {
    id: 'ad1',
    name: 'Promoção Vista do Parque',
    platform: 'meta',
    status: 'active',
    budget: 50,
    spent: 350,
    impressions: 12500,
    clicks: 420,
    leads: 18,
    propertyId: '1',
    thumbnail: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'ad2',
    name: 'Lançamento Horizon - Google Search',
    platform: 'google',
    status: 'active',
    budget: 100,
    spent: 890,
    impressions: 5600,
    clicks: 890,
    leads: 45,
    propertyId: '4',
    thumbnail: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
  }
];

// --- MOCK CHAT DATA (WaSeller) ---
export const MOCK_CHATS: ChatConversation[] = [
  {
    id: 'chat1',
    leadId: 'l1',
    leadName: 'Roberto Silva',
    leadAvatar: 'https://ui-avatars.com/api/?name=Roberto+Silva&background=random',
    lastMessage: 'Gostaria de agendar para sábado às 10h.',
    unreadCount: 1,
    lastActivity: '10 min atrás',
    assignedTo: 'u2',
    tags: ['Quente', 'Primeiro Imóvel'],
    status: 'open',
    messages: [
      { id: 'm1', text: 'Olá Roberto, vi que gostou do Vista do Parque.', sender: 'agent', timestamp: '10:00', status: 'read' },
      { id: 'm2', text: 'Sim, achei interessante o preço.', sender: 'user', timestamp: '10:05', status: 'read' },
      { id: 'm3', text: 'Podemos agendar uma visita?', sender: 'agent', timestamp: '10:06', status: 'read' },
      { id: 'm4', text: 'Gostaria de agendar para sábado às 10h.', sender: 'user', timestamp: '10:15', status: 'delivered' }
    ]
  },
  {
    id: 'chat2',
    leadId: 'l2',
    leadName: 'Ana Souza',
    lastMessage: 'Vou ver com meu esposo e te aviso.',
    unreadCount: 0,
    lastActivity: '1h atrás',
    assignedTo: 'u2',
    tags: ['Médica'],
    status: 'open',
    messages: [
      { id: 'm1', text: 'Oi Ana, conseguiu ver as fotos?', sender: 'agent', timestamp: '09:00', status: 'read' },
      { id: 'm2', text: 'Vou ver com meu esposo e te aviso.', sender: 'user', timestamp: '09:30', status: 'read' }
    ]
  },
  {
    id: 'chat3',
    leadId: 'l4',
    leadName: 'Mariana Lima',
    lastMessage: 'Qual o valor da entrada?',
    unreadCount: 3,
    lastActivity: '5 min atrás',
    assignedTo: undefined, // Unassigned (Fila de espera)
    tags: ['Novo'],
    status: 'waiting',
    messages: [
      { id: 'm1', text: 'Olá, tenho interesse no Viva Vida.', sender: 'user', timestamp: '11:00', status: 'delivered' },
      { id: 'm2', text: 'Qual o valor da entrada?', sender: 'user', timestamp: '11:01', status: 'delivered' }
    ]
  }
];


export const APP_CONFIG = {
  companyName: 'NovaMorada',
  whatsapp: '5511999999999',
  address: 'Av. Ipiranga, 1000 - Centro, São Paulo - SP',
  email: 'contato@novamorada.com.br',
  social: {
    instagram: '@novamorada',
    facebook: '/novamorada',
    linkedin: '/company/novamorada'
  }
};
