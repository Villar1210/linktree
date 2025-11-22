#!/bin/bash
# 🧪 Script de Teste - ivillar.com.br/linktree

echo "🧪 Testando configuração do linktree.ivillar.com.br..."
echo "=================================================="

# Verificar se o Nginx está rodando
echo "1. 🌐 Status do Nginx:"
if sudo systemctl is-active --quiet nginx; then
    echo "   ✅ Nginx está rodando"
else
    echo "   ❌ Nginx não está rodando"
    sudo systemctl status nginx --no-pager
fi

# Verificar se a aplicação Flask está rodando
echo ""
echo "2. 🏗️  Status da aplicação Linktree:"
if sudo systemctl is-active --quiet linktree; then
    echo "   ✅ Aplicação está rodando"
else
    echo "   ❌ Aplicação não está rodando"
    sudo systemctl status linktree --no-pager
fi

# Testar conectividade local
echo ""
echo "3. 🔍 Testes de conectividade:"

# Teste 1: Aplicação Flask diretamente
echo "   Testando Flask (localhost:5000)..."
if curl -s -f http://localhost:5000 > /dev/null; then
    echo "   ✅ Flask respondendo na porta 5000"
else
    echo "   ❌ Flask não está respondendo na porta 5000"
fi

# Teste 2: Nginx proxy
echo "   Testando Nginx proxy (localhost)..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost)
if [ "$response" = "200" ]; then
    echo "   ✅ Nginx proxy funcionando (HTTP $response)"
elif [ "$response" = "302" ] || [ "$response" = "301" ]; then
    echo "   ⚠️  Nginx proxy redirecionando (HTTP $response)"
else
    echo "   ❌ Nginx proxy com problemas (HTTP $response)"
fi

# Teste 3: Arquivos estáticos
echo "   Testando arquivos estáticos..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/static/style.css)
if [ "$response" = "200" ]; then
    echo "   ✅ Arquivos estáticos funcionando (HTTP $response)"
else
    echo "   ❌ Arquivos estáticos com problemas (HTTP $response)"
fi

# Verificar configuração do Nginx
echo ""
echo "4. ⚙️  Configuração do Nginx:"
if sudo nginx -t > /dev/null 2>&1; then
    echo "   ✅ Configuração do Nginx válida"
else
    echo "   ❌ Configuração do Nginx inválida"
    sudo nginx -t
fi

# Verificar logs recentes
echo ""
echo "5. 📋 Logs recentes:"
echo "   Últimos erros do Nginx:"
if [ -f "/var/log/nginx/linktree_error.log" ]; then
    tail -n 5 /var/log/nginx/linktree_error.log 2>/dev/null || echo "   📝 Nenhum erro recente"
else
    echo "   📝 Arquivo de log não encontrado"
fi

echo "   Últimos logs da aplicação:"
if [ -f "/var/www/linktree/logs/app.log" ]; then
    tail -n 5 /var/www/linktree/logs/app.log 2>/dev/null || echo "   📝 Nenhum log recente"
else
    echo "   📝 Arquivo de log não encontrado"
fi

# Verificar portas em uso
echo ""
echo "6. 🔌 Portas em uso:"
echo "   Porta 80 (HTTP):"
if ss -tlnp | grep -q ":80 "; then
    echo "   ✅ Porta 80 está em uso"
else
    echo "   ❌ Porta 80 não está em uso"
fi

echo "   Porta 5000 (Flask):"
if ss -tlnp | grep -q ":5000 "; then
    echo "   ✅ Porta 5000 está em uso"
else
    echo "   ❌ Porta 5000 não está em uso"
fi

# Teste de DNS (se estiver configurado)
echo ""
echo "7. 🌍 Teste de DNS (se configurado):"
if dig +short linktree.ivillar.com.br > /dev/null 2>&1; then
    ip=$(dig +short linktree.ivillar.com.br | head -n1)
    echo "   📍 linktree.ivillar.com.br resolve para: $ip"
    
    # Testar se é o IP local
    local_ip=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip)
    if [ "$ip" = "$local_ip" ]; then
        echo "   ✅ DNS aponta para este servidor"
    else
        echo "   ⚠️  DNS aponta para servidor diferente"
    fi
else
    echo "   ⚠️  DNS não configurado ou não acessível"
fi

echo ""
echo "📊 Resumo dos Testes:"
echo "===================="

# Contagem de sucessos
total_tests=0
passed_tests=0

# URLs para teste final
echo "🔗 URLs para testar no navegador:"
echo "   http://linktree.ivillar.com.br"
echo "   http://IP_DO_SERVIDOR"

echo ""
echo "📝 Comandos úteis:"
echo "   sudo systemctl restart linktree nginx"
echo "   sudo tail -f /var/log/nginx/linktree_access.log"
echo "   sudo journalctl -u linktree -f"

echo ""
echo "🔧 Para debug:"
echo "   curl -v http://localhost"
echo "   curl -v http://localhost:5000"
echo "   curl -v http://linktree.ivillar.com.br"