#!/bin/bash
# 🌐 Script de Configuração Nginx - ivillar.com.br/linktree

echo "🌐 Configurando Nginx para linktree.ivillar.com.br..."

# Verificar se o Nginx está instalado
if ! command -v nginx &> /dev/null; then
    echo "❌ Nginx não está instalado. Instalando..."
    sudo apt update
    sudo apt install nginx -y
fi

# Criar configuração do site
echo "📝 Criando configuração do site..."
sudo tee /etc/nginx/sites-available/linktree > /dev/null << 'EOF'
server {
    listen 80;
    server_name linktree.ivillar.com.br;
    
    # Logs específicos do linktree
    access_log /var/log/nginx/linktree_access.log;
    error_log /var/log/nginx/linktree_error.log;
    
    # Configuração para o linktree (root do subdomínio)
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Configurações de timeout
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        
        # Buffer configurations
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }
    
    # Arquivos estáticos do linktree
    location /static {
        alias /var/www/linktree/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
        
        # Tipos de arquivo específicos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
EOF

# Verificar se a configuração está correta
echo "🧪 Testando configuração do Nginx..."
sudo nginx -t

if [ $? -ne 0 ]; then
    echo "❌ Erro na configuração do Nginx"
    exit 1
fi

# Desabilitar site padrão (se existir)
if [ -f "/etc/nginx/sites-enabled/default" ]; then
    echo "🗑️  Desabilitando site padrão..."
    sudo rm /etc/nginx/sites-enabled/default
fi

# Ativar site
echo "🔗 Ativando site linktree..."
sudo ln -sf /etc/nginx/sites-available/linktree /etc/nginx/sites-enabled/

# Testar configuração novamente
echo "🧪 Testando configuração final..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Configuração válida"
    
    # Reiniciar Nginx
    echo "🔄 Reiniciando Nginx..."
    sudo systemctl restart nginx
    
    # Verificar status
    if sudo systemctl is-active --quiet nginx; then
        echo "✅ Nginx está rodando"
    else
        echo "❌ Erro ao iniciar Nginx"
        sudo systemctl status nginx
        exit 1
    fi
    
    # Habilitar Nginx para iniciar automaticamente
    sudo systemctl enable nginx
    
    echo ""
    echo "🎉 Configuração concluída com sucesso!"
    echo "=================================="
    echo ""
    echo "📍 URLs disponíveis:"
    echo "   http://linktree.ivillar.com.br"
    echo ""
    echo "📊 Para testar:"
    echo "   curl -I http://localhost"
    echo "   curl -I http://linktree.ivillar.com.br"
    echo ""
    echo "📋 Logs do Nginx:"
    echo "   sudo tail -f /var/log/nginx/linktree_access.log"
    echo "   sudo tail -f /var/log/nginx/linktree_error.log"
    echo ""
    echo "🔒 Para configurar SSL (recomendado):"
    echo "   sudo apt install certbot python3-certbot-nginx"
    echo "   sudo certbot --nginx -d linktree.ivillar.com.br"
    echo ""
    
else
    echo "❌ Configuração inválida. Verifique os erros acima."
    exit 1
fi
EOF

chmod +x configure-nginx.sh