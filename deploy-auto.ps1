# Script PowerShell para deploy incremental e reinício automático da aplicação na VPS
# Configurações
$LocalPath = "C:\linktree"
$RemotePath = "/var/www/linktree"
$VPS_IP = "72.61.41.119"
$SSH_USER = "root"
$SSH_PORT = "22"

# 1. Listar arquivos modificados nas últimas 24h
Write-Host ("Arquivos modificados nas últimas 24h em {0}:" -f $LocalPath)
$changed = Get-ChildItem -Recurse -Path $LocalPath | Where-Object { $_.LastWriteTime -gt (Get-Date).AddDays(-1) -and -not $_.PSIsContainer }
$changed | Select-Object FullName, LastWriteTime

# 2. Fazer upload dos arquivos alterados via SCP
foreach ($file in $changed) {
    $relative = $file.FullName.Substring($LocalPath.Length).TrimStart('\')
    $remoteFile = $RemotePath + "/" + ($relative -replace '\\','/')
    $remoteDir = [System.IO.Path]::GetDirectoryName($remoteFile)
    # Cria diretório remoto se necessário
    ssh -p $SSH_PORT "$SSH_USER@$VPS_IP" "mkdir -p '$remoteDir'"
    # Envia arquivo
    $scpCmd = 'scp -P ' + $SSH_PORT + ' "' + $file.FullName + '" ' + $SSH_USER + '@' + $VPS_IP + ':"' + $remoteFile + '"'
    Write-Host "Executando: $scpCmd"
    Invoke-Expression $scpCmd
    Write-Host ("Enviado: {0}" -f $relative)
}

# 3. Reiniciar aplicação na VPS
Write-Host "Reiniciando aplicação na VPS..."
$restartCmd = "cd $RemotePath; pkill -f gunicorn; ./quick-run.sh daemon"
ssh -p $SSH_PORT "$SSH_USER@$VPS_IP" $restartCmd

Write-Host "Deploy concluído e aplicação reiniciada!"