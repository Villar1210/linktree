#!/bin/bash
# 📋 Monitor de Logs - Lumiar Linktree

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Lumiar Linktree - Monitor de Logs${NC}"
echo "==================================="

# Caminhos dos logs
NGINX_ACCESS_LOG="/var/log/nginx/linktree_access.log"
NGINX_ERROR_LOG="/var/log/nginx/linktree_error.log"
NGINX_ACCESS_GENERAL="/var/log/nginx/access.log"
NGINX_ERROR_GENERAL="/var/log/nginx/error.log"
GUNICORN_ACCESS_LOG="/var/www/linktree/logs/gunicorn_access.log"
GUNICORN_ERROR_LOG="/var/www/linktree/logs/gunicorn_error.log"
APP_LOG="/var/www/linktree/logs/app.log"
GUNICORN_LOG="/var/www/linktree/gunicorn.log"

# Função para verificar se arquivo existe
check_log_file() {
    local file="$1"
    local name="$2"
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $name: $file${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  $name: $file (não encontrado)${NC}"
        return 1
    fi
}

# Função para mostrar logs recentes
show_recent_logs() {
    local file="$1"
    local name="$2"
    local lines="${3:-20}"
    
    if [ -f "$file" ]; then
        echo -e "\n${CYAN}📄 Últimas $lines linhas - $name:${NC}"
        echo "$(printf '=%.0s' {1..50})"
        tail -n "$lines" "$file" | while IFS= read -r line; do
            # Colorir logs baseado no conteúdo
            if [[ "$line" =~ ERROR|error|Error ]]; then
                echo -e "${RED}$line${NC}"
            elif [[ "$line" =~ WARN|warn|Warning ]]; then
                echo -e "${YELLOW}$line${NC}"
            elif [[ "$line" =~ INFO|info|Success ]]; then
                echo -e "${GREEN}$line${NC}"
            else
                echo "$line"
            fi
        done
        echo ""
    else
        echo -e "${YELLOW}⚠️  Arquivo não encontrado: $file${NC}"
    fi
}

# Função para monitoramento em tempo real
monitor_logs() {
    local mode="$1"
    
    echo -e "${BLUE}🔍 Iniciando monitoramento em tempo real...${NC}"
    echo -e "${YELLOW}Pressione Ctrl+C para parar${NC}"
    echo ""
    
    case "$mode" in
        "nginx-access")
            if [ -f "$NGINX_ACCESS_LOG" ]; then
                tail -f "$NGINX_ACCESS_LOG"
            else
                tail -f "$NGINX_ACCESS_GENERAL"
            fi
            ;;
        "nginx-error")
            if [ -f "$NGINX_ERROR_LOG" ]; then
                tail -f "$NGINX_ERROR_LOG"
            else
                tail -f "$NGINX_ERROR_GENERAL"
            fi
            ;;
        "gunicorn")
            if [ -f "$GUNICORN_LOG" ]; then
                tail -f "$GUNICORN_LOG"
            elif [ -f "$GUNICORN_ERROR_LOG" ]; then
                tail -f "$GUNICORN_ERROR_LOG"
            else
                echo "❌ Log do Gunicorn não encontrado"
                exit 1
            fi
            ;;
        "app")
            if [ -f "$APP_LOG" ]; then
                tail -f "$APP_LOG"
            else
                # Fallback para systemd logs
                sudo journalctl -u linktree -f
            fi
            ;;
        "all")
            # Monitorar múltiplos logs
            echo -e "${BLUE}Monitorando todos os logs disponíveis...${NC}"
            
            local files=()
            [ -f "$NGINX_ACCESS_LOG" ] && files+=("$NGINX_ACCESS_LOG")
            [ -f "$NGINX_ERROR_LOG" ] && files+=("$NGINX_ERROR_LOG")
            [ -f "$GUNICORN_LOG" ] && files+=("$GUNICORN_LOG")
            [ -f "$APP_LOG" ] && files+=("$APP_LOG")
            
            if [ ${#files[@]} -gt 0 ]; then
                tail -f "${files[@]}"
            else
                echo "❌ Nenhum arquivo de log encontrado"
                exit 1
            fi
            ;;
        *)
            echo "❌ Modo inválido: $mode"
            exit 1
            ;;
    esac
}

