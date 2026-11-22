begin;

create or replace function public.save_finance_account(account_key bigint, account_row jsonb)
returns bigint
language plpgsql set search_path = ''
as $$
declare
  result_id bigint;
  new_account public.accounts := jsonb_populate_record(null::public.accounts, account_row);
begin
  if not exists (select 1 from public.household_access) then
    raise insufficient_privilege using message = 'Household access required';
  end if;
  lock table public.accounts in share row exclusive mode;
  if account_key is null then
    insert into public.accounts (
      name, type, bank, color, limit_amount, closing_day, due_day, member_id, initial_balance,
      is_default, brand, current_invoice, count_in_available
    )
    select
      r.name, r.type, r.bank, r.color, r.limit_amount, r.closing_day, r.due_day, r.member_id,
      r.initial_balance, r.is_default, r.brand, r.current_invoice, r.count_in_available
    from jsonb_populate_record(null::public.accounts, account_row) as r
    returning id into result_id;
  else
    update public.accounts
    set (name, type, bank, color, limit_amount, closing_day, due_day, member_id, initial_balance,
      is_default, brand, current_invoice, count_in_available) = (
      new_account.name, new_account.type, new_account.bank, new_account.color,
      new_account.limit_amount, new_account.closing_day, new_account.due_day, new_account.member_id,
      new_account.initial_balance, new_account.is_default, new_account.brand,
      new_account.current_invoice, new_account.count_in_available
    )
    where id = account_key
    returning id into result_id;
    if not found then raise no_data_found; end if;
  end if;

  if new_account.is_default then
    update public.accounts set is_default = false where id <> result_id and is_default;
  end if;
  return result_id;
end;
$$;

create or replace function public.delete_finance_account(account_key bigint, delete_records boolean)
returns void
language plpgsql set search_path = ''
as $$
begin
  perform 1 from public.accounts where id = account_key for update;
  if not found then raise no_data_found; end if;

  if delete_records then
    delete from public.transactions where account_key in (account_id, from_account_id, to_account_id);
    delete from public.planned where account_key in (account_id, from_account_id, to_account_id);
  end if;
  delete from public.accounts where id = account_key;
end;
$$;

-- Save the forecast and, when it is already realized, its ledger entry together.
create or replace function public.persist_finance_planned(
  planned_key bigint, planned_row jsonb, entry jsonb, original_id bigint, changes jsonb
)
returns jsonb
language plpgsql set search_path = ''
as $$
declare
  result_id bigint;
  new_planned public.planned := jsonb_populate_record(null::public.planned, planned_row);
  recorded_entry public.transactions;
