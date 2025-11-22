#!/bin/bash
# ⚡ Scripts Rápidos - Lumiar Linktree

# Navegar para diretório correto
cd /var/www/linktree

# Ativar ambiente virtual
source venv/bin/activate

echo "🚀 Comandos rápidos para Lumiar Linktree"
echo "========================================"

case "$1" in
    "dev")
        echo "🔧 Executando em modo desenvolvimento..."
        export FLASK_ENV=development
        export FLASK_DEBUG=1
        python app.py
        ;;
        
    "prod")
        echo "🏭 Executando em modo produção..."
        export FLASK_ENV=production
        gunicorn --bind 127.0.0.1:5000 app:app
        ;;
        
    "daemon")
        echo "👥 Executando em modo daemon..."
        mkdir -p logs
        export FLASK_ENV=production
        gunicorn --bind 127.0.0.1:5000 \
                 --workers 4 \
                 --daemon \
                 --pid logs/gunicorn.pid \
                 --access-logfile logs/access.log \
                 --error-logfile logs/error.log \
                 app:app
        echo "✅ Aplicação rodando em background"
        echo "PID: $(cat logs/gunicorn.pid)"
        ;;
        
    "stop")
        echo "🛑 Parando aplicação..."
        # Parar systemd service se estiver rodando
        sudo systemctl stop linktree 2>/dev/null || true
        
        # Parar daemon se estiver rodando
        if [ -f "logs/gunicorn.pid" ]; then
            kill $(cat logs/gunicorn.pid) 2>/dev/null || true
            rm -f logs/gunicorn.pid
        fi
        
        # Forçar parada de todos os processos
        pkill -f "gunicorn.*app:app" 2>/dev/null || true
        pkill -f "python.*app.py" 2>/dev/null || true
        
        echo "✅ Aplicação parada"
        ;;
        
    "restart")
        echo "🔄 Reiniciando aplicação..."
        $0 stop
        sleep 2
        $0 daemon
        ;;
        
    "status")
        echo "📊 Status da aplicação:"
        
        # Verificar systemd
        if systemctl is-active --quiet linktree 2>/dev/null; then
            echo "✅ Systemd service: ATIVO"
        else
            echo "⚠️  Systemd service: INATIVO"
        fi
        
        # Verificar gunicorn
        if pgrep -f "gunicorn.*app:app" > /dev/null; then
            echo "✅ Gunicorn: RODANDO"
        else
            echo "⚠️  Gunicorn: PARADO"
        fi
        
        # Teste de conectividade
        if curl -s -f http://localhost:5000 > /dev/null 2>&1; then
            echo "✅ Aplicação: RESPONDENDO"
        else
            echo "❌ Aplicação: NÃO RESPONDE"
        fi
        ;;
        
    "logs")
        echo "📋 Mostrando logs..."
        
        # Usar quick-logs se disponível
        if [ -f "./quick-logs.sh" ]; then
            chmod +x ./quick-logs.sh
            ./quick-logs.sh all
        else
            # Logs diretos como solicitado
            echo ""
            echo -e "${BLUE}📈 Nginx Access Log (últimas 10 linhas):${NC}"
            tail -10 /var/log/nginx/access.log 2>/dev/null || echo "Log não encontrado"
            
            echo ""
            echo -e "${RED}❌ Nginx Error Log (últimas 5 linhas):${NC}"
            tail -5 /var/log/nginx/error.log 2>/dev/null || echo "Nenhum erro recente"
            
            echo ""
            echo -e "${YELLOW}🐍 Gunicorn Log (últimas 10 linhas):${NC}"
            if [ -f "gunicorn.log" ]; then
                tail -10 gunicorn.log
            elif [ -f "/var/www/linktree/gunicorn.log" ]; then
                tail -10 /var/www/linktree/gunicorn.log
            else
                echo "Log não encontrado - usando systemd:"
                journalctl -u linktree -n 10 --no-pager 2>/dev/null || echo "Service não encontrado"
            fi
            
            echo ""
            echo -e "${BLUE}Comandos para monitoramento em tempo real:${NC}"
            echo "tail -f /var/log/nginx/access.log"
            echo "tail -f /var/log/nginx/error.log" 
            echo "tail -f gunicorn.log"
        fi
        ;;
        
    "test")
        echo "🧪 Testando aplicação..."
        
        # Teste local
        echo "Testando localhost:5000..."
        if curl -s -f http://localhost:5000 > /dev/null; then
            echo "✅ localhost:5000 OK"
        else
            echo "❌ localhost:5000 FALHA"
        fi
        
        # Teste nginx
        echo "Testando através do nginx..."
        if curl -s -f http://localhost > /dev/null; then
            echo "✅ Nginx OK"
        else
            echo "❌ Nginx FALHA"
        fi
        
        # Teste subdomínio
        echo "Testando subdomínio..."
        if curl -s -f http://linktree.ivillar.com.br > /dev/null; then
            echo "✅ Subdomínio OK"
        else
            echo "❌ Subdomínio FALHA (verifique DNS)"
        fi
        ;;
        
    "install")
        echo "📦 Instalando/atualizando dependências..."
        pip install -r requirements.txt
        echo "✅ Dependências instaladas"
        ;;
        
    "backup")
        echo "💾 Criando backup dos dados..."
        
        # Backup dos dados JSON
        mkdir -p backups
        cp data/empreendimentos.json backups/empreendimentos_$(date +%Y%m%d).json
        echo "✅ Backup dos dados: backups/empreendimentos_$(date +%Y%m%d).json"
        
        # Backup completo
        backup_file="backup_linktree_$(date +%Y%m%d_%H%M%S).tar.gz"
        tar -czf $backup_file \
            --exclude='venv' \
            --exclude='__pycache__' \
            --exclude='*.pyc' \
            --exclude='.git' \
            --exclude='logs/*.log' \
            --exclude='*.pid' \
            .
        echo "✅ Backup completo criado: $backup_file"
        
        # Usar script de backup se disponível
        if [ -f "./backup.sh" ]; then
            echo "📦 Executando script de backup completo..."
            chmod +x ./backup.sh
            ./backup.sh auto
        fi
        ;;
    
    "monitor")
        echo "📋 Iniciando monitor de logs..."
        if [ -f "./logs-monitor.sh" ]; then
            chmod +x ./logs-monitor.sh
            ./logs-monitor.sh
        else
            echo "❌ Script logs-monitor.sh não encontrado"
            echo "Usando comandos diretos:"
            echo ""
            echo "# Ver logs do Nginx"
            echo "tail -f /var/log/nginx/access.log"
            echo "tail -f /var/log/nginx/error.log"
            echo ""
            echo "# Ver logs do Gunicorn"
            if [ -f "logs/gunicorn.log" ]; then
                echo "tail -f logs/gunicorn.log"
            fi
            if [ -f "gunicorn.log" ]; then
                echo "tail -f gunicorn.log"
            fi
            echo ""
            echo "# Ver logs via systemd"
            echo "sudo journalctl -u linktree -f"
        fi
        ;;
        
    *)
        echo "Uso: $0 {dev|prod|daemon|stop|restart|status|logs|test|install|backup|monitor}"
        echo ""
        echo "Comandos disponíveis:"
        echo "  dev      - Executar em modo desenvolvimento"
        echo "  prod     - Executar em modo produção (foreground)"
        echo "  daemon   - Executar em modo daemon (background)"
        echo "  stop     - Parar aplicação"
        echo "  restart  - Reiniciar aplicação"
        echo "  status   - Mostrar status"
        echo "  logs     - Mostrar logs"
        echo "  test     - Testar conectividade"
        echo "  install  - Instalar dependências"
        echo "  backup   - Criar backup (dados + completo)"
        echo "  monitor  - Monitor de logs em tempo real"
        echo ""
        echo "Exemplos:"
        echo "  $0 dev      # Modo desenvolvimento"
        echo "  $0 daemon   # Produção em background"
        echo "  $0 status   # Ver status"
        echo "  $0 monitor  # Monitor de logs"
        ;;
esac