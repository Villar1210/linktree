#!/bin/bash
# 💾 Script de Backup - Lumiar Linktree

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}💾 Lumiar Linktree - Sistema de Backup${NC}"
echo "====================================="

# Configurações
BACKUP_DIR="/var/backups/linktree"
PROJECT_DIR="/var/www/linktree"
DATE=$(date +%Y%m%d_%H%M%S)
DATE_SIMPLE=$(date +%Y%m%d)

# Criar diretório de backup se não existir
mkdir -p "$BACKUP_DIR"
mkdir -p "$PROJECT_DIR/backups"

# Função para backup dos dados JSON
backup_data() {
    echo -e "${BLUE}📊 Fazendo backup dos dados...${NC}"
    
    if [ -f "$PROJECT_DIR/data/empreendimentos.json" ]; then
        # Backup local na pasta do projeto
        cp "$PROJECT_DIR/data/empreendimentos.json" "$PROJECT_DIR/backups/empreendimentos_$DATE_SIMPLE.json"
        
        # Backup no diretório sistema
        cp "$PROJECT_DIR/data/empreendimentos.json" "$BACKUP_DIR/empreendimentos_$DATE_SIMPLE.json"
        
        echo -e "${GREEN}✅ Backup dos dados criado:${NC}"
        echo "   - Local: $PROJECT_DIR/backups/empreendimentos_$DATE_SIMPLE.json"
        echo "   - Sistema: $BACKUP_DIR/empreendimentos_$DATE_SIMPLE.json"
    else
        echo -e "${YELLOW}⚠️  Arquivo de dados não encontrado${NC}"
    fi
}

# Função para backup completo
backup_complete() {
    echo -e "${BLUE}📦 Fazendo backup completo...${NC}"
    
    cd "$PROJECT_DIR" || exit 1
    
    # Nome do arquivo de backup
    BACKUP_FILE="$BACKUP_DIR/backup_linktree_$DATE.tar.gz"
    
    # Criar backup completo excluindo arquivos desnecessários
    tar -czf "$BACKUP_FILE" \
        --exclude='venv' \
        --exclude='__pycache__' \
        --exclude='*.pyc' \
        --exclude='.git' \
        --exclude='logs/*.log' \
        --exclude='*.pid' \
        --exclude='backups/*.tar.gz' \
        .
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Backup completo criado: $BACKUP_FILE${NC}"
        
        # Mostrar tamanho do backup
        size=$(du -h "$BACKUP_FILE" | cut -f1)
        echo -e "${GREEN}📊 Tamanho do backup: $size${NC}"
    else
        echo -e "${RED}❌ Erro ao criar backup completo${NC}"
        return 1
    fi
}

# Função para backup dos logs
backup_logs() {
    echo -e "${BLUE}📋 Fazendo backup dos logs...${NC}"
    
    if [ -d "$PROJECT_DIR/logs" ] && [ "$(ls -A $PROJECT_DIR/logs 2>/dev/null)" ]; then
        LOG_BACKUP="$BACKUP_DIR/logs_$DATE.tar.gz"
        
        cd "$PROJECT_DIR" || exit 1
        tar -czf "$LOG_BACKUP" logs/
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Backup dos logs criado: $LOG_BACKUP${NC}"
        else
            echo -e "${YELLOW}⚠️  Erro ao fazer backup dos logs${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Nenhum log encontrado para backup${NC}"
    fi
}

# Função para backup da configuração do sistema
backup_config() {
    echo -e "${BLUE}⚙️  Fazendo backup das configurações...${NC}"
    
    CONFIG_BACKUP="$BACKUP_DIR/config_$DATE.tar.gz"
    
    # Backup das configurações do Nginx e systemd
    sudo tar -czf "$CONFIG_BACKUP" \
        /etc/nginx/sites-available/linktree \
        /etc/systemd/system/linktree.service \
        2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Backup das configurações criado: $CONFIG_BACKUP${NC}"
    else
        echo -e "${YELLOW}⚠️  Algumas configurações não puderam ser copiadas${NC}"
    fi
}

# Função para limpeza de backups antigos
cleanup_old_backups() {
    echo -e "${BLUE}🧹 Limpando backups antigos...${NC}"
    
    # Manter apenas os últimos 7 dias de backups diários
    find "$BACKUP_DIR" -name "empreendimentos_*.json" -mtime +7 -delete 2>/dev/null
    
    # Manter apenas os últimos 30 backups completos
    find "$BACKUP_DIR" -name "backup_linktree_*.tar.gz" -mtime +30 -delete 2>/dev/null
    
    # Manter apenas os últimos 7 dias de logs
    find "$BACKUP_DIR" -name "logs_*.tar.gz" -mtime +7 -delete 2>/dev/null
    
    echo -e "${GREEN}✅ Limpeza concluída${NC}"
}

