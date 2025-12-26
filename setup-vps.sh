#!/bin/bash

# 🚀 Script de Configuração VPS - Adicionar Chave SSH
# ====================================================
# Execute este script NA VPS para adicionar a chave pública

set -e

echo "🚀 Configurando chave SSH na VPS..."
echo "===================================="

# Chave pública (substitua com a sua)
PUBLIC_KEY="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDYW9pSGOyPDTf6dhKNxc1xDxY6HCRHLwpowfoaQ8a1HZMppypQY04NYGOZBLRwSyicaUBgE9+6Wrvv2WNJkS1ij5ZFmWqhSvawKjGyTHltW7uqrB4TnMK4vpue0wJ3TyfWIuXvCRWflxn1Brde0AuZw/IPJegF2COZq/8QqdC8iCb/qDAWckUp165ng2n9mnmfTsDT2CZAk+Ih20h3MW/vr5RsZ20zCiyEyPJncrl8uR728bgYzl8XSsLQbOo2+VEgTJvOD25r3bh2uawpmjoLqETfiiiJEZ4tzoBdxNHuaTdZiCZycnzJgcfDWIn0jw+07tMN0XgoZJbnGOf6IU2Aj8ji/bmHyo9fW66kfqDVw3TD+iuVuITdsO5G6VRxQ1OxPtzNDTgjICTU4kgM+BJRw2Fc87PvkEijbz5NJcT1mtxAptG6DYZlQ5aLoC8X82HCPxSd6EbDzqTQdJu/+DetFK2nwQ00JHQoCtU1b4WLdAzWejF3AzAHp3ZHiq8PjYV5zNYmKFbdYsDRhwe9TzqjbLM5NCiCq6XwhCOUsKXG0g6FgRqyovvdEC9/SkQUFb9X0gA3Pl7rw/Si8CYodyCFdCRHskdazjLMF+ahHiv1iS8dUGFOl45MngKcKZEVJIbbZVEbTksUYEzKgkWBwFSt4RaRUATnRRI06b5UDSMPDQ== deploy@linktree"

# Criar diretório .ssh se não existir
echo "📁 Criando diretório .ssh..."
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Verificar se a chave já existe
if grep -q "$PUBLIC_KEY" ~/.ssh/authorized_keys 2>/dev/null; then
    echo "✅ Chave SSH já existe no authorized_keys"
else
    # Adicionar chave pública
    echo "🔑 Adicionando chave pública..."
    echo "$PUBLIC_KEY" >> ~/.ssh/authorized_keys
    echo "✅ Chave adicionada com sucesso!"
fi

# Ajustar permissões
echo "🔒 Ajustando permissões..."
chmod 600 ~/.ssh/authorized_keys

# Verificar configuração SSH
echo ""
echo "📋 Verificando configuração SSH..."
if [ -f /etc/ssh/sshd_config ]; then
    # Verificar se autenticação por chave está habilitada
    if grep -q "^PubkeyAuthentication yes" /etc/ssh/sshd_config; then
        echo "✅ PubkeyAuthentication está habilitado"
    else
        echo "⚠️  PubkeyAuthentication pode não estar habilitado"
        echo "   Adicione 'PubkeyAuthentication yes' em /etc/ssh/sshd_config"
    fi
fi

echo ""
echo "===================================="
echo "✅ Configuração concluída!"
echo "===================================="
echo ""
echo "🧪 Teste a conexão do seu computador local:"
echo "   ssh -i ~/.ssh/id_rsa_linktree root@72.61.41.119"
echo ""
echo "Ou se configurou o SSH config:"
echo "   ssh linktree-vps"
