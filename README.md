# Gerência Church - Frontend

Sistema de gerenciamento para igrejas desenvolvido com Next.js 14+.

## 🚀 Tecnologias

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **Axios**
- **React Hook Form + Zod**

## 📦 Instalação

```bash
npm install
```

## ⚙️ Configuração

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 🏃 Executar

```bash
npm run dev
```

Acesse: http://localhost:3001

## 🔐 Login Padrão

Configure um usuário no backend primeiro.

## 📁 Estrutura

```
app/
├── (auth)/login       - Página de login
├── (dashboard)/       - Área autenticada
│   ├── dashboard/     - Dashboard principal
│   ├── members/       - Gestão de membros
│   ├── departments/   - Departamentos
│   ├── finances/      - Financeiro
│   └── reports/       - Relatórios
components/
├── ui/                - Componentes shadcn
├── sidebar.tsx        - Menu lateral
└── header.tsx         - Cabeçalho
services/              - Serviços de API
hooks/                 - Hooks personalizados
types/                 - Tipos TypeScript
```

## 🎨 Tema

Cores personalizadas:
- **Primary**: #001529 (Azul escuro)
- **Secondary**: Cinza
- **Background**: Branco

## 📝 Licença

Projeto desenvolvido para Assembleia de Deus - Sede Uruaçu
