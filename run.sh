#!/bin/bash
# 🚀 Script de Execução - Lumiar Linktree

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Lumiar Linktree - Script de Execução${NC}"
echo "=========================================="

# Verificar se estamos no diretório correto
if [ ! -f "app.py" ]; then
    echo -e "${RED}❌ Erro: arquivo app.py não encontrado${NC}"
    echo "Execute este script no diretório /var/www/linktree"
    exit 1
fi

# Função para verificar se o ambiente virtual existe
check_venv() {
    if [ ! -d "venv" ]; then
        echo -e "${YELLOW}⚠️  Ambiente virtual não encontrado. Criando...${NC}"
        python3 -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt
    fi
}

# Função para ativar ambiente virtual
activate_venv() {
    echo -e "${BLUE}🔧 Ativando ambiente virtual...${NC}"
    source venv/bin/activate
    
    # Verificar se ativou corretamente
    if [ -z "$VIRTUAL_ENV" ]; then
        echo -e "${RED}❌ Erro ao ativar ambiente virtual${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Ambiente virtual ativo: $VIRTUAL_ENV${NC}"
}

# Função para verificar dependências
check_dependencies() {
    echo -e "${BLUE}📦 Verificando dependências...${NC}"
    
    if ! pip show flask > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Flask não encontrado. Instalando dependências...${NC}"
        pip install -r requirements.txt
    fi
    
    if ! pip show gunicorn > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Gunicorn não encontrado. Instalando...${NC}"
        pip install gunicorn
    fi
    
    echo -e "${GREEN}✅ Dependências verificadas${NC}"
}

# Função para parar processos existentes
stop_existing() {
    echo -e "${BLUE}🛑 Parando processos existentes...${NC}"
    
    # Parar processo do systemd se estiver rodando
    if systemctl is-active --quiet linktree 2>/dev/null; then
        sudo systemctl stop linktree
        echo -e "${GREEN}✅ Serviço systemd parado${NC}"
    fi
    
    # Matar processos gunicorn existentes
    pkill -f "gunicorn.*app:app" 2>/dev/null || true
    
    # Matar processos Flask existentes
    pkill -f "python.*app.py" 2>/dev/null || true
    
    sleep 2
    echo -e "${GREEN}✅ Processos existentes parados${NC}"
}

# Função para modo desenvolvimento
run_development() {
    echo -e "${BLUE}🔧 Executando em modo DESENVOLVIMENTO...${NC}"
    echo "Acesse: http://localhost:5000"
    echo "Pressione Ctrl+C para parar"
    echo ""
    
    export FLASK_ENV=development
    export FLASK_DEBUG=1
    python app.py
}

# Função para modo produção (foreground)
run_production() {
    echo -e "${BLUE}🏭 Executando em modo PRODUÇÃO (foreground)...${NC}"
    echo "Acesse: http://linktree.ivillar.com.br"
    echo "Pressione Ctrl+C para parar"
    echo ""
    
    export FLASK_ENV=production
    gunicorn --bind 127.0.0.1:5000 \
             --workers 2 \
             --timeout 30 \
             --keepalive 2 \
             --max-requests 1000 \
             --access-logfile /var/www/linktree/logs/access.log \
             --error-logfile /var/www/linktree/logs/error.log \
             --log-level info \
             app:app
}

# Função para modo daemon
run_daemon() {
    echo -e "${BLUE}👥 Executando em modo DAEMON...${NC}"
    
    # Criar diretório de logs se não existir
    mkdir -p logs
    
    export FLASK_ENV=production
    gunicorn --bind 127.0.0.1:5000 \
             --workers 4 \
             --timeout 30 \
             --keepalive 2 \
             --max-requests 1000 \
             --daemon \
             --pid logs/gunicorn.pid \
             --access-logfile logs/access.log \
             --error-logfile logs/error.log \
             --log-level info \
             app:app
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Aplicação executando em background${NC}"
        echo "PID: $(cat logs/gunicorn.pid 2>/dev/null || echo 'não encontrado')"
        echo "Logs: tail -f logs/access.log"
        echo "Para parar: ./run.sh stop"
    else
        echo -e "${RED}❌ Erro ao iniciar aplicação${NC}"
        exit 1
    fi
}

