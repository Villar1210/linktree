# 📞 Configuração WhatsApp - Lumiar Platform

## 🎯 Números Configurados

### 👨‍💼 **Daniel - Consultor Sênior**
- **Número**: `5511999999999`
- **Especialidade**: Imóveis residenciais e comerciais
- **Uso**: Contato principal e atendimento personalizado

### 👥 **Equipe de Vendas**
- **Número**: `5511888888888`
- **Especialidade**: Atendimento geral e cotações
- **Uso**: Cards de empreendimentos e formulários

---

## ⚙️ Como Alterar os Números

### 1️⃣ **Método 1: Arquivo .env (Recomendado)**

Edite o arquivo `.env` na raiz do projeto:

```env
# Configurações do WhatsApp
WHATSAPP_DANIEL=5511999999999
WHATSAPP_VENDAS=5511888888888
```

### 2️⃣ **Método 2: Diretamente no código**

Edite o arquivo `app.py`:

```python
# Configurações do WhatsApp
WHATSAPP_DANIEL = os.getenv('WHATSAPP_DANIEL', "5511999999999")  # Número do Daniel
WHATSAPP_VENDAS = os.getenv('WHATSAPP_VENDAS', "5511888888888")  # Número de vendas
```

### 3️⃣ **Método 3: Arquivo JSON**

Edite o arquivo `data/empreendimentos.json`:

```json
{
  "configuracoes": {
    "whatsapp_daniel": "5511999999999",
    "whatsapp_vendas": "5511888888888",
    "responsaveis": {
      "daniel": {
        "nome": "Daniel",
        "whatsapp": "5511999999999"
      },
      "vendas": {
        "nome": "Equipe de Vendas", 
        "whatsapp": "5511888888888"
      }
    }
  }
}
```

---

## 🔗 Onde os Números são Utilizados

### 🏠 **Página Inicial**
- ✅ Botão principal do hero section → **Daniel**
- ✅ Cards de ação rápida → **Vendas**
- ✅ Rodapé com links sociais → **Ambos**

### 🏢 **Página de Empreendimentos**
- ✅ Botões "Mais Informações" → **Vendas**
- ✅ Formulário de contato → **Daniel**
- ✅ Mensagens personalizadas por imóvel

### 🎯 **Página de Campanhas**
- ✅ Botões "Aproveitar Oferta" → **Vendas**
- ✅ CTAs promocionais → **Daniel**

### 💼 **Página de Vagas**
- ✅ Botões "Candidatar-se" → **Daniel**
- ✅ Contato para RH → **Vendas**

---

## 📱 Formato dos Números

### ✅ **Formato Correto**
```
5511999999999
```
- **55**: Código do Brasil
- **11**: Código de área (DDD)
- **999999999**: Número do celular (9 dígitos)

### ❌ **Formatos Incorretos**
```
(11) 99999-9999    ❌ Com formatação
+55 11 99999-9999  ❌ Com espaços
11999999999        ❌ Sem código do país
```

---

## 🎨 Mensagens Personalizadas

### 🏠 **Mensagens da Página Inicial**

#### Daniel (Hero Section):
```
"Olá Daniel! Vim do site da Lumiar e gostaria de mais informações sobre os empreendimentos."
```

#### Vendas (Quick Contact):
```
"Olá! Gostaria de informações sobre apartamentos."
```

### 🏢 **Mensagens dos Empreendimentos**

#### Por Imóvel:
```
"Olá! Tenho interesse no [Nome do Empreendimento] que vi no site da Lumiar."
```

#### Formulário:
```
"Olá! Meu nome é [Nome]. [Mensagem personalizada]"
```

### 🎯 **Mensagens das Campanhas**

#### Promoções:
```
"Olá! Vi a promoção [Nome da Campanha] no site e gostaria de mais detalhes."
```

### 💼 **Mensagens das Vagas**

#### Candidatura:
```
"Olá! Tenho interesse na vaga de [Cargo] que vi no site da Lumiar."
```

