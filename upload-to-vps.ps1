# 📤 Upload para VPS Hostinger - PowerShell
# Script para Windows

# Cores para output
$Red = "`e[31m"
$Green = "`e[32m"
$Yellow = "`e[33m"
$Blue = "`e[34m"
$Reset = "`e[0m"

Write-Host "${Blue}📤 Upload para VPS Hostinger - Windows${Reset}"
Write-Host "========================================="

# Verificar se estamos no diretório correto
if (!(Test-Path "app.py")) {
    Write-Host "${Red}❌ Execute este script no diretório do projeto (onde está o app.py)${Reset}"
    exit 1
}

# Solicitar informações da VPS
$VPS_IP = Read-Host "Digite o IP da VPS Hostinger"
$SSH_USER = Read-Host "Digite o usuário SSH (padrão: root)"
$SSH_PORT = Read-Host "Digite a porta SSH (padrão: 22)"

# Usar padrões se não informado
if ([string]::IsNullOrEmpty($SSH_USER)) { $SSH_USER = "root" }
if ([string]::IsNullOrEmpty($SSH_PORT)) { $SSH_PORT = "22" }

Write-Host ""
Write-Host "${Blue}📋 Informações de conexão:${Reset}"
Write-Host "IP: $VPS_IP"
Write-Host "Usuário: $SSH_USER"
Write-Host "Porta: $SSH_PORT"
Write-Host ""

# Confirmar antes de continuar
$confirm = Read-Host "As informações estão corretas? (y/n)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Upload cancelado."
    exit 1
}

# Lista de arquivos/pastas essenciais
$FilesToUpload = @(
    "app.py",
    "requirements.txt", 
    "gunicorn.conf.py",
    "nginx-linktree.conf",
    "data",
    "static",
    "templates",
    "install.sh",
    "configure-nginx.sh", 
    "run.sh",
    "quick-run.sh",
    "backup.sh",
    "logs-monitor.sh",
    "quick-logs.sh",
    "setup-backup-cron.sh",
    "DEPLOY_HOSTINGER.md",
    "LOGS_COMMANDS.md",
    "BACKUP_GUIDE.md",
    "README.md"
)

# Verificar se todos os arquivos existem
Write-Host "${Yellow}📦 Verificando arquivos...${Reset}"
$MissingFiles = @()
foreach ($file in $FilesToUpload) {
    if (Test-Path $file) {
        Write-Host "${Green}✅ $file${Reset}"
    } else {
        $MissingFiles += $file
        Write-Host "${Yellow}⚠️  Arquivo não encontrado: $file${Reset}"
    }
}

if ($MissingFiles.Count -gt 0) {
    Write-Host ""
    Write-Host "${Yellow}Alguns arquivos não foram encontrados, mas continuaremos com os disponíveis.${Reset}"
}

# Criar arquivo ZIP
$ZipFileName = "lumiar-linktree-$(Get-Date -Format 'yyyyMMdd_HHmmss').zip"
Write-Host ""
Write-Host "${Blue}📦 Criando $ZipFileName...${Reset}"

try {
    # Criar arquivo ZIP usando PowerShell 5+
    $ExistingFiles = $FilesToUpload | Where-Object { Test-Path $_ }
    
    if ($ExistingFiles.Count -gt 0) {
        Compress-Archive -Path $ExistingFiles -DestinationPath $ZipFileName -Force
        
        $ZipSize = (Get-Item $ZipFileName).Length
        $ZipSizeMB = [math]::Round($ZipSize / 1MB, 2)
        Write-Host "${Green}✅ Arquivo criado: $ZipFileName ($ZipSizeMB MB)${Reset}"
    } else {
        Write-Host "${Red}❌ Nenhum arquivo para compactar${Reset}"
        exit 1
    }
} catch {
    Write-Host "${Red}❌ Erro ao criar ZIP: $($_.Exception.Message)${Reset}"
    exit 1
}

Write-Host ""
Write-Host "${Blue}🚀 Preparando upload...${Reset}"

# Verificar se SCP está disponível (Windows 10+ ou Git Bash)
$ScpAvailable = $false
try {
    $null = Get-Command scp -ErrorAction Stop
    $ScpAvailable = $true
    Write-Host "${Green}✅ SCP disponível${Reset}"
} catch {
    Write-Host "${Yellow}⚠️  SCP não encontrado${Reset}"
}