# Função para parar daemon
stop_daemon() {
    echo -e "${BLUE}🛑 Parando daemon...${NC}"
    
    if [ -f "logs/gunicorn.pid" ]; then
        pid=$(cat logs/gunicorn.pid)
        if kill -0 $pid 2>/dev/null; then
            kill $pid
            echo -e "${GREEN}✅ Daemon parado (PID: $pid)${NC}"
        else
            echo -e "${YELLOW}⚠️  Processo não encontrado (PID: $pid)${NC}"
        fi
        rm -f logs/gunicorn.pid
    else
        echo -e "${YELLOW}⚠️  Arquivo PID não encontrado${NC}"
    fi
    
    # Força parada de todos os processos gunicorn
    pkill -f "gunicorn.*app:app" 2>/dev/null || true
}

# Função para mostrar status
show_status() {
    echo -e "${BLUE}📊 Status da Aplicação${NC}"
    echo "====================="
    
    # Verificar systemd service
    if systemctl is-active --quiet linktree 2>/dev/null; then
        echo -e "${GREEN}✅ Systemd service: ATIVO${NC}"
    else
        echo -e "${YELLOW}⚠️  Systemd service: INATIVO${NC}"
    fi
    
    # Verificar processo gunicorn
    if pgrep -f "gunicorn.*app:app" > /dev/null; then
        pids=$(pgrep -f "gunicorn.*app:app" | tr '\n' ' ')
        echo -e "${GREEN}✅ Gunicorn: RODANDO (PIDs: $pids)${NC}"
    else
        echo -e "${YELLOW}⚠️  Gunicorn: NÃO RODANDO${NC}"
    fi
    
    # Verificar porta 5000
    if ss -tlnp | grep -q ":5000 "; then
        echo -e "${GREEN}✅ Porta 5000: EM USO${NC}"
    else
        echo -e "${YELLOW}⚠️  Porta 5000: LIVRE${NC}"
    fi
    
    # Teste de conectividade
    if curl -s -f http://localhost:5000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Conectividade: OK${NC}"
    else
        echo -e "${RED}❌ Conectividade: FALHA${NC}"
    fi
}

# Menu principal
show_menu() {
    echo ""
    echo "Escolha o modo de execução:"
    echo "1) Desenvolvimento (Flask dev server)"
    echo "2) Produção (Gunicorn foreground)"
    echo "3) Daemon (Gunicorn background)"
    echo "4) Parar daemon"
    echo "5) Status"
    echo "6) Sair"
    echo ""
}

# Verificar argumentos da linha de comando
case "$1" in
    "dev"|"development")
        check_venv
        activate_venv
        check_dependencies
        stop_existing
        run_development
        ;;
    "prod"|"production")
        check_venv
        activate_venv
        check_dependencies
        stop_existing
        run_production
        ;;
    "daemon")
        check_venv
        activate_venv
        check_dependencies
        stop_existing
        run_daemon
        ;;
    "stop")
        stop_daemon
        ;;
    "status")
        show_status
        ;;
    "restart")
        stop_daemon
        sleep 2
        check_venv
        activate_venv
        check_dependencies
        run_daemon
        ;;
    *)
        # Menu interativo
        while true; do
            show_menu
            read -p "Digite sua opção (1-6): " choice
            
            case $choice in
                1)
                    check_venv
                    activate_venv
                    check_dependencies
                    stop_existing
                    run_development
                    break
                    ;;
                2)
                    check_venv
                    activate_venv
                    check_dependencies
                    stop_existing
                    run_production
                    break
                    ;;
                3)
                    check_venv
                    activate_venv
                    check_dependencies
                    stop_existing
                    run_daemon
                    break
                    ;;
                4)
                    stop_daemon
                    break
                    ;;
                5)
                    show_status
                    echo ""
                    read -p "Pressione Enter para continuar..."
                    ;;
                6)
                    echo -e "${BLUE}👋 Até logo!${NC}"
                    exit 0
                    ;;
                *)
                    echo -e "${RED}❌ Opção inválida${NC}"
                    ;;
            esac
        done
        ;;
esac