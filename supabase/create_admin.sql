-- Deletar usuário existente (se houver)
DELETE FROM public.users WHERE email = 'villar.lumiar@gmail.com';

-- Inserir usuário admin na tabela users
INSERT INTO public.users (id, email, name, role, phone)
VALUES (
  '174df23d-1c54-43fe-8e7f-73f8270633d6',
  'villar.lumiar@gmail.com',
  'Villar Lumiar',
  'admin',
  '(11) 97387-9858'
);
