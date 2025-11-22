#!/bin/bash
# Script de atualização e reinício do servidor Flask + Nginx com venv automático
# Uso: bash atualizar_servidor.sh

set -e

PROJ_DIR="/tmp/linktree"
VENV_DIR="$PROJ_DIR/venv"
LOG_FILE="$PROJ_DIR/atualizacao.log"

# 1. Parar processos Flask antigos (se rodando em background)
PIDS=$(ps aux | grep 'python app.py' | grep -v grep | awk '{print $2}')
if [ ! -z "$PIDS" ]; then
  echo "Parando Flask antigo..." | tee -a "$LOG_FILE"
  kill $PIDS
  sleep 2
fi

# 2. Criar venv se não existir
echo "Verificando ambiente virtual..." | tee -a "$LOG_FILE"
if [ ! -d "$VENV_DIR" ]; then
  python3 -m venv "$VENV_DIR"
fi

# 3. Ativar venv
echo "Ativando venv..." | tee -a "$LOG_FILE"
source "$VENV_DIR/bin/activate"

# 4. Instalar dependências
echo "Instalando dependências..." | tee -a "$LOG_FILE"
pip install --upgrade pip
pip install -r "$PROJ_DIR/requirements.txt"

# 5. (Opcional) Backup do banco de dados
# cp "$PROJ_DIR/database/app.db" "$PROJ_DIR/database/app.db.bak.$(date +%Y%m%d%H%M%S)"

# 6. Subir o Flask em background
nohup python "$PROJ_DIR/app.py" > "$PROJ_DIR/flask.log" 2>&1 &

# 7. Reiniciar nginx
sudo systemctl reload nginx

echo "Atualização concluída com sucesso!" | tee -a "$LOG_FILE"
