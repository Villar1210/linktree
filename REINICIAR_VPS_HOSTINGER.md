# 🚀 Deploy na VPS Hostinger

## 📋 Pré-requisitos

- Acesso SSH à VPS Hostinger
- Node.js 18+ instalado na VPS
- Git instalado na VPS
- PM2 ou similar para gerenciar processos

## 🔐 1. Configurar Acesso SSH

### No seu computador local:

```bash
# Conectar à VPS (substitua com seus dados)
ssh usuario@seu-ip-vps

# Ou se usar porta customizada:
ssh -p 22 usuario@seu-ip-vps
```

### Configurar chave SSH (recomendado):

```bash
# Gerar chave SSH (se não tiver)
ssh-keygen -t rsa -b 4096 -C "seu-email@example.com"

# Copiar chave para VPS
ssh-copy-id usuario@seu-ip-vps
```

## 🛠️ 2. Configurar VPS (Primeira Vez)

### 2.1 Instalar Node.js e PM2

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalação
node --version
npm --version

# Instalar PM2 globalmente
sudo npm install -g pm2

# Instalar Nginx (para servir a aplicação)
sudo apt install -y nginx
```

### 2.2 Clonar Repositório

```bash
# Navegar para diretório web
cd /var/www

# Clonar repositório
sudo git clone https://github.com/Villar1210/linktree.git
cd linktree

# Dar permissões
sudo chown -R $USER:$USER /var/www/linktree
```

### 2.3 Configurar Variáveis de Ambiente

```bash
# Criar arquivo .env.local
nano .env.local
```

Cole suas credenciais do Supabase:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-aqui
```

Salve com `Ctrl+O`, Enter, `Ctrl+X`

### 2.4 Instalar Dependências e Build

```bash
# Instalar dependências
npm install

# Build de produção
npm run build
```

### 2.5 Configurar PM2

```bash
# Criar arquivo de configuração PM2
nano ecosystem.config.js
```

Cole:
```javascript
module.exports = {
  apps: [{
    name: 'linktree',
    script: 'npx',
    args: 'serve -s dist -l 3000',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
}
```

```bash
# Instalar serve
npm install -g serve

# Iniciar aplicação
pm2 start ecosystem.config.js

# Salvar configuração PM2
pm2 save

# Configurar PM2 para iniciar no boot
pm2 startup
# Execute o comando que aparecer (começa com sudo)
```

### 2.6 Configurar Nginx

```bash
# Criar configuração Nginx
sudo nano /etc/nginx/sites-available/linktree
```

Cole:
```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/linktree /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### 2.7 Configurar SSL (HTTPS) - Opcional mas Recomendado

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado SSL
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com

# Renovação automática já está configurada!
```

## 🔄 3. Atualizar Aplicação (Após Commits)

### Opção A: Manual via SSH

```bash
# Conectar à VPS
ssh usuario@seu-ip-vps

# Navegar para o projeto
cd /var/www/linktree

# Puxar últimas alterações
git pull origin master

# Reinstalar dependências (se package.json mudou)
npm install

# Rebuild
npm run build

# Reiniciar PM2
pm2 restart linktree
```

### Opção B: Script Automatizado (Recomendado)

Crie um script `deploy.sh` na VPS:

```bash
nano /var/www/linktree/deploy.sh
```

Cole:
```bash
#!/bin/bash
echo "🚀 Iniciando deploy..."

cd /var/www/linktree

echo "📥 Puxando alterações do GitHub..."
git pull origin master

echo "📦 Instalando dependências..."
npm install

echo "🔨 Fazendo build..."
npm run build

echo "🔄 Reiniciando aplicação..."
pm2 restart linktree

echo "✅ Deploy concluído!"
pm2 status
```

```bash
# Dar permissão de execução
chmod +x /var/www/linktree/deploy.sh

# Executar deploy
./deploy.sh
```

## 🤖 4. Automatizar com GitHub Actions (Opcional)

Crie `.github/workflows/deploy.yml` no repositório:

```yaml
name: Deploy to VPS

on:
  push:
    branches: [ master ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /var/www/linktree
            ./deploy.sh
```

Configure os secrets no GitHub:
- `VPS_HOST`: IP da VPS
- `VPS_USER`: usuário SSH
- `VPS_SSH_KEY`: chave privada SSH

## 📊 Comandos Úteis PM2

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs linktree

# Monitorar
pm2 monit

# Parar aplicação
pm2 stop linktree

# Reiniciar
pm2 restart linktree

# Deletar do PM2
pm2 delete linktree
```

## 🔍 Troubleshooting

### Aplicação não inicia
```bash
pm2 logs linktree --lines 50
```

### Nginx não funciona
```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

### Porta 3000 em uso
```bash
sudo lsof -i :3000
# Matar processo se necessário
sudo kill -9 PID
```

### Verificar se aplicação está rodando
```bash
curl http://localhost:3000
```

## 🎯 Checklist Rápido

- [ ] VPS configurada com Node.js e PM2
- [ ] Repositório clonado em `/var/www/linktree`
- [ ] `.env.local` configurado com credenciais Supabase
- [ ] Build realizado (`npm run build`)
- [ ] PM2 rodando a aplicação
- [ ] Nginx configurado como proxy reverso
- [ ] SSL configurado (opcional)
- [ ] Script de deploy criado
- [ ] GitHub Actions configurado (opcional)

---

**Pronto!** Agora toda vez que fizer push para o GitHub, basta rodar o script de deploy na VPS ou deixar o GitHub Actions fazer automaticamente! 🚀
