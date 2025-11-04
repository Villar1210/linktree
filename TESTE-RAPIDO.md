# 🚀 Teste Rápido do Projeto Lumiar Linktree

## Para testar rapidamente:

### 1. Configuração Inicial (Windows)
```bash
# Executar setup automático
setup.bat

# OU manualmente:
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configurar Variáveis
```bash
# Copiar arquivo de exemplo
copy .env.example .env

# Editar .env com seus números de WhatsApp:
WHATSAPP_DANIEL=5511999999999
WHATSAPP_VENDAS=5511888888888
```

### 3. Executar
```bash
# Execução rápida
run.bat

# OU manualmente:
python app.py
```

### 4. Acessar
- **URL:** http://localhost:5000
- **Páginas disponíveis:**
  - `/` - Página inicial (nova versão)
  - `/empreendimentos` - Catálogo de imóveis
  - `/campanhas` - Promoções especiais
  - `/vagas` - Portal de vagas
  - `/contato` - Informações de contato

## 🎯 Funcionalidades Testadas:

✅ **Nova Página Inicial:**
- Hero section com estatísticas
- Cards de ação principais
- Seção WhatsApp destacada
- Contato rápido por categoria

✅ **Sistema de Templates:**
- Template base com header/footer
- Navegação consistente
- Design responsivo

✅ **Integração WhatsApp:**
- Links diretos com mensagens personalizadas
- Botões para diferentes tipos de contato

✅ **Design Moderno:**
- Animações CSS
- Cards interativos
- Gradientes e efeitos visuais

## 📱 Para testar no celular:
1. Execute o projeto
2. Descubra seu IP: `ipconfig`
3. Acesse: `http://SEU_IP:5000`

## 🎨 Personalização:
- Adicione logo em: `static/images/logo.png`
- Edite dados em: `data/empreendimentos.json`
- Modifique cores no CSS dos templates