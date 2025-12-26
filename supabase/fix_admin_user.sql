-- =======================================================
-- CORREÇÃO DE USUÁRIO ADMIN
-- =======================================================
-- Este script vai pegar o UUID correto do seu usuário no Authentication
-- e garantir que ele exista na tabela public.users

-- 1. Primeiro, removemos qualquer registro antigo desse email na tabela pública
DELETE FROM public.users WHERE email = 'villar.lumiar@gmail.com';

-- 2. Inserimos novamente pegando o ID VERDADEIRO da tabela auth.users
INSERT INTO public.users (id, email, name, role, phone)
SELECT 
  id, 
  email, 
  'Villar Lumiar', 
  'admin', 
  '(11) 97387-9858'
FROM auth.users
WHERE email = 'villar.lumiar@gmail.com';

-- 3. Verificar se deu certo
SELECT * FROM public.users WHERE email = 'villar.lumiar@gmail.com';
