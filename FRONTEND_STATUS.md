# 🖥️ Frontend - Gerência Church - Status do Projeto

## 📋 Resumo Geral

Frontend desenvolvido em **Next.js 14** com **TypeScript**, **Tailwind CSS** e **shadcn/ui** para consumir a API REST do backend NestJS.

---

## ✅ O que foi Implementado

### 🎨 1. Configuração Base
- ✅ Next.js 14 com App Router
- ✅ TypeScript configurado
- ✅ Tailwind CSS com cores personalizadas (#001529 - azul escuro)
- ✅ shadcn/ui instalado e configurado
- ✅ Axios para requisições HTTP
- ✅ React Hook Form + Zod para validação de formulários

### 🔐 2. Autenticação
- ✅ **Serviço de autenticação** (`services/auth.service.ts`)
  - Login com JWT
  - Logout
  - Verificação de autenticação
- ✅ **Interceptor Axios** com refresh token automático
- ✅ **Hook personalizado** `useAuth` para gerenciar autenticação

### 🔒 3. Sistema de Permissões (RBAC)
- ✅ **Hook** `usePermissions` implementado
- ✅ Controle baseado em roles:
  - `admin` - acesso total
  - `finance` - acesso financeiro e relatórios
  - `leader` - acesso limitado
  - `secretary` - acesso básico
- ✅ Menus dinâmicos baseados em permissões

### 🧩 4. Componentes Criados

#### Componentes de Layout
- ✅ **Sidebar** (`components/sidebar.tsx`)
  - Menu lateral fixo
  - Navegação por páginas
  - Submenu para Financeiro
  - Oculta itens baseado em permissões
  - Tema azul escuro (#001529)

- ✅ **Header** (`components/header.tsx`)
  - Cabeçalho superior
  - Menu de usuário
  - Botão de notificações
  - Logout integrado

#### Componentes shadcn/ui Instalados
- ✅ Button
- ✅ Card
- ✅ Input
- ✅ Label
- ✅ Table
- ✅ Dialog
- ✅ Select
- ✅ Dropdown Menu

### 📡 5. Serviços de API

#### ✅ Serviços Implementados
1. **`services/api.ts`** - Cliente Axios base
   - Base URL configurável
   - Interceptors de request/response
   - Refresh token automático
   - Redirecionamento para login em caso de erro 401

2. **`services/auth.service.ts`** - Autenticação
   - `login()` - POST /auth/login
   - `logout()` - POST /auth/logout
   - `isAuthenticated()` - Verificação local

3. **`services/reports.service.ts`** - Relatórios
   - `getFinancialSummary()` - GET /reports/financial-summary
   - `getCashBalance()` - GET /reports/cash-balance
   - `getCashFlow()` - GET /reports/cash-flow
   - `getPendingAccounts()` - GET /reports/pending-accounts
   - `getOverdueAccounts()` - GET /reports/overdue-accounts

4. **`services/members.service.ts`** - Membros
   - `getAll()` - GET /members
   - `getById()` - GET /members/:id
   - `create()` - POST /members
   - `update()` - PATCH /members/:id
   - `delete()` - DELETE /members/:id

5. **`services/finance.service.ts`** - Financeiro
   - **Caixa:**
     - `getAllCashFlows()` - GET /cash-flows
     - `getCashBalance()` - GET /cash-flows/balance
     - `createCashFlow()` - POST /cash-flows
     - `deleteCashFlow()` - DELETE /cash-flows/:id
   
   - **Contas a Pagar:**
     - `getAllAccountsPayable()` - GET /accounts-payable
     - `createAccountPayable()` - POST /accounts-payable
     - `markAsPaid()` - PATCH /accounts-payable/:id/mark-as-paid ⭐
     - `deleteAccountPayable()` - DELETE /accounts-payable/:id
   
   - **Contas a Receber:**
     - `getAllAccountsReceivable()` - GET /accounts-receivable
     - `createAccountReceivable()` - POST /accounts-receivable
     - `markAsReceived()` - PATCH /accounts-receivable/:id/mark-as-received ⭐
     - `deleteAccountReceivable()` - DELETE /accounts-receivable/:id

### 📄 6. Páginas Implementadas

#### ✅ Páginas 100% Funcionais

1. **Login** (`app/(auth)/login/page.tsx`)
   - ✅ Formulário com validação Zod
   - ✅ Integração completa com API
   - ✅ Salvamento de tokens (access + refresh)
   - ✅ Redirecionamento pós-login
   - ✅ Tratamento de erros
   - ✅ Design responsivo com logo da igreja

2. **Dashboard** (`app/(dashboard)/dashboard/page.tsx`)
   - ✅ Cards de resumo financeiro:
     - Saldo em Caixa
     - Total de Entradas (verde)
     - Total de Saídas (vermelho)
     - Contas Pendentes (amarelo)
   - ✅ Projeção Financeira com 4 colunas:
     - Saldo Atual
     - A Receber
     - A Pagar
     - Saldo Projetado
   - ✅ Integração com `GET /reports/financial-summary`
   - ✅ Formatação de moeda (R$)
   - ✅ Loading state

3. **Layout Dashboard** (`app/(dashboard)/layout.tsx`)
   - ✅ Sidebar fixa à esquerda
   - ✅ Header superior
   - ✅ Área de conteúdo com scroll
   - ✅ Navegação funcional

#### 📝 Páginas Criadas (Estrutura Básica)

As seguintes rotas foram **criadas no sistema de roteamento** mas ainda precisam de implementação completa:

1. **Membros** (`app/(dashboard)/members/page.tsx`)
   - ⚠️ **NÃO CRIADA** - Precisa criar
   - Funcionalidades esperadas:
     - Listagem em tabela
     - Busca/filtro
     - Botão "Novo Membro"
     - Modal de criação/edição
     - Ações: editar, deletar

2. **Departamentos** (`app/(dashboard)/departments/page.tsx`)
   - ⚠️ **NÃO CRIADA** - Precisa criar
   - Funcionalidades esperadas:
     - Listagem com cards
     - CRUD completo
     - Associação com funções

3. **Financeiro - Caixa** (`app/(dashboard)/finances/cash-flows/page.tsx`)
   - ⚠️ **NÃO CRIADA** - Precisa criar
   - Funcionalidades esperadas:
     - Tabela de movimentações
     - Filtro por data
     - Filtro por tipo (entrada/saída)
     - Saldo atual destacado
     - Botão "Nova Movimentação"

4. **Financeiro - Contas a Pagar** (`app/(dashboard)/finances/accounts-payable/page.tsx`)
   - ✅ **IMPLEMENTADA E FUNCIONANDO**
   - Funcionalidades implementadas:
     - Listagem de contas em tabela
     - Status visual (pendente/pago/vencido/cancelado) com badges coloridos
     - Botão "Marcar como Pago" com modal de confirmação ⭐
     - Modal de nova conta com validação Zod
     - Ordenação automática por vencimento
     - Soft delete com confirmação
     - Detecção automática de contas vencidas
     - Integração completa com finance.service.ts

5. **Financeiro - Contas a Receber** (`app/(dashboard)/finances/accounts-receivable/page.tsx`)
   - ⚠️ **NÃO CRIADA** - Precisa criar
   - Funcionalidades esperadas:
     - Listagem de contas
     - Status visual
     - Botão "Marcar como Recebido" ⭐
     - Modal de nova conta

6. **Relatórios** (`app/(dashboard)/reports/page.tsx`)
   - ⚠️ **NÃO CRIADA** - Precisa criar
   - Funcionalidades esperadas:
     - Seleção de período
     - Múltiplos tipos de relatório
     - Gráficos (opcional)
     - Exportação (futuro)

7. **Usuários** (`app/(dashboard)/users/page.tsx`)
   - ⚠️ **NÃO CRIADA** - Precisa criar
   - **Visível apenas para admin**
   - Funcionalidades esperadas:
     - CRUD de usuários
     - Gerenciamento de roles
     - Ativar/desativar usuários

---

## 🔗 Conexão com Backend

### URL Base
```
http://localhost:3000
```
Configurável via `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Headers Automáticos
Todas as requisições incluem:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Fluxo de Autenticação
1. Usuário faz login → recebe `access_token` e `refresh_token`
2. Tokens salvos no `localStorage`
3. Axios interceptor adiciona token em toda requisição
4. Se receber `401`:
   - Tenta refresh automático
   - Se falhar → redireciona para login

### Endpoints Conectados
✅ Todos os endpoints do backend estão mapeados nos serviços

---

## 📊 Status por Módulo

| Módulo | Serviço API | Layout | Funcional |
|--------|-------------|--------|-----------|
| 🔐 Login | ✅ | ✅ | ✅ |
| 📊 Dashboard | ✅ | ✅ | ✅ |
| 👥 Membros | ✅ | ❌ | ❌ |
| 🏢 Departamentos | ❌ | ❌ | ❌ |
| 💰 Caixa | ✅ | ❌ | ❌ |
| 💳 Contas a Pagar | ✅ | ✅ | ✅ |
| 💵 Contas a Receber | ✅ | ❌ | ❌ |
| 📈 Relatórios | ✅ | ❌ | ❌ |
| 👤 Usuários | ❌ | ❌ | ❌ |

**Legenda:**
- ✅ = Implementado e funcionando
- ⚠️ = Parcialmente implementado
- ❌ = Não implementado

---

## 📁 Estrutura de Arquivos Criada

```
gerencia_church_ft/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx                    ✅ FUNCIONANDO
│   ├── (dashboard)/
│   │   ├── layout.tsx                      ✅ FUNCIONANDO
│   │   ├── dashboard/
│   │   │   └── page.tsx                    ✅ FUNCIONANDO
│   │   ├── members/                        ❌ NÃO CRIADO
│   │   ├── departments/                    ❌ NÃO CRIADO
│   │   ├── finances/
│   │   │   ├── cash-flows/                 ❌ NÃO CRIADO
│   │   │   ├── accounts-payable/           ✅ FUNCIONANDO
│   │   │   └── accounts-receivable/        ❌ NÃO CRIADO
│   │   ├── reports/                        ❌ NÃO CRIADO
│   │   └── users/                          ❌ NÃO CRIADO
│   ├── globals.css                         ✅ CONFIGURADO
│   ├── layout.tsx                          ✅ FUNCIONANDO
│   └── page.tsx                            ✅ REDIRECT LOGIN
│
├── components/
│   ├── ui/                                 ✅ shadcn/ui
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── table.tsx
│   │   ├── dialog.tsx
│   │   ├── select.tsx
│   │   └── dropdown-menu.tsx
│   ├── sidebar.tsx                         ✅ FUNCIONANDO
│   └── header.tsx                          ✅ FUNCIONANDO
│
├── services/
│   ├── api.ts                              ✅ CONFIGURADO
│   ├── auth.service.ts                     ✅ FUNCIONANDO
│   ├── members.service.ts                  ✅ PRONTO
│   ├── finance.service.ts                  ✅ PRONTO
│   └── reports.service.ts                  ✅ FUNCIONANDO
│
├── hooks/
│   ├── use-auth.ts                         ✅ FUNCIONANDO
│   └── use-permissions.ts                  ✅ FUNCIONANDO
│
├── types/
│   └── api.ts                              ✅ TODOS OS TIPOS
│
├── lib/
│   └── utils.ts                            ✅ shadcn utils
│
├── .env.local                              ✅ CONFIGURADO
├── package.json                            ✅ CONFIGURADO
├── tailwind.config.ts                      ✅ CONFIGURADO (v4)
├── tsconfig.json                           ✅ CONFIGURADO
└── README.md                               ✅ DOCUMENTADO
```

---

## 🎨 Tema e Cores

### Cores Principais
```css
--primary: #001529        /* Azul escuro da AD */
--sidebar: #001529        /* Sidebar azul */
--background: #FFFFFF     /* Branco */
--card: #FFFFFF           /* Cards brancos */
--border: #E5E7EB         /* Cinza claro */
```

### Aplicação
- **Sidebar**: Azul escuro (#001529) com texto branco
- **Cards**: Branco com bordas cinza
- **Botões primários**: Azul escuro
- **Dashboard**: Cards com ícones coloridos (verde/vermelho/amarelo)

---

## 🚀 Como Rodar

### 1. Iniciar Backend
```bash
cd gerencia_church_bk
npm run start:dev
```
Backend rodando em: `http://localhost:3000`

### 2. Iniciar Frontend
```bash
cd gerencia_church_ft
npm run dev
```
Frontend rodando em: `http://localhost:3001`

### 3. Acessar
Abra: `http://localhost:3001`

---

## 📝 Próximos Passos

### 🔴 Prioridade Alta (Falta Implementar)

1. ~~**Página de Contas a Pagar**~~ ✅ **CONCLUÍDA**
   - Listagem com tabela
   - Formulário de criação/edição
   - Botão "Marcar como Pago" com confirmação
   - Integração com API

2. **Página de Contas a Receber**
   - Similar à Contas a Pagar
   - Botão "Marcar como Recebido"

3. **Página de Membros**
   - Listagem com tabela
   - Formulário de criação/edição
   - Busca e filtros
   - Integração com API

4. **Páginas Financeiras - Caixa**
   - Caixa (movimentações)
   - Visualização de entradas/saídas

5. **Página de Relatórios**
   - Filtros de data
   - Múltiplos tipos de relatório
   - Visualização de dados

### 🟡 Prioridade Média

4. **Página de Departamentos**
   - CRUD completo
   - Listagem

5. **Página de Usuários**
   - CRUD de usuários (apenas admin)
   - Gerenciamento de roles

### 🟢 Melhorias Futuras

6. **Gráficos**
   - Instalar Chart.js ou Recharts
   - Gráficos de fluxo financeiro

7. **Exportação de Relatórios**
   - PDF
   - Excel

8. **Notificações**
   - Sistema de notificações em tempo real
   - Alertas de contas vencidas

9. **Dark Mode**
   - Toggle de tema claro/escuro

---

## ✅ Checklist de Implementação

### Funcionando ✅
- [x] Login com JWT
- [x] Logout
- [x] Refresh token automático
- [x] Dashboard com resumo financeiro
- [x] Sidebar com navegação
- [x] Header com menu de usuário
- [x] Controle de permissões (RBAC)
- [x] Tema personalizado (#001529)
- [x] Contas a Pagar (completa com marcar como pago)

### Falta Implementar ❌
- [ ] Página de Membros
- [ ] Página de Departamentos
- [ ] Página de Caixa
- [x] Página de Contas a Pagar
- [ ] Página de Contas a Receber
- [ ] Página de Relatórios
- [ ] Página de Usuários
- [ ] Gráficos financeiros
- [ ] Sistema de notificações
- [ ] Exportação de relatórios

---

## 🔧 Tecnologias Utilizadas

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Next.js | 14+ | Framework React |
| TypeScript | 5+ | Tipagem estática |
| Tailwind CSS | 4 | Estilização |
| shadcn/ui | Latest | Componentes |
| Axios | Latest | HTTP Client |
| React Hook Form | Latest | Formulários |
| Zod | Latest | Validação |
| Lucide React | Latest | Ícones |

---

**Status do Projeto**: 🟡 **Em Desenvolvimento**  
**Páginas Funcionais**: 3/9 (33%)  
**Serviços API**: 5/5 (100%)  
**Componentes Base**: 100%  

**Última Atualização**: 09 de Janeiro de 2026
