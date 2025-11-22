# 📋 COMANDOS SSH - PASSO A PASSO

## PASSO 2: Verificação do Sistema
```bash
# 1. Verificar sistema operacional
lsb_release -a

# 2. Verificar se Python está instalado
python3 --version

# 3. Verificar se Nginx está instalado
nginx -v

# 4. Verificar espaço em disco
df -h

# 5. Ver diretório atual
pwd
ls -la
```

## PASSO 3: Atualizar Sistema
```bash
# 1. Atualizar lista de pacotes
apt update

# 2. Fazer upgrade (pode demorar alguns minutos)
apt upgrade -y
```

## PASSO 4: Criar Diretórios
```bash
# 1. Criar diretório para aplicação
mkdir -p /var/www/linktree

# 2. Ir para diretório temporário
cd /tmp

# 3. Verificar se existe algum arquivo anterior
ls -la *.zip
```