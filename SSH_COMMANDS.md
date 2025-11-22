# 🖥️ Comandos SSH para Deploy - VPS Hostinger

## 🔑 1. Conectar na VPS

```bash
# Conectar via SSH
ssh root@SEU_IP_VPS

# Se der problema de chave, usar:
ssh -o StrictHostKeyChecking=no root@SEU_IP_VPS

# Primeira vez - atualizar sistema
apt update && apt upgrade -y
```

## 📦 2. Extrair e Preparar Arquivos

```bash
# Ir para diretório temporário
cd /tmp

# Extrair ZIP (se enviou via upload)
unzip lumiar-linktree-*.zip -d /var/www/linktree

# OU se moveu pasta completa
# mv linktree-upload /var/www/linktree

# Ir para diretório da aplicação
cd /var/www/linktree

# Dar permissões de execução
chmod +x *.sh

# Verificar arquivos
ls -la
```

## 🚀 3. Instalação Automática

```bash
# Executar script de instalação completa
./install.sh

# OU passo a passo:

# 3.1. Instalar dependências do sistema
apt install python3 python3-pip python3-venv nginx -y

# 3.2. Criar ambiente virtual Python
python3 -m venv venv
source venv/bin/activate

# 3.3. Instalar dependências Python
pip install -r requirements.txt

# 3.4. Configurar Nginx
./configure-nginx.sh
```

## 🌐 4. Configurar Domínio (DNS)

### No Painel Hostinger:
1. Acesse **DNS Zone Editor**
2. Adicione registro A:
   - **Type**: A
   - **Name**: linktree
   - **Points to**: IP_DA_VPS
   - **TTL**: 3600

### Verificar DNS:
```bash
# Testar resolução DNS
nslookup linktree.ivillar.com.br
dig linktree.ivillar.com.br

# Pode demorar alguns minutos para propagar
```

## 🔧 5. Iniciar Aplicação

```bash
# Testar em modo desenvolvimento primeiro
./quick-run.sh dev

# Se funcionou, parar e rodar em produção
Ctrl+C
./quick-run.sh daemon

# Verificar status
./quick-run.sh status

# Testar conectividade
./quick-run.sh test
```

## 🔒 6. Configurar SSL (HTTPS)

```bash
# Instalar Certbot
apt install certbot python3-certbot-nginx -y

# Obter certificado SSL gratuito
certbot --nginx -d linktree.ivillar.com.br

# Configurar renovação automática
crontab -e
# Adicionar esta linha:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 🎯 7. Criar Serviço Systemd (Opcional)

```bash
# Criar arquivo de serviço
cat > /etc/systemd/system/linktree.service << 'EOF'
[Unit]
Description=Lumiar Linktree Flask App
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/linktree
Environment="PATH=/var/www/linktree/venv/bin"
ExecStart=/var/www/linktree/venv/bin/gunicorn --config gunicorn.conf.py app:app
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Ativar e iniciar serviço
systemctl daemon-reload
systemctl enable linktree
systemctl start linktree
systemctl status linktree
```

## 🧪 8. Testes Finais

```bash
# Testar aplicação localmente
curl http://localhost:5000

# Testar através do Nginx
curl http://localhost
curl http://linktree.ivillar.com.br

# Testar HTTPS (após SSL)
curl https://linktree.ivillar.com.br

# Usar scripts de teste
./quick-run.sh test
```

## 📋 9. Monitoramento e Logs

```bash
# Ver logs em tempo real
./quick-logs.sh all
./logs-monitor.sh

# Logs específicos
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
tail -f gunicorn.log

# Status dos serviços
./quick-run.sh status
systemctl status nginx
systemctl status linktree
```

## 🛠️ 10. Comandos de Manutenção

```bash
# Reiniciar aplicação
./quick-run.sh restart

# Parar aplicação
./quick-run.sh stop

# Backup
./backup.sh

# Configurar backup automático
./setup-backup-cron.sh

# Ver processos rodando
ps aux | grep gunicorn
ps aux | grep nginx
```

## 🚨 Troubleshooting

### Problema: Aplicação não inicia
```bash
# Verificar logs de erro
journalctl -u linktree -n 50
./quick-logs.sh gunicorn

# Verificar dependências
source venv/bin/activate
pip list | grep -E "(flask|gunicorn)"

# Testar manualmente
python3 app.py
```

### Problema: Nginx retorna 502
```bash
# Verificar se app está rodando
curl http://localhost:5000

# Verificar configuração nginx
nginx -t

# Reiniciar serviços
systemctl restart nginx
systemctl restart linktree
```

### Problema: Domínio não funciona
```bash
# Verificar configuração DNS
nslookup linktree.ivillar.com.br

# Verificar arquivo nginx
cat /etc/nginx/sites-available/linktree

# Verificar se está ativado
ls -la /etc/nginx/sites-enabled/
```

### Problema: Permissões
```bash
# Corrigir propriedade dos arquivos
chown -R www-data:www-data /var/www/linktree

# Corrigir permissões
chmod 755 /var/www/linktree
chmod +x /var/www/linktree/*.sh
chmod 644 /var/www/linktree/*.py
```

## 📱 URLs Finais

Após deploy completo:
- **Desenvolvimento**: http://IP_VPS:5000
- **Produção HTTP**: http://linktree.ivillar.com.br
- **Produção HTTPS**: https://linktree.ivillar.com.br

## 📞 Comandos de Emergência

```bash
# Parar tudo
pkill -f gunicorn
systemctl stop nginx
systemctl stop linktree

# Verificar portas em uso
netstat -tlnp | grep :80
netstat -tlnp | grep :5000

# Reiniciar servidor (último recurso)
reboot
```

---

**💡 Dica**: Mantenha este guia aberto durante o deploy para consulta rápida dos comandos!