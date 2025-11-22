# 🚀 Deploy na VPS Hostinger - Lumiar Linktree

## 📋 Pré-requisitos

### Informações Necessárias da Hostinger
- **IP da VPS**: (fornecido pela Hostinger)
- **Usuário SSH**: geralmente `root` ou usuário criado
- **Senha SSH**: fornecida no painel da Hostinger
- **Porta SSH**: geralmente `22`

### Domínio
- **Domínio principal**: `ivillar.com.br`
- **Subdomínio**: `linktree.ivillar.com.br`

## 🔧 Passo 1: Preparar Arquivos para Upload

### Criar arquivo compactado (se necessário)
```powershell
# No Windows (PowerShell)
cd C:\linktree
Compress-Archive -Path * -DestinationPath lumiar-linktree-deploy.zip -Force
```

### Arquivos essenciais para upload:
```
✅ app.py                    # Aplicação Flask principal
✅ requirements.txt          # Dependências Python
✅ gunicorn.conf.py         # Configuração Gunicorn
✅ nginx-linktree.conf      # Configuração Nginx
✅ data/                    # Pasta com dados JSON
✅ static/                  # CSS, JS, imagens
✅ templates/               # Templates HTML
✅ install.sh               # Script de instalação
✅ configure-nginx.sh       # Script configuração Nginx
✅ run.sh                   # Script de execução
✅ quick-run.sh             # Script rápido
✅ backup.sh                # Sistema de backup
✅ logs-monitor.sh          # Monitor de logs
✅ quick-logs.sh            # Logs rápidos
```

## 🌐 Passo 2: Conexão SSH e Upload

### Opção A: Upload via SCP (Recomendado)
```bash
# Upload do arquivo ZIP
scp lumiar-linktree-deploy.zip root@SEU_IP_VPS:/tmp/

# Ou upload de pasta completa
scp -r C:\linktree root@SEU_IP_VPS:/tmp/linktree-upload
```

### Opção B: Via WinSCP ou FileZilla
1. Abrir WinSCP/FileZilla
2. Conectar na VPS:
   - Host: IP da VPS Hostinger
   - Usuário: root (ou usuário criado)
   - Senha: fornecida pela Hostinger
   - Porta: 22
3. Enviar arquivos para `/tmp/` ou `/home/`

### Opção C: Via GitHub (Alternativa)
```bash
# Se tiver repositório git
git init
git add .
git commit -m "Deploy inicial Lumiar Linktree"
git remote add origin https://github.com/SEU_USUARIO/lumiar-linktree.git
git push -u origin main

# No servidor, fazer clone
git clone https://github.com/SEU_USUARIO/lumiar-linktree.git /var/www/linktree
```

## 🖥️ Passo 3: Conectar na VPS

### Via SSH
```bash
# Windows (PowerShell)
ssh root@SEU_IP_VPS

# Se der erro de chave, usar:
ssh -o StrictHostKeyChecking=no root@SEU_IP_VPS
```

### Comandos iniciais no servidor
```bash
# Atualizar sistema
apt update && apt upgrade -y

# Verificar sistema
lsb_release -a
python3 --version
nginx -v
```

## 📦 Passo 4: Instalação no Servidor

### Se enviou ZIP
```bash
# Extrair arquivos
cd /tmp
unzip lumiar-linktree-deploy.zip -d /var/www/linktree
cd /var/www/linktree

# Dar permissões
chmod +x *.sh
```

### Se enviou pasta
```bash
# Mover arquivos
mv /tmp/linktree-upload /var/www/linktree
cd /var/www/linktree
chmod +x *.sh
```

### Executar instalação automática
```bash
# Script de instalação completa
./install.sh

# Ou passo a passo:
# 1. Instalar Python e dependências
apt install python3 python3-pip python3-venv nginx -y

# 2. Criar ambiente virtual
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 3. Configurar Nginx
./configure-nginx.sh
```

## 🔧 Passo 5: Configurar Domínio

### No Painel da Hostinger
1. Acessar painel Hostinger
2. Ir em **DNS Zone Editor**
3. Adicionar registro A:
   - **Type**: A
   - **Name**: linktree
   - **Points to**: IP da VPS
   - **TTL**: 3600

### Verificar DNS
```bash
# No servidor ou local
nslookup linktree.ivillar.com.br
dig linktree.ivillar.com.br
```

## 🚀 Passo 6: Iniciar Aplicação

### Usando quick-run.sh
```bash
cd /var/www/linktree

# Testar em desenvolvimento primeiro
./quick-run.sh dev

# Se funcionar, rodar em produção
./quick-run.sh daemon

# Verificar status
./quick-run.sh status
```

### Configurar como serviço systemd
```bash
# Criar arquivo de serviço
cat > /etc/systemd/system/linktree.service << EOF
[Unit]
Description=Lumiar Linktree Flask App
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/linktree
ExecStart=/var/www/linktree/venv/bin/gunicorn --bind 127.0.0.1:5000 app:app
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Ativar serviço
systemctl daemon-reload
systemctl enable linktree
systemctl start linktree
systemctl status linktree
```

## 🔒 Passo 7: Configurar SSL (HTTPS)

### Instalar Certbot
```bash
apt install certbot python3-certbot-nginx -y

# Obter certificado
certbot --nginx -d linktree.ivillar.com.br

# Renovação automática
crontab -e
# Adicionar linha:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 🧪 Passo 8: Testes Finais

### Testar conectividade
```bash
# No servidor
./quick-run.sh test

# Comandos manuais
curl http://localhost:5000
curl http://linktree.ivillar.com.br
curl https://linktree.ivillar.com.br
```

### Verificar logs
```bash
# Usar scripts criados
./quick-logs.sh all
./logs-monitor.sh status

# Ou comandos diretos
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
journalctl -u linktree -f
```

## 🛠️ Comandos de Manutenção

### Reiniciar serviços
```bash
./quick-run.sh restart

# Ou manualmente
systemctl restart linktree
systemctl restart nginx
```

### Backup automático
```bash
# Configurar backup
./setup-backup-cron.sh

# Backup manual
./backup.sh
```

### Monitoramento
```bash
# Status geral
./quick-run.sh status

# Logs em tempo real
./quick-run.sh monitor

# Análise de logs
./logs-monitor.sh analyze
```

## 🚨 Troubleshooting

### Problemas comuns

#### 1. Aplicação não inicia
```bash
# Verificar logs
journalctl -u linktree -n 50
./quick-logs.sh gunicorn

# Verificar dependências
source venv/bin/activate
pip list
```

#### 2. Nginx erro 502
```bash
# Verificar se app está rodando
./quick-run.sh status
curl http://localhost:5000

# Verificar configuração nginx
nginx -t
systemctl restart nginx
```

#### 3. Domínio não resolve
```bash
# Verificar DNS
nslookup linktree.ivillar.com.br
dig linktree.ivillar.com.br

# Verificar configuração nginx
cat /etc/nginx/sites-available/linktree
```

#### 4. Permissões
```bash
# Corrigir permissões
chown -R www-data:www-data /var/www/linktree
chmod +x /var/www/linktree/*.sh
```

## 📱 URLs Finais

Após deploy completo:
- **HTTP**: http://linktree.ivillar.com.br
- **HTTPS**: https://linktree.ivillar.com.br

## 📞 Suporte

Em caso de problemas:
1. Verificar logs: `./quick-logs.sh all`
2. Status dos serviços: `./quick-run.sh status`
3. Testar conectividade: `./quick-run.sh test`

---

**Próximos passos**: Execute os comandos na ordem apresentada para fazer o deploy completo na VPS Hostinger!