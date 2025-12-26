# 📖 Guia de Uso - Scripts de Configuração Automática

## 🎯 Visão Geral

Foram criados scripts para automatizar a configuração do deploy automático:

1. **setup-deploy.ps1** - Script principal (Windows PowerShell)
2. **setup-vps.sh** - Script para rodar na VPS (Bash)

---

## 🚀 Opção 1: Configuração Automática Completa (Recomendado)

### Pré-requisitos:
- OpenSSH instalado no Windows
- GitHub CLI instalado (opcional, mas recomendado)
- Acesso SSH à VPS

### Passo a Passo:

#### 1. Instalar GitHub CLI (se ainda não tiver):
```powershell
winget install GitHub.cli
```

#### 2. Autenticar no GitHub CLI:
```powershell
gh auth login
```
Siga as instruções na tela.

#### 3. Executar o script de configuração:
```powershell
cd c:\linktree
.\setup-deploy.ps1
```

O script vai:
- ✅ Verificar as chaves SSH
- ✅ Adicionar a chave pública na VPS
- ✅ Configurar os 3 secrets no GitHub automaticamente
- ✅ Configurar o SSH config para facilitar conexões

#### 4. Testar:
```powershell
# Testar conexão SSH
ssh linktree-vps

# Fazer um commit de teste
git add .
git commit -m "Test: Deploy automático"
git push origin master
```

---

## 🔧 Opção 2: Configuração Manual com Scripts

Se não quiser instalar o GitHub CLI ou preferir fazer manualmente:

### Etapa 1: Configurar VPS

**Opção A - Executar script remotamente:**
```powershell
cd c:\linktree
ssh root@72.61.41.119 'bash -s' < setup-vps.sh
```

**Opção B - Copiar e executar na VPS:**
```powershell
# Copiar script para VPS
scp setup-vps.sh root@72.61.41.119:~/

# Conectar e executar
ssh root@72.61.41.119
chmod +x setup-vps.sh
./setup-vps.sh
exit
```

### Etapa 2: Configurar GitHub Secrets Manualmente

Execute o script pulando a parte do GitHub:
```powershell
.\setup-deploy.ps1 -SkipGitHub
```

Depois adicione os secrets manualmente em:
https://github.com/Villar1210/linktree/settings/secrets/actions

Os valores estão em `SSH_GITHUB_CONFIG.md`

---

## 🎛️ Opções do Script Principal

```powershell
# Executar tudo (padrão)
.\setup-deploy.ps1

# Pular configuração da VPS (só GitHub)
.\setup-deploy.ps1 -SkipVPS

# Pular configuração do GitHub (só VPS)
.\setup-deploy.ps1 -SkipGitHub

# Pular ambos (só SSH config)
.\setup-deploy.ps1 -SkipVPS -SkipGitHub
```

---

## ✅ Verificação Pós-Configuração

### 1. Testar Conexão SSH:
```powershell
ssh linktree-vps
```
Deve conectar sem pedir senha.

### 2. Verificar GitHub Secrets:
Acesse: https://github.com/Villar1210/linktree/settings/secrets/actions

Deve ter 3 secrets:
- VPS_HOST
- VPS_USER
- VPS_SSH_KEY

### 3. Testar Deploy Automático:
```powershell
# Criar arquivo de teste
echo "teste" > teste-deploy.txt
git add teste-deploy.txt
git commit -m "Test: Deploy automático funcionando"
git push origin master
```

Acompanhe em: https://github.com/Villar1210/linktree/actions

Se aparecer ✅ verde, está funcionando!

---

## 🔍 Troubleshooting

### Erro: "ssh: command not found"
Instale o OpenSSH:
```powershell
Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0
```

### Erro: "gh: command not found"
Instale o GitHub CLI:
```powershell
winget install GitHub.cli
```
Depois feche e abra o PowerShell novamente.

### Erro: "Permission denied (publickey)"
A chave não foi adicionada corretamente na VPS. Execute:
```powershell
ssh root@72.61.41.119 'bash -s' < setup-vps.sh
```

### GitHub Actions continua falhando
Verifique se os secrets foram adicionados corretamente:
```powershell
gh secret list -R Villar1210/linktree
```

Deve mostrar:
- VPS_HOST
- VPS_SSH_KEY
- VPS_USER

---

## 📚 Arquivos Relacionados

- `setup-deploy.ps1` - Script principal de configuração
- `setup-vps.sh` - Script para configurar VPS
- `SSH_GITHUB_CONFIG.md` - Guia manual detalhado
- `REINICIAR_VPS_HOSTINGER.md` - Guia de setup inicial da VPS
- `.github/workflows/deploy.yml` - Workflow do GitHub Actions

---

## 🎯 Resumo Rápido

**Configuração mais rápida (com GitHub CLI):**
```powershell
# 1. Instalar e autenticar GitHub CLI
winget install GitHub.cli
gh auth login

# 2. Executar script
cd c:\linktree
.\setup-deploy.ps1

# 3. Testar
ssh linktree-vps
git push origin master
```

**Pronto! Deploy automático configurado!** 🚀
