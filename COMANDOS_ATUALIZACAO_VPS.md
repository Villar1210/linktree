# 🚀 Comandos para Atualização VPS - Execute na Ordem

## 1. Conectar no Servidor
```bash
ssh root@72.61.41.119
```

## 2. Fazer Backup da Versão Atual (Segurança)
```bash
cd /var/www
cp -r linktree linktree-backup-$(date +%Y%m%d_%H%M%S)
```

## 3. Extrair Nova Versão
```bash
cd /tmp
unzip -o lumiar-linktree-20251109_164052.zip -d /var/www/linktree-new

# Mover arquivos novos
cd /var/www
rsync -av linktree-new/ linktree/
rm -rf linktree-new
```

## 4. Configurar Permissões e Dependências
```bash
cd /var/www/linktree
chmod +x *.sh

# Ativar ambiente virtual e instalar dependências
source venv/bin/activate
pip install -r requirements.txt
```

## 5. Atualizar Base de Dados
```bash
# Inicializar/atualizar banco de dados
python3 -c "
from app import app, db
with app.app_context():
    db.create_all()
    print('Database updated successfully!')
"
```

## 6. Reiniciar Serviços
```bash
# Parar serviços atuais
./quick-run.sh stop

# Reiniciar Gunicorn
./quick-run.sh daemon

# Reiniciar Nginx
systemctl restart nginx

# Verificar status
./quick-run.sh status
```

## 7. Testar Aplicação
```bash
# Testar conectividade local
curl -I http://localhost:5000

# Testar via domínio
curl -I https://linktree.ivillar.com.br

# Verificar logs se necessário
./quick-logs.sh
```

## 8. Verificar Funcionalidades Novas
- ✅ Sistema de autenticação: https://linktree.ivillar.com.br/auth/login
- ✅ Dashboards: /admin/dashboard, /corretor/dashboard, etc.
- ✅ Menu "Área do Membro"
- ✅ Cadastros por tipo de usuário

## 🔍 Troubleshooting
Se algo não funcionar:
```bash
# Ver logs detalhados
tail -f /var/log/nginx/error.log
./quick-logs.sh error

# Reiniciar tudo
systemctl restart nginx
./quick-run.sh restart
```

## 📊 Credenciais de Teste
- **Admin**: admin@ivillar.com.br / Admin@123
- **Corretor**: corretor@lumiar.com.br / Corretor@123
- **Cliente**: cliente@teste.com.br / Cliente@123
- **Imobiliária**: imobiliaria@lumiar.com.br / Imobiliaria@123