begin
  if original_id is not null then
    update public.planned
    set skipped_months = case when changes ? 'skip_month' then (
          select string_agg(distinct month, ',' order by month)
          from unnest(array_append(string_to_array(skipped_months, ','), changes ->> 'skip_month')) as month
        ) else skipped_months end,
        end_month = case when changes ? 'end_month' then changes ->> 'end_month' else end_month end,
        installment_total = case when changes ? 'installment_total'
          then (changes ->> 'installment_total')::int else installment_total end
    where id = original_id;
    if not found then raise no_data_found; end if;
  end if;

  if planned_key is null then
    insert into public.planned (
      type, category, description, amount, due_date, recurrence, installment_current,
      installment_total, priority, account_id, from_account_id, to_account_id, member_id,
      periodicity, realized, attachment, attachment_method, skipped_months, end_month,
      salary_deductions, include_in_ir, fonte_id, multa_fixa_porcentagem, multa_fixa_valor,
      taxa_juros_diaria, taxa_juros_mensal, dias_carencia, tipo_consequencia, dias_para_sancao,
      aceita_pagamento_parcial, valor_minimo, forma_pagamento, restrito_categoria
    )
    select
      new_planned.type, new_planned.category, new_planned.description, new_planned.amount,
      new_planned.due_date, new_planned.recurrence, new_planned.installment_current,
      new_planned.installment_total, new_planned.priority, new_planned.account_id,
      new_planned.from_account_id, new_planned.to_account_id, new_planned.member_id,
      new_planned.periodicity, new_planned.realized, new_planned.attachment,
      new_planned.attachment_method, new_planned.skipped_months, new_planned.end_month,
      new_planned.salary_deductions, new_planned.include_in_ir, new_planned.fonte_id,
      new_planned.multa_fixa_porcentagem, new_planned.multa_fixa_valor,
      new_planned.taxa_juros_diaria, new_planned.taxa_juros_mensal, new_planned.dias_carencia,
      new_planned.tipo_consequencia, new_planned.dias_para_sancao,
      new_planned.aceita_pagamento_parcial, new_planned.valor_minimo, new_planned.forma_pagamento,
      new_planned.restrito_categoria
    returning id into result_id;
  else
    update public.planned
    set (
      type, category, description, amount, due_date, recurrence, installment_current,
      installment_total, priority, account_id, from_account_id, to_account_id, member_id,
      periodicity, realized, attachment, attachment_method, skipped_months, end_month,
      salary_deductions, include_in_ir, fonte_id, multa_fixa_porcentagem, multa_fixa_valor,
      taxa_juros_diaria, taxa_juros_mensal, dias_carencia, tipo_consequencia, dias_para_sancao,
      aceita_pagamento_parcial, valor_minimo, forma_pagamento, restrito_categoria
    ) = (
      new_planned.type, new_planned.category, new_planned.description, new_planned.amount,
      new_planned.due_date, new_planned.recurrence, new_planned.installment_current,
      new_planned.installment_total, new_planned.priority, new_planned.account_id,
      new_planned.from_account_id, new_planned.to_account_id, new_planned.member_id,
      new_planned.periodicity, new_planned.realized, new_planned.attachment,
      new_planned.attachment_method, new_planned.skipped_months, new_planned.end_month,
      new_planned.salary_deductions, new_planned.include_in_ir, new_planned.fonte_id,
      new_planned.multa_fixa_porcentagem, new_planned.multa_fixa_valor,
      new_planned.taxa_juros_diaria, new_planned.taxa_juros_mensal, new_planned.dias_carencia,
      new_planned.tipo_consequencia, new_planned.dias_para_sancao,
      new_planned.aceita_pagamento_parcial, new_planned.valor_minimo, new_planned.forma_pagamento,
      new_planned.restrito_categoria
    )
    where id = planned_key returning id into result_id;
    if not found then raise no_data_found; end if;
  end if;

  if entry is not null and not exists (
    select 1 from public.transactions where planned_id = result_id
  ) then
    insert into public.transactions (
      date, type, category, description, amount, account_id, from_account_id, to_account_id,
      member_id, planned_id, attachment, attachment_method, fonte_id, include_in_ir,
      deducted_in_payroll, forma_pagamento
    )
    select
      r.date, r.type, r.category, r.description, r.amount, r.account_id, r.from_account_id,
      r.to_account_id, r.member_id, result_id, r.attachment, r.attachment_method, r.fonte_id,
      r.include_in_ir, r.deducted_in_payroll, r.forma_pagamento
    from jsonb_populate_record(null::public.transactions, entry) as r
    returning * into recorded_entry;
  end if;

  return jsonb_build_object('id', result_id, 'transaction', to_jsonb(recorded_entry));
end;
$$;

create or replace function public.skip_finance_planned_month(planned_key bigint, skipped_month text)
returns text[]
language plpgsql set search_path = ''
as $$
declare
  result text[];
begin
  if skipped_month is null or skipped_month !~ '^[0-9]{4}-(0[1-9]|1[0-2])$' then
    raise invalid_parameter_value using message = 'Invalid month';
  end if;

  update public.planned
  set skipped_months = (
    select string_agg(distinct month, ',' order by month)
    from unnest(array_append(string_to_array(skipped_months, ','), skipped_month)) as month
  )
  where id = planned_key
  returning string_to_array(skipped_months, ',') into result;

  if not found then raise no_data_found; end if;
  return result;
