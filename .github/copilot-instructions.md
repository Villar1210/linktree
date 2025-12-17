# 🤖 Copilot Instructions for AI Agents

## Visão Geral do Projeto
- Este repositório é um app web moderno (React + TypeScript + Vite + Tailwind) para gestão de links, campanhas, imóveis e integrações de WhatsApp.
- Estrutura modular: componentes em `components/`, páginas em `pages/`, serviços de API em `services/`.
- Dados e constantes de negócio centralizados em `constants.ts` e `types.ts`.

## Fluxos e Convenções
- **Build/Dev:** Use `npm install` e `npm run dev` para rodar localmente. O build é feito via Vite.
- **Variáveis de ambiente:** Configure `.env.local` (exemplo: `GEMINI_API_KEY`).
- **Estilos:** Tailwind configurado em `tailwind.config.js` e `postcss.config.js`.
- **APIs:** Consuma serviços via `services/api.ts`. Endpoints e exemplos em `docs/api.md`.
- **WhatsApp:** Integração e tracking detalhados em `docs/whatsapp-config.md`.
- **Deploy:** Siga `docs/deployment.md` para Docker, cloud e CI/CD.
- **Testes:** Veja `docs/testing-guide.md` para checklists e práticas de QA.

## Padrões Específicos
- **Componentização:** Prefira componentes reutilizáveis em `components/`.
- **Páginas:** Cada rota tem um arquivo em `pages/` (ex: `pages/Properties.tsx`).
- **Admin vs. Buyer:** Subpastas em `pages/` segmentam funcionalidades por perfil.
- **Dados de negócio:** Use/enriqueça `constants.ts` para simular dados e fluxos.
- **Tipos:** Sempre tipar dados e props com `types.ts`.
- **Comunicação:** Use hooks/fetch do `services/api.ts` para integração.
- **Tracking:** Eventos de WhatsApp e Analytics devem seguir exemplos dos docs.

## Exemplos de Arquivos-Chave
- `components/AdminLayout.tsx` — layout administrativo padrão
- `pages/admin/PropertiesList.tsx` — listagem de imóveis para admin
- `services/api.ts` — camada de integração HTTP
- `constants.ts` — dados simulados e enums de negócio
- `docs/whatsapp-config.md` — guia de integração WhatsApp
- `docs/deployment.md` — instruções de deploy multi-cloud

## Dicas para Agentes
- Consulte sempre os arquivos de documentação em `docs/` para integrações, deploy e testes.
- Siga os exemplos de tipagem e estrutura de dados dos arquivos centrais.
- Prefira padrões já existentes ao criar novos fluxos ou componentes.
- Documente decisões e fluxos não triviais em markdown na raiz ou em `docs/`.
