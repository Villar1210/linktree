#!/bin/bash
# ⏰ Configuração de Backup Automático - Lumiar Linktree

echo "⏰ Configuração de Backup Automático"
echo "===================================="

LINKTREE_DIR="/var/www/linktree"
BACKUP_SCRIPT="$LINKTREE_DIR/backup.sh"

# Verificar se o script de backup existe
if [ ! -f "$BACKUP_SCRIPT" ]; then
    echo "❌ Script de backup não encontrado: $BACKUP_SCRIPT"
    exit 1
fi

# Dar permissão de execução
chmod +x "$BACKUP_SCRIPT"

echo "📋 Opções de backup automático:"
echo ""
echo "1) Backup diário dos dados (2:00 AM)"
echo "2) Backup semanal completo (Domingo 3:00 AM)"
echo "3) Backup personalizado"
echo "4) Remover backup automático"
echo "5) Mostrar agendamentos atuais"
echo ""

read -p "Escolha uma opção (1-5): " option

case $option in
    1)
        echo "📅 Configurando backup diário dos dados..."
        
        # Adicionar ao crontab
        (crontab -l 2>/dev/null | grep -v "linktree.*backup"; echo "0 2 * * * $BACKUP_SCRIPT auto") | crontab -
        
        echo "✅ Backup diário configurado para 2:00 AM"
        echo "   Comando: $BACKUP_SCRIPT auto"
        ;;
        
    2)
        echo "📅 Configurando backup semanal completo..."
        
        # Backup completo aos domingos
        (crontab -l 2>/dev/null | grep -v "linktree.*backup"; echo "0 3 * * 0 $BACKUP_SCRIPT full") | crontab -
        
        echo "✅ Backup semanal configurado para Domingo 3:00 AM"
        echo "   Comando: $BACKUP_SCRIPT full"
        ;;
        
    3)
        echo "⚙️  Configuração personalizada"
        echo ""
        echo "Formato do cron: MIN HOUR DAY MONTH WEEKDAY"
        echo "Exemplos:"
        echo "  0 2 * * *     = Todo dia às 2:00"
        echo "  0 3 * * 0     = Todo domingo às 3:00"
        echo "  0 */6 * * *   = A cada 6 horas"
        echo ""
        
        read -p "Digite o horário (formato cron): " cron_time
        
        echo ""
        echo "Tipos de backup:"
        echo "  auto      = Backup dos dados + limpeza"
        echo "  data      = Apenas dados JSON"
        echo "  complete  = Backup completo"
        echo "  full      = Backup completo + limpeza"
        echo ""
        
        read -p "Digite o tipo de backup: " backup_type
        
        # Validar tipo de backup
        if [[ "$backup_type" =~ ^(auto|data|complete|full)$ ]]; then
            (crontab -l 2>/dev/null | grep -v "linktree.*backup"; echo "$cron_time $BACKUP_SCRIPT $backup_type") | crontab -
            echo "✅ Backup personalizado configurado"
            echo "   Horário: $cron_time"
            echo "   Comando: $BACKUP_SCRIPT $backup_type"
        else
            echo "❌ Tipo de backup inválido"
            exit 1
        fi
        ;;
        
    4)
        echo "🗑️  Removendo backups automáticos..."
        
        # Remover entradas do linktree backup
        crontab -l 2>/dev/null | grep -v "linktree.*backup" | crontab -
        
        echo "✅ Backups automáticos removidos"
        ;;
        
    5)
        echo "📋 Agendamentos atuais do crontab:"
        echo ""
        
        if crontab -l 2>/dev/null | grep -q "linktree.*backup"; then
            echo "Backups do Linktree:"
            crontab -l | grep "linktree.*backup"
        else
            echo "Nenhum backup automático configurado para o Linktree"
        fi
        
        echo ""
        echo "Todos os agendamentos:"
        crontab -l 2>/dev/null || echo "Nenhum agendamento configurado"
        ;;
        
    *)
        echo "❌ Opção inválida"
        exit 1
        ;;
esac

echo ""
echo "📊 Comandos úteis:"
echo "  crontab -l              = Listar agendamentos"
echo "  crontab -e              = Editar agendamentos"
echo "  sudo tail -f /var/log/cron.log = Ver logs do cron"
echo "  $BACKUP_SCRIPT list     = Listar backups"
echo ""

# Verificar se o cron está rodando
if systemctl is-active --quiet cron 2>/dev/null || systemctl is-active --quiet crond 2>/dev/null; then
    echo "✅ Serviço cron está rodando"
else
    echo "⚠️  Serviço cron não está rodando. Inicie com:"
    echo "   sudo systemctl start cron"
    echo "   sudo systemctl enable cron"
fi

echo ""
echo "🎯 Configuração de backup automático concluída!"