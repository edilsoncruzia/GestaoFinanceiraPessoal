# Gestão Financeira Pessoal

Aplicativo web React e Vite para controle de contas, transações, orçamentos, metas e projeções financeiras de uma pessoa ou casal.

## Rodar localmente

    pnpm install
    pnpm dev

Sem configuração do Supabase, o aplicativo começa com dados de exemplo e salva os registros no navegador.

## Configurar o Supabase

Para uma instalação nova, execute [supabase/schema.sql](supabase/schema.sql) no SQL Editor. Em uma base existente que ainda não recebeu as correções, comece pelas duas migrações abaixo. Execute na ordem indicada.

1. [Proteger o acesso da família](supabase/migrations/20261122225921_protect_household_finances.sql)
2. [Ativar as operações de persistência](supabase/migrations/20261122225928_persist_finance_operations.sql)

A base existente continua compartilhada como um único grupo. A primeira migração bloqueia o acesso pelo navegador até que os usuários sejam autorizados. As tabelas e os registros existentes são preservados.

Crie ou identifique os usuários em **Authentication → Users**. No SQL Editor, autorize o UUID de cada pessoa que deve ter acesso à base. Para o Google, habilite o provedor, configure a URL de retorno do aplicativo e autorize o UUID da conta criada no Supabase Auth.

```sql
insert into public.household_access (user_id)
values ('UUID_DO_USUARIO_NO_SUPABASE_AUTH')
on conflict do nothing;
```

Copie **.env.example** para **.env** e preencha o URL do projeto e a chave pública (publishable ou anon). O login por senha usa o e-mail do Supabase Auth. Em uma base já publicada, aplique as migrações, autorize os membros e publique esta versão do app no mesmo período de manutenção.

## Verificações

Os comandos abaixo foram validados com Node.js 24.

    pnpm lint
    pnpm build

O build é gerado em **dist/**.
