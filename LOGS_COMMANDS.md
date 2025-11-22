# 📋 Comandos de Logs - Lumiar Linktree

## Comandos Principais Solicitados

### Ver logs da aplicação
```bash
# Nginx Access Log (requisições HTTP)
tail -f /var/log/nginx/access.log

# Nginx Error Log (erros do servidor web)
tail -f /var/log/nginx/error.log
```

### Logs do Gunicorn
```bash
# Log principal do Gunicorn
tail -f gunicorn.log

# Se estiver no diretório /var/www/linktree
tail -f /var/www/linktree/gunicorn.log

# Logs separados (se configurados)
tail -f /var/www/linktree/logs/gunicorn_access.log
tail -f /var/www/linktree/logs/gunicorn_error.log
```

## Scripts de Monitoramento Criados

### Quick Logs (uso rápido)
```bash
# Script simples para logs
./quick-logs.sh                # Nginx access (padrão)
./quick-logs.sh nginx-access   # Nginx access
./quick-logs.sh nginx-error    # Nginx error
./quick-logs.sh gunicorn       # Gunicorn
./quick-logs.sh all            # Resumo de todos
```

### Monitor Completo (análise avançada)
```bash
# Script completo de monitoramento
./logs-monitor.sh              # Menu interativo
./logs-monitor.sh nginx-access # Monitorar access log
./logs-monitor.sh nginx-error  # Monitorar error log
./logs-monitor.sh gunicorn     # Monitorar gunicorn
./logs-monitor.sh all          # Monitorar todos
./logs-monitor.sh analyze      # Análise de logs
```

### Via Quick Run
```bash
# Através do script principal
./quick-run.sh logs           # Ver logs recentes
./quick-run.sh monitor        # Monitor interativo
```

## Comandos de Sistema

### Via Systemd (se configurado como serviço)
```bash
# Ver logs do serviço
sudo journalctl -u linktree -f

# Últimas 50 linhas
sudo journalctl -u linktree -n 50

# Logs desde hoje
sudo journalctl -u linktree --since today
```

### Análise Rápida
```bash
# Contar erros no Nginx
grep -c "error" /var/log/nginx/error.log

# Status codes mais frequentes
awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c | sort -nr

# IPs mais frequentes
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -10

# Requests por hora
awk '{print $4}' /var/log/nginx/access.log | cut -d: -f2 | sort | uniq -c
```

## Localização dos Logs

### Nginx
- **Access Log**: `/var/log/nginx/access.log`
- **Error Log**: `/var/log/nginx/error.log`
- **Site específico**: `/var/log/nginx/linktree_access.log`
- **Site específico**: `/var/log/nginx/linktree_error.log`

### Gunicorn
- **Log principal**: `/var/www/linktree/gunicorn.log`
- **Access separado**: `/var/www/linktree/logs/gunicorn_access.log`
- **Error separado**: `/var/www/linktree/logs/gunicorn_error.log`

### Aplicação
- **Via Systemd**: `journalctl -u linktree`
- **Log customizado**: `/var/www/linktree/logs/app.log`

## Monitoramento em Tempo Real

### Múltiplos logs simultaneamente
```bash
# Ver vários logs ao mesmo tempo
tail -f /var/log/nginx/access.log /var/log/nginx/error.log gunicorn.log
```

### Com filtros
```bash
# Apenas erros 4xx e 5xx
tail -f /var/log/nginx/access.log | grep -E " (4|5)[0-9][0-9] "

# Apenas POST requests
tail -f /var/log/nginx/access.log | grep "POST"

# Filtrar IPs específicos
tail -f /var/log/nginx/access.log | grep "192.168"
```

## Comandos de Manutenção

### Rotação de logs
```bash
# Forçar rotação do Nginx
sudo logrotate /etc/logrotate.d/nginx

# Ver configuração de rotação
cat /etc/logrotate.d/nginx
```

### Limpeza
```bash
# Comprimir logs antigos (mais de 7 dias)
find /var/www/linktree/logs/ -name "*.log" -mtime +7 -exec gzip {} \;

# Remover logs muito antigos (mais de 30 dias)
find /var/www/linktree/logs/ -name "*.log.gz" -mtime +30 -delete
```

## Troubleshooting

### Se os logs não aparecem
```bash
# Verificar permissões
ls -la /var/log/nginx/
ls -la /var/www/linktree/logs/

# Verificar se o Nginx está rodando
sudo systemctl status nginx

# Verificar se o Gunicorn está rodando
ps aux | grep gunicorn

# Criar diretório de logs se não existir
mkdir -p /var/www/linktree/logs
```

### Logs em tempo real não funcionam
```bash
# Verificar se o arquivo existe
ls -la gunicorn.log

# Testar com sudo (problemas de permissão)
sudo tail -f /var/log/nginx/access.log

# Usar journalctl como alternativa
sudo journalctl -u linktree -f
```

---

**Nota**: Os comandos `tail -f` manterão o terminal "pendurado" mostrando logs em tempo real. Use `Ctrl+C` para parar o monitoramento.