# Função para análise de logs
analyze_logs() {
    echo -e "${PURPLE}📊 Análise de Logs - Últimas 24 horas${NC}"
    echo "======================================"
    
    # Nginx Access Log
    if [ -f "$NGINX_ACCESS_LOG" ]; then
        echo -e "\n${CYAN}🌐 Nginx Access (últimas 24h):${NC}"
        
        # Requests por hora
        echo "Requests por hora:"
        awk '{print $4}' "$NGINX_ACCESS_LOG" | cut -d: -f2 | sort | uniq -c | tail -24
        
        # Status codes
        echo -e "\nStatus codes:"
        awk '{print $9}' "$NGINX_ACCESS_LOG" | sort | uniq -c | sort -nr
        
        # IPs mais frequentes
        echo -e "\nTop 10 IPs:"
        awk '{print $1}' "$NGINX_ACCESS_LOG" | sort | uniq -c | sort -nr | head -10
        
        # URLs mais acessadas
        echo -e "\nTop 10 URLs:"
        awk '{print $7}' "$NGINX_ACCESS_LOG" | sort | uniq -c | sort -nr | head -10
    fi
    
    # Nginx Error Log
    if [ -f "$NGINX_ERROR_LOG" ]; then
        echo -e "\n${RED}❌ Nginx Errors (últimas 100 linhas):${NC}"
        tail -100 "$NGINX_ERROR_LOG" | grep -c "error" && echo "Errors encontrados" || echo "Nenhum error recente"
    fi
    
    # Gunicorn Errors
    if [ -f "$GUNICORN_ERROR_LOG" ]; then
        echo -e "\n${RED}🐍 Gunicorn Errors:${NC}"
        grep -i error "$GUNICORN_ERROR_LOG" | tail -10 || echo "Nenhum error encontrado"
    fi
}

# Função para limpar logs antigos
cleanup_logs() {
    echo -e "${BLUE}🧹 Limpeza de Logs${NC}"
    echo "=================="
    
    read -p "Deseja limpar logs mais antigos que 30 dias? (y/n): " confirm
    
    if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
        # Rotacionar logs do nginx
        sudo logrotate /etc/logrotate.d/nginx
        
        # Limpar logs antigos da aplicação
        find /var/www/linktree/logs/ -name "*.log" -mtime +30 -delete 2>/dev/null || true
        
        # Comprimir logs antigos
        find /var/www/linktree/logs/ -name "*.log" -mtime +7 -exec gzip {} \; 2>/dev/null || true
        
        echo -e "${GREEN}✅ Limpeza concluída${NC}"
    else
        echo -e "${YELLOW}Limpeza cancelada${NC}"
    fi
}

# Menu principal
show_menu() {
    echo ""
    echo "Escolha uma opção de monitoramento:"
    echo "1) Ver logs recentes do Nginx (Access)"
    echo "2) Ver logs recentes do Nginx (Error)"
    echo "3) Ver logs recentes do Gunicorn"
    echo "4) Ver logs da aplicação (systemd)"
    echo "5) Monitorar Nginx Access em tempo real"
    echo "6) Monitorar Nginx Error em tempo real"
    echo "7) Monitorar Gunicorn em tempo real"
    echo "8) Monitorar aplicação em tempo real"
    echo "9) Monitorar todos os logs"
    echo "10) Análise de logs"
    echo "11) Status dos arquivos de log"
    echo "12) Limpar logs antigos"
    echo "13) Comandos personalizados"
    echo "14) Sair"
    echo ""
}

