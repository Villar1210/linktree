# 🏢 LuxeEstate Pro - Setup Guide

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no [Supabase](https://supabase.com) (gratuito)

## 🚀 Configuração Rápida

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Supabase

#### 2.1 Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Clique em "New Project"
3. Escolha organization epreencha:
   - **Name**: luxe-estate-pro
   - **Database Password**: Escolha uma senha forte
   - **Region**: South America (são paulo) - mais próximo
4. Aguarde ~2 minutos para o projeto ser criado

#### 2.2 Configurar Banco de Dados

1. No painel do Supabase, vá em **SQL Editor**
2. Clique em "New Query"
3. Copie TODO o conteúdo do arquivo `supabase/schema.sql`
4. Cole no editor e clique em **"Run"**
5. ✅ Verifique que aparece "Success" - isso criou todas as tabelas!

#### 2.3 Obter Credenciais

1. No painel Supabase, vá em **Settings** → **API**
2. Copie os valores:
   - **Project URL**
   - **anon/public** key

#### 2.4 Configurar Variáveis de Ambiente

1. Copie o arquivo de template:
   ```bash
   copy .env.example .env.local
   ```

2. Edite `.env.local` e cole suas credenciais:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI...
   ```

### 3. Rodar o Projeto

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) 🎉

---

## 👤 Criar Primeiro Usuário Admin

Como o banco está vazio, precisamos criar o primeiro admin:

### Via Supabase Dashboard:

1. Vá em **Authentication** → **Users**
2. Clique em "Add user" → **Create new user**
3. Preencha:
   - **Email**: admin@luxeestate.com
   - **Password**: sua_senha_aqui
   - **Auto Confirm User**: ✅ Ativado
4. Clique em "Create user"
5. Copie o **User UID** (algo como `a1b2c3d4-...`)

6. Agora vá em **SQL Editor** e rode:
   ```sql
   INSERT INTO public.users (id, email, name, role)
   VALUES ('cole-o-uid-aqui', 'admin@luxeestate.com', 'Admin Principal', 'admin');
   ```

7. ✅ Pronto! Agora pode fazer login com esse usuário

---

## 📊 Popular com Dados de Exemplo (Opcional)

Para adicionar os imóveis e leads do arquivo `constants.ts` no banco:

1. Vá em **SQL Editor** no Supabase
2. Rode este script para adicionar um imóvel de exemplo:

```sql
INSERT INTO properties (
  title, description, price, type, bedrooms, bathrooms, area,
  address, city, state, images, featured, status, features
) VALUES (
  'Residencial Vista do Parque',
  'Apartamento moderno com vista panorâmica do parque. Acabamentos de primeira, ar condicionado split, closet e cozinha planejada.',
  480000,
  'Apartamento',
  3,
  2,
  85,
  'Rua das Palmeiras, 123',
  'São Paulo',
  'SP',
  ARRAY[
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
  ],
  TRUE,
  'active',
  ARRAY['Salão de Festas', 'Playground', 'Portaria 24h', 'Varanda Grill']
);
```

**Dica**: Você pode criar um script para migrar todos os dados de `constants.ts` automaticamente (tarefa futura).

---

## 🔨 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento (localhost:3000)
npm run build        # Build de produção
npm run preview      # Preview do build
npm run lint         # Verificar código
npm run lint:fix     # Corrigir problemas automaticamente
npm run format       # Formatar código com Prettier
npm run type-check   # Verificar tipos TypeScript
npm run test         # Rodar testes (quando implementados)
```

---

## 🏗️ Estrutura do Projeto

```
linktree/
├── components/       # Componentes React
│   ├── ui/          # Componentes de UI base
│   ├── Layout.tsx   # Layout público
│   └── AdminLayout.tsx
├── pages/           # Páginas da aplicação
│   ├── admin/       # Área administrativa
│   └── buyer/       # Área do comprador
├── services/        # Camada de serviços (API)
│   ├── auth.service.ts
│   ├── properties.service.ts
│   └── leads.service.ts
├── hooks/           # React hooks customizados
│   └── useAuth.tsx  # Hook de autenticação
├── config/          # Configurações
│   └── supabase.ts  # Cliente Supabase
├── types.ts         # TypeScript types
├── supabase/        # Scripts SQL
│   ├── schema.sql   # Schema do banco
│   └── seed.sql     # Dados iniciais
└── .env.local       # Variáveis de ambiente (não committar!)
```

---

## 🔐 Autenticação e Permissões

### Roles (Funções):
- **admin**: Acesso total (gerenciar imóveis, leads, usuários)
- **agent**: Acessar CRM e imóveis
- **buyer**: Ver perfil e favoritos

### Rotas Protegidas:
- `/admin/*` → Requer role `admin`
- `/buyer/dashboard` → Requer autenticação

### Row Level Security (RLS):
- ✅ Público pode ver imóveis ativos
- ✅ Apenas admins podem criar/editar imóveis
- ✅ Leads só visíveis para admins e agents
- ✅ Usuários só veem próprio perfil

---

## 🚨 Troubleshooting

### Erro: "Missing Supabase environment variables"
- Verifique se `.env.local` existe e está preenchido
- Reinicie o servidor (`npm run dev`) após alterar `.env`

### Erro ao fazer login: "Invalid credentials"
- Certifique-se que criou o usuário no Authentication do Supabase
- Verifique se inseriu na tabela `users` também (dois passos!)

### Erro: "relation public.properties does not exist"
- Rode o script `supabase/schema.sql` no SQL Editor
- Verifique se deu "Success" no final

### Imagens não carregam
- As URLs do Unsplash funcionam diretamente
- Para produção, use Supabase Storage para hospedar imagens

---

## 📱 Próximos Passos

Agora que o backend está configurado:

1. ✅ Faça login com o usuário admin
2. ✅ Teste criar um imóvel em `/admin/properties/new`
3. ✅ Explore o CRM em `/admin/crm`
4. 🔮 Integre com WhatsApp API (futuro)
5. 🔮 Configure domain customizado
6. 🔮 Deploy na Vercel/Netlify

---

## 📚 Documentação

- [Supabase Docs](https://supabase.com/docs)
- [React Router](https://reactrouter.com/en/main)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite](https://vitejs.dev/guide/)

---

## 🆘 Suporte

Problemas? Abra uma issue ou pergunte a quem criou o projeto!

**Feito com ❤️ usando React + TypeScript + Supabase**
