# 🔗 Checklist de Integração Frontend ↔ Backend

## 📋 Resumo Executivo

Este documento lista **TODOS os endpoints** que o frontend está consumindo do backend NestJS. Use este checklist para verificar se o backend tem todos os endpoints implementados e funcionando corretamente.

**Data de criação**: 09 de Janeiro de 2026  
**Frontend**: Next.js 14 + TypeScript  
**Backend**: NestJS + PostgreSQL  
**Porta Frontend**: 3001  
**Porta Backend**: 3000  

---

## 🎯 Status Geral

- ✅ **9 páginas implementadas** (100%)
- ✅ **7 serviços de API criados**
- ✅ **Zero erros TypeScript**
- ⚠️ **Backend precisa verificar todos os endpoints abaixo**

---

## 🔐 AUTENTICAÇÃO (`/auth`)

### Endpoints Usados

| Método | Rota | Body/Params | Resposta Esperada | Usado em |
|--------|------|-------------|-------------------|----------|
| `POST` | `/auth/login` | `{ email: string, password: string }` | `{ user: {...}, accessToken: string, refreshToken: string }` | Login page |
| `POST` | `/auth/logout` | `{ refreshToken: string }` | `void` | Header logout |
| `POST` | `/auth/refresh` | `{ refreshToken: string }` | `{ accessToken: string, refreshToken: string }` | Axios interceptor |

### Detalhes Importantes

- **JWT Tokens**: Access token e refresh token devem estar em **camelCase** (`accessToken`, `refreshToken`)
- **Token no Header**: `Authorization: Bearer <access_token>`
- **Payload do JWT**: Deve conter `sub` (user id), `email`, `role`
- **Refresh automático**: Frontend faz refresh automático quando recebe 401

### Verificar no Backend

```typescript
// ✅ Verificar se existe:
@Post('login')
async login(@Body() loginDto: LoginDto) {
  return {
    user: { id, name, email, role },
    accessToken: '...',
    refreshToken: '...'
  };
}

@Post('logout')
async logout(@Body() body: { refreshToken: string }) {}

@Post('refresh')
async refresh(@Body() body: { refreshToken: string }) {
  return {
    accessToken: '...',
    refreshToken: '...'
  };
}
```

---

## 👥 MEMBROS (`/members`)

### Endpoints Usados

| Método | Rota | Body/Params | Resposta | Página |
|--------|------|-------------|----------|--------|
| `GET` | `/members` | - | `Member[]` | Members page |
| `GET` | `/members/:id` | `id: number` | `Member` | Detalhes (futuro) |
| `POST` | `/members` | `CreateMemberDto` | `Member` | Modal criar |
| `PATCH` | `/members/:id` | `UpdateMemberDto` | `Member` | Modal editar |
| `DELETE` | `/members/:id` | `id: number` | `void` | Soft delete |

### DTOs Esperados

```typescript
// CreateMemberDto
{
  name: string;           // obrigatório
  cpf?: string;
  birth_date?: string;    // formato: YYYY-MM-DD
  phone?: string;
  email?: string;
  details?: string;       // campo de observações
  // status: NÃO ENVIAR (sempre criado como 'active')
}

// UpdateMemberDto (todos opcionais)
{
  name?: string;
  cpf?: string;
  birth_date?: string;
  phone?: string;
  email?: string;
  details?: string;
  status?: 'active' | 'inactive' | 'transferred';
}

// Member (resposta)
{
  id: number;
  name: string;
  cpf?: string;
  birth_date?: string;
  phone?: string;
  email?: string;
  photo?: string;
  details?: string;
  status: 'active' | 'inactive' | 'transferred';
  created_at: string;
  updated_at: string;
}
```

### RBAC Esperado

- `admin`, `finance`, `leader`, `secretary` → podem listar
- `admin`, `secretary` → podem criar/editar/excluir

---

## 🏢 DEPARTAMENTOS (`/departments`)

