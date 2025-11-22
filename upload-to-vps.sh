#!/bin/bash
# 📤 Upload para VPS Hostinger - Lumiar Linktree

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📤 Upload para VPS Hostinger${NC}"
echo "=============================="

# Verificar se estamos no diretório correto
if [ ! -f "app.py" ]; then
    echo -e "${RED}❌ Execute este script no diretório do projeto (onde está o app.py)${NC}"
    exit 1
fi

# Solicitar informações da VPS
read -p "Digite o IP da VPS Hostinger: " VPS_IP
read -p "Digite o usuário SSH (geralmente root): " SSH_USER
read -p "Digite a porta SSH (padrão 22): " SSH_PORT

# Usar padrões se não informado
SSH_PORT=${SSH_PORT:-22}
SSH_USER=${SSH_USER:-root}

echo ""
echo -e "${BLUE}📋 Informações de conexão:${NC}"
echo "IP: $VPS_IP"
echo "Usuário: $SSH_USER"  
echo "Porta: $SSH_PORT"
echo ""

# Confirmar antes de continuar
read -p "As informações estão corretas? (y/n): " confirm
if [[ $confirm != [yY] ]]; then
    echo "Upload cancelado."
    exit 1
fi

# Criar arquivo ZIP com todos os arquivos necessários
echo -e "${YELLOW}📦 Criando arquivo para upload...${NC}"

# Lista de arquivos/pastas essenciais
FILES_TO_UPLOAD=(
    "app.py"
    "requirements.txt"
    "gunicorn.conf.py"
    "nginx-linktree.conf"
    "data/"
    "static/"
    "templates/"
    "install.sh"
    "configure-nginx.sh"
    "run.sh"
    "quick-run.sh"
    "backup.sh"
    "logs-monitor.sh"
    "quick-logs.sh"
    "setup-backup-cron.sh"
    "DEPLOY_HOSTINGER.md"
    "LOGS_COMMANDS.md"
    "BACKUP_GUIDE.md"
    "README.md"
)

# Verificar se todos os arquivos existem
echo "Verificando arquivos..."
missing_files=()
for file in "${FILES_TO_UPLOAD[@]}"; do
    if [ ! -e "$file" ]; then
        missing_files+=("$file")
        echo -e "${YELLOW}⚠️  Arquivo não encontrado: $file${NC}"
    else
        echo -e "${GREEN}✅ $file${NC}"
    fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}Alguns arquivos não foram encontrados, mas continuaremos com os disponíveis.${NC}"
fi

# Criar ZIP
ZIP_FILE="lumiar-linktree-$(date +%Y%m%d_%H%M%S).zip"
echo ""
echo -e "${BLUE}📦 Criando $ZIP_FILE...${NC}"

if command -v zip &> /dev/null; then
    # Usando zip (Linux/Mac)
    zip -r "$ZIP_FILE" "${FILES_TO_UPLOAD[@]}" 2>/dev/null
elif command -v tar &> /dev/null; then
    # Usando tar como fallback
    ZIP_FILE="lumiar-linktree-$(date +%Y%m%d_%H%M%S).tar.gz"
    tar -czf "$ZIP_FILE" "${FILES_TO_UPLOAD[@]}" 2>/dev/null
else
    echo -e "${RED}❌ Nem zip nem tar disponível. Fazendo upload de pasta completa.${NC}"
    ZIP_FILE=""
fi

if [ -f "$ZIP_FILE" ]; then
    echo -e "${GREEN}✅ Arquivo criado: $ZIP_FILE${NC}"
    
    # Mostrar tamanho do arquivo
    if command -v ls &> /dev/null; then
        SIZE=$(ls -lh "$ZIP_FILE" | awk '{print $5}')
        echo "Tamanho: $SIZE"
    fi
fi

echo ""
echo -e "${BLUE}🚀 Iniciando upload...${NC}"

# Função para upload via SCP
upload_file() {
    local source="$1"
    local destination="$2"
    
    echo "Uploading $source para $destination..."
    
    # Tentar upload com diferentes opções
    if scp -P "$SSH_PORT" -o ConnectTimeout=30 -o StrictHostKeyChecking=no "$source" "$SSH_USER@$VPS_IP:$destination"; then
        echo -e "${GREEN}✅ Upload concluído!${NC}"
        return 0
    else
        echo -e "${RED}❌ Falha no upload${NC}"
        return 1
    fi
}

