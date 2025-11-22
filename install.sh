#!/bin/bash
# 🚀 Script de Instalação - Lumiar Linktree
# Execute este script no seu servidor Linux/VPS

echo "🏗️  Iniciando instalação do Lumiar Linktree..."

# Atualizar sistema
echo "📦 Atualizando sistema..."
sudo apt update && sudo apt upgrade -y

# Instalar Python e dependências
echo "🐍 Instalando Python e dependências..."
sudo apt install python3 python3-pip python3-venv nginx curl unzip -y

# Verificar versão do Python
echo "✅ Versão do Python instalada:"
python3 --version

# Criar diretório da aplicação
echo "📁 Criando diretório da aplicação..."
sudo mkdir -p /var/www/linktree
sudo chown $USER:$USER /var/www/linktree
cd /var/www/linktree

# Criar ambiente virtual
echo "🔧 Criando ambiente virtual Python..."
python3 -m venv venv

# Ativar ambiente virtual
echo "⚡ Ativando ambiente virtual..."
source venv/bin/activate

# Verificar se requirements.txt existe
if [ ! -f "requirements.txt" ]; then
    echo "📝 Criando requirements.txt..."
    cat > requirements.txt << EOF
Flask==3.0.0
requests==2.31.0
python-dotenv==1.0.0
gunicorn==21.2.0
EOF
fi

# Instalar dependências do projeto
echo "📦 Instalando dependências do projeto..."
pip install -r requirements.txt

# Instalar Gunicorn (se não estiver no requirements.txt)
echo "🚀 Instalando Gunicorn..."
pip install gunicorn

# Verificar instalações
echo "✅ Verificando instalações:"
pip list | grep -E "(Flask|gunicorn|requests)"

# Criar arquivo de configuração do Gunicorn
echo "⚙️  Criando configuração do Gunicorn..."
cat > gunicorn.conf.py << EOF
# Configuração do Gunicorn para Lumiar Linktree
bind = "127.0.0.1:5000"
workers = 2
worker_class = "sync"
timeout = 30
keepalive = 2
max_requests = 1000
max_requests_jitter = 100
preload_app = True
user = "www-data"
group = "www-data"
EOF

# Criar arquivo .env de exemplo
echo "🔐 Criando arquivo .env de exemplo..."
cat > .env.example << EOF
# Configurações da aplicação
SECRET_KEY=sua_chave_secreta_super_segura_aqui
FLASK_ENV=production

# Números do WhatsApp (formato: código_país + DDD + número)
WHATSAPP_DANIEL=5511999999999
WHATSAPP_VENDAS=5511888888888

# URL do Google Drive (opcional)
GOOGLE_DRIVE_JSON_URL=https://drive.google.com/uc?export=download&id=SEU_ID_ARQUIVO
EOF

# Criar pastas necessárias
echo "📂 Criando estrutura de pastas..."
mkdir -p static/images
mkdir -p data
mkdir -p logs

# Criar arquivo de log
touch logs/app.log

# Configurar Nginx (configuração básica)
echo "🌐 Configurando Nginx..."
sudo tee /etc/nginx/sites-available/linktree > /dev/null << EOF
server {
    listen 80;
    server_name _;  # Altere para seu domínio

    # Logs
    access_log /var/log/nginx/linktree_access.log;
    error_log /var/log/nginx/linktree_error.log;

    # Arquivos estáticos
    location /static {
        alias /var/www/linktree/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Proxy para a aplicação Flask
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Timeouts
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
}
EOF

# Ativar site no Nginx
echo "🔗 Ativando site no Nginx..."
sudo ln -sf /etc/nginx/sites-available/linktree /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Testar configuração do Nginx
echo "🧪 Testando configuração do Nginx..."
sudo nginx -t

# Criar serviço systemd
echo "🔄 Criando serviço systemd..."
sudo tee /etc/systemd/system/linktree.service > /dev/null << EOF
[Unit]
Description=Lumiar Linktree Flask Application
After=network.target

[Service]
Type=notify
User=www-data
Group=www-data
WorkingDirectory=/var/www/linktree
Environment=PATH=/var/www/linktree/venv/bin
ExecStart=/var/www/linktree/venv/bin/gunicorn --config gunicorn.conf.py app:app
ExecReload=/bin/kill -s HUP \$MAINPID
Restart=always
RestartSec=3
StandardOutput=append:/var/www/linktree/logs/app.log
StandardError=append:/var/www/linktree/logs/app.log

[Install]
WantedBy=multi-user.target
EOF

# Ajustar permissões
echo "🔐 Ajustando permissões..."
sudo chown -R www-data:www-data /var/www/linktree
sudo chmod -R 755 /var/www/linktree

# Recarregar systemd
echo "🔄 Recarregando systemd..."
sudo systemctl daemon-reload

# Ativar serviços
echo "⚡ Ativando serviços..."
sudo systemctl enable linktree
sudo systemctl enable nginx

# Criar script de deploy
echo "📝 Criando script de deploy..."
cat > deploy.sh << 'EOF'
#!/bin/bash
# Script de deploy rápido

echo "🚀 Iniciando deploy..."

# Parar aplicação
sudo systemctl stop linktree

# Fazer backup dos dados
if [ -f "data/empreendimentos.json" ]; then
    cp data/empreendimentos.json data/backup_$(date +%Y%m%d_%H%M%S).json
    echo "✅ Backup criado"
fi

# Atualizar código (descomente a linha apropriada)
# git pull origin main  # Se usar Git
# Ou faça upload manual dos arquivos

# Ativar ambiente virtual e atualizar dependências
source venv/bin/activate
pip install -r requirements.txt

# Ajustar permissões
sudo chown -R www-data:www-data /var/www/linktree

# Reiniciar serviços
sudo systemctl start linktree
sudo systemctl reload nginx

# Verificar status
sleep 3
sudo systemctl status linktree --no-pager
echo "✅ Deploy concluído!"
EOF

chmod +x deploy.sh

# Criar script de monitoramento
echo "📊 Criando script de monitoramento..."
cat > monitor.sh << 'EOF'
#!/bin/bash
# Script de monitoramento

echo "📊 Status dos Serviços:"
echo "======================"

echo "🏗️  Linktree App:"
sudo systemctl status linktree --no-pager -l

echo ""
echo "🌐 Nginx:"
sudo systemctl status nginx --no-pager -l

echo ""
echo "📋 Últimos logs da aplicação:"
tail -n 20 logs/app.log

echo ""
echo "🔍 Teste de conectividade:"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:5000/ || echo "❌ Aplicação não está respondendo"
EOF

chmod +x monitor.sh

echo ""
echo "🎉 Instalação concluída com sucesso!"
echo "=================================="
echo ""
echo "📋 Próximos passos:"
echo "1. Copie os arquivos da aplicação para /var/www/linktree"
echo "2. Configure o arquivo .env (copie de .env.example)"
echo "3. Inicie os serviços:"
echo "   sudo systemctl start linktree"
echo "   sudo systemctl start nginx"
echo ""
echo "🛠️  Scripts úteis criados:"
echo "   ./deploy.sh    - Deploy rápido"
echo "   ./monitor.sh   - Monitoramento"
echo ""
echo "🌐 Para testar:"
echo "   curl http://localhost"
echo "   ou acesse pelo IP do servidor no navegador"
echo ""
echo "📊 Para monitorar:"
echo "   ./monitor.sh"
echo "   sudo journalctl -u linktree -f"
echo ""