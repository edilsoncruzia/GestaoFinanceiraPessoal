import { createClient } from '@supabase/supabase-js';
import { SEED_ACCOUNTS, SEED_TRANSACTIONS, SEED_PLANNED, SEED_GOALS, BUDGETS, MEMBERS } from '../constants/seedData';
import { DEFAULT_CATEGORY_ROWS } from '../constants/tokens';

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
      const [accountsRes, txRes, plannedRes, goalsRes, budgetsRes, sourcesRes, categoriesRes, ideasRes] = await Promise.all([
        supabase.from('accounts').select('*'),
        supabase.from('transactions').select('*'),
        supabase.from('planned').select('*'),
        supabase.from('goals').select('*'),
        supabase.from('budgets').select('*'),
        supabase.from('sources').select('*'),
        supabase.from('categories').select('*'),
        supabase.from('ideas').select('*'),
      ]);

      // Só cai no fallback de exemplo se as tabelas PRINCIPAIS (contas/transações) falharem.
      // Tabelas auxiliares com erro viram lista vazia, sem apagar o resto.
      if (!accountsRes.error && !txRes.error) {
        let categories = null;
        if (!categoriesRes.error) {
          categories = (categoriesRes.data || []).map(mapCategoryFromDb);
          if (categories.length === 0) {
            await seedCategories();
            categories = DEFAULT_CATEGORY_ROWS.map((c) => ({ ...c }));
          }
        }
        return {
          accounts: (accountsRes.data || []).map(mapAccountFromDb),
          transactions: (txRes.data || []).map(mapTxFromDb),
          planned: plannedRes.error ? [] : (plannedRes.data || []).map(mapPlannedFromDb),
          goals: goalsRes.error ? [] : (goalsRes.data || []).map(mapGoalFromDb),
          budgets: budgetsRes.error ? [] : (budgetsRes.data || []).map(mapBudgetFromDb),
          sources: sourcesRes.error ? [] : (sourcesRes.data || []).map(mapSourceFromDb),
          categories,
          ideas: ideasRes.error ? [] : (ideasRes.data || []).map(mapIdeaFromDb),
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
  const localCategories = localStorage.getItem('gf_categories');
  const localIdeas = localStorage.getItem('gf_ideas');

  return {
    accounts: localAccounts ? JSON.parse(localAccounts) : SEED_ACCOUNTS,
    transactions: localTx ? JSON.parse(localTx) : SEED_TRANSACTIONS,
    planned: localPlanned ? JSON.parse(localPlanned) : SEED_PLANNED,
    goals: localGoals ? JSON.parse(localGoals) : SEED_GOALS,
    categories: localCategories ? JSON.parse(localCategories) : null,
    ideas: localIdeas ? JSON.parse(localIdeas) : [],
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
    formaPagamento: p.forma_pagamento || "normal"
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
      fonte_id: tx.fonteId || null,
      include_in_ir: Boolean(tx.includeInIR),
      deducted_in_payroll: Boolean(tx.deductedInPayroll),
      forma_pagamento: (tx.formaPagamento && tx.formaPagamento !== "normal") ? tx.formaPagamento : undefined
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
      forma_pagamento: (p.formaPagamento && p.formaPagamento !== "normal") ? p.formaPagamento : undefined
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
      current_invoice: a.currentInvoice || 0,
      count_in_available: a.countInAvailable == null ? true : Boolean(a.countInAvailable)
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

export function mapCategoryFromDb(c) {
  return {
    key: c.key,
    label: c.label,
    color: c.color,
    type: c.type
  };
}

export async function syncCategoryToSupabase(cat) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('categories').upsert({
      key: cat.key,
      label: cat.label,
      color: cat.color,
      type: cat.type
    }, { onConflict: 'key' });
  } catch (e) {
    console.error('Erro ao sincronizar categoria com Supabase:', e);
  }
}

export async function deleteCategoryFromSupabase(key) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('categories').delete().eq('key', key);
  } catch (e) {
    console.error('Erro ao excluir categoria no Supabase:', e);
  }
}

export async function seedCategories() {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('categories').upsert(DEFAULT_CATEGORY_ROWS.map((c) => ({ key: c.key, label: c.label, color: c.color, type: c.type })), { onConflict: 'key' });
  } catch (e) {
    console.error('Erro ao semear categorias no Supabase:', e);
  }
}

export function mapIdeaFromDb(i) {
  return { id: i.id, text: i.text, done: Boolean(i.done), date: i.created_at ? i.created_at.slice(0, 10) : "", attachment: i.attachment || null, attachmentMethod: i.attachment_method || null };
}

export async function syncIdeaToSupabase(idea) {
  if (!isSupabaseConfigured || !supabase) return idea.id;
  try {
    const payload = { text: idea.text, done: Boolean(idea.done), attachment: idea.attachment || null, attachment_method: idea.attachmentMethod || null };
    if (idea.id && typeof idea.id === 'number' && idea.id < 1000000000000) {
      await supabase.from('ideas').update(payload).eq('id', idea.id);
      return idea.id;
    } else {
      const { data, error } = await supabase.from('ideas').insert([payload]).select('id').single();
      if (error) throw error;
      return data.id;
    }
  } catch (e) {
    console.error('Erro ao sincronizar ideia com Supabase:', e);
    return idea.id;
  }
}

export async function deleteIdeaFromSupabase(id) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('ideas').delete().eq('id', id);
  } catch (e) {
    console.error('Erro ao excluir ideia no Supabase:', e);
  }
}

// Limpa dados do Supabase mantendo os membros do casal.
// scope: 'all' (tudo) | 'income' (apenas receitas) | 'expense' (apenas despesas)
export async function clearSupabaseData(scope = 'all') {
  if (!isSupabaseConfigured || !supabase) return;

  if (scope === 'income') {
    await supabase.from('transactions').delete().eq('type', 'income');
    await supabase.from('planned').delete().eq('type', 'income');
    return;
  }
  if (scope === 'expense') {
    await supabase.from('transactions').delete().eq('type', 'expense');
    await supabase.from('planned').delete().eq('type', 'expense');
    return;
  }

  // 'all' — apaga tudo
  const tables = ['transactions', 'planned', 'goals', 'budgets', 'accounts', 'sources'];
  for (const t of tables) {
    await supabase.from(t).delete().gte('id', 0);
  }
  try {
    await supabase.from('categories').delete().neq('key', '');
  } catch (e) {
    console.error('Erro ao limpar categorias no Supabase:', e);
  }
  try {
    await supabase.from('ideas').delete().gte('id', 0);
  } catch (e) {
    console.error('Erro ao limpar ideias no Supabase:', e);
  }
}

// ===== Autenticação (Supabase Auth) =====
export async function getAuthSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthChange(cb) {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session));
  return () => data.subscription.unsubscribe();
}

export async function signInWithPasswordAuth(email, password) {
  if (!supabase) return { error: { message: 'Supabase não configurado' } };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error };
}

export async function signInWithGoogleAuth() {
  if (!supabase) return { error: { message: 'Supabase não configurado' } };
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + window.location.pathname },
  });
  return { error };
}

export async function signOutAuth() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

// Busca o e-mail do membro a partir do CPF (login por CPF + senha).
export async function lookupMemberEmailByCpf(cpf) {
  if (!supabase) return null;
  const { data, error } = await supabase.from('members').select('email').eq('cpf', cpf).maybeSingle();
  if (error || !data) return null;
  return data.email;
}

