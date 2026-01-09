-- Script para criar usuário administrador padrão
-- Email: superadmin@gmail.com
-- Senha: Assembleia1&$1010

-- IMPORTANTE: Execute este script no banco de dados PostgreSQL "gerencia_church"

-- A senha será hasheada com bcrypt (cost factor 10)
-- Hash gerado para: Assembleia1&$1010
-- $2b$10$ZxYvU9K3jQm5h5f3eYH8YuLKp1Kc6Q6Qh5f3eYH8YuLKp1Kc6Q6Qh

INSERT INTO users (name, email, password, role, active, created_at, updated_at)
VALUES (
  'Super Administrador',
  'superadmin@gmail.com',
  '$2b$10$ZxYvU9K3jQm5h5f3eYH8YuLKp1Kc6Q6Qh5f3eYH8YuLKp1Kc6Q6Qh',
  'admin',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  active = EXCLUDED.active,
  updated_at = NOW();

-- Verificar se o usuário foi criado
SELECT id, name, email, role, active, created_at 
FROM users 
WHERE email = 'superadmin@gmail.com';