end;
$$;

create or replace function public.record_salary_entries(entries jsonb, model_id bigint, deductions text)
returns setof public.transactions
language plpgsql set search_path = ''
as $$
begin
  update public.planned set salary_deductions = deductions where id = model_id;
  if not found then raise no_data_found; end if;

  return query
  insert into public.transactions (
    date, type, category, description, amount, account_id, from_account_id, to_account_id,
    member_id, planned_id, attachment, attachment_method, fonte_id, include_in_ir,
    deducted_in_payroll, forma_pagamento
  )
  select
    r.date, r.type, r.category, r.description, r.amount, r.account_id, r.from_account_id,
    r.to_account_id, r.member_id, r.planned_id, r.attachment, r.attachment_method, r.fonte_id,
    r.include_in_ir, r.deducted_in_payroll, r.forma_pagamento
  from jsonb_populate_recordset(null::public.transactions, entries) as r
  returning *;
end;
$$;

create or replace function public.contribute_to_finance_goal(goal_key bigint, entry jsonb)
returns jsonb
language plpgsql set search_path = ''
as $$
declare
  updated_goal public.goals;
  contribution public.transactions;
  amount numeric := (entry ->> 'amount')::numeric;
begin
  if amount is null or amount <= 0 or amount = 'NaN'::numeric then
    raise invalid_parameter_value using message = 'Invalid contribution amount';
  end if;

  update public.goals set saved = least(target, saved + amount)
  where id = goal_key returning * into updated_goal;
  if not found then raise no_data_found; end if;

  insert into public.transactions (
    date, type, category, description, amount, account_id, from_account_id, to_account_id,
    member_id, planned_id, attachment, attachment_method, fonte_id, include_in_ir,
    deducted_in_payroll, forma_pagamento
  )
  select
    r.date, 'expense', 'poupanca', 'Contribuição: ' || updated_goal.name, r.amount, r.account_id,
    r.from_account_id, r.to_account_id, updated_goal.member_id, r.planned_id, r.attachment,
    r.attachment_method, r.fonte_id, r.include_in_ir, r.deducted_in_payroll, r.forma_pagamento
  from jsonb_populate_record(null::public.transactions, entry) as r
  returning * into contribution;
  return jsonb_build_object('goal', updated_goal, 'transaction', contribution);
end;
$$;

create or replace function public.clear_finance_data(data_scope text)
returns void
language plpgsql set search_path = ''
as $$
begin
  if not exists (select 1 from public.household_access) then
    raise insufficient_privilege using message = 'Household access required';
  end if;
  if data_scope in ('income', 'expense') then
    delete from public.transactions where type = data_scope;
    delete from public.planned where type = data_scope;
  elsif data_scope = 'all' then
    delete from public.transactions where id is not null;
    delete from public.planned where id is not null;
    delete from public.goals where id is not null;
    delete from public.budgets where id is not null;
    delete from public.accounts where id is not null;
    delete from public.sources where id is not null;
    delete from public.categories where key is not null;
    delete from public.ideas where id is not null;
  else
    raise invalid_parameter_value using message = 'Invalid data scope';
  end if;
end;
$$;

-- The old export included six arrays. Optional newer sections replace their
-- corresponding tables only when included. Every change is in one transaction.
create or replace function public.restore_finance_backup(backup jsonb)
returns void
language plpgsql set search_path = ''
as $$
declare
  section text;
  row_data jsonb;
  old_id text;
  new_id bigint;
  account_ids jsonb := '{}'::jsonb;
  planned_ids jsonb := '{}'::jsonb;
  source_ids jsonb;
