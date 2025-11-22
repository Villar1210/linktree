#!/bin/bash
cd /root/linktree
pkill -f app.py
nohup python3 app.py > app.log 2>&1 &#!/bin/bash
# Script de Reinicialização - Via WinSCP
# Arquivo: restart-app.sh

echo "🚀 Reiniciando aplicação Lumiar Linktree..."

# Ir para diretório da aplicação
cd /var/www/linktree

# Parar processos existentes
echo "⏹️ Parando processos antigos..."
pkill -f gunicorn 2>/dev/null || true
pkill -f "python.*app.py" 2>/dev/null || true
sleep 3

# Ativar ambiente virtual e inicializar banco
echo "🗄️ Inicializando banco de dados..."
source venv/bin/activate
python3 -c "
from app import app, db
try:
    with app.app_context():
        db.create_all()
    print('✅ Database initialized successfully!')
except Exception as e:
    print(f'❌ Database error: {e}')
" 2>/dev/null || echo "⚠️ Database initialization skipped"

# Iniciar aplicação em modo daemon
echo "🚀 Iniciando aplicação..."
source venv/bin/activate
nohup gunicorn --config gunicorn.conf.py app:app > logs/app.log 2>&1 &
echo $! > logs/app.pid

# Aguardar inicialização
sleep 5

# Reiniciar nginx
echo "🔄 Reiniciando Nginx..."
systemctl restart nginx

# Verificar status
echo "🔍 Verificando status..."
if pgrep -f gunicorn > /dev/null; then
    echo "✅ Gunicorn está rodando"
else
    echo "❌ Gunicorn não está rodando"
fi

if systemctl is-active --quiet nginx; then
    echo "✅ Nginx está ativo"
else
    echo "❌ Nginx não está ativo"
fi

# Testar aplicação
echo "🧪 Testando aplicação..."
sleep 2
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5000 | grep -q "200"; then
    echo "✅ Aplicação local respondendo (200)"
else
    echo "⚠️ Aplicação local não responde corretamente"
fi

echo ""
echo "🎉 Processo de reinicialização concluído!"
echo "📱 Teste: https://linktree.ivillar.com.br"
echo ""
echo "📊 Status dos processos:"
ps aux | grep -E "(gunicorn|nginx)" | grep -v grep || echo "Nenhum processo encontrado"