### Endpoints Usados

| Método | Rota | Body/Params | Resposta | Página |
|--------|------|-------------|----------|--------|
| `GET` | `/departments` | - | `Department[]` | Departments page |
| `GET` | `/departments/:id` | `id: number` | `Department` | Detalhes (futuro) |
| `POST` | `/departments` | `CreateDepartmentDto` | `Department` | Modal criar |
| `PATCH` | `/departments/:id` | `UpdateDepartmentDto` | `Department` | Modal editar |
| `DELETE` | `/departments/:id` | `id: number` | `void` | Soft delete |

### DTOs Esperados

```typescript
// CreateDepartmentDto
{
  name: string;           // obrigatório
  description?: string;
}

// UpdateDepartmentDto
{
  name?: string;
  description?: string;
  status?: 'active' | 'inactive';  // frontend adiciona status na UI
}

// Department (resposta)
{
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}
```

### RBAC Esperado

- `admin`, `finance`, `leader`, `secretary` → podem listar
- `admin`, `secretary` → podem criar/editar/excluir

---

## 💰 FLUXO DE CAIXA (`/cash-flows`)

### Endpoints Usados

| Método | Rota | Body/Params | Resposta | Página |
|--------|------|-------------|----------|--------|
| `GET` | `/cash-flows` | - | `CashFlow[]` | Cash Flows page |
| `GET` | `/cash-flows/balance` | - | `{ balance: number }` | Cards de resumo |
| `POST` | `/cash-flows` | `CreateCashFlowDto` | `CashFlow` | Modal criar |
| `DELETE` | `/cash-flows/:id` | `id: number` | `void` | Apenas manuais |

### DTOs Esperados

```typescript
// CreateCashFlowDto
{
  type: 'entrada' | 'saida';       // obrigatório
  description: string;              // obrigatório
  amount: number;                   // obrigatório
  date: string;                     // formato: YYYY-MM-DD
  category?: string;
}

// CashFlow (resposta)
{
  id: number;
  type: 'entrada' | 'saida';
  description: string;
  amount: number;
  date: string;
  category?: string;
  origin?: 'manual' | 'automatic';  // IMPORTANTE: fluxos automáticos não podem ser excluídos
  created_by: number;
  created_at: string;
  updated_at: string;
}
```

### Regras Importantes

- ⚠️ **Fluxos automáticos** (gerados por contas pagas/recebidas) **NÃO podem ser excluídos**
- ✅ Apenas fluxos manuais podem ser excluídos pelo usuário
- Backend deve marcar origem como `automatic` quando criar fluxo de conta

### RBAC Esperado

- `admin`, `finance` → acesso total

---

## 💳 CONTAS A PAGAR (`/accounts-payable`)

### Endpoints Usados

| Método | Rota | Body/Params | Resposta | Página |
|--------|------|-------------|----------|--------|
| `GET` | `/accounts-payable` | - | `AccountPayable[]` | Accounts Payable page |
| `POST` | `/accounts-payable` | `CreateAccountPayableDto` | `AccountPayable` | Modal criar |
| `PATCH` | `/accounts-payable/:id/mark-as-paid` | `{ paid_date: string }` | `AccountPayable` | Marcar como pago ⭐ |
| `DELETE` | `/accounts-payable/:id` | `id: number` | `void` | Soft delete |

### DTOs Esperados

```typescript
// CreateAccountPayableDto
{
  description: string;    // obrigatório
  amount: number;         // obrigatório
  due_date: string;       // formato: YYYY-MM-DD
}

// AccountPayable (resposta)
{
  id: number;
  description: string;
  amount: number;
  due_date: string;
  paid_date?: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  created_at: string;
  updated_at: string;
}
```

### Regras Importantes

- ⚠️ **Marcar como pago**: Endpoint específico `/accounts-payable/:id/mark-as-paid`
- ⚠️ Ao marcar como pago, backend **DEVE criar fluxo de caixa automático** (saída)
- Status `overdue` é calculado no frontend se `due_date < hoje` e status = pending

