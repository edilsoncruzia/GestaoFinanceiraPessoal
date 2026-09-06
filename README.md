# Gestão Financeira Pessoal

Aplicativo (web) para gestão financeira pessoal/do casal — controle de contas, orçamentos,
transações, metas, regra 50/30/20 e projeções.

## Stack
- **React 18** + **Vite 5**
- **Supabase** (persistência, com fallback automático para **LocalStorage**)
- Recharts e lucide-react

## Como rodar localmente
```bash
pnpm install
cp .env.example .env    # preencha com seu projeto Supabase
pnpm dev
```

## Configuração Supabase
1. Crie um projeto em https://supabase.com.
2. Abra o **SQL Editor** e rode o conteúdo de `supabase/schema.sql`.
3. Em **Project Settings → API**, copie a `Project URL` e a `anon public key` para o `.env`:
   - `VITE_SUPABASE_URL=`
   - `VITE_SUPABASE_ANON_KEY=`

> Sem as variáveis configuradas o app roda normalmente usando dados locais (seed/LocalStorage).

## Build de produção
```bash
pnpm build
```
O resultado fica em `dist/` e é auto-detectado pela Vercel.
