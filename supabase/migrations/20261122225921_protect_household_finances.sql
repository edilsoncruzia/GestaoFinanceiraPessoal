-- Preserve the existing shared household and grant access only to approved Auth users.
begin;

create table if not exists public.household_access (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.household_access enable row level security;
revoke all on table public.household_access from public, anon, authenticated;
grant select on table public.household_access to authenticated;

drop policy if exists "Read own household access" on public.household_access;
create policy "Read own household access" on public.household_access
  for select to authenticated
  using (user_id = (select auth.uid()));

-- CPF and legacy contact details stay accessible only to database administrators.
alter table public.members enable row level security;
drop policy if exists "Permitir acesso total em members" on public.members;
revoke all on table public.members from public, anon, authenticated;

-- These columns were in separate manual migrations in earlier installations.
alter table public.ideas
  add column if not exists attachment text,
  add column if not exists attachment_method text;
alter table public.transactions
  add column if not exists forma_pagamento text;
alter table public.planned
  add column if not exists multa_fixa_porcentagem numeric(5,2) default 2.0,
  add column if not exists multa_fixa_valor numeric(12,2) default 0.0,
  add column if not exists taxa_juros_diaria numeric(6,3) default 0.033,
  add column if not exists taxa_juros_mensal numeric(5,2) default 0.0,
  add column if not exists dias_carencia integer default 0,
  add column if not exists tipo_consequencia text default 'NEGATIVACAO_SPC_SERASA',
  add column if not exists dias_para_sancao integer default 30,
  add column if not exists aceita_pagamento_parcial boolean default false,
  add column if not exists valor_minimo numeric(12,2) default 0.0,
  add column if not exists forma_pagamento text default 'normal',
  add column if not exists restrito_categoria text;
create table if not exists public.settings (
  key text primary key,
  value text,
  updated_at timestamptz default now()
);

do $$
declare
  table_name text;
  sequence_name text;
begin
  foreach table_name in array array[
    'accounts', 'transactions', 'planned', 'goals', 'budgets',
    'sources', 'categories', 'ideas', 'settings'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on table public.%I from public, anon, authenticated', table_name);
    execute format('grant select, insert, update, delete on table public.%I to authenticated', table_name);
    execute format('drop policy if exists %I on public.%I', 'Permitir acesso total em ' || table_name, table_name);
    execute format('drop policy if exists "Household access required" on public.%I', table_name);
    execute format('drop policy if exists "Household operations" on public.%I', table_name);

    -- Keep the household check mandatory even if another permissive policy exists.
    execute format($policy$
      create policy "Household access required" on public.%I
        as restrictive for all to authenticated
        using ((select exists (select 1 from public.household_access)))
        with check ((select exists (select 1 from public.household_access)))
    $policy$, table_name);
    execute format($policy$
      create policy "Household operations" on public.%I
        for all to authenticated
        using ((select exists (select 1 from public.household_access)))
        with check ((select exists (select 1 from public.household_access)))
    $policy$, table_name);

    if table_name not in ('categories', 'settings') then
      sequence_name := pg_get_serial_sequence(format('public.%I', table_name), 'id');
      if sequence_name is not null then
        execute format('revoke all on sequence %s from public, anon, authenticated', sequence_name);
        execute format('grant usage on sequence %s to authenticated', sequence_name);
      end if;
    end if;
  end loop;
end;
$$;

commit;