### RBAC Esperado

- `admin`, `finance` → acesso total

---

## 💵 CONTAS A RECEBER (`/accounts-receivable`)

### Endpoints Usados

| Método | Rota | Body/Params | Resposta | Página |
|--------|------|-------------|----------|--------|
| `GET` | `/accounts-receivable` | - | `AccountReceivable[]` | Accounts Receivable page |
| `POST` | `/accounts-receivable` | `CreateAccountReceivableDto` | `AccountReceivable` | Modal criar |
| `PATCH` | `/accounts-receivable/:id/mark-as-received` | `{ received_date: string }` | `AccountReceivable` | Marcar como recebido ⭐ |
| `DELETE` | `/accounts-receivable/:id` | `id: number` | `void` | Soft delete |

### DTOs Esperados

```typescript
// CreateAccountReceivableDto
{
  description: string;    // obrigatório
  amount: number;         // obrigatório
  due_date: string;       // formato: YYYY-MM-DD
}

// AccountReceivable (resposta)
{
  id: number;
  description: string;
  amount: number;
  due_date: string;
  received_date?: string;
  status: 'pending' | 'received' | 'overdue' | 'cancelled';
  created_at: string;
  updated_at: string;
}
```

### Regras Importantes

- ⚠️ **Marcar como recebido**: Endpoint específico `/accounts-receivable/:id/mark-as-received`
- ⚠️ Ao marcar como recebido, backend **DEVE criar fluxo de caixa automático** (entrada)
- Status `overdue` é calculado no frontend se `due_date < hoje` e status = pending

### RBAC Esperado

- `admin`, `finance` → acesso total

---

## 📊 RELATÓRIOS (`/reports`)

### Endpoints Usados

| Método | Rota | Query Params | Resposta | Página |
|--------|------|--------------|----------|--------|
| `GET` | `/reports/financial-summary` | - | `FinancialSummary` | Dashboard + Reports |
| `GET` | `/reports/cash-balance` | - | `{ balance: number }` | Reports cards |
| `GET` | `/reports/cash-flow` | `startDate`, `endDate` | `CashFlow[]` | Reports charts |
| `GET` | `/reports/pending-accounts` | - | `{ total: number, accounts: [] }` | Reports cards |
| `GET` | `/reports/overdue-accounts` | - | `{ total: number, accounts: [] }` | Futuro |

### DTOs Esperados

```typescript
// FinancialSummary (resposta mais importante)
{
  caixa_atual: {
    entradas: number;
    saidas: number;
    saldo: number;
  };
  contas_pendentes: {
    contas_a_pagar: {
      quantidade: number;
      total: number;
      contas: AccountPayable[];
    };
    contas_a_receber: {
      quantidade: number;
      total: number;
      contas: AccountReceivable[];
    };
    saldo_previsto: number;
  };
  projecao_futura: {
    saldo_atual: number;
    a_receber: number;
    a_pagar: number;
    saldo_projetado: number;
  };
}
```

### RBAC Esperado

- `admin`, `finance` → acesso aos relatórios

---

## 👤 USUÁRIOS (`/users`)

### Endpoints Usados

| Método | Rota | Body/Params | Resposta | Página |
|--------|------|-------------|----------|--------|
| `GET` | `/users` | - | `User[]` | Users page |
| `GET` | `/users/:id` | `id: number` | `User` | Detalhes |
| `POST` | `/users` | `CreateUserDto` | `User` | Modal criar |
| `PATCH` | `/users/:id` | `UpdateUserDto` | `User` | Modal editar |
| `DELETE` | `/users/:id` | `id: number` | `void` | Soft delete |

### DTOs Esperados