# Função para restaurar backup
restore_backup() {
    echo -e "${YELLOW}⚠️  Função de restauração${NC}"
    echo "Para restaurar um backup:"
    echo ""
    echo "1. Parar a aplicação:"
    echo "   sudo systemctl stop linktree"
    echo ""
    echo "2. Fazer backup atual (segurança):"
    echo "   $0 complete"
    echo ""
    echo "3. Restaurar arquivo:"
    echo "   cd /var/www"
    echo "   sudo rm -rf linktree"
    echo "   sudo tar -xzf /var/backups/linktree/backup_linktree_YYYYMMDD_HHMMSS.tar.gz"
    echo "   sudo mv linktree linktree_old"
    echo "   sudo mv [extracted_folder] linktree"
    echo ""
    echo "4. Ajustar permissões:"
    echo "   sudo chown -R www-data:www-data /var/www/linktree"
    echo ""
    echo "5. Reiniciar aplicação:"
    echo "   sudo systemctl start linktree"
}

# Função para listar backups
list_backups() {
    echo -e "${BLUE}📋 Backups disponíveis:${NC}"
    echo ""
    
    echo -e "${YELLOW}Dados (JSON):${NC}"
    ls -lh "$BACKUP_DIR"/empreendimentos_*.json 2>/dev/null | tail -10 || echo "   Nenhum backup de dados encontrado"
    
    echo ""
    echo -e "${YELLOW}Completos:${NC}"
    ls -lh "$BACKUP_DIR"/backup_linktree_*.tar.gz 2>/dev/null | tail -10 || echo "   Nenhum backup completo encontrado"
    
    echo ""
    echo -e "${YELLOW}Logs:${NC}"
    ls -lh "$BACKUP_DIR"/logs_*.tar.gz 2>/dev/null | tail -5 || echo "   Nenhum backup de logs encontrado"
    
    echo ""
    echo -e "${YELLOW}Configurações:${NC}"
    ls -lh "$BACKUP_DIR"/config_*.tar.gz 2>/dev/null | tail -5 || echo "   Nenhum backup de configuração encontrado"
}

# Função para backup automatizado (cron)
backup_auto() {
    echo -e "${BLUE}🤖 Backup automatizado iniciado...${NC}"
    
    # Log do backup automático
    LOG_FILE="/var/log/linktree_backup.log"
    
    {
        echo "$(date): Iniciando backup automatizado"
        backup_data
        backup_logs
        cleanup_old_backups
        echo "$(date): Backup automatizado concluído"
    } >> "$LOG_FILE" 2>&1
    
    echo -e "${GREEN}✅ Backup automatizado concluído${NC}"
    echo "Log: $LOG_FILE"
}

# Menu principal
show_menu() {
    echo ""
    echo "Escolha o tipo de backup:"
    echo "1) Backup dos dados (JSON)"
    echo "2) Backup completo"
    echo "3) Backup dos logs"
    echo "4) Backup das configurações"
    echo "5) Backup completo + limpeza"
    echo "6) Listar backups"
    echo "7) Instruções de restauração"
    echo "8) Sair"
    echo ""
}

# Verificar argumentos da linha de comando
case "$1" in
    "data")
        backup_data
        ;;
    "complete")
        backup_complete
        ;;
    "logs")
        backup_logs
        ;;
    "config")
        backup_config
        ;;
    "full")
        backup_data
        backup_complete
        backup_logs
        backup_config
        cleanup_old_backups
        ;;
    "auto")
        backup_auto
        ;;
    "list")
        list_backups
        ;;
    "restore")
        restore_backup
        ;;
    "cleanup")
        cleanup_old_backups
        ;;
    *)
        # Menu interativo
        while true; do
            show_menu
            read -p "Digite sua opção (1-8): " choice
            
            case $choice in
                1)
                    backup_data
                    break
                    ;;
                2)
                    backup_complete
                    break
                    ;;
                3)
                    backup_logs
                    break
                    ;;
                4)
                    backup_config
                    break
                    ;;
                5)
                    backup_data
                    backup_complete
                    backup_logs
                    backup_config
                    cleanup_old_backups
                    break
                    ;;
                6)
                    list_backups
                    echo ""
                    read -p "Pressione Enter para continuar..."
                    ;;
                7)
                    restore_backup
                    echo ""
                    read -p "Pressione Enter para continuar..."
                    ;;
                8)
                    echo -e "${BLUE}👋 Backup finalizado!${NC}"
                    exit 0
                    ;;
                *)
                    echo -e "${RED}❌ Opção inválida${NC}"
                    ;;
            esac
        done
        ;;
esac

echo ""
echo -e "${GREEN}🎯 Backup concluído com sucesso!${NC}"
echo -e "${BLUE}📍 Backups salvos em: $BACKUP_DIR${NC}"