if ($ScpAvailable) {
    # Upload via SCP
    Write-Host "${Blue}📤 Enviando via SCP...${Reset}"
    
    $ScpCommand = "scp -P $SSH_PORT -o ConnectTimeout=30 -o StrictHostKeyChecking=no `"$ZipFileName`" `"$SSH_USER@${VPS_IP}:/tmp/`""
    
    Write-Host "Executando: $ScpCommand"
    
    try {
        Invoke-Expression $ScpCommand
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "${Green}🎉 Upload concluído com sucesso!${Reset}"
            
            # Instruções pós-upload
            Write-Host ""
            Write-Host "${Blue}📋 Próximos passos no servidor:${Reset}"
            Write-Host "1. Conectar via SSH:"
            Write-Host "   ssh $SSH_USER@$VPS_IP"
            Write-Host ""
            Write-Host "2. Extrair arquivos:"
            Write-Host "   cd /tmp"
            Write-Host "   unzip $ZipFileName -d /var/www/linktree"
            Write-Host ""
            Write-Host "3. Ir para o diretório e instalar:"
            Write-Host "   cd /var/www/linktree"
            Write-Host "   chmod +x *.sh"
            Write-Host "   ./install.sh"
            Write-Host ""
            Write-Host "4. Configurar e iniciar:"
            Write-Host "   ./configure-nginx.sh"
            Write-Host "   ./quick-run.sh daemon"
            
        } else {
            Write-Host "${Red}❌ Falha no upload via SCP${Reset}"
            $ScpAvailable = $false
        }
    } catch {
        Write-Host "${Red}❌ Erro no upload: $($_.Exception.Message)${Reset}"
        $ScpAvailable = $false
    }
}

if (-not $ScpAvailable) {
    # Instruções para upload manual
    Write-Host ""
    Write-Host "${Yellow}📋 Upload manual necessário${Reset}"
    Write-Host "=================================="
    Write-Host ""
    Write-Host "${Blue}Opção 1 - WinSCP (Recomendado):${Reset}"
    Write-Host "1. Baixar WinSCP: https://winscp.net/"
    Write-Host "2. Conectar com:"
    Write-Host "   - Host: $VPS_IP"
    Write-Host "   - Usuário: $SSH_USER"
    Write-Host "   - Porta: $SSH_PORT"
    Write-Host "3. Enviar arquivo: $ZipFileName para /tmp/"
    Write-Host ""
    Write-Host "${Blue}Opção 2 - FileZilla:${Reset}"
    Write-Host "1. Baixar FileZilla: https://filezilla-project.org/"
    Write-Host "2. Protocolo: SFTP"
    Write-Host "3. Host: $VPS_IP, Porta: $SSH_PORT"
    Write-Host "4. Usuário: $SSH_USER"
    Write-Host "5. Enviar $ZipFileName para /tmp/"
    Write-Host ""
    Write-Host "${Blue}Opção 3 - PowerShell SSH:${Reset}"
    Write-Host "# Instalar OpenSSH se não tiver:"
    Write-Host "Add-WindowsCapability -Online -Name OpenSSH.Client"
    Write-Host ""
    Write-Host "# Depois executar:"
    Write-Host "scp -P $SSH_PORT `"$ZipFileName`" $SSH_USER@${VPS_IP}:/tmp/"
}

# Oferecer para abrir FileZilla ou WinSCP se disponível
Write-Host ""
$OpenTool = Read-Host "Deseja abrir ferramenta de FTP? (w=WinSCP, f=FileZilla, n=não)"

switch ($OpenTool.ToLower()) {
    "w" {
        try {
            # Tentar abrir WinSCP
            Start-Process "winscp.exe" -ArgumentList "scp://$SSH_USER@${VPS_IP}:$SSH_PORT"
        } catch {
            Write-Host "${Yellow}WinSCP não encontrado. Baixe em: https://winscp.net/${Reset}"
        }
    }
    "f" {
        try {
            # Tentar abrir FileZilla
            Start-Process "filezilla.exe"
        } catch {
            Write-Host "${Yellow}FileZilla não encontrado. Baixe em: https://filezilla-project.org/${Reset}"
        }
    }
}

# Opção de manter ou remover ZIP
Write-Host ""
$KeepZip = Read-Host "Deseja manter o arquivo $ZipFileName localmente? (y/n)"
if ($KeepZip -ne "y" -and $KeepZip -ne "Y") {
    Remove-Item $ZipFileName -Force
    Write-Host "${Green}Arquivo temporário removido.${Reset}"
} else {
    Write-Host "${Blue}Arquivo mantido: $ZipFileName${Reset}"
}

Write-Host ""
Write-Host "${Blue}📖 Documentação completa:${Reset}"
Write-Host "Consulte DEPLOY_HOSTINGER.md para guia detalhado"
Write-Host ""
Write-Host "${Green}✨ Preparação concluída! Faça o upload e execute a instalação no servidor.${Reset}"

# Mostrar comandos SSH para copiar
Write-Host ""
Write-Host "${Blue}📋 Comandos para executar no servidor (copie):${Reset}"
Write-Host "ssh $SSH_USER@$VPS_IP"
Write-Host "cd /tmp"
Write-Host "unzip $ZipFileName -d /var/www/linktree"
Write-Host "cd /var/www/linktree"
Write-Host "chmod +x *.sh"
Write-Host "./install.sh"