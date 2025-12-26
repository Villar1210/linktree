#!/bin/bash

# 🚀 Script de Deploy Automático para VPS
# ----------------------------------------
# Este script deve ser executado NA VPS após conectar via SSH

echo "🚀 Iniciando deploy do Linktree..."
echo "=================================="

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Diretório do projeto
PROJECT_DIR="/var/www/linktree"

# Verificar se diretório existe
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ Erro: Diretório $PROJECT_DIR não encontrado!${NC}"
    echo "Execute primeiro a configuração inicial da VPS."
    exit 1
fi

# Navegar para o projeto
cd $PROJECT_DIR

# 1. Puxar alterações do GitHub
echo -e "${BLUE}📥 Puxando alterações do GitHub...${NC}"
git pull origin master

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao puxar do GitHub!${NC}"
    exit 1
fi

# 2. Instalar/atualizar dependências
echo -e "${BLUE}📦 Instalando dependências...${NC}"
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao instalar dependências!${NC}"
    exit 1
fi

# 3. Build de produção
echo -e "${BLUE}🔨 Fazendo build de produção...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao fazer build!${NC}"
    exit 1
fi

# 4. Reiniciar aplicação com PM2
echo -e "${BLUE}🔄 Reiniciando aplicação...${NC}"
pm2 restart linktree

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao reiniciar PM2!${NC}"
    exit 1
fi

# 5. Mostrar status
echo ""
echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
echo "=================================="
echo ""
pm2 status
echo ""
echo -e "${GREEN}🌐 Aplicação rodando em: http://seu-dominio.com${NC}"
echo -e "${BLUE}📊 Para ver logs: pm2 logs linktree${NC}"
