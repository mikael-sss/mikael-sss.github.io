# SPVM Vendas - SaaS de Gestão de Vendas

Plataforma escalável para gerenciar vendas, orçamentos e pagamentos com arquitetura multi-tenant moderna.

## 🏗 Arquitetura

### Stack Tecnológico
- **Frontend:** Next.js 15 (App Router, Server Components, TypeScript)
- **Backend:** Next.js API Routes + Server Actions  
- **Database:** Supabase PostgreSQL com Row Level Security (RLS)
- **Autenticação:** Supabase Auth
- **Styling:** Tailwind CSS + Design Tokens
- **Validação:** Zod

### Padrão Multi-tenancy
- **Tipo:** Shared Database, Shared Schema
- **Isolamento:** Row Level Security (RLS) do PostgreSQL
- **Vantagens:** 
  - Custo-eficiente (um banco de dados para todos)
  - Simples de gerenciar
  - Fácil de escalar horizontalmente
  - Segurança garantida pelo PostgreSQL

## 📁 Estrutura do Projeto

```
├── app/
│   ├── (auth)/
│   │   ├── login/          # Página de login
│   │   └── signup/         # Página de cadastro
│   ├── dashboard/
│   │   ├── layout.tsx      # Layout com sidebar
│   │   ├── page.tsx        # Dashboard home
│   │   ├── products/       # Gestão de produtos
│   │   ├── quotations/     # Gestão de orçamentos
│   │   ├── sales/          # Gestão de vendas
│   │   └── payments/       # Rastreamento de pagamentos
│   ├── layout.tsx          # Root layout
│   ├── globals.css         # Global styles + design tokens
│   └── page.tsx            # Landing page
├── lib/
│   ├── auth.ts             # Autenticação utilities
│   ├── schemas.ts          # Validação com Zod
│   └── supabase/
│       ├── client.ts       # Cliente browser
│       └── server.ts       # Cliente servidor
├── middleware.ts           # Route protection
├── scripts/
│   └── 01-initial-schema.sql  # SQL schema com RLS
└── [config files]

```

## 🚀 Começar

### 1. Clonar e instalar
```bash
git clone <repo>
cd mikael-sss.github.io
npm install
# ou pnpm install, yarn install, etc
```

### 2. Configurar Supabase
```bash
# Copiar variáveis de ambiente
cp .env.example .env.local

# Preencher com suas credenciais do Supabase
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# SUPABASE_SERVICE_ROLE_KEY=...
```

### 3. Criar schema do banco de dados
- Ir para Supabase Dashboard → SQL Editor
- Abrir `scripts/01-initial-schema.sql`
- Executar o script SQL

### 4. Rodar localmente
```bash
npm run dev
# Abre em http://localhost:3000
```

### 5. Testar
- Cadastro: `/auth/signup`
- Login: `/auth/login`
- Dashboard: `/dashboard` (protegido)

## 📊 Schema do Banco de Dados

### Tabelas Principais
- **organizations** - Organizações (tenants)
- **users** - Usuários com organização
- **products** - Produtos cadastrados
- **quotations** - Orçamentos de venda
- **quotation_items** - Itens dos orçamentos
- **sales** - Vendas realizadas
- **sale_items** - Itens das vendas
- **payments** - Rastreamento de pagamentos

### Segurança (RLS)
Cada tabela possui políticas RLS que garantem:
- ✅ Usuários só veem dados da sua organização
- ✅ Admin pode gerenciar produtos
- ✅ Apenas o criador pode modificar seus registros
- ✅ Isolamento completo entre organizações

## 🔑 Conceitos Principais

### Autenticação
- Supabase Auth gerencia login/signup
- Senhas com hash seguro
- Sessões via cookies (HTTP-only)
- Middleware protege rotas privadas

### Multi-tenancy
- Cada organização é completamente isolada
- `tenant_id` armazenado em cada tabela
- RLS garante isolamento no banco
- Melhor performance que schema separado

### Type Safety
- TypeScript em 100% do projeto
- Zod para validação de dados
- Database types gerados do Supabase
- IntelliSense completo no editor

## 📝 Roadmap

### ✅ Phase 1 - Foundation (Completo)
- [x] Next.js 15 setup
- [x] Supabase integration
- [x] Database schema com RLS
- [x] Autenticação (login/signup)
- [x] Dashboard layout com sidebar

### 🔄 Phase 2 - Core Modules (Em progresso)
- [ ] CRUD completo de produtos
- [ ] Sistema de orçamentos
- [ ] Gestão de vendas
- [ ] Rastreamento de pagamentos

### 📊 Phase 3 - Analytics (Planejado)
- [ ] Dashboards com gráficos
- [ ] Relatórios de vendas
- [ ] Análise de pagamentos
- [ ] Exportação de dados

### 👥 Phase 4 - Teams (Futuro)
- [ ] Gerenciamento de usuários/permissões
- [ ] Convite de membros
- [ ] Roles e permissões granulares
- [ ] Auditoria de ações

## 🛠 Desenvolvimento

### Adicionar nova página
```bash
# Criar arquivo na rota desejada
# Ex: app/dashboard/new-feature/page.tsx

# Usar template com Client Component
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function NewFeaturePage() {
  const supabase = createClient()
  
  return <div>...</div>
}
```

### Acessar dados do Supabase
```typescript
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('organization_id', orgId)
```

### Adicionar validação
```typescript
import { z } from 'zod'

const ProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
})

const validated = ProductSchema.parse(data)
```

## 📚 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zod Validation](https://zod.dev)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 🐛 Troubleshooting

### "RLS policy prevents..." erro
- Verificar se usuário está autenticado
- Confirmar que `organization_id` está correto
- Validar RLS policies no Supabase SQL Editor

### Dados não aparecem na tabela
- Confirmar que dados foram inseridos
- Verificar RLS policies
- Debugar com `console.log` no servidor

### Sessão expira rapidamente
- Supabase auto-renova tokens
- Cookies podem estar desabilitados
- Verificar settings de cookie no navegador

## 📄 Licença

MIT - Veja LICENSE para detalhes

## 👤 Autor

Desenvolvido como base SaaS escalável moderno.
