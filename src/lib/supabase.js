import { createClient } from '@supabase/supabase-js';
import { DEFAULT_CATEGORY_ROWS } from '../constants/tokens';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('seu-projeto') && supabaseUrl.startsWith('https://')
);

const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey, { auth: { flowType: "pkce" } }) : null;

async function checked(query) {
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function loadRows(table, key = 'id') {
  const size = 500;
  const rows = [];
  let total;
  while (total === undefined || rows.length < total) {
    const start = rows.length;
    const options = start === 0 ? { count: 'exact' } : undefined;
    const { data, error, count } = await supabase.from(table).select('*', options).order(key).range(start, start + size - 1);
    if (error) throw error;
    if (count != null) total = count;
    rows.push(...data);
    if (!data.length || (total === undefined && data.length < size)) break;
  }
  return rows;
}

export async function loadInitialData() {
  const [accounts, transactions, planned, goals, budgets, sources, categories, ideas, settings] = await Promise.all([
    loadRows('accounts'),
    loadRows('transactions'),
    loadRows('planned'),
    loadRows('goals'),
    loadRows('budgets'),
    loadRows('sources'),
    loadRows('categories', 'key'),
    loadRows('ideas'),
    loadRows('settings', 'key'),
  ]);
  if (!categories.length) {
    await checked(supabase.from('categories').upsert(DEFAULT_CATEGORY_ROWS.map(categoryPayload), {
      onConflict: 'key', ignoreDuplicates: true,
    }));
  }
  return {
    accounts: accounts.map(mapAccountFromDb),
    transactions: transactions.map(mapTxFromDb),
    planned: planned.map(mapPlannedFromDb),
    goals: goals.map(mapGoalFromDb),
    budgets: budgets.map(mapBudgetFromDb),
    sources: sources.map(mapSourceFromDb),
    categories: categories.length ? categories.map(categoryPayload) : DEFAULT_CATEGORY_ROWS,
    ideas: ideas.map(mapIdeaFromDb),
    reserva: normalizeReserva(settings.find((row) => row.key === 'reserva')?.value),
  };
}

function normalizeReserva(value) {
  try {
    return { limite: Math.max(0, Number(JSON.parse(value || '{}')?.limite) || 0) };
  } catch {
    return { limite: 0 };
  }
}

// Mapeadores DB -> Frontend
function mapAccountFromDb(a) {
  return {
    id: a.id,
    name: a.name,
    type: a.type,
    bank: a.bank,
    color: a.color,
    limit: Number(a.limit_amount) || 0,
    closingDay: a.closing_day,
    dueDay: a.due_day,
    memberId: a.member_id,
    initialBalance: Number(a.initial_balance) || 0,
    isDefault: Boolean(a.is_default),
    brand: a.brand,
    currentInvoice: Number(a.current_invoice) || 0,
    countInAvailable: a.count_in_available == null ? true : Boolean(a.count_in_available)
  };
}

function mapTxFromDb(t) {
  return {
    id: t.id,
    date: t.date,
    type: t.type,
    category: t.category,
    description: t.description,
    amount: Number(t.amount) || 0,
    accountId: t.account_id,
    fromAccountId: t.from_account_id,
    toAccountId: t.to_account_id,
    memberId: t.member_id,
    plannedId: t.planned_id,
    attachment: t.attachment,
    attachmentMethod: t.attachment_method,
    fonteId: t.fonte_id,
    includeInIR: Boolean(t.include_in_ir),
    deductedInPayroll: Boolean(t.deducted_in_payroll),
    formaPagamento: t.forma_pagamento || "normal"
  };
}

function mapPlannedFromDb(p) {
  return {
    id: p.id,
    type: p.type,
    category: p.category,
    description: p.description,
    amount: Number(p.amount) || 0,
    dueDate: p.due_date,
    recurrence: p.recurrence,
    installmentCurrent: p.installment_current,
    installmentTotal: p.installment_total,
    priority: p.priority,
    accountId: p.account_id,
    fromAccountId: p.from_account_id,
    toAccountId: p.to_account_id,
    memberId: p.member_id,
    periodicity: p.periodicity,
    realized: Boolean(p.realized),
    attachment: p.attachment,
    attachmentMethod: p.attachment_method,
    skippedMonths: p.skipped_months ? p.skipped_months.split(",").filter(Boolean) : [],
    endMonth: p.end_month || null,
    salaryDeductions: p.salary_deductions ? JSON.parse(p.salary_deductions) : [],
    includeInIR: Boolean(p.include_in_ir),
    fonteId: p.fonte_id,
    multa_fixa_porcentagem: Number(p.multa_fixa_porcentagem),
    multa_fixa_valor: Number(p.multa_fixa_valor) || 0,
    taxa_juros_diaria: Number(p.taxa_juros_diaria),
    taxa_juros_mensal: Number(p.taxa_juros_mensal) || 0,
    dias_carencia: Number(p.dias_carencia) || 0,
    tipo_consequencia: p.tipo_consequencia,
    dias_para_sancao: Number(p.dias_para_sancao) || 30,
    aceita_pagamento_parcial: Boolean(p.aceita_pagamento_parcial),
    valor_minimo: Number(p.valor_minimo) || 0,
    formaPagamento: p.forma_pagamento || "normal",
    restritoCategoria: p.restrito_categoria || null
  };
}

function mapGoalFromDb(g) {
  return {
    id: g.id,
    name: g.name,
    target: Number(g.target) || 0,
    saved: Number(g.saved) || 0,
    memberId: g.member_id,
    accountId: g.account_id
  };
}

function mapBudgetFromDb(b) {
  return {
    id: b.id,
    category: b.category,
    limit: Number(b.limit_amount) || 0,
    memberId: b.member_id
  };
}

function transactionPayload(tx) {
  return {
    date: tx.date,
    type: tx.type,
    category: tx.category || null,
    description: tx.description,
    amount: tx.amount,
    account_id: tx.accountId || null,
    from_account_id: tx.fromAccountId || null,
    to_account_id: tx.toAccountId || null,
    member_id: tx.memberId || null,
    planned_id: tx.plannedId || null,
    attachment: tx.attachment || null,
    attachment_method: tx.attachmentMethod || null,
    fonte_id: tx.fonteId || null,
    include_in_ir: Boolean(tx.includeInIR),
    deducted_in_payroll: Boolean(tx.deductedInPayroll),
    forma_pagamento: tx.formaPagamento || "normal"
  };
}

function plannedPayload(p) {
  return {
    type: p.type,
    category: p.category || null,
    description: p.description,
    amount: p.amount,
    due_date: p.dueDate,
    recurrence: p.recurrence,
    installment_current: p.installmentCurrent || null,
    installment_total: p.installmentTotal || null,
    priority: p.priority || 'importante',
    account_id: p.accountId || null,
    from_account_id: p.fromAccountId || null,
    to_account_id: p.toAccountId || null,
    member_id: p.memberId || null,
    periodicity: p.periodicity || null,
    realized: Boolean(p.realized),
    attachment: p.attachment || null,
    attachment_method: p.attachmentMethod || null,
    skipped_months: (p.skippedMonths || []).join(","),
    end_month: p.endMonth || null,
    salary_deductions: JSON.stringify(p.salaryDeductions || []),
    include_in_ir: Boolean(p.includeInIR),
    fonte_id: p.fonteId || null,
    multa_fixa_porcentagem: p.multa_fixa_porcentagem != null ? Number(p.multa_fixa_porcentagem) : null,
    multa_fixa_valor: Number(p.multa_fixa_valor) || 0,
    taxa_juros_diaria: p.taxa_juros_diaria != null ? Number(p.taxa_juros_diaria) : null,
    taxa_juros_mensal: Number(p.taxa_juros_mensal) || 0,
    dias_carencia: Number(p.dias_carencia) || 0,
    tipo_consequencia: p.tipo_consequencia || null,
    dias_para_sancao: Number(p.dias_para_sancao) || 30,
    aceita_pagamento_parcial: Boolean(p.aceita_pagamento_parcial),
    valor_minimo: Number(p.valor_minimo) || 0,
    forma_pagamento: p.formaPagamento || "normal",
    restrito_categoria: p.type === "income" ? p.restritoCategoria || null : null
  };
}

function accountPayload(a) {
  return {
    name: a.name,
    type: a.type,
    bank: a.bank || null,
    color: a.color || null,
    limit_amount: a.limit || 0,
    closing_day: a.closingDay ?? null,
    due_day: a.dueDay ?? null,
    member_id: a.memberId ?? null,
    initial_balance: a.initialBalance || 0,
    is_default: Boolean(a.isDefault),
    brand: a.brand || null,
    current_invoice: a.currentInvoice || 0,
    count_in_available: a.countInAvailable == null ? true : Boolean(a.countInAvailable)
  };
}

function categoryPayload({ key, label, color, type }) {
  return { key, label, color, type };
}

function sourcePayload({ name, type }) {
  return { name, type: type || null };
}

function mapSourceFromDb(row) {
  return { id: row.id, ...sourcePayload(row) };
}

function mapIdeaFromDb(row) {
  return {
    id: row.id,
    text: row.text,
    done: Boolean(row.done),
    date: row.created_at?.slice(0, 10) || '',
    attachment: row.attachment || null,
    attachmentMethod: row.attachment_method || null,
  };
}

function ideaPayload(idea) {
  return {
    text: idea.text,
    done: Boolean(idea.done),
    attachment: idea.attachment || null,
    attachment_method: idea.attachmentMethod || null,
  };
}

function goalPayload(goal) {
  return {
    name: goal.name,
    target: goal.target,
    saved: goal.saved ?? 0,
    member_id: goal.memberId ?? null,
    account_id: goal.accountId ?? null,
  };
}

async function write(action, fallback = false) {
  try {
    return await action();
  } catch (error) {
    console.error('Falha na gravação com Supabase', error.code || error.name);
    return fallback;
  }
}

function saveRecord(table, id, payload) {
  if (!supabase) return id;
  return write(async () => {
    const exists = id && typeof id === 'number' && id < 1000000000000;
    const query = exists
      ? supabase.from(table).update(payload).eq('id', id)
      : supabase.from(table).insert(payload);
    const row = await checked(query.select('id').single());
    return row.id;
  }, null);
}

function removeRecord(table, key, value) {
  if (!supabase) return true;
  return write(async () => {
    await checked(supabase.from(table).delete().eq(key, value).select(key).single());
    return true;
  });
}

function runOperation(name, args) {
  return write(async () => {
    await checked(supabase.rpc(name, args));
    return true;
  });
}

export const syncTransactionToSupabase = (tx) => saveRecord('transactions', tx.id, transactionPayload(tx));
export const deleteTransactionFromSupabase = (id) => removeRecord('transactions', 'id', id);
export const syncPlannedToSupabase = (item) => saveRecord('planned', item.id, plannedPayload(item));
export const deletePlannedFromSupabase = (id) => removeRecord('planned', 'id', id);
export const syncSourceToSupabase = (source) => saveRecord('sources', source.id, sourcePayload(source));
export const deleteSourceFromSupabase = (id) => removeRecord('sources', 'id', id);
export const syncGoalToSupabase = (goal) => saveRecord('goals', goal.id, goalPayload(goal));
export const syncIdeaToSupabase = (idea) => saveRecord('ideas', idea.id, ideaPayload(idea));
export const deleteIdeaFromSupabase = (id) => removeRecord('ideas', 'id', id);
export const deleteCategoryFromSupabase = (key) => removeRecord('categories', 'key', key);

export function syncAccountToSupabase(account) {
  if (!supabase) return account.id;
  return write(() => checked(supabase.rpc('save_finance_account', {
    account_key: account.id < 1000000000000 ? account.id : null,
    account_row: accountPayload(account),
  })), null);
}

export function deleteAccountFromSupabase(id, deleteRecords) {
  return !supabase || runOperation('delete_finance_account', { account_key: id, delete_records: deleteRecords });
}

export function syncCategoryToSupabase(category) {
  if (!supabase) return true;
  return write(async () => {
    await checked(supabase.from('categories').upsert(categoryPayload(category), { onConflict: 'key' }));
    return true;
  });
}

export function saveSetting(key, value) {
  if (!supabase) return true;
  return write(async () => {
    await checked(supabase.from('settings').upsert({ key, value: JSON.stringify(value) }, { onConflict: 'key' }));
    return true;
  });
}

export function clearSupabaseData(scope) {
  return !supabase || runOperation('clear_finance_data', { data_scope: scope });
}

function persistPlanned(item, transaction, originalId = null, changes = null) {
  return write(async () => {
    const result = await checked(supabase.rpc('persist_finance_planned', {
      planned_key: !originalId && item.id < 1000000000000 ? item.id : null,
      planned_row: plannedPayload(item),
      entry: transaction ? transactionPayload(transaction) : null,
      original_id: originalId,
      changes,
    }));
    return {
      id: result.id,
      transaction: result.transaction ? mapTxFromDb(result.transaction) : null,
    };
  }, null);
}

export function splitPlanned(original, changes, next, transaction) {
  if (!supabase) return { id: next.id, transaction };
  return persistPlanned(next, transaction, original.id, changes);
}

export function saveRealizedPlanned(item, transaction, existingTransactions) {
  if (supabase) return persistPlanned(item, transaction);
  return {
    id: item.id,
    transaction: existingTransactions.some((row) => row.plannedId === item.id) ? null : transaction,
  };
}

export function skipPlannedMonth(item, month) {
  if (!supabase) return [...new Set([...(item.skippedMonths || []), month])];
  return write(() => checked(supabase.rpc('skip_finance_planned_month', {
    planned_key: item.id, skipped_month: month,
  })), null);
}

export function updatePlannedDate(id, dueDate) {
  if (!supabase) return true;
  return write(async () => {
    await checked(supabase.from('planned').update({ due_date: dueDate }).eq('id', id).select('id').single());
    return true;
  });
}

export function recordTransactionBatch(entries, model) {
  if (!supabase) return entries;
  return write(async () => {
    if (!model) {
      const data = await checked(supabase.from('transactions').insert(entries.map(transactionPayload)).select());
      return data.map(mapTxFromDb);
    }
    const data = await checked(supabase.rpc('record_salary_entries', {
      entries: entries.map(transactionPayload),
      model_id: model.id,
      deductions: JSON.stringify(model.salaryDeductions),
    }));
    return data.map(mapTxFromDb);
  }, null);
}

export function contributeToGoalInSupabase(goal, transaction) {
  return write(async () => {
    const result = await checked(supabase.rpc('contribute_to_finance_goal', {
      goal_key: goal.id,
      entry: transactionPayload(transaction),
    }));
    return { goal: mapGoalFromDb(result.goal), transaction: mapTxFromDb(result.transaction) };
  }, null);
}

export function restoreSupabaseBackup(backup) {
  const payload = {
    accounts: backup.accounts.map((row) => ({ id: row.id, ...accountPayload(row) })),
    planned: backup.planned.map((row) => ({ id: row.id, ...plannedPayload(row) })),
    transactions: backup.transactions.map((row) => ({ id: row.id, ...transactionPayload(row) })),
    goals: backup.goals.map((row) => ({ id: row.id, ...goalPayload(row) })),
    categories: backup.categories.map(categoryPayload),
    ideas: backup.ideas.map((row) => ({ ...ideaPayload(row), created_at: row.date || null })),
  };
  if (backup.sources) payload.sources = backup.sources.map((row) => ({ id: row.id, ...sourcePayload(row) }));
  if (backup.budgets) payload.budgets = backup.budgets.map((row) => ({
    category: row.category, limit_amount: row.limit, member_id: row.memberId ?? null,
  }));
  if (backup.reserva) payload.reserva = backup.reserva;
  return checked(supabase.rpc('restore_finance_backup', { backup: payload }));
}

export async function checkHouseholdAccess() {
  return Boolean(await checked(supabase.from('household_access').select('user_id').maybeSingle()));
}

export function onAuthChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}

export function signInWithPasswordAuth(email, password) {
  return supabase.auth.signInWithPassword({ email, password });
}

export function signInWithGoogleAuth() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + window.location.pathname },
  });
}

export function signOutAuth() {
  return supabase.auth.signOut({ scope: 'local' });
}