begin
  if not exists (select 1 from public.household_access) then
    raise insufficient_privilege using message = 'Household access required';
  end if;
  foreach section in array array['accounts', 'planned', 'transactions', 'goals', 'categories', 'ideas'] loop
    if jsonb_typeof(backup -> section) is distinct from 'array' then
      raise invalid_parameter_value using message = 'Invalid backup section: ' || section;
    end if;
  end loop;

  lock table public.accounts, public.sources, public.planned, public.transactions,
    public.goals, public.budgets, public.categories, public.ideas, public.settings
    in share row exclusive mode;

  delete from public.transactions where id is not null;
  delete from public.planned where id is not null;
  delete from public.goals where id is not null;
  delete from public.accounts where id is not null;
  delete from public.categories where key is not null;
  delete from public.ideas where id is not null;

  if backup ? 'sources' then
    source_ids := '{}'::jsonb;
    delete from public.sources where id is not null;
    for row_data in select * from jsonb_array_elements(backup -> 'sources') loop
      old_id := row_data ->> 'id';
      if old_id is null or source_ids ? old_id then
        raise invalid_parameter_value using message = 'Invalid source identifier';
      end if;
      insert into public.sources (
        name, type
      )
      select
        r.name, r.type
      from jsonb_populate_record(null::public.sources, row_data) as r
      returning id into new_id;
      source_ids := source_ids || jsonb_build_object(old_id, new_id);
    end loop;
  end if;

  for row_data in select * from jsonb_array_elements(backup -> 'accounts') loop
    old_id := row_data ->> 'id';
    if old_id is null or account_ids ? old_id then
      raise invalid_parameter_value using message = 'Invalid account identifier';
    end if;
    insert into public.accounts (
      name, type, bank, color, limit_amount, closing_day, due_day, member_id, initial_balance,
      is_default, brand, current_invoice, count_in_available
    )
    select
      r.name, r.type, r.bank, r.color, r.limit_amount, r.closing_day, r.due_day, r.member_id,
      r.initial_balance, r.is_default, r.brand, r.current_invoice, r.count_in_available
    from jsonb_populate_record(null::public.accounts, row_data) as r
    returning id into new_id;
    account_ids := account_ids || jsonb_build_object(old_id, new_id);
  end loop;

  for row_data in select * from jsonb_array_elements(backup -> 'planned') loop
    old_id := row_data ->> 'id';
    if old_id is null or planned_ids ? old_id then
      raise invalid_parameter_value using message = 'Invalid planned entry identifier';
    end if;
    insert into public.planned (
      type, category, description, amount, due_date, recurrence, installment_current,
      installment_total, priority, account_id, from_account_id, to_account_id, member_id,
      periodicity, realized, attachment, attachment_method, skipped_months, end_month,
      salary_deductions, include_in_ir, fonte_id, multa_fixa_porcentagem, multa_fixa_valor,
      taxa_juros_diaria, taxa_juros_mensal, dias_carencia, tipo_consequencia, dias_para_sancao,
      aceita_pagamento_parcial, valor_minimo, forma_pagamento, restrito_categoria
    )
    select
      r.type, r.category, r.description, r.amount, r.due_date, r.recurrence, r.installment_current,
      r.installment_total, r.priority,
      case when r.account_id is not null then coalesce((account_ids ->> r.account_id::text)::bigint, -1) end,
      case when r.from_account_id is not null then coalesce((account_ids ->> r.from_account_id::text)::bigint, -1) end,
      case when r.to_account_id is not null then coalesce((account_ids ->> r.to_account_id::text)::bigint, -1) end,
      r.member_id, r.periodicity, r.realized, r.attachment, r.attachment_method, r.skipped_months,
      r.end_month, r.salary_deductions, r.include_in_ir,
      case when source_ids is null then r.fonte_id else case when r.fonte_id is not null then coalesce((source_ids ->> r.fonte_id::text)::bigint, -1) end end,
      r.multa_fixa_porcentagem, r.multa_fixa_valor, r.taxa_juros_diaria, r.taxa_juros_mensal,
      r.dias_carencia, r.tipo_consequencia, r.dias_para_sancao, r.aceita_pagamento_parcial,
      r.valor_minimo, r.forma_pagamento, r.restrito_categoria
    from jsonb_populate_record(null::public.planned, row_data) as r
    returning id into new_id;
    planned_ids := planned_ids || jsonb_build_object(old_id, new_id);
  end loop;

  insert into public.transactions (
    date, type, category, description, amount, account_id, from_account_id, to_account_id,
    member_id, planned_id, attachment, attachment_method, fonte_id, include_in_ir,
    deducted_in_payroll, forma_pagamento
  )
  select
    r.date, r.type, r.category, r.description, r.amount,
    case when r.account_id is not null then coalesce((account_ids ->> r.account_id::text)::bigint, -1) end,
    case when r.from_account_id is not null then coalesce((account_ids ->> r.from_account_id::text)::bigint, -1) end,
    case when r.to_account_id is not null then coalesce((account_ids ->> r.to_account_id::text)::bigint, -1) end,
    r.member_id,
    case when r.planned_id is not null then coalesce((planned_ids ->> r.planned_id::text)::bigint, -1) end,
    r.attachment, r.attachment_method,
    case when source_ids is null then r.fonte_id else case when r.fonte_id is not null then coalesce((source_ids ->> r.fonte_id::text)::bigint, -1) end end,
    r.include_in_ir, r.deducted_in_payroll, r.forma_pagamento
  from jsonb_populate_recordset(null::public.transactions, backup -> 'transactions') as r;

  insert into public.goals (
    name, target, saved, member_id, account_id
  )
  select
    r.name, r.target, r.saved, r.member_id,
    case when r.account_id is not null then coalesce((account_ids ->> r.account_id::text)::bigint, -1) end
  from jsonb_populate_recordset(null::public.goals, backup -> 'goals') as r;

  insert into public.categories (
    key, label, color, type
  )
  select
    r.key, r.label, r.color, r.type
  from jsonb_populate_recordset(null::public.categories, backup -> 'categories') as r;

  insert into public.ideas (
    text, done, attachment, attachment_method, created_at
  )
  select
    r.text, r.done, r.attachment, r.attachment_method, coalesce(r.created_at, now())
  from jsonb_populate_recordset(null::public.ideas, backup -> 'ideas') as r;

  if backup ? 'budgets' then
    delete from public.budgets where id is not null;
    insert into public.budgets (
      category, limit_amount, member_id
    )
    select
      r.category, r.limit_amount, r.member_id
    from jsonb_populate_recordset(null::public.budgets, backup -> 'budgets') as r;
  end if;

  if backup ? 'reserva' then
    insert into public.settings (key, value)
    values ('reserva', (backup -> 'reserva')::text)
    on conflict (key) do update set value = excluded.value;
  end if;