```typescript
// CreateUserDto
{
  name: string;           // obrigatório
  email: string;          // obrigatório, único
  password: string;       // obrigatório, mínimo 6 caracteres
  role: 'admin' | 'finance' | 'leader' | 'secretary';  // obrigatório
}

// UpdateUserDto
{
  name?: string;
  email?: string;
  password?: string;      // opcional - só atualizar se fornecido
  role?: string;
  active?: boolean;       // para ativar/desativar
}

// User (resposta)
{
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'finance' | 'leader' | 'secretary';
  active: boolean;
  created_at: string;
  updated_at: string;
}
```

### Regras Importantes

- ⚠️ **Senha opcional na edição**: Se `password` não for enviado, não atualizar
- ⚠️ **Email único**: Backend deve validar duplicação
- ⚠️ **Usuário inativo**: Não pode fazer login
- Frontend previne excluir/desativar o próprio usuário

### RBAC Esperado

- `admin` → acesso exclusivo à página de usuários

---

## 🔄 FLUXO DE INTEGRAÇÃO AUTOMÁTICA

### Quando marcar conta como PAGA

1. Frontend chama: `PATCH /accounts-payable/:id/mark-as-paid`
2. Backend deve:
   - Atualizar conta: `status = 'paid'`, `paid_date = hoje`
   - **Criar fluxo de caixa automático**:
     ```typescript
     {
       type: 'saida',
       description: account.description,
       amount: account.amount,
       date: paid_date,
       origin: 'automatic'  // ⭐ IMPORTANTE
     }
     ```
3. Frontend recarrega cash flows e vê o lançamento automático

### Quando marcar conta como RECEBIDA

1. Frontend chama: `PATCH /accounts-receivable/:id/mark-as-received`
2. Backend deve:
   - Atualizar conta: `status = 'received'`, `received_date = hoje`
   - **Criar fluxo de caixa automático**:
     ```typescript
     {
       type: 'entrada',
       description: account.description,
       amount: account.amount,
       date: received_date,
       origin: 'automatic'  // ⭐ IMPORTANTE
     }
     ```
3. Frontend recarrega cash flows e vê o lançamento automático

---

## 🛡️ RBAC - Tabela de Permissões

| Página | admin | finance | leader | secretary |
|--------|-------|---------|--------|-----------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Membros (view) | ✅ | ✅ | ✅ | ✅ |
| Membros (edit) | ✅ | ❌ | ❌ | ✅ |
| Departamentos (view) | ✅ | ✅ | ✅ | ✅ |
| Departamentos (edit) | ✅ | ❌ | ❌ | ✅ |
| Caixa | ✅ | ✅ | ❌ | ❌ |
| Contas a Pagar | ✅ | ✅ | ❌ | ❌ |
| Contas a Receber | ✅ | ✅ | ❌ | ❌ |
| Relatórios | ✅ | ✅ | ❌ | ❌ |
| Usuários | ✅ | ❌ | ❌ | ❌ |

---

## 📝 VALIDAÇÕES IMPORTANTES

### Backend DEVE validar

- ✅ Email único em usuários
- ✅ Senhas hashadas (bcrypt)
- ✅ JWT válido em todas as rotas protegidas
- ✅ Soft delete (nunca deletar de verdade)
- ✅ Datas em formato ISO (YYYY-MM-DD)
- ✅ Valores monetários sempre positivos
- ✅ Status válidos para cada entidade

### Backend NÃO precisa validar no frontend

- ❌ Frontend já valida todos os formulários com Zod
- ❌ Frontend já formata datas corretamente
- ❌ Frontend já previne ações inválidas (ex: excluir próprio usuário)

---

## 🚨 ERROS ESPERADOS

### Códigos HTTP que o frontend trata

| Código | Significado | Ação do Frontend |
|--------|-------------|------------------|
| `200` | Sucesso | Toast success |
| `201` | Criado | Toast success |
| `400` | Bad Request | Toast error com mensagem |
| `401` | Não autorizado | Tenta refresh token → redireciona login |
| `403` | Forbidden | Toast error "Sem permissão" |
| `404` | Not Found | Toast error "Não encontrado" |
| `500` | Server Error | Toast error genérico |

