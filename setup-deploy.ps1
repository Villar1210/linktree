# 🚀 Script de Configuração Automática - SSH e GitHub Secrets
# ============================================================
# Este script automatiza a configuração completa do deploy automático

param(
    [switch]$SkipVPS,
    [switch]$SkipGitHub
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Iniciando configuração automática de deploy..." -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

# Variáveis
$VPS_HOST = "72.61.41.119"
$VPS_USER = "root"
$SSH_KEY_NAME = "id_rsa_linktree"
$SSH_DIR = "$env:USERPROFILE\.ssh"
$PRIVATE_KEY = "$SSH_DIR\$SSH_KEY_NAME"
$PUBLIC_KEY = "$SSH_DIR\$SSH_KEY_NAME.pub"

# Função para verificar se comando existe
function Test-Command {
    param($Command)
    $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

# ============================================================
# ETAPA 1: Verificar chave SSH
# ============================================================
Write-Host "`n📋 Etapa 1: Verificando chave SSH..." -ForegroundColor Yellow

if (Test-Path $PRIVATE_KEY) {
    Write-Host "✅ Chave SSH já existe: $PRIVATE_KEY" -ForegroundColor Green
} else {
    Write-Host "❌ Chave SSH não encontrada!" -ForegroundColor Red
    Write-Host "Execute primeiro: ssh-keygen -t rsa -b 4096 -C 'deploy@linktree' -f '$PRIVATE_KEY' -N ''" -ForegroundColor Yellow
    exit 1
}

# Ler chaves
$publicKeyContent = Get-Content $PUBLIC_KEY -Raw
$privateKeyContent = Get-Content $PRIVATE_KEY -Raw

Write-Host "✅ Chaves SSH carregadas" -ForegroundColor Green

# ============================================================
# ETAPA 2: Configurar VPS
# ============================================================
if (-not $SkipVPS) {
    Write-Host "`n📋 Etapa 2: Configurando VPS..." -ForegroundColor Yellow
    
    # Verificar se ssh está disponível
    if (-not (Test-Command ssh)) {
        Write-Host "❌ SSH não encontrado! Instale o OpenSSH." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Conectando em $VPS_USER@$VPS_HOST..." -ForegroundColor Cyan
    
    # Criar script temporário para executar na VPS
    $vpsScript = @"
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo '$publicKeyContent' >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
echo 'Chave SSH adicionada com sucesso!'
"@
    
    # Salvar script temporário
    $tempScript = "$env:TEMP\setup_vps.sh"
    $vpsScript | Out-File -FilePath $tempScript -Encoding UTF8 -NoNewline
    
    Write-Host "📤 Enviando chave pública para VPS..." -ForegroundColor Cyan
    
    try {
        # Executar script na VPS
        ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_HOST" "bash -s" < $tempScript
        Write-Host "✅ Chave pública adicionada na VPS com sucesso!" -ForegroundColor Green
        
        # Testar conexão
        Write-Host "`n🔍 Testando conexão SSH..." -ForegroundColor Cyan
        ssh -i $PRIVATE_KEY -o StrictHostKeyChecking=no "$VPS_USER@$VPS_HOST" "echo 'Conexão SSH funcionando!'"
        Write-Host "✅ Conexão SSH testada com sucesso!" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Erro ao configurar VPS: $_" -ForegroundColor Red
        Write-Host "Você pode fazer manualmente seguindo SSH_GITHUB_CONFIG.md" -ForegroundColor Yellow
    }
    finally {
        Remove-Item $tempScript -ErrorAction SilentlyContinue
    }
} else {
    Write-Host "`n⏭️  Pulando configuração da VPS (use -SkipVPS:$false para incluir)" -ForegroundColor Gray
}

# ============================================================
# ETAPA 3: Configurar GitHub Secrets
# ============================================================
if (-not $SkipGitHub) {
    Write-Host "`n📋 Etapa 3: Configurando GitHub Secrets..." -ForegroundColor Yellow
    
    # Verificar se gh (GitHub CLI) está instalado
    if (Test-Command gh) {
        Write-Host "✅ GitHub CLI encontrado" -ForegroundColor Green
        
        # Verificar autenticação
        $ghAuth = gh auth status 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Autenticado no GitHub" -ForegroundColor Green
            
            try {
                Write-Host "`n📤 Adicionando secrets no GitHub..." -ForegroundColor Cyan
                
                # Adicionar VPS_HOST
                Write-Host "  → Adicionando VPS_HOST..." -ForegroundColor Gray
                echo $VPS_HOST | gh secret set VPS_HOST -R Villar1210/linktree
                
                # Adicionar VPS_USER
                Write-Host "  → Adicionando VPS_USER..." -ForegroundColor Gray
                echo $VPS_USER | gh secret set VPS_USER -R Villar1210/linktree
                
                # Adicionar VPS_SSH_KEY
                Write-Host "  → Adicionando VPS_SSH_KEY..." -ForegroundColor Gray
                Get-Content $PRIVATE_KEY -Raw | gh secret set VPS_SSH_KEY -R Villar1210/linktree
                
                Write-Host "✅ Todos os secrets adicionados com sucesso!" -ForegroundColor Green
            }
            catch {
                Write-Host "❌ Erro ao adicionar secrets: $_" -ForegroundColor Red
                Write-Host "Adicione manualmente em: https://github.com/Villar1210/linktree/settings/secrets/actions" -ForegroundColor Yellow
            }
        } else {
            Write-Host "❌ Não autenticado no GitHub CLI" -ForegroundColor Red
            Write-Host "Execute: gh auth login" -ForegroundColor Yellow
            Write-Host "Ou adicione os secrets manualmente em:" -ForegroundColor Yellow
            Write-Host "https://github.com/Villar1210/linktree/settings/secrets/actions" -ForegroundColor Cyan
        }
    } else {
        Write-Host "⚠️  GitHub CLI não encontrado" -ForegroundColor Yellow
        Write-Host "Instale com: winget install GitHub.cli" -ForegroundColor Cyan
        Write-Host "`nOu adicione os secrets manualmente:" -ForegroundColor Yellow
        Write-Host "https://github.com/Villar1210/linktree/settings/secrets/actions" -ForegroundColor Cyan
        Write-Host "`nSecrets necessários:" -ForegroundColor Yellow
        Write-Host "  VPS_HOST = $VPS_HOST" -ForegroundColor Gray
        Write-Host "  VPS_USER = $VPS_USER" -ForegroundColor Gray
        Write-Host "  VPS_SSH_KEY = (conteúdo de $PRIVATE_KEY)" -ForegroundColor Gray
    }
} else {
    Write-Host "`n⏭️  Pulando configuração do GitHub (use -SkipGitHub:$false para incluir)" -ForegroundColor Gray
}

# ============================================================
# ETAPA 4: Configurar SSH Config
# ============================================================
Write-Host "`n📋 Etapa 4: Configurando SSH Config..." -ForegroundColor Yellow

$sshConfigFile = "$SSH_DIR\config"
$sshConfigEntry = @"

# Linktree VPS
Host linktree-vps
    HostName $VPS_HOST
    User $VPS_USER
    IdentityFile $PRIVATE_KEY
    StrictHostKeyChecking no
"@

if (Test-Path $sshConfigFile) {
    $currentConfig = Get-Content $sshConfigFile -Raw
    if ($currentConfig -notmatch "Host linktree-vps") {
        Add-Content -Path $sshConfigFile -Value $sshConfigEntry
        Write-Host "✅ Entrada adicionada ao SSH config" -ForegroundColor Green
    } else {
        Write-Host "✅ SSH config já contém entrada para linktree-vps" -ForegroundColor Green
    }
} else {
    $sshConfigEntry | Out-File -FilePath $sshConfigFile -Encoding UTF8
    Write-Host "✅ SSH config criado com entrada para linktree-vps" -ForegroundColor Green
}

Write-Host "`nAgora você pode conectar com: ssh linktree-vps" -ForegroundColor Cyan

# ============================================================
# RESUMO FINAL
# ============================================================
Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "✅ CONFIGURAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host ("=" * 60) -ForegroundColor Cyan

Write-Host "`n📊 Resumo:" -ForegroundColor Yellow
Write-Host "  ✅ Chaves SSH verificadas" -ForegroundColor Green
if (-not $SkipVPS) {
    Write-Host "  ✅ VPS configurada" -ForegroundColor Green
}
if (-not $SkipGitHub) {
    Write-Host "  ✅ GitHub Secrets configurados (ou instruções fornecidas)" -ForegroundColor Green
}
Write-Host "  ✅ SSH Config atualizado" -ForegroundColor Green

Write-Host "`n🚀 Próximos passos:" -ForegroundColor Yellow
Write-Host "  1. Teste a conexão: ssh linktree-vps" -ForegroundColor Cyan
Write-Host "  2. Faça um commit e push para testar o deploy automático" -ForegroundColor Cyan
Write-Host "  3. Acompanhe em: https://github.com/Villar1210/linktree/actions" -ForegroundColor Cyan

Write-Host "`n✨ Deploy automático configurado com sucesso!" -ForegroundColor Green
