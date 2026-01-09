// Script para criar usuário administrador
// Execute com: node create-admin.js

const bcrypt = require('bcrypt');

const email = 'superadmin@gmail.com';
const password = 'Assembleia1&$1010';
const name = 'Super Administrador';
const role = 'admin';

async function createAdmin() {
  try {
    // Gerar hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('\n=== CRIAR USUÁRIO ADMINISTRADOR ===\n');
    console.log('Nome:', name);
    console.log('Email:', email);
    console.log('Senha:', password);
    console.log('Senha Hasheada:', hashedPassword);
    console.log('Role:', role);
    console.log('\n=== SQL PARA EXECUTAR NO POSTGRESQL ===\n');
    
    const sql = `
INSERT INTO users (name, email, password, role, active, created_at, updated_at)
VALUES (
  '${name}',
  '${email}',
  '${hashedPassword}',
  '${role}',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  active = EXCLUDED.active,
  updated_at = NOW();

-- Verificar
SELECT id, name, email, role, active FROM users WHERE email = '${email}';
    `.trim();
    
    console.log(sql);
    console.log('\n=== INSTRUÇÕES ===');
    console.log('1. Copie o SQL acima');
    console.log('2. Abra o pgAdmin ou qualquer cliente PostgreSQL');
    console.log('3. Conecte ao banco "gerencia_church"');
    console.log('4. Execute o SQL');
    console.log('5. Faça login no sistema com:');
    console.log(`   Email: ${email}`);
    console.log(`   Senha: ${password}`);
    console.log('\n✅ Pronto para usar!\n');
    
  } catch (error) {
    console.error('Erro ao gerar hash:', error);
  }
}

createAdmin();
