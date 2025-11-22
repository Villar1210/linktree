#!/bin/bash
# Script de atualização automática do projeto linktree na VPS
# Uso: bash atualizar_linktree.sh

# Caminho do projeto (ajuste se necessário)
PROJETO_DIR="/tmp/linktree"

# 1. Entrar na pasta do projeto
cd "$PROJETO_DIR" || { echo "Pasta do projeto não encontrada: $PROJETO_DIR"; exit 1; }

# 2. Ativar ambiente virtual (se existir)
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
    echo "Ambiente virtual ativado."
else
    echo "Ambiente virtual não encontrado. Pulando ativação."
fi

# 3. Instalar dependências
if [ -f "requirements.txt" ]; then
    pip3 install -r requirements.txt
fi

# 4. Aplicar migrações do banco (se usar Flask-Migrate)
if [ -f "manage.py" ]; then
    python3 manage.py db upgrade
elif [ -f "app.py" ]; then
    flask db upgrade || echo "Comando flask db upgrade falhou ou não é necessário."
fi

# 5. Reiniciar app (ajuste para seu ambiente)
# Tente systemd, supervisor ou modo manual
if systemctl list-units --type=service | grep -q linktree; then
    sudo systemctl restart linktree
    echo "Serviço systemd linktree reiniciado."
elif command -v supervisorctl >/dev/null && supervisorctl status | grep -q linktree; then
    supervisorctl restart linktree
    echo "Serviço supervisor linktree reiniciado."
else
    pkill -f app.py
    nohup python3 app.py &
    echo "App iniciado manualmente."
fi

echo "Atualização concluída!"
