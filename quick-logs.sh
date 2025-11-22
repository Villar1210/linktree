#!/bin/bash
# 🔍 Quick Logs - Lumiar Linktree

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Quick Logs - Lumiar Linktree${NC}"
echo "================================"

# Comandos solicitados pelo usuário
case "$1" in
    "nginx-access"|"")
        echo -e "${GREEN}📈 Nginx Access Log (tempo real)${NC}"
        echo "Comando: tail -f /var/log/nginx/access.log"
        echo "Pressione Ctrl+C para parar"
        echo "====================================="
        tail -f /var/log/nginx/access.log
        ;;
    
    "nginx-error")
        echo -e "${RED}❌ Nginx Error Log (tempo real)${NC}"
        echo "Comando: tail -f /var/log/nginx/error.log"
        echo "Pressione Ctrl+C para parar"
        echo "===================================="
        tail -f /var/log/nginx/error.log
        ;;
    
    "gunicorn")
        echo -e "${YELLOW}🐍 Gunicorn Log (tempo real)${NC}"
        echo "Comando: tail -f gunicorn.log"
        echo "Pressione Ctrl+C para parar"
        echo "============================="
        
        # Tentar diferentes locais do gunicorn.log
        if [ -f "gunicorn.log" ]; then
            tail -f gunicorn.log
        elif [ -f "/var/www/linktree/gunicorn.log" ]; then
            tail -f /var/www/linktree/gunicorn.log
        elif [ -f "logs/gunicorn.log" ]; then
            tail -f logs/gunicorn.log
        else
            echo -e "${RED}❌ Arquivo gunicorn.log não encontrado${NC}"
            echo "Tentando logs do systemd..."
            sudo journalctl -u linktree -f
        fi
        ;;
    
    "all")
        echo -e "${BLUE}📊 Todos os Logs Principais${NC}"
        echo "============================"
        
        # Mostrar logs recentes de cada serviço
        echo -e "\n${GREEN}🌐 Nginx Access (últimas 10 linhas):${NC}"
        tail -10 /var/log/nginx/access.log 2>/dev/null || echo "Log não encontrado"
        
        echo -e "\n${RED}❌ Nginx Error (últimas 5 linhas):${NC}"
        tail -5 /var/log/nginx/error.log 2>/dev/null || echo "Nenhum erro recente"
        
        echo -e "\n${YELLOW}🐍 Gunicorn (últimas 10 linhas):${NC}"
        if [ -f "gunicorn.log" ]; then
            tail -10 gunicorn.log
        elif [ -f "/var/www/linktree/gunicorn.log" ]; then
            tail -10 /var/www/linktree/gunicorn.log
        else
            sudo journalctl -u linktree -n 10 --no-pager 2>/dev/null || echo "Log não encontrado"
        fi
        
        echo -e "\n${BLUE}Para monitoramento em tempo real:${NC}"
        echo "./quick-logs.sh nginx-access  # Access logs"
        echo "./quick-logs.sh nginx-error   # Error logs"
        echo "./quick-logs.sh gunicorn      # Gunicorn logs"
        ;;
    
    "recent")
        echo -e "${BLUE}📋 Logs Recentes (últimas 20 linhas)${NC}"
        echo "===================================="
        
        echo -e "\n${GREEN}Nginx Access:${NC}"
        tail -20 /var/log/nginx/access.log 2>/dev/null | while read line; do
            echo -e "${GREEN}$line${NC}"
        done
        
        echo -e "\n${RED}Nginx Error:${NC}"
        tail -10 /var/log/nginx/error.log 2>/dev/null | while read line; do
            echo -e "${RED}$line${NC}"
        done
        
        echo -e "\n${YELLOW}Gunicorn:${NC}"
        if [ -f "gunicorn.log" ]; then
            tail -20 gunicorn.log | while read line; do
                echo -e "${YELLOW}$line${NC}"
            done
        fi
        ;;
    
    "help"|"-h"|"--help")
        echo -e "${BLUE}Comandos disponíveis:${NC}"
        echo ""
        echo "./quick-logs.sh              # Nginx access log (padrão)"
        echo "./quick-logs.sh nginx-access # Nginx access log"
        echo "./quick-logs.sh nginx-error  # Nginx error log"
        echo "./quick-logs.sh gunicorn     # Gunicorn log"
        echo "./quick-logs.sh all          # Resumo de todos"
        echo "./quick-logs.sh recent       # Logs recentes"
        echo ""
        echo -e "${YELLOW}Comandos diretos mencionados:${NC}"
        echo "tail -f /var/log/nginx/access.log"
        echo "tail -f /var/log/nginx/error.log"
        echo "tail -f gunicorn.log"
        echo ""
        echo -e "${BLUE}Para análise avançada use:${NC}"
        echo "./logs-monitor.sh           # Monitor completo"
        ;;
    
    *)
        echo -e "${YELLOW}Uso: $0 [nginx-access|nginx-error|gunicorn|all|recent|help]${NC}"
        echo ""
        echo "Comandos principais (como solicitado):"
        echo "• tail -f /var/log/nginx/access.log"
        echo "• tail -f /var/log/nginx/error.log"
        echo "• tail -f gunicorn.log"
        echo ""
        echo "Execute: $0 help para mais opções"
        ;;
esac