# Fazer upload
if [ -f "$ZIP_FILE" ]; then
    # Upload do arquivo ZIP
    echo "📤 Enviando arquivo compactado..."
    if upload_file "$ZIP_FILE" "/tmp/"; then
        echo ""
        echo -e "${GREEN}🎉 Upload concluído com sucesso!${NC}"
        echo ""
        echo -e "${BLUE}📋 Próximos passos no servidor:${NC}"
        echo "1. Conectar via SSH:"
        echo "   ssh $SSH_USER@$VPS_IP"
        echo ""
        echo "2. Extrair arquivos:"
        echo "   cd /tmp"
        echo "   unzip $ZIP_FILE -d /var/www/linktree"
        echo "   # ou se for .tar.gz:"
        echo "   # tar -xzf $ZIP_FILE -C /var/www/linktree --strip-components=1"
        echo ""
        echo "3. Ir para o diretório e instalar:"
        echo "   cd /var/www/linktree"
        echo "   chmod +x *.sh"
        echo "   ./install.sh"
        echo ""
        echo "4. Configurar domínio e iniciar:"
        echo "   ./configure-nginx.sh"
        echo "   ./quick-run.sh daemon"
        echo ""
    fi
else
    # Upload individual de arquivos (fallback)
    echo "📤 Enviando arquivos individuais..."
    
    # Criar diretório no servidor
    echo "Criando diretório /tmp/linktree-upload no servidor..."
    ssh -p "$SSH_PORT" -o ConnectTimeout=30 -o StrictHostKeyChecking=no "$SSH_USER@$VPS_IP" "mkdir -p /tmp/linktree-upload"
    
    # Upload de cada arquivo/pasta
    success=0
    total=0
    
    for file in "${FILES_TO_UPLOAD[@]}"; do
        if [ -e "$file" ]; then
            total=$((total + 1))
            echo "📤 Enviando $file..."
            
            if [ -d "$file" ]; then
                # É um diretório
                if scp -P "$SSH_PORT" -r -o ConnectTimeout=30 -o StrictHostKeyChecking=no "$file" "$SSH_USER@$VPS_IP:/tmp/linktree-upload/"; then
                    success=$((success + 1))
                    echo -e "${GREEN}✅ $file enviado${NC}"
                else
                    echo -e "${RED}❌ Falha ao enviar $file${NC}"
                fi
            else
                # É um arquivo
                if scp -P "$SSH_PORT" -o ConnectTimeout=30 -o StrictHostKeyChecking=no "$file" "$SSH_USER@$VPS_IP:/tmp/linktree-upload/"; then
                    success=$((success + 1))
                    echo -e "${GREEN}✅ $file enviado${NC}"
                else
                    echo -e "${RED}❌ Falha ao enviar $file${NC}"
                fi
            fi
        fi
    done
    
    echo ""
    echo -e "${BLUE}📊 Resumo do upload:${NC}"
    echo "Arquivos enviados: $success de $total"
    
    if [ $success -eq $total ]; then
        echo -e "${GREEN}🎉 Todos os arquivos foram enviados com sucesso!${NC}"
    elif [ $success -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Upload parcial concluído${NC}"
    else
        echo -e "${RED}❌ Falha no upload${NC}"
        exit 1
    fi
    
    echo ""
    echo -e "${BLUE}📋 Próximos passos no servidor:${NC}"
    echo "1. Conectar via SSH:"
    echo "   ssh $SSH_USER@$VPS_IP"
    echo ""
    echo "2. Mover arquivos:"
    echo "   mv /tmp/linktree-upload /var/www/linktree"
    echo "   cd /var/www/linktree"
    echo "   chmod +x *.sh"
    echo ""
    echo "3. Instalar:"
    echo "   ./install.sh"
    echo ""
fi

# Limpar arquivo ZIP temporário
if [ -f "$ZIP_FILE" ]; then
    read -p "Deseja manter o arquivo $ZIP_FILE localmente? (y/n): " keep_zip
    if [[ $keep_zip != [yY] ]]; then
        rm "$ZIP_FILE"
        echo "Arquivo temporário removido."
    fi
fi

echo ""
echo -e "${BLUE}📖 Documentação completa:${NC}"
echo "Consulte DEPLOY_HOSTINGER.md para guia detalhado"
echo ""
echo -e "${GREEN}✨ Upload concluído! Agora conecte no servidor e execute a instalação.${NC}"