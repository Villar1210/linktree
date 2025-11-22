# 🚀 Guia de Deploy - VPS/Hostinger

## 📋 Pré-requisitos

- VPS com Ubuntu/Debian
- Acesso SSH configurado
- Python 3.7+ instalado
- Nginx (opcional, para proxy reverso)

## 🔐 1. Conectar via SSH

```bash
# Conectar ao seu VPS
ssh usuario@seu-vps.hostinger.com

# Ou se usar porta personalizada
ssh -p 2222 usuario@seu-vps.hostinger.com
```

## 📁 2. Preparar Estrutura no Servidor

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências
sudo apt install python3 python3-pip python3-venv nginx -y

# Criar pasta da aplicação
sudo mkdir -p /var/www/linktree
sudo chown $USER:$USER /var/www/linktree
cd /var/www/linktree
```

## 📤 3. Upload dos Arquivos

### Opção A: Via SCP (do seu computador local)
```bash
# Upload do arquivo ZIP
scp C:\linktree\lumiar-linktree.zip usuario@seu-vps.hostinger.com:/var/www/linktree/

# Conectar via SSH e extrair
ssh usuario@seu-vps.hostinger.com
cd /var/www/linktree
unzip lumiar-linktree.zip
rm lumiar-linktree.zip
```

### Opção B: Via FTP/SFTP
```bash
# Usar cliente FTP como FileZilla ou WinSCP
# Conectar: seu-vps.hostinger.com
# Porta: 22 (SFTP) ou 21 (FTP)
# Destino: /var/www/linktree/
```

### Opção C: Via Git (se tiver repositório)
```bash
cd /var/www/linktree
git clone https://github.com/seu-usuario/lumiar-linktree.git .
```

## 🐍 4. Configurar Ambiente Python

```bash
cd /var/www/linktree

# Criar ambiente virtual
python3 -m venv venv

# Ativar ambiente virtual
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt
```

## ⚙️ 5. Configurar Variáveis de Ambiente

```bash
# Criar arquivo .env
nano .env
```

Adicionar no arquivo `.env`:
```env
SECRET_KEY=sua_chave_secreta_super_segura_aqui
FLASK_ENV=production
WHATSAPP_DANIEL=5511999999999
WHATSAPP_VENDAS=5511888888888
```

## 🔧 6. Configurar Gunicorn

```bash
# Criar arquivo de configuração do Gunicorn
nano gunicorn.conf.py
```

Conteúdo do `gunicorn.conf.py`:
```python
bind = "127.0.0.1:5000"
workers = 2
timeout = 30
keepalive = 2
max_requests = 1000
preload_app = True
```

## 🌐 7. Configurar Nginx (Proxy Reverso)

```bash
# Criar configuração do site
sudo nano /etc/nginx/sites-available/linktree
```

Conteúdo da configuração:
```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static {
        alias /var/www/linktree/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/linktree /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔄 8. Configurar Systemd Service

```bash
# Criar serviço systemd
sudo nano /etc/systemd/system/linktree.service
```

Conteúdo do service:
```ini
[Unit]
Description=Lumiar Linktree Flask App
After=network.target

[Service]
Type=notify
User=www-data
Group=www-data
WorkingDirectory=/var/www/linktree
Environment=PATH=/var/www/linktree/venv/bin
ExecStart=/var/www/linktree/venv/bin/gunicorn --config gunicorn.conf.py app:app
ExecReload=/bin/kill -s HUP $MAINPID
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

```bash
# Ajustar permissões
sudo chown -R www-data:www-data /var/www/linktree

# Ativar e iniciar serviço
sudo systemctl daemon-reload
sudo systemctl enable linktree
sudo systemctl start linktree
sudo systemctl status linktree
```

## 🔒 9. SSL com Let's Encrypt (Opcional)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obter certificado SSL
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com

# Renovação automática
sudo crontab -e
# Adicionar linha:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔍 10. Verificar Deploy

```bash
# Verificar status dos serviços
sudo systemctl status linktree
sudo systemctl status nginx

# Verificar logs
sudo journalctl -u linktree -f
sudo tail -f /var/log/nginx/error.log

# Testar aplicação
curl http://localhost:5000
curl http://seu-dominio.com
```

## 📊 11. Monitoramento e Logs

```bash
# Ver logs da aplicação
sudo journalctl -u linktree --since today

# Ver logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Monitorar recursos
htop
df -h
```

## 🔄 12. Atualizações Futuras

```bash
cd /var/www/linktree

# Fazer backup dos dados
cp data/empreendimentos.json backup/empreendimentos_$(date +%Y%m%d).json

# Atualizar arquivos (via git ou upload)
git pull origin main
# ou upload de novos arquivos

# Reiniciar aplicação
sudo systemctl restart linktree
```

## 🛠️ 13. Troubleshooting

### Aplicação não inicia:
```bash
# Verificar logs
sudo journalctl -u linktree -n 50

# Testar manualmente
cd /var/www/linktree
source venv/bin/activate
python app.py
```

### Nginx não funciona:
```bash
# Verificar configuração
sudo nginx -t

# Ver logs de erro
sudo tail -f /var/log/nginx/error.log
```

### Permissões:
```bash
# Ajustar permissões
sudo chown -R www-data:www-data /var/www/linktree
sudo chmod -R 755 /var/www/linktree
```

## 🎯 Comandos Rápidos de Deploy

```bash
#!/bin/bash
# Script de deploy rápido

cd /var/www/linktree
git pull origin main
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart linktree
sudo systemctl reload nginx
echo "Deploy concluído!"
```

## 📱 Teste Final

Acesse no navegador:
- `http://seu-dominio.com`
- Teste todos os links do WhatsApp
- Verifique responsividade mobile
- Teste sistema de filtros

---

**🏗️ Deploy da Construtora Lumiar concluído com sucesso!**