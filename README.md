# Segurança: Variáveis de Ambiente

Para garantir a segurança das credenciais, configure a variável de ambiente `MAIL_PASSWORD` antes de rodar scripts que enviam e-mails:

No Windows PowerShell:
```powershell
$env:MAIL_PASSWORD = "SUA_SENHA_DE_EMAIL"
```
No Linux/macOS:
```bash
export MAIL_PASSWORD="SUA_SENHA_DE_EMAIL"
```

Nunca coloque senhas diretamente no código-fonte.
# 🏗️ Lumiar Linktree - Plataforma de Empreendimentos

Plataforma web leve e responsiva que centraliza os empreendimentos da Construtora Lumiar e permite comunicação rápida via WhatsApp.

## 🚀 Tecnologias Utilizadas

- **Backend**: Python + Flask
- **Frontend**: HTML + CSS + JavaScript
- **Dados**: JSON (sincronizável com Google Drive)
- **Comunicação**: WhatsApp via links diretos

## 📁 Estrutura do Projeto

```
C:\linktree/
├── app.py                  # Aplicação Flask principal
├── requirements.txt        # Dependências Python
├── README.md              # Documentação do projeto
├── data/
│   └── empreendimentos.json # Dados dos empreendimentos
├── static/
│   ├── style.css          # Estilos principais
│   ├── js/
│   │   └── main.js        # JavaScript interativo
│   └── images/            # Imagens dos empreendimentos
└── templates/
    ├── base.html          # Template base
    ├── index.html         # Página inicial
    └── empreendimentos.html # Lista de empreendimentos
```

## ✨ Funcionalidades

### 🏠 **Página Inicial**
- Hero section com estatísticas da construtora
- Cards de navegação para principais seções
- Seção destacada para contato com Daniel
- Grid de contato rápido por categoria

### 🏢 **Empreendimentos**
- Listagem responsiva de todos os imóveis
- Sistema de filtros por tipo (Apartamento, Casa, Cobertura)
- Cards detalhados com preços e características
- Integração direta com WhatsApp para cada imóvel

### 🚀 **Campanhas Promocionais**
- Campanhas com descontos especiais
- Condições e prazos claramente definidos
- Links diretos para imóveis em promoção

### 💼 **Vagas de Emprego**
- Oportunidades para corretores
- Detalhes de salários e benefícios
- Requisitos e responsabilidades

## 🛠️ Instalação e Execução

### 1. **Pré-requisitos**
```bash
# Python 3.7+ instalado
python --version
```

### 2. **Instalação**
```bash
# Navegar para a pasta
cd C:\linktree

# Instalar dependências
pip install -r requirements.txt
```

### 3. **Executar a aplicação**

#### **Desenvolvimento Local:**
```bash
# Método 1: Flask dev server
python app.py

# Método 2: Script interativo
./run.sh dev

# Método 3: Comando rápido  
./quick-run.sh dev

# Acesse: http://localhost:5000
```

#### **Produção (Servidor):**
```bash
# Navegar para o diretório
cd /var/www/linktree

# Ativar ambiente virtual
source venv/bin/activate

# Executar com Gunicorn (foreground)
gunicorn --bind 127.0.0.1:5000 app:app

# Ou usar configuração otimizada
gunicorn --config gunicorn.conf.py app:app

# Ou executar em background (daemon)
gunicorn --bind 127.0.0.1:5000 --workers 4 --daemon app:app
```

#### **Scripts Automatizados:**
```bash
# Script interativo completo
./run.sh

# Comandos rápidos
./quick-run.sh daemon    # Executar em background
./quick-run.sh status    # Ver status
./quick-run.sh stop      # Parar aplicação
./quick-run.sh restart   # Reiniciar
./quick-run.sh logs      # Ver logs
./quick-run.sh test      # Testar conectividade
```

### 4. **Configuração (Opcional)**
```bash
# Criar arquivo .env para variáveis de ambiente
echo "SECRET_KEY=sua_chave_secreta_aqui" > .env
echo "GOOGLE_DRIVE_JSON_URL=sua_url_do_google_drive" >> .env
```

## 📱 Configuração do WhatsApp

Edite os números no arquivo `app.py`:

```python
# Números de WhatsApp (substitua pelos números reais)
WHATSAPP_DANIEL = "5511999999999"  # Número do Daniel
WHATSAPP_VENDAS = "5511888888888"  # Número de vendas
```

## 📝 Personalização de Dados

### **Empreendimentos**
Edite o arquivo `data/empreendimentos.json`:

```json
{
  "empreendimentos": [
    {
      "id": 1,
      "nome": "Seu Empreendimento",
      "tipo": "Apartamento|Casa|Cobertura",
      "status": "Disponível|Lançamento|Em Obras",
      "preco": "R$ 000.000",
      "localizacao": "Localização, Cidade",
      "quartos": 2,
      "banheiros": 2,
      "area": "00m²",
      "imagem": "/static/images/seu-imovel.jpg",
      "descricao": "Descrição detalhada",
      "whatsapp_message": "Mensagem personalizada"
    }
  ]
}
```

### **Google Drive (Opcional)**
1. Faça upload do JSON para o Google Drive
2. Torne o arquivo público
3. Copie o ID do arquivo da URL
4. Configure no `app.py`:

```python
GOOGLE_DRIVE_JSON_URL = "https://drive.google.com/uc?export=download&id=SEU_ID_ARQUIVO"
```

## 🎨 Personalização Visual

### **Cores e Estilos**
Edite as variáveis CSS em `static/style.css`:

```css
:root {
    --primary-color: #2563eb;    /* Azul principal */
    --success-color: #059669;    /* Verde WhatsApp */
    --warning-color: #d97706;    /* Laranja promoções */
    /* ... outras variáveis ... */
}
```

### **Imagens**
Adicione suas imagens em `static/images/`:
- `vila-madalena.jpg`
- `morumbi.jpg`
- `itaim.jpg`
- `jardins.jpg`
- `alphaville.jpg`
- `placeholder.jpg` (imagem padrão)

## 🚀 Deploy em Produção

### **Heroku**
```bash
# Criar Procfile
echo "web: gunicorn app:app" > Procfile

# Deploy
git init
git add .
git commit -m "Initial commit"
heroku create seu-app-lumiar
git push heroku main
```

### **Render/Railway**
- Conecte o repositório
- Configure variáveis de ambiente
- Deploy automático

### **VPS/Servidor**
```bash
# Usando Gunicorn
gunicorn --bind 0.0.0.0:5000 app:app

# Ou usando systemd + nginx
```

## 📊 Analytics (Opcional)

Adicione Google Analytics no `base.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>
```

## 🔧 Manutenção

### **Atualizar Dados**
- Edite `data/empreendimentos.json`
- Ou atualize via Google Drive (sincronização automática)

### **Backup**
```bash
# Backup dos dados
cp data/empreendimentos.json backup/empreendimentos_$(date +%Y%m%d).json
```

### **Logs**
```bash
# Verificar logs em produção
tail -f /var/log/lumiar-app.log
```

## 📞 Suporte

Para dúvidas ou suporte:
- **Daniel**: WhatsApp configurado na aplicação
- **Email**: contato@lumiar.com.br
- **Horário**: Segunda a Sexta: 8h às 18h | Sábado: 8h às 14h

## 📄 Licença

Este projeto é propriedade da **Construtora Lumiar**. Todos os direitos reservados.

---

**Desenvolvido com ❤️ para a Construtora Lumiar** 🏗️