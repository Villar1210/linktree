# Corrigir warning de safe.directory do git
git config --global --add safe.directory /tmp/linktree
#!/bin/bash

# Script de deploy automatizado para produção Flask + Gunicorn + Nginx
# Uso: ./deploy_full.sh

set -e

# Caminho do projeto (ajuste se necessário)
PROJ_DIR="/tmp/linktree"
cd "$PROJ_DIR"

echo "[1/7] Parando Gunicorn antigo (se existir)..."
sudo systemctl stop gunicorn || true

echo "[2/7] Atualizando código fonte... (upload manual, sem git pull)"

echo "[3/7] Ativando virtualenv..."
if [ -d "venv" ]; then
    source venv/bin/activate
else
    python3 -m venv venv
    source venv/bin/activate
fi

echo "[4/7] Instalando dependências..."
pip install --upgrade pip
pip install -r requirements.txt

echo "[5/7] Exportando variáveis de ambiente (.env)..."
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

echo "[6/7] Aplicando migrações do banco de dados..."
flask db upgrade

# echo "[Opcional] Coletando arquivos estáticos..."
# flask collect

echo "[7/7] Iniciando Gunicorn..."
sudo systemctl start gunicorn
sleep 2

echo "Status do Gunicorn:"
sudo systemctl status gunicorn --no-pager

echo "Deploy concluído com sucesso!"

# Diagnóstico rápido do backend
curl -I http://127.0.0.1:5000 || echo "Backend não respondeu na porta 5000."

echo "[6/6] Checando logs do nginx e gunicorn..."
echo "--- Últimos 20 linhas do log do nginx ---"
sudo tail -n 20 /var/log/nginx/error.log || true

echo "--- Últimos 20 linhas do log do gunicorn ---"
if [ -d "logs" ]; then
    tail -n 20 logs/gunicorn.log || true
else
    echo "(Ajuste o caminho do log do gunicorn se necessário)"
fi

echo "[OK] Deploy e diagnóstico concluídos."
