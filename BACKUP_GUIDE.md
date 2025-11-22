# 💾 Guia de Backup - Lumiar Linktree

## 📋 Comandos Básicos de Backup

### **Backup rápido dos dados:**
```bash
# Backup dos dados JSON
cp data/empreendimentos.json backup/empreendimentos_$(date +%Y%m%d).json
```

### **Backup completo:**
```bash
# Backup completo do projeto (excluindo arquivos temporários)
tar -czf backup_linktree_$(date +%Y%m%d).tar.gz \
    --exclude='venv' \
    --exclude='__pycache__' \
    --exclude='*.pyc' \
    --exclude='.git' \
    --exclude='logs/*.log' \
    --exclude='*.pid' \
    .
```

## 🤖 Scripts Automatizados

### **1. Script de Backup Completo (`backup.sh`):**
```bash
# Dar permissões
chmod +x backup.sh

# Backup interativo (menu)
./backup.sh

# Comandos diretos
./backup.sh data      # Apenas dados JSON
./backup.sh complete  # Backup completo
./backup.sh logs      # Backup dos logs
./backup.sh config    # Backup das configurações
./backup.sh full      # Backup completo + limpeza
./backup.sh auto      # Backup automatizado
./backup.sh list      # Listar backups
```

### **2. Backup via Quick-run:**
```bash
# Backup rápido
./quick-run.sh backup
```

### **3. Configurar Backup Automático:**
```bash
# Configurar cron para backup automático
chmod +x setup-backup-cron.sh
./setup-backup-cron.sh

# Opções disponíveis:
# 1) Backup diário (2:00 AM)
# 2) Backup semanal (Domingo 3:00 AM)  
# 3) Personalizado
```

## 📂 Estrutura de Backups

```
/var/backups/linktree/           # Backups do sistema
├── empreendimentos_20241109.json
├── backup_linktree_20241109_143022.tar.gz
├── logs_20241109_143022.tar.gz
└── config_20241109_143022.tar.gz

/var/www/linktree/backups/       # Backups locais
├── empreendimentos_20241109.json
└── backup_linktree_20241109.tar.gz
```

## ⏰ Backup Automático

### **Configurar Cron:**
```bash
# Editar crontab
crontab -e

# Exemplos de agendamento:
0 2 * * *    /var/www/linktree/backup.sh auto      # Diário 2:00 AM
0 3 * * 0    /var/www/linktree/backup.sh full      # Semanal Domingo 3:00 AM
0 */6 * * *  /var/www/linktree/backup.sh data      # A cada 6 horas
```

### **Verificar Agendamentos:**
```bash
# Listar agendamentos
crontab -l

# Ver logs do cron
sudo tail -f /var/log/cron.log

# Status do serviço cron
systemctl status cron
```

## 🔄 Restauração de Backup

### **Restaurar dados JSON:**
```bash
# Parar aplicação
sudo systemctl stop linktree

# Fazer backup de segurança
cp data/empreendimentos.json data/empreendimentos_backup.json

# Restaurar backup
cp backups/empreendimentos_YYYYMMDD.json data/empreendimentos.json

# Reiniciar aplicação
sudo systemctl start linktree
```

### **Restaurar backup completo:**
```bash
# 1. Parar aplicação
sudo systemctl stop linktree

# 2. Backup de segurança do estado atual
tar -czf /tmp/current_state_$(date +%Y%m%d_%H%M%S).tar.gz /var/www/linktree

# 3. Restaurar backup
cd /var/www
sudo rm -rf linktree_old
sudo mv linktree linktree_old
sudo tar -xzf /var/backups/linktree/backup_linktree_YYYYMMDD_HHMMSS.tar.gz
sudo chown -R www-data:www-data linktree

# 4. Reiniciar aplicação
sudo systemctl start linktree
sudo systemctl status linktree
```

## 🧹 Limpeza de Backups

### **Limpeza automática:**
```bash
# O script de backup já faz limpeza automática:
# - Dados: mantém 7 dias
# - Completos: mantém 30 dias  
# - Logs: mantém 7 dias

./backup.sh cleanup
```

### **Limpeza manual:**
```bash
# Remover backups mais antigos que 7 dias
find /var/backups/linktree -name "empreendimentos_*.json" -mtime +7 -delete

# Remover backups completos mais antigos que 30 dias
find /var/backups/linktree -name "backup_linktree_*.tar.gz" -mtime +30 -delete
```

## 📊 Monitoramento de Backups

### **Verificar último backup:**
```bash
# Listar backups recentes
ls -lt /var/backups/linktree/ | head -10

# Verificar tamanho dos backups
du -h /var/backups/linktree/
```

### **Testar integridade:**
```bash
# Testar integridade do tar.gz
tar -tzf backup_linktree_YYYYMMDD_HHMMSS.tar.gz > /dev/null

# Verificar JSON
python3 -c "import json; json.load(open('data/empreendimentos.json'))"
```

## 🚨 Backup de Emergência

### **Comando único para backup completo:**
```bash
# Backup de emergência rápido
cd /var/www/linktree && tar -czf /tmp/emergency_backup_$(date +%Y%m%d_%H%M%S).tar.gz \
  --exclude='venv' --exclude='__pycache__' --exclude='.git' .
```

### **Sincronização remota (opcional):**
```bash
# Sync para servidor remoto
rsync -avz --exclude='venv' --exclude='__pycache__' \
  /var/www/linktree/ usuario@servidor-backup:/backups/linktree/

# Sync para cloud (se configurado)
rclone sync /var/backups/linktree/ remote:backups/linktree/
```

---

**💡 Dicas importantes:**
- Configure backup automático logo após o deploy
- Teste a restauração regularmente
- Mantenha backups em locais diferentes (local + remoto)
- Verifique logs de backup periodicamente
- Documente procedimentos de emergência