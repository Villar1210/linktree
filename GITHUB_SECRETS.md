# 📝 Configurar Secrets no GitHub

Para o GitHub Actions funcionar, você precisa configurar os secrets do repositório:

## 1. Acessar Settings do Repositório

1. Vá para: https://github.com/Villar1210/linktree
2. Clique em **Settings** (aba superior)
3. No menu lateral esquerdo, clique em **Secrets and variables** → **Actions**
4. Clique em **New repository secret**

## 2. Adicionar os Secrets

Crie os seguintes secrets (um por vez):

### VPS_HOST
- **Name**: `VPS_HOST`
- **Value**: O IP ou domínio da sua VPS Hostinger (ex: `123.45.67.89` ou `vps.seudominio.com`)

### VPS_USER
- **Name**: `VPS_USER`
- **Value**: Usuário SSH da VPS (geralmente `root` ou `ubuntu`)

### VPS_SSH_KEY
- **Name**: `VPS_SSH_KEY`
- **Value**: Sua chave privada SSH completa

**Como obter a chave SSH:**

No seu computador local (Windows), execute:
```powershell
# Se você já tem uma chave SSH
Get-Content $env:USERPROFILE\.ssh\id_rsa

# Se não tem, crie uma nova:
ssh-keygen -t rsa -b 4096 -C "seu-email@example.com"
# Pressione Enter para aceitar o local padrão
# Depois copie a chave:
Get-Content $env:USERPROFILE\.ssh\id_rsa
```

Copie TODO o conteúdo (incluindo `-----BEGIN RSA PRIVATE KEY-----` e `-----END RSA PRIVATE KEY-----`)

**Depois, adicione a chave pública na VPS:**
```powershell
# Copiar chave pública
Get-Content $env:USERPROFILE\.ssh\id_rsa.pub

# Conecte na VPS e adicione ao authorized_keys:
# ssh usuario@ip-vps
# nano ~/.ssh/authorized_keys
# Cole a chave pública e salve
```

### VPS_PORT (Opcional)
- **Name**: `VPS_PORT`
- **Value**: Porta SSH (padrão é `22`, só crie se usar porta diferente)

## 3. Testar o Deploy Automático

Após configurar os secrets:

1. Faça qualquer alteração no código
2. Commit e push para o GitHub:
   ```powershell
   git add .
   git commit -m "Test: configurar GitHub Actions"
   git push origin master
   ```
3. Vá em **Actions** no GitHub para ver o deploy rodando
4. Se der erro, clique no workflow para ver os logs

## ✅ Pronto!

Agora toda vez que você fizer push para `master`, o GitHub Actions vai:
1. Conectar na VPS via SSH
2. Fazer `git pull`
3. Instalar dependências
4. Fazer build
5. Reiniciar a aplicação com PM2

---

**Nota**: Se preferir deploy manual, basta conectar na VPS e rodar:
```bash
cd /var/www/linktree
./deploy-vps.sh
```
