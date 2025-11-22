# 🚀 GUIA COMPLETO - Upload para VPS Hostinger

## 📦 Arquivos Preparados

✅ **lumiar-linktree-hostinger-deploy.zip** (47 KB) - Arquivo principal com todos os componentes
✅ Scripts de upload automatizados criados
✅ Documentação completa de deploy

## 🎯 3 Métodos de Upload Disponíveis

### 🔥 Método 1: Script Automático PowerShell (Windows)
```powershell
# Execute no PowerShell
cd C:\linktree
.\upload-to-vps.ps1
```
**Vantagens**: Automático, cria ZIP, faz upload via SCP
**Requisitos**: Windows 10+ com OpenSSH ou Git Bash

### 🛠️ Método 2: Script Bash (WSL/Linux)
```bash
# Execute no WSL ou Linux
cd /mnt/c/linktree  # ou caminho Linux
chmod +x upload-to-vps.sh
./upload-to-vps.sh
```
**Vantagens**: Controle total, suporte a múltiplos formatos
**Requisitos**: WSL, Git Bash ou Linux

### 📂 Método 3: Upload Manual (Mais Simples)
**Arquivo**: `lumiar-linktree-hostinger-deploy.zip`

#### Opção 3A: WinSCP (Recomendado)
1. Baixar: https://winscp.net/
2. Conectar na VPS:
   - Host: **IP_DA_VPS_HOSTINGER**
   - Usuário: **root**
   - Porta: **22**
3. Enviar `lumiar-linktree-hostinger-deploy.zip` para `/tmp/`

#### Opção 3B: FileZilla
1. Baixar: https://filezilla-project.org/
2. Protocolo: **SFTP**
3. Mesmo processo do WinSCP

#### Opção 3C: Painel Hostinger (se disponível)
1. Acessar painel da VPS
2. File Manager
3. Upload do arquivo ZIP

## 📋 Informações Necessárias da Hostinger

Você precisará de:
- **IP da VPS**: Fornecido no painel Hostinger
- **Usuário SSH**: Geralmente `root`
- **Senha SSH**: Fornecida no painel
- **Porta SSH**: Geralmente `22`

### Como encontrar no painel Hostinger:
1. Login no painel Hostinger
2. Ir em "VPS" → Sua VPS
3. Seção "SSH Access" ou "Server Details"

## 🖥️ Comandos no Servidor (Após Upload)

### Conectar na VPS:
```bash
ssh root@IP_DA_VPS
```

### Extrair e instalar:
```bash
# Ir para diretório temporário
cd /tmp

# Extrair arquivos
unzip lumiar-linktree-hostinger-deploy.zip -d /var/www/linktree

# Ir para o projeto
cd /var/www/linktree

# Dar permissões
chmod +x *.sh

# Instalar tudo automaticamente
./install.sh

# Configurar Nginx
./configure-nginx.sh

# Iniciar aplicação
./quick-run.sh daemon
```

## 🌐 Configurar Domínio

### No Painel Hostinger:
1. **DNS Zone Editor**
2. Adicionar registro A:
   - Type: **A**
   - Name: **linktree**
   - Points to: **IP_DA_VPS**
   - TTL: **3600**

### Testar DNS:
```bash
nslookup linktree.ivillar.com.br
```

## 🔒 SSL Gratuito (HTTPS)

```bash
# No servidor, após domínio configurado
apt install certbot python3-certbot-nginx -y
certbot --nginx -d linktree.ivillar.com.br
```

## 📱 URLs Finais

- **HTTP**: http://linktree.ivillar.com.br
- **HTTPS**: https://linktree.ivillar.com.br (após SSL)

## 🛟 Suporte e Troubleshooting

### Documentos incluídos no ZIP:
- **DEPLOY_HOSTINGER.md** - Guia completo de deploy
- **SSH_COMMANDS.md** - Comandos SSH passo a passo
- **LOGS_COMMANDS.md** - Monitoramento e logs
- **BACKUP_GUIDE.md** - Sistema de backup

### Scripts úteis no servidor:
```bash
./quick-run.sh status    # Ver status da aplicação
./quick-run.sh logs      # Ver logs recentes
./quick-run.sh test      # Testar conectividade
./quick-logs.sh all      # Logs em tempo real
./backup.sh              # Fazer backup
```

## 🎯 Checklist de Deploy

- [ ] 1. **Upload** - Enviar arquivo ZIP para VPS
- [ ] 2. **SSH** - Conectar no servidor
- [ ] 3. **Extrair** - Descompactar arquivos
- [ ] 4. **Instalar** - Executar `./install.sh`
- [ ] 5. **DNS** - Configurar linktree.ivillar.com.br
- [ ] 6. **Nginx** - Executar `./configure-nginx.sh`
- [ ] 7. **Iniciar** - Executar `./quick-run.sh daemon`
- [ ] 8. **Testar** - Acessar http://linktree.ivillar.com.br
- [ ] 9. **SSL** - Configurar HTTPS com certbot
- [ ] 10. **Backup** - Executar `./setup-backup-cron.sh`

## 🚨 Contatos de Emergência

Se algo der errado:
1. Verificar logs: `./quick-logs.sh all`
2. Status: `./quick-run.sh status`
3. Reiniciar: `./quick-run.sh restart`

---

**🎉 Tudo pronto para deploy! Escolha um método de upload e siga os comandos SSH.**

**Arquivo principal**: `lumiar-linktree-hostinger-deploy.zip` (47 KB)