# 🔐 Configuração Completa - SSH e GitHub Secrets

## ✅ Informações da VPS
- **IP**: 72.61.41.119
- **Usuário**: root
- **Porta SSH**: 22 (padrão)

## 📋 Passo 1: Adicionar Chave Pública na VPS

### Chave Pública SSH (copie exatamente como está):
```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDYW9pSGOyPDTf6dhKNxc1xDxY6HCRHLwpowfoaQ8a1HZMppypQY04NYGOZBLRwSyicaUBgE9+6Wrvv2WNJkS1ij5ZFmWqhSvawKjGyTHltW7uqrB4TnMK4vpue0wJ3TyfWIuXvCRWflxn1Brde0AuZw/IPJegF2COZq/8QqdC8iCb/qDAWckUp165ng2n9mnmfTsDT2CZAk+Ih20h3MW/vr5RsZ20zCiyEyPJncrl8uR728bgYzl8XSsLQbOo2+VEgTJvOD25r3bh2uawpmjoLqETfiiiJEZ4tzoBdxNHuaTdZiCZycnzJgcfDWIn0jw+07tMN0XgoZJbnGOf6IU2Aj8ji/bmHyo9fW66kfqDVw3TD+iuVuITdsO5G6VRxQ1OxPtzNDTgjICTU4kgM+BJRw2Fc87PvkEijbz5NJcT1mtxAptG6DYZlQ5aLoC8X82HCPxSd6EbDzqTQdJu/+DetFK2nwQ00JHQoCtU1b4WLdAzWejF3AzAHp3ZHiq8PjYV5zNYmKFbdYsDRhwe9TzqjbLM5NCiCq6XwhCOUsKXG0g6FgRqyovvdEC9/SkQUFb9X0gA3Pl7rw/Si8CYodyCFdCRHskdazjLMF+ahHiv1iS8dUGFOl45MngKcKZEVJIbbZVEbTksUYEzKgkWBwFSt4RaRUATnRRI06b5UDSMPDQ== deploy@linktree
```

### Como adicionar na VPS:

**Opção A - Via SSH (Recomendado):**
1. Conecte na VPS:
   ```bash
   ssh root@72.61.41.119
   ```

2. Crie o diretório .ssh se não existir:
   ```bash
   mkdir -p ~/.ssh
   chmod 700 ~/.ssh
   ```

3. Adicione a chave pública:
   ```bash
   echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDYW9pSGOyPDTf6dhKNxc1xDxY6HCRHLwpowfoaQ8a1HZMppypQY04NYGOZBLRwSyicaUBgE9+6Wrvv2WNJkS1ij5ZFmWqhSvawKjGyTHltW7uqrB4TnMK4vpue0wJ3TyfWIuXvCRWflxn1Brde0AuZw/IPJegF2COZq/8QqdC8iCb/qDAWckUp165ng2n9mnmfTsDT2CZAk+Ih20h3MW/vr5RsZ20zCiyEyPJncrl8uR728bgYzl8XSsLQbOo2+VEgTJvOD25r3bh2uawpmjoLqETfiiiJEZ4tzoBdxNHuaTdZiCZycnzJgcfDWIn0jw+07tMN0XgoZJbnGOf6IU2Aj8ji/bmHyo9fW66kfqDVw3TD+iuVuITdsO5G6VRxQ1OxPtzNDTgjICTU4kgM+BJRw2Fc87PvkEijbz5NJcT1mtxAptG6DYZlQ5aLoC8X82HCPxSd6EbDzqTQdJu/+DetFK2nwQ00JHQoCtU1b4WLdAzWejF3AzAHp3ZHiq8PjYV5zNYmKFbdYsDRhwe9TzqjbLM5NCiCq6XwhCOUsKXG0g6FgRqyovvdEC9/SkQUFb9X0gA3Pl7rw/Si8CYodyCFdCRHskdazjLMF+ahHiv1iS8dUGFOl45MngKcKZEVJIbbZVEbTksUYEzKgkWBwFSt4RaRUATnRRI06b5UDSMPDQ== deploy@linktree" >> ~/.ssh/authorized_keys
   ```

4. Ajuste as permissões:
   ```bash
   chmod 600 ~/.ssh/authorized_keys
   ```

5. Saia da VPS:
   ```bash
   exit
   ```

**Opção B - Via Painel Hostinger:**
1. Acesse o painel da Hostinger
2. Vá em VPS → SSH Keys
3. Adicione a chave pública acima

---

## 📋 Passo 2: Configurar GitHub Secrets

Acesse: https://github.com/Villar1210/linktree/settings/secrets/actions

### Secret 1: VPS_HOST
- **Name**: `VPS_HOST`
- **Value**: 
  ```
  72.61.41.119
  ```

### Secret 2: VPS_USER
- **Name**: `VPS_USER`
- **Value**: 
  ```
  root
  ```

### Secret 3: VPS_SSH_KEY
- **Name**: `VPS_SSH_KEY`
- **Value** (copie TUDO abaixo, incluindo as linhas BEGIN e END):
```
-----BEGIN OPENSSH PRIVATE KEY-----
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
15cqwKgjb54EWmKbis3WuyliQ=
-----END OPENSSH PRIVATE KEY-----
```

---

## 📋 Passo 3: Testar Conexão SSH

No PowerShell, teste a conexão com a nova chave:

```powershell
ssh -i $env:USERPROFILE\.ssh\id_rsa_linktree root@72.61.41.119
```

Se conectar sem pedir senha, está funcionando! ✅

---

## 📋 Passo 4: Configurar SSH Config (Opcional mas Recomendado)

Crie/edite o arquivo `~/.ssh/config`:

```
Host linktree-vps
    HostName 72.61.41.119
    User root
    IdentityFile ~/.ssh/id_rsa_linktree
    StrictHostKeyChecking no
```

Depois você pode conectar apenas com:
```bash
ssh linktree-vps
```

---

## 🚀 Passo 5: Testar Deploy Automático

Após configurar os secrets, faça um commit qualquer:

```powershell
# Criar arquivo de teste
echo "teste" > teste.txt
git add teste.txt
git commit -m "Test: Verificar deploy automático"
git push origin master
```

Acompanhe em: https://github.com/Villar1210/linktree/actions

---

## ✅ Checklist

- [ ] Adicionar chave pública na VPS
- [ ] Testar conexão SSH com a nova chave
- [ ] Adicionar secret VPS_HOST no GitHub
- [ ] Adicionar secret VPS_USER no GitHub
- [ ] Adicionar secret VPS_SSH_KEY no GitHub
- [ ] Fazer push para testar deploy automático
- [ ] Verificar execução do GitHub Actions

---

## 🔍 Troubleshooting

### Erro: "Permission denied (publickey)"
- Verifique se a chave pública foi adicionada corretamente na VPS
- Confirme que as permissões estão corretas (600 para authorized_keys)

### GitHub Actions continua falhando
- Verifique se copiou a chave privada COMPLETA (incluindo BEGIN e END)
- Certifique-se que não há espaços extras no início/fim da chave

### Não consegue conectar na VPS
- Verifique se o firewall permite conexões SSH (porta 22)
- Confirme que o IP está correto: 72.61.41.119