### Formato de erro esperado

```typescript
// Backend deve retornar erros assim:
{
  statusCode: 400,
  message: "Email já cadastrado",  // Frontend mostra esta mensagem
  error: "Bad Request"
}
```

---

## ✅ CHECKLIST PARA BACKEND

Use esta lista para verificar se tudo está implementado:

### Autenticação
- [ ] POST `/auth/login` retorna `accessToken` e `refreshToken` em camelCase
- [ ] POST `/auth/refresh` funciona e renova tokens
- [ ] POST `/auth/logout` invalida refresh token
- [ ] JWT contém `sub`, `email`, `role`

### Membros
- [ ] GET `/members` lista todos
- [ ] POST `/members` cria sem status (sempre active)
- [ ] PATCH `/members/:id` atualiza
- [ ] DELETE `/members/:id` faz soft delete
- [ ] Campo `details` existe na tabela

### Departamentos
- [ ] GET `/departments` lista todos
- [ ] POST `/departments` cria
- [ ] PATCH `/departments/:id` atualiza
- [ ] DELETE `/departments/:id` faz soft delete

### Fluxo de Caixa
- [ ] GET `/cash-flows` lista todos
- [ ] GET `/cash-flows/balance` retorna saldo atual
- [ ] POST `/cash-flows` cria manual
- [ ] DELETE `/cash-flows/:id` só permite manuais
- [ ] Campo `origin` existe ('manual' | 'automatic')

### Contas a Pagar
- [ ] GET `/accounts-payable` lista todas
- [ ] POST `/accounts-payable` cria
- [ ] PATCH `/accounts-payable/:id/mark-as-paid` marca como paga
- [ ] DELETE `/accounts-payable/:id` faz soft delete
- [ ] **Ao marcar como paga, cria fluxo automático (saída)**

### Contas a Receber
- [ ] GET `/accounts-receivable` lista todas
- [ ] POST `/accounts-receivable` cria
- [ ] PATCH `/accounts-receivable/:id/mark-as-received` marca como recebida
- [ ] DELETE `/accounts-receivable/:id` faz soft delete
- [ ] **Ao marcar como recebida, cria fluxo automático (entrada)**

### Relatórios
- [ ] GET `/reports/financial-summary` retorna estrutura completa
- [ ] GET `/reports/cash-balance` retorna saldo
- [ ] GET `/reports/cash-flow` aceita `startDate` e `endDate`
- [ ] GET `/reports/pending-accounts` retorna contas pendentes

### Usuários
- [ ] GET `/users` lista todos
- [ ] POST `/users` cria com senha hashada
- [ ] PATCH `/users/:id` atualiza (senha opcional)
- [ ] DELETE `/users/:id` faz soft delete
- [ ] Email é único
- [ ] Usuário inativo não pode fazer login

### RBAC
- [ ] Guards protegem rotas por role
- [ ] Admin tem acesso total
- [ ] Finance acessa financeiro e relatórios
- [ ] Secretary edita membros e departamentos
- [ ] Leader só visualiza

---

## 🎯 PRÓXIMOS PASSOS

1. **Backend**: Revisar este documento e marcar checkboxes ✅
2. **Backend**: Implementar endpoints faltantes
3. **Backend**: Testar com Postman/Insomnia
4. **Frontend**: Testar integração end-to-end
5. **Ambos**: Corrigir bugs de integração

---

## 📞 CONTATO

Se algum endpoint não existir ou estiver diferente, **avisar o frontend** para ajustar os serviços.

Se tudo estiver implementado conforme este documento, o sistema deve funcionar **100%** sem erros de integração.

---

**Documento criado em**: 09 de Janeiro de 2026  
**Última verificação**: Pendente pelo backend  