# Verificar argumentos da linha de comando
case "$1" in
    "nginx-access")
        monitor_logs "nginx-access"
        ;;
    "nginx-error")
        monitor_logs "nginx-error"
        ;;
    "gunicorn")
        monitor_logs "gunicorn"
        ;;
    "app")
        monitor_logs "app"
        ;;
    "all")
        monitor_logs "all"
        ;;
    "analyze")
        analyze_logs
        ;;
    "status")
        echo -e "${BLUE}📊 Status dos Arquivos de Log:${NC}"
        echo "============================="
        check_log_file "$NGINX_ACCESS_LOG" "Nginx Access (específico)"
        check_log_file "$NGINX_ERROR_LOG" "Nginx Error (específico)"
        check_log_file "$NGINX_ACCESS_GENERAL" "Nginx Access (geral)"
        check_log_file "$NGINX_ERROR_GENERAL" "Nginx Error (geral)"
        check_log_file "$GUNICORN_LOG" "Gunicorn"
        check_log_file "$GUNICORN_ACCESS_LOG" "Gunicorn Access"
        check_log_file "$GUNICORN_ERROR_LOG" "Gunicorn Error"
        check_log_file "$APP_LOG" "Aplicação"
        ;;
    "cleanup")
        cleanup_logs
        ;;
    "recent")
        show_recent_logs "$NGINX_ACCESS_LOG" "Nginx Access" 20
        show_recent_logs "$NGINX_ERROR_LOG" "Nginx Error" 10
        show_recent_logs "$GUNICORN_LOG" "Gunicorn" 20
        ;;
    "commands")
        echo -e "${PURPLE}📝 Comandos Personalizados de Log:${NC}"
        echo "=================================="
        echo ""
        echo "# Ver logs da aplicação"
        echo "tail -f /var/log/nginx/access.log"
        echo "tail -f /var/log/nginx/error.log"
        echo "tail -f /var/log/nginx/linktree_access.log"
        echo "tail -f /var/log/nginx/linktree_error.log"
        echo ""
        echo "# Logs do Gunicorn"
        echo "tail -f /var/www/linktree/gunicorn.log"
        echo "tail -f /var/www/linktree/logs/gunicorn_access.log"
        echo "tail -f /var/www/linktree/logs/gunicorn_error.log"
        echo ""
        echo "# Logs da aplicação via systemd"
        echo "sudo journalctl -u linktree -f"
        echo "sudo journalctl -u linktree -n 50"
        echo ""
        echo "# Análise rápida"
        echo "grep -i error /var/log/nginx/error.log | tail -10"
        echo "awk '{print \$9}' /var/log/nginx/access.log | sort | uniq -c"
        echo ""
        ;;
    *)
        # Menu interativo
        while true; do
            show_menu
            read -p "Digite sua opção (1-14): " choice
            
            case $choice in
                1)
                    show_recent_logs "$NGINX_ACCESS_LOG" "Nginx Access" 30
                    [ -f "$NGINX_ACCESS_GENERAL" ] && show_recent_logs "$NGINX_ACCESS_GENERAL" "Nginx Access Geral" 10
                    read -p "Pressione Enter para continuar..."
                    ;;
                2)
                    show_recent_logs "$NGINX_ERROR_LOG" "Nginx Error" 20
                    [ -f "$NGINX_ERROR_GENERAL" ] && show_recent_logs "$NGINX_ERROR_GENERAL" "Nginx Error Geral" 10
                    read -p "Pressione Enter para continuar..."
                    ;;
                3)
                    show_recent_logs "$GUNICORN_LOG" "Gunicorn" 30
                    [ -f "$GUNICORN_ERROR_LOG" ] && show_recent_logs "$GUNICORN_ERROR_LOG" "Gunicorn Error" 10
                    read -p "Pressione Enter para continuar..."
                    ;;
                4)
                    echo -e "${CYAN}📄 Logs da aplicação via systemd:${NC}"
                    sudo journalctl -u linktree -n 30 --no-pager
                    read -p "Pressione Enter para continuar..."
                    ;;
                5)
                    monitor_logs "nginx-access"
                    ;;
                6)
                    monitor_logs "nginx-error"
                    ;;
                7)
                    monitor_logs "gunicorn"
                    ;;
                8)
                    monitor_logs "app"
                    ;;
                9)
                    monitor_logs "all"
                    ;;
                10)
                    analyze_logs
                    read -p "Pressione Enter para continuar..."
                    ;;
                11)
                    echo -e "${BLUE}📊 Status dos Arquivos de Log:${NC}"
                    echo "============================="
                    check_log_file "$NGINX_ACCESS_LOG" "Nginx Access (específico)"
                    check_log_file "$NGINX_ERROR_LOG" "Nginx Error (específico)"
                    check_log_file "$GUNICORN_LOG" "Gunicorn"
                    check_log_file "$APP_LOG" "Aplicação"
                    echo ""
                    read -p "Pressione Enter para continuar..."
                    ;;
                12)
                    cleanup_logs
                    read -p "Pressione Enter para continuar..."
                    ;;
                13)
                    $0 commands
                    read -p "Pressione Enter para continuar..."
                    ;;
                14)
                    echo -e "${BLUE}👋 Monitor de logs finalizado!${NC}"
                    exit 0
                    ;;
                *)
                    echo -e "${RED}❌ Opção inválida${NC}"
                    ;;
            esac
        done
        ;;
esac