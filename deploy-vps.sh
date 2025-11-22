#!/bin/bash
# 🚀 Script de Deploy Automático - VPS Hostinger
# Execute este script no servidor após fazer SSH

echo "🚀 Iniciando deploy da nova versão..."

# 1. Fazer backup da versão atual
echo "📦 Fazendo backup da versão atual..."
cd /var/www
if [ -d "linktree" ]; then
    cp -r linktree linktree-backup-$(date +%Y%m%d_%H%M%S)
    echo "✅ Backup criado"
fi

# 2. Extrair nova versão
echo "📂 Extraindo nova versão..."
cd /tmp
if [ -f "lumiar-linktree-20251109_164052.zip" ]; then
    unzip -o lumiar-linktree-20251109_164052.zip -d /var/www/linktree-new
    echo "✅ Arquivo extraído"
else
    echo "❌ Arquivo ZIP não encontrado em /tmp/"
    exit 1
fi

# 3. Atualizar arquivos
echo "🔄 Atualizando arquivos..."
cd /var/www
rsync -av linktree-new/ linktree/
rm -rf linktree-new
echo "✅ Arquivos atualizados"

# 4. Configurar permissões
echo "🔧 Configurando permissões..."
cd /var/www/linktree
chmod +x *.sh
chown -R www-data:www-data /var/www/linktree
echo "✅ Permissões configuradas"

# 5. Instalar/atualizar dependências Python
echo "📦 Instalando dependências Python..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✅ Ambiente virtual criado"
fi

source venv/bin/activate
pip install -r requirements.txt
echo "✅ Dependências instaladas"

# 6. Atualizar base de dados
echo "🗄️ Atualizando base de dados..."
python3 -c "
from app import app, db
with app.app_context():
    db.create_all()
    print('✅ Database updated successfully!')
"

# 7. Parar serviços atuais
echo "⏹️ Parando serviços atuais..."
pkill -f gunicorn || true
sleep 2

# 8. Iniciar aplicação
echo "🚀 Iniciando aplicação..."
./quick-run.sh daemon

# 9. Reiniciar Nginx
echo "🔄 Reiniciando Nginx..."
systemctl restart nginx

# 10. Verificar status
echo "🔍 Verificando status..."
sleep 3
./quick-run.sh status

# 11. Testar aplicação
echo "🧪 Testando aplicação..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5000 | grep -q "200"; then
    echo "✅ Aplicação local funcionando"
else
    echo "⚠️ Problema com aplicação local"
fi

if curl -s -o /dev/null -w "%{http_code}" https://linktree.ivillar.com.br | grep -q "200\|301\|302"; then
    echo "✅ Aplicação online funcionando"
else
    echo "⚠️ Verificar configuração SSL/DNS"
fi

echo ""
echo "🎉 Deploy concluído!"
echo ""
echo "📋 URLs disponíveis:"
echo "🏠 Página principal: https://linktree.ivillar.com.br"
echo "🔐 Login: https://linktree.ivillar.com.br/auth/login"
echo "📝 Cadastro: https://linktree.ivillar.com.br/auth/cadastro"
echo "👑 Dashboard Admin: https://linktree.ivillar.com.br/admin/dashboard"
echo "🏢 Dashboard Corretor: https://linktree.ivillar.com.br/corretor/dashboard"
echo "👤 Dashboard Cliente: https://linktree.ivillar.com.br/cliente/dashboard"
echo "🏬 Dashboard Imobiliária: https://linktree.ivillar.com.br/imobiliaria/dashboard"
echo ""
echo "🔑 Credenciais de teste:"
echo "Admin: admin@ivillar.com.br / Admin@123"
echo "Corretor: corretor@lumiar.com.br / Corretor@123"
echo "Cliente: cliente@teste.com.br / Cliente@123"
echo "Imobiliária: imobiliaria@lumiar.com.br / Imobiliaria@123"
echo ""
echo "✨ Sistema completo disponível!"