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
      const [accountsRes, txRes, plannedRes, goalsRes] = await Promise.all([
        supabase.from('accounts').select('*'),
        supabase.from('transactions').select('*'),
        supabase.from('planned').select('*'),
        supabase.from('goals').select('*'),
      ]);

      if (!accountsRes.error && accountsRes.data?.length > 0) {
        return {
          accounts: accountsRes.data.map(mapAccountFromDb),
          transactions: (txRes.data || []).map(mapTxFromDb),
          planned: (plannedRes.data || []).map(mapPlannedFromDb),
          goals: (goalsRes.data || []).map(mapGoalFromDb),
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
    memberId: a.member_id
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
    attachment: t.attachment
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
    memberId: p.member_id
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

// Funções de Persistência no Supabase
export async function syncTransactionToSupabase(tx) {
  if (!isSupabaseConfigured || !supabase) return;
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
      attachment: tx.attachment || null
    };

    if (tx.id && typeof tx.id === 'number' && tx.id < 1000000000000) {
      await supabase.from('transactions').update(payload).eq('id', tx.id);
    } else {
      await supabase.from('transactions').insert([payload]);
    }
  } catch (e) {
    console.error('Erro ao sincronizar transação com Supabase:', e);
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
  if (!isSupabaseConfigured || !supabase) return;
  try {
    const payload = {
      type: p.type,
      category: p.category,
      description: p.description,
      amount: p.amount,
      due_date: p.dueDate,
      recurrence: p.recurrence,
      installment_current: p.installmentCurrent || null,
      installment_total: p.installmentTotal || null,
      priority: p.priority || 'importante',
      account_id: p.accountId || null,
      member_id: p.memberId || null
    };

    if (p.id && typeof p.id === 'number' && p.id < 1000000000000) {
      await supabase.from('planned').update(payload).eq('id', p.id);
    } else {
      await supabase.from('planned').insert([payload]);
    }
  } catch (e) {
    console.error('Erro ao sincronizar previsto com Supabase:', e);
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
