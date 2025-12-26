
# Script para Sincronizar com GitHub
# ----------------------------------
Write-Host "🔄 Iniciando sincronização com GitHub..." -ForegroundColor Cyan

# 1. Adicionar todos os arquivos
Write-Host "📂 Adicionando arquivos..."
git add .

# 2. Commit (com data/hora)
$date = Get-Date -Format "dd/MM/yyyy HH:mm"
$message = "Atualização CRM e Login: $date"
Write-Host "💾 Criando commit: $message"
git commit -m "$message"

# 3. Push
Write-Host "🚀 Enviando para o GitHub..."
git push origin master

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Sincronização concluída com sucesso!" -ForegroundColor Green
    Write-Host "🔗 Agora você pode conectar este repositório no Supabase." -ForegroundColor Green
}
else {
    Write-Host "❌ Erro ao enviar. Verifique sua conexão ou permissões." -ForegroundColor Red
}