---

## 🔧 Configuração Avançada

### JavaScript Dinâmico

Os números são injetados via JavaScript para uso dinâmico:

```javascript
window.LUMIAR_CONFIG = {
    whatsapp: {
        daniel: '{{ WHATSAPP_DANIEL }}',
        vendas: '{{ WHATSAPP_VENDAS }}'
    }
};
```

### Filtro Jinja2

Utiliza filtro personalizado para gerar links:

```python
@app.template_filter('whatsapp_link')
def whatsapp_link_filter(numero, mensagem="Olá!"):
    mensagem_encoded = requests.utils.quote(mensagem)
    return f"https://wa.me/{numero}?text={mensagem_encoded}"
```

### Context Processor

Injeta automaticamente nos templates:

```python
@app.context_processor
def inject_whatsapp_numbers():
    return {
        'WHATSAPP_DANIEL': WHATSAPP_DANIEL,
        'WHATSAPP_VENDAS': WHATSAPP_VENDAS
    }
```

---

## 📊 Analytics e Tracking

### 🎯 **Eventos Rastreados**

#### WhatsApp Clicks:
```javascript
gtag('event', 'whatsapp_click', {
    'source': 'daniel_hero',     // Botão principal
    'source': 'vendas_card',     // Card de empreendimento
    'source': 'contact_form',    // Formulário
    'source': 'campaign_cta'     // CTA promocional
});
```

### 📈 **Métricas Disponíveis**
- Cliques no Daniel vs Vendas
- Origem dos contatos (hero, cards, formulários)
- Taxa de conversão por página
- Horários de maior engajamento

---

## 🧪 Como Testar

### 1️⃣ **Teste Local**
```bash
# Altere os números no .env
WHATSAPP_DANIEL=5511000000000
WHATSAPP_VENDAS=5511000000001

# Reinicie a aplicação
python app.py

# Acesse http://localhost:5000
# Clique nos botões do WhatsApp
# Verifique se os links estão corretos
```

### 2️⃣ **Teste de Links**

#### Verificar URLs geradas:
```
https://wa.me/5511999999999?text=Olá%20Daniel!%20Vim%20do%20site...
```

#### Elementos a testar:
- [ ] Botão principal da home
- [ ] Cards de empreendimentos  
- [ ] Formulário de contato
- [ ] Links do rodapé
- [ ] CTAs das campanhas

### 3️⃣ **Teste de Responsividade**
- [ ] Mobile: Botões touch-friendly
- [ ] Desktop: Hover effects
- [ ] Tablet: Layout adaptado

---

## 🚨 Troubleshooting

### ❓ **Problemas Comuns**

#### 1. Números não aparecem
```bash
# Verificar se .env está carregado
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print(os.getenv('WHATSAPP_DANIEL'))"
```

#### 2. Links não funcionam
```bash
# Verificar formato do número
# Deve ser: 5511999999999 (sem formatação)
```

#### 3. JavaScript não funciona
```bash
# Verificar console do navegador (F12)
# Procurar por erros na configuração global
```

#### 4. Mensagens não personalizadas
```bash
# Verificar encoding das mensagens
# Caracteres especiais devem ser codificados
```

---

## 📝 Checklist de Configuração

### ✅ **Antes de Ir ao Ar**
- [ ] Números testados e funcionando
- [ ] Mensagens personalizadas configuradas
- [ ] Analytics tracking ativo
- [ ] Links responsivos em mobile
- [ ] Fallbacks configurados (.env + código)
- [ ] Documentação atualizada

### ✅ **Monitoramento Contínuo**
- [ ] Verificar cliques diários
- [ ] Monitorar taxa de conversão
- [ ] Ajustar mensagens conforme feedback
- [ ] Testar novos dispositivos/navegadores

---

**📞 WhatsApp configurado com sucesso!**

*Para mais dúvidas sobre configuração, consulte a documentação técnica completa.*