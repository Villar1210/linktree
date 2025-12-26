-- Deletar usuário existente (se houver)
DELETE FROM public.users WHERE id = '1abf13c7-1836-46e3-863c-4710c1418a29';

-- Inserir usuário admin na tabela users
INSERT INTO public.users (id, email, name, role, phone)
VALUES (
  '1abf13c7-1836-46e3-863c-4710c1418a29',
  'villar.lumiar@gmail.com',
  'Villar Lumiar',
  'admin',
  '(11) 97387-9858'
);
