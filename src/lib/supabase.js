import { createClient } from '@supabase/supabase-js';
import { SEED_ACCOUNTS, SEED_TRANSACTIONS, SEED_PLANNED, SEED_GOALS, BUDGETS, MEMBERS } from '../constants/seedData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('seu-projeto') && 
  supabaseUrl.startsWith('https://')
);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Helpers de carregamento com fallback inteligente (LocalStorage / SeedData)
export async function loadInitialData() {
  if (isSupabaseConfigured && supabase) {
    try {
      const [accountsRes, txRes, plannedRes, goalsRes, budgetsRes, sourcesRes] = await Promise.all([
        supabase.from('accounts').select('*'),
        supabase.from('transactions').select('*'),
        supabase.from('planned').select('*'),
        supabase.from('goals').select('*'),
        supabase.from('budgets').select('*'),
        supabase.from('sources').select('*'),
      ]);

      // Só cai no fallback de exemplo se as tabelas PRINCIPAIS (contas/transações) falharem.
      // Tabelas auxiliares com erro viram lista vazia, sem apagar o resto.
      if (!accountsRes.error && !txRes.error) {
        return {
          accounts: (accountsRes.data || []).map(mapAccountFromDb),
          transactions: (txRes.data || []).map(mapTxFromDb),
          planned: plannedRes.error ? [] : (plannedRes.data || []).map(mapPlannedFromDb),
          goals: goalsRes.error ? [] : (goalsRes.data || []).map(mapGoalFromDb),
          budgets: budgetsRes.error ? [] : (budgetsRes.data || []).map(mapBudgetFromDb),
          sources: sourcesRes.error ? [] : (sourcesRes.data || []).map(mapSourceFromDb),
        };
      }
    } catch (err) {
      console.warn('Erro ao carregar dados do Supabase. Utilizando fallback local:', err);
    }
  }

  // Fallback LocalStorage ou SeedData
  const localAccounts = localStorage.getItem('gf_accounts');
  const localTx = localStorage.getItem('gf_transactions');
  const localPlanned = localStorage.getItem('gf_planned');
  const localGoals = localStorage.getItem('gf_goals');

  return {
    accounts: localAccounts ? JSON.parse(localAccounts) : SEED_ACCOUNTS,
    transactions: localTx ? JSON.parse(localTx) : SEED_TRANSACTIONS,
    planned: localPlanned ? JSON.parse(localPlanned) : SEED_PLANNED,
    goals: localGoals ? JSON.parse(localGoals) : SEED_GOALS,
  };
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
    currentInvoice: Number(a.current_invoice) || 0
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
    fonteId: t.fonte_id
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
    fonteId: p.fonte_id
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

// Funções de Persistência no Supabase
export async function syncTransactionToSupabase(tx) {
  if (!isSupabaseConfigured || !supabase) return tx.id;
  try {
    const payload = {
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
      fonte_id: tx.fonteId || null
    };

    if (tx.id && typeof tx.id === 'number' && tx.id < 1000000000000) {
      await supabase.from('transactions').update(payload).eq('id', tx.id);
      return tx.id;
    } else {
      const { data, error } = await supabase.from('transactions').insert([payload]).select('id');
      if (error) throw error;
      const id = Array.isArray(data) ? data[0]?.id : data?.id;
      return id ?? null;
    }
  } catch (e) {
    console.error('Erro ao sincronizar transação com Supabase:', e);
    return null;
  }
}

export async function deleteTransactionFromSupabase(id) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('transactions').delete().eq('id', id);
  } catch (e) {
    console.error('Erro ao excluir transação no Supabase:', e);
  }
}

export async function syncPlannedToSupabase(p) {
  if (!isSupabaseConfigured || !supabase) return p.id;
  try {
    const payload = {
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
      fonte_id: p.fonteId || null
    };

    if (p.id && typeof p.id === 'number' && p.id < 1000000000000) {
      await supabase.from('planned').update(payload).eq('id', p.id);
      return p.id;
    } else {
      const { data, error } = await supabase.from('planned').insert([payload]).select('id').single();
      if (error) throw error;
      return data.id;
    }
  } catch (e) {
    console.error('Erro ao sincronizar previsto com Supabase:', e);
    return p.id;
  }
}

export async function deletePlannedFromSupabase(id) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('planned').delete().eq('id', id);
  } catch (e) {
    console.error('Erro ao excluir previsto no Supabase:', e);
  }
}

export async function syncAccountToSupabase(a) {
  if (!isSupabaseConfigured || !supabase) return a.id;
  try {
    const payload = {
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
      current_invoice: a.currentInvoice || 0
    };

    if (a.id && typeof a.id === 'number' && a.id < 1000000000000) {
      await supabase.from('accounts').update(payload).eq('id', a.id);
      return a.id;
    } else {
      const { data, error } = await supabase.from('accounts').insert([payload]).select('id').single();
      if (error) throw error;
      return data.id;
    }
  } catch (e) {
    console.error('Erro ao sincronizar conta com Supabase:', e);
    return a.id;
  }
}

export async function deleteAccountFromSupabase(id, deleteRecords) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    if (deleteRecords) {
      await supabase.from('transactions').delete().or(`account_id.eq.${id},from_account_id.eq.${id},to_account_id.eq.${id}`);
      await supabase.from('planned').delete().eq('account_id', id);
    }
    await supabase.from('accounts').delete().eq('id', id);
  } catch (e) {
    console.error('Erro ao excluir conta no Supabase:', e);
  }
}

export function mapSourceFromDb(s) {
  return {
    id: s.id,
    name: s.name,
    type: s.type
  };
}

export async function syncSourceToSupabase(s) {
  if (!isSupabaseConfigured || !supabase) return s.id;
  try {
    const payload = { name: s.name, type: s.type || null };
    if (s.id && typeof s.id === 'number' && s.id < 1000000000000) {
      await supabase.from('sources').update(payload).eq('id', s.id);
      return s.id;
    } else {
      const { data, error } = await supabase.from('sources').insert([payload]).select('id').single();
      if (error) throw error;
      return data.id;
    }
  } catch (e) {
    console.error('Erro ao sincronizar fonte com Supabase:', e);
    return s.id;
  }
}

export async function deleteSourceFromSupabase(id) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('sources').delete().eq('id', id);
  } catch (e) {
    console.error('Erro ao excluir fonte no Supabase:', e);
  }
}

// Limpa TODOS os dados do Supabase (mantém os membros do casal)
export async function clearSupabaseData() {
  if (!isSupabaseConfigured || !supabase) return;
  const tables = ['transactions', 'planned', 'goals', 'budgets', 'accounts', 'sources'];
  for (const t of tables) {
    await supabase.from(t).delete().gte('id', 0);
  }
}

