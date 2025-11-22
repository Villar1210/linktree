# Script PowerShell para atualizar proxy_pass do nginx para porta 8000
# Salve como update_nginx_port.ps1 e execute como administrador/root na VPS

$nginxConf = "/etc/nginx/sites-available/linktree.ivillar.com.br"

# Ler conteúdo
$content = Get-Content $nginxConf

# Substituir proxy_pass para porta 8000
$content = $content -replace 'proxy_pass http://127.0.0.1:5000;', 'proxy_pass http://127.0.0.1:8000;'

# Salvar de volta
Set-Content -Path $nginxConf -Value $content

# Reiniciar nginx
Write-Host "Reiniciando nginx..."
sudo systemctl restart nginx
Write-Host "Atualização concluída. Teste o acesso no navegador."
