# 🌐 Configuração DNS para linktree.ivillar.com.br

## 📋 Pré-requisitos

Antes de configurar o servidor, você precisa configurar o DNS do subdomínio.

## 🔧 1. Configuração DNS

### **No painel do seu provedor de domínio (Registro.br, Godaddy, etc.):**

Adicione um registro DNS tipo **A** apontando para o IP do seu servidor:

```
Tipo: A
Nome: linktree
Destino: IP_DO_SEU_SERVIDOR
TTL: 3600 (1 hora)
```

**Exemplo:**
- Se o IP do servidor é `192.168.1.100`
- Criar: `linktree.ivillar.com.br` → `192.168.1.100`

### **Verificar propagação DNS:**
```bash
# Testar resolução DNS
nslookup linktree.ivillar.com.br

# Ou usando dig
dig linktree.ivillar.com.br

# Verificar online
# https://www.whatsmydns.net/
```

## 🚀 2. Deploy no Servidor

### **Comandos no servidor:**

```bash
# 1. Conectar via SSH
ssh usuario@IP_DO_SERVIDOR

# 2. Navegar para pasta do projeto
cd /var/www/linktree

# 3. Executar configuração do Nginx
./configure-nginx.sh

# 4. Testar configuração
./test-setup.sh

# 5. Verificar se está funcionando
curl http://linktree.ivillar.com.br
```

## 🔒 3. Configurar SSL (HTTPS)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obter certificado SSL
sudo certbot --nginx -d linktree.ivillar.com.br

# Verificar renovação automática
sudo certbot renew --dry-run
```

## ✅ 4. URLs Finais

Após a configuração completa:

- **HTTP**: http://linktree.ivillar.com.br
- **HTTPS**: https://linktree.ivillar.com.br (após SSL)

## 🛠️ 5. Troubleshooting

### **DNS não resolve:**
```bash
# Verificar se o DNS foi configurado corretamente
dig linktree.ivillar.com.br

# Se não resolver, aguarde propagação (até 48h)
# Ou contate seu provedor de domínio
```

### **Nginx não responde:**
```bash
# Verificar status
sudo systemctl status nginx

# Verificar configuração
sudo nginx -t

# Reiniciar se necessário
sudo systemctl restart nginx
```

### **Aplicação não funciona:**
```bash
# Verificar status da aplicação
sudo systemctl status linktree

# Ver logs
sudo journalctl -u linktree -f

# Reiniciar aplicação
sudo systemctl restart linktree
```

## 📊 6. Monitoramento

### **Verificar logs:**
```bash
# Logs do Nginx
sudo tail -f /var/log/nginx/linktree_access.log
sudo tail -f /var/log/nginx/linktree_error.log

# Logs da aplicação
sudo journalctl -u linktree -f
```

### **Verificar status dos serviços:**
```bash
# Script de monitoramento
./test-setup.sh

# Status manual
sudo systemctl status nginx linktree
```

## 🎯 7. Configuração Completa

### **Resumo da arquitetura:**

```
Internet → DNS (linktree.ivillar.com.br) → Servidor (IP) → Nginx (porta 80/443) → Flask (porta 5000)
```

### **Fluxo de funcionamento:**

1. **Usuário acessa**: `linktree.ivillar.com.br`
2. **DNS resolve**: para o IP do servidor
3. **Nginx recebe**: requisição na porta 80/443
4. **Nginx faz proxy**: para Flask na porta 5000
5. **Flask responde**: com a aplicação linktree
6. **Nginx retorna**: resposta ao usuário

---

**🏗️ Configuração do subdomínio linktree.ivillar.com.br pronta!**