end;
$$;

revoke all on function public.save_finance_account(bigint, jsonb) from public, anon, authenticated;
grant execute on function public.save_finance_account(bigint, jsonb) to authenticated;

revoke all on function public.delete_finance_account(bigint, boolean) from public, anon, authenticated;
grant execute on function public.delete_finance_account(bigint, boolean) to authenticated;

revoke all on function public.persist_finance_planned(bigint, jsonb, jsonb, bigint, jsonb) from public, anon, authenticated;
grant execute on function public.persist_finance_planned(bigint, jsonb, jsonb, bigint, jsonb) to authenticated;

revoke all on function public.skip_finance_planned_month(bigint, text) from public, anon, authenticated;
grant execute on function public.skip_finance_planned_month(bigint, text) to authenticated;

revoke all on function public.record_salary_entries(jsonb, bigint, text) from public, anon, authenticated;
grant execute on function public.record_salary_entries(jsonb, bigint, text) to authenticated;

revoke all on function public.contribute_to_finance_goal(bigint, jsonb) from public, anon, authenticated;
grant execute on function public.contribute_to_finance_goal(bigint, jsonb) to authenticated;

revoke all on function public.clear_finance_data(text) from public, anon, authenticated;
grant execute on function public.clear_finance_data(text) to authenticated;

revoke all on function public.restore_finance_backup(jsonb) from public, anon, authenticated;
grant execute on function public.restore_finance_backup(jsonb) to authenticated;

commit;
