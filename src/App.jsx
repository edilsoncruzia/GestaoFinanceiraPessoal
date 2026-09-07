import React, { useState, useMemo, useRef, useEffect } from 'react';
import { COLORS, CATEGORIES, NECESSIDADES, DESEJOS, PRIORITY, DEFAULT_PRIORITY } from './constants/tokens';
import { SEED_ACCOUNTS, SEED_TRANSACTIONS, SEED_PLANNED, SEED_GOALS, BUDGETS, MEMBERS, INITIAL_BALANCE, TODAY_MONTH, TODAY_DATE } from './constants/seedData';
import {
  fmt, fmtDate, monthKey, round2, statusFor, plannedStatus, displayStatus,
  memberLabel, inScope, addMonths, monthDiff, monthLabel, generatePlannedOccurrences
} from './utils/formatters';
import {
  loadInitialData, syncTransactionToSupabase, deleteTransactionFromSupabase,
  syncPlannedToSupabase, deletePlannedFromSupabase, isSupabaseConfigured,
  syncAccountToSupabase, deleteAccountFromSupabase,
  syncSourceToSupabase, deleteSourceFromSupabase,
  clearSupabaseData
} from './lib/supabase';

// UI & Layout Components
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { MonthNav } from './components/ui/MonthNav';
import { MemberFilterBar } from './components/ui/MemberFilterBar';
import { BottomNav } from './components/ui/BottomNav';

// Views
import { InicioView } from './components/views/InicioView';
import { TransacoesView } from './components/views/TransacoesView';
import { OrcamentoView } from './components/views/OrcamentoView';
import { MaisMenuView, BackRow } from './components/views/MaisMenuView';
import { ContasView } from './components/views/ContasView';
import { MetasView } from './components/views/MetasView';
import { RelatoriosView } from './components/views/RelatoriosView';
import { Regra503020View } from './components/views/Regra503020View';
import { ProjecaoView } from './components/views/ProjecaoView';
import { DadosView } from './components/views/DadosView';
import { FontesView } from './components/views/FontesView';
import { ExtratoView } from './components/views/ExtratoView';

// Modals
import { TransactionFormModal } from './components/modals/TransactionFormModal';
import { PlannedFormModal } from './components/modals/PlannedFormModal';
import { PayModal } from './components/modals/PayModal';
import { ContributeModal } from './components/modals/ContributeModal';
import { GoalFormModal } from './components/modals/GoalFormModal';
import { CloseMonthModal } from './components/modals/CloseMonthModal';
import { AccountFormModal } from './components/modals/AccountFormModal';
import { AccountScopeModal } from './components/modals/AccountScopeModal';

export default function App() {
  return (
    <ErrorBoundary>
      <FinanceApp />
    </ErrorBoundary>
  );
}

function FinanceApp() {
  const [tab, setTab] = useState("inicio");
  const [moreView, setMoreView] = useState(null);
  const [transactions, setTransactions] = useState(isSupabaseConfigured ? [] : SEED_TRANSACTIONS);
  const [planned, setPlanned] = useState(isSupabaseConfigured ? [] : SEED_PLANNED);
  const [accounts, setAccounts] = useState(isSupabaseConfigured ? [] : SEED_ACCOUNTS);
  const [goals, setGoals] = useState(isSupabaseConfigured ? [] : SEED_GOALS);
  const [budgets, setBudgets] = useState(isSupabaseConfigured ? [] : BUDGETS);
  const [showForm, setShowForm] = useState(false);
  const [showPlannedForm, setShowPlannedForm] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [editingPlanned, setEditingPlanned] = useState(null);
  const [payTarget, setPayTarget] = useState(null);
  const [contributeTarget, setContributeTarget] = useState(null);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showCloseMonth, setShowCloseMonth] = useState(false);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [accountAction, setAccountAction] = useState(null); // { account, action: 'edit' | 'delete' }
  const [sources, setSources] = useState([]);
  const [extratoAccount, setExtratoAccount] = useState(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("todos");
  const [memberFilter, setMemberFilter] = useState("todos");
  const [selectedMonth, setSelectedMonth] = useState(TODAY_MONTH);
  const [hideBalance, setHideBalance] = useState(false);
  const [toast, setToast] = useState("");
  const fileInputRef = useRef(null);

  // Carregar dados (Supabase ou LocalStorage) ao iniciar
  useEffect(() => {
    loadInitialData().then((data) => {
      if (data.accounts) setAccounts(data.accounts);
      if (data.transactions) setTransactions(data.transactions);
      if (data.planned) setPlanned(data.planned);
      if (data.goals) setGoals(data.goals);
      if (data.budgets) setBudgets(data.budgets);
      if (data.sources) setSources(data.sources);
    });
  }, []);

  // Persistir no LocalStorage
  useEffect(() => {
    if (!isSupabaseConfigured) {
      localStorage.setItem('gf_accounts', JSON.stringify(accounts));
      localStorage.setItem('gf_transactions', JSON.stringify(transactions));
      localStorage.setItem('gf_planned', JSON.stringify(planned));
      localStorage.setItem('gf_goals', JSON.stringify(goals));
    }
  }, [accounts, transactions, planned, goals]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  function showToast(msg) { setToast(msg); }

  const visibleTx = useMemo(() => transactions.filter((t) => inScope(t.memberId, memberFilter)), [transactions, memberFilter]);
  const sorted = useMemo(() => [...visibleTx].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.id - a.id)), [visibleTx]);
  const initialBalance = useMemo(() => isSupabaseConfigured ? accounts.reduce((s, a) => s + (a.initialBalance || 0), 0) : INITIAL_BALANCE, [accounts]);
  const balance = useMemo(() => initialBalance + transactions.reduce((s, t) => s + (t.type === "income" ? t.amount : t.type === "expense" ? -t.amount : 0), 0), [transactions, initialBalance]);
  const currentMonthTx = useMemo(() => visibleTx.filter((t) => monthKey(t.date) === selectedMonth), [visibleTx, selectedMonth]);
  const projectedMonth = useMemo(() => generatePlannedOccurrences(planned, selectedMonth).filter((o) => inScope(o.memberId, memberFilter)), [planned, selectedMonth, memberFilter]);
  const monthIncome = useMemo(() => {
    if (currentMonthTx.length > 0) return currentMonthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    return projectedMonth.filter((o) => o.type === "income").reduce((s, o) => s + o.amount, 0);
  }, [currentMonthTx, projectedMonth]);
  const monthExpense = useMemo(() => {
    if (currentMonthTx.length > 0) return currentMonthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return projectedMonth.filter((o) => o.type === "expense").reduce((s, o) => s + o.amount, 0);
  }, [currentMonthTx, projectedMonth]);

  const monthlyTrend = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => addMonths(selectedMonth, i - 5));
    return months.map((m) => {
      const actual = visibleTx.filter((t) => monthKey(t.date) === m);
      let receitas = actual.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
      let despesas = actual.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
      let projected = false;
      if (actual.length === 0) {
        const occ = generatePlannedOccurrences(planned, m).filter((o) => inScope(o.memberId, memberFilter));
        receitas = occ.filter((o) => o.type === "income").reduce((s, o) => s + o.amount, 0);
        despesas = occ.filter((o) => o.type === "expense").reduce((s, o) => s + o.amount, 0);
        projected = receitas > 0 || despesas > 0;
      }
      return { month: m, label: monthLabel(m), receitas, despesas, projected };
    });
  }, [selectedMonth, visibleTx, planned, memberFilter]);

  const categoryBreakdown = useMemo(() => {
    const map = {};
    currentMonthTx.filter((t) => t.type === "expense").forEach((t) => { map[t.category] = (map[t.category] || 0) + t.amount; });
    return Object.entries(map).map(([category, value]) => ({ category, value, color: CATEGORIES[category]?.color || COLORS.green, label: CATEGORIES[category]?.label || category })).sort((a, b) => b.value - a.value);
  }, [currentMonthTx]);

  const monthTxAll = useMemo(() => transactions.filter((t) => monthKey(t.date) === selectedMonth), [transactions, selectedMonth]);
  const budgetsWithSpent = useMemo(() => budgets.map((b) => ({
    ...b, spent: monthTxAll.filter((t) => t.type === "expense" && t.category === b.category && (b.memberId == null || t.memberId === b.memberId)).reduce((s, t) => s + t.amount, 0),
  })), [budgets, monthTxAll]);

  const openWindowMonths = useMemo(() => Array.from({ length: 6 }, (_, i) => addMonths(TODAY_MONTH, i - 5)), []);
  const todayOpenItems = useMemo(() => {
    const all = [];
    openWindowMonths.forEach((m) => {
      generatePlannedOccurrences(planned, m).forEach((o) => {
        const linked = transactions.filter((tx) => monthKey(tx.date) === m && (tx.plannedId === o.id));
        const paid = o.realized ? o.amount : linked.reduce((s, tx) => s + tx.amount, 0);
        const st = plannedStatus(paid, o.amount);
        if (!o.realized && (st.state === "pendente" || st.state === "parcial")) all.push({ ...o, paid });
      });
    });
    return all;
  }, [planned, transactions]);
  const accumulatedOpenItems = useMemo(() => {
    const all = [];
    const start = addMonths(TODAY_MONTH, -5);
    let m = start;
    while (m <= selectedMonth) {
      generatePlannedOccurrences(planned, m).forEach((o) => {
        const linked = transactions.filter((tx) => monthKey(tx.date) === m && (tx.plannedId === o.id));
        const paid = o.realized ? o.amount : linked.reduce((s, tx) => s + tx.amount, 0);
        const st = plannedStatus(paid, o.amount);
        if (o.realized || (st.state !== "pendente" && st.state !== "parcial")) return;
        const occMonth = monthKey(o.dueDate);
        if (occMonth === selectedMonth || (occMonth < selectedMonth && o.dueDate < TODAY_DATE)) {
          all.push({ ...o, paid });
        }
      });
      m = addMonths(m, 1);
    }
    return all;
  }, [planned, transactions, selectedMonth]);

  const pendingExpenseTotal = useMemo(() => todayOpenItems.filter((i) => i.type === "expense").reduce((s, i) => s + (i.amount - i.paid), 0), [todayOpenItems]);
  const availableNow = balance - pendingExpenseTotal;

  const health = useMemo(() => {
    let score = 100;
    const overCount = budgetsWithSpent.filter((b) => statusFor(b.spent, b.limit).state === "over").length;
    const exactCount = budgetsWithSpent.filter((b) => statusFor(b.spent, b.limit).state === "exact").length;
    score -= overCount * 15 + exactCount * 5;
    if (monthIncome > 0 && monthExpense > monthIncome) score -= 25;
    const necessidades = currentMonthTx.filter((t) => t.type === "expense" && NECESSIDADES.includes(t.category)).reduce((s, t) => s + t.amount, 0);
    const desejos = currentMonthTx.filter((t) => t.type === "expense" && DESEJOS.includes(t.category)).reduce((s, t) => s + t.amount, 0);
    const poupanca = monthIncome - necessidades - desejos;
    const poupancaPct = monthIncome > 0 ? Math.round((poupanca / monthIncome) * 100) : 0;
    if (monthIncome > 0) {
      if (poupancaPct < 0) score -= 20;
      else if (poupancaPct < 15) score -= 8;
    }
    score = Math.max(0, Math.min(100, Math.round(score)));
    let mood;
    if (score >= 80) mood = { label: "Saúde financeira ótima", shortLabel: "Ótima", color: COLORS.green };
    else if (score >= 60) mood = { label: "Saúde financeira boa", shortLabel: "Boa", color: COLORS.greenLight };
    else if (score >= 40) mood = { label: "Atenção com os gastos", shortLabel: "Atenção", color: COLORS.amber };
    else mood = { label: "Momento de ajustar o mês", shortLabel: "Crítica", color: COLORS.rust };
    return { score, overCount, exactCount, poupancaPct, totalBudgets: budgetsWithSpent.length, ...mood };
  }, [budgetsWithSpent, monthIncome, monthExpense, currentMonthTx]);

  const monthOccurrences = useMemo(() => generatePlannedOccurrences(planned, selectedMonth), [planned, selectedMonth]);
  const plannedWithStatus = useMemo(() => monthOccurrences.map((o) => {
    const linked = transactions.filter((tx) => monthKey(tx.date) === selectedMonth && (tx.plannedId === o.id));
    return { ...o, paid: o.realized ? o.amount : linked.reduce((s, tx) => s + tx.amount, 0) };
  }), [monthOccurrences, transactions, selectedMonth]);

  const monthProjection = useMemo(() => {
    let pendingIncome = 0, pendingExpense = 0;
    plannedWithStatus.forEach((i) => {
      const st = plannedStatus(i.paid, i.amount);
      if (st.state !== "pendente" && st.state !== "parcial") return;
      if (i.type === "income") pendingIncome += (i.amount - i.paid); else pendingExpense += (i.amount - i.paid);
    });
    return { pendingIncome, pendingExpense, endBalance: balance + pendingIncome - pendingExpense };
  }, [plannedWithStatus, balance]);

  const todayOccurrences = useMemo(() => {
    const occ = generatePlannedOccurrences(planned, TODAY_MONTH);
    return occ.map((o) => {
      const linked = transactions.filter((tx) => monthKey(tx.date) === TODAY_MONTH && (tx.plannedId === o.id));
      return { ...o, paid: o.realized ? o.amount : linked.reduce((s, tx) => s + tx.amount, 0) };
    });
  }, [planned, transactions]);

  const todayBudgets = useMemo(() => {
    const txMonth = transactions.filter((t) => monthKey(t.date) === TODAY_MONTH);
    return budgets.map((b) => ({ ...b, spent: txMonth.filter((t) => t.type === "expense" && t.category === b.category && (b.memberId == null || t.memberId === b.memberId)).reduce((s, t) => s + t.amount, 0) }));
  }, [budgets, transactions]);

  const alerts = useMemo(() => {
    const list = [];
    todayBudgets.forEach((b) => {
      const st = statusFor(b.spent, b.limit);
      const label = (CATEGORIES[b.category]?.label || b.category) + (b.memberId ? " (" + memberLabel(b.memberId) + ")" : "");
      if (st.state === "over") list.push({ level: "rust", priorityRank: 0, text: label + " ultrapassou o limite em " + fmt(b.spent - b.limit) });
      else if (st.state === "exact") list.push({ level: "amber", priorityRank: 1, text: label + " atingiu o limite do mês" });
      else if (b.limit > 0 && b.spent / b.limit >= 0.8) list.push({ level: "amber", priorityRank: 1, text: label + " já está em " + Math.round((b.spent / b.limit) * 100) + "% do limite" });
    });
    todayOccurrences.forEach((o) => {
      const st = plannedStatus(o.paid, o.amount);
      if (st.state !== "pendente" && st.state !== "parcial") return;
      const diffDays = Math.round((new Date(o.dueDate + "T00:00:00") - new Date(TODAY_DATE + "T00:00:00")) / 86400000);
      const priorityRank = PRIORITY[o.priority || DEFAULT_PRIORITY[o.category] || "importante"]?.rank || 1;
      if (diffDays < 0) list.push({ level: "rust", priorityRank, text: o.description + " está atrasado desde " + fmtDate(o.dueDate) });
      else if (diffDays <= 3) list.push({ level: "amber", priorityRank, text: o.description + " vence " + (diffDays === 0 ? "hoje" : "em " + diffDays + " dia" + (diffDays > 1 ? "s" : "")) });
    });
    return list.sort((a, b) => (a.level === b.level ? a.priorityRank - b.priorityRank : a.level === "rust" ? -1 : 1));
  }, [todayBudgets, todayOccurrences]);

  const filteredTx = useMemo(() => sorted.filter((t) => {
    if (filterType !== "todos" && t.type !== filterType) return false;
    if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [sorted, filterType, search]);

  async function upsertTransaction(tx) {
    const isEdit = transactions.some((t) => t.id === tx.id);
    const newTx = { ...tx, id: tx.id || Date.now() };
    const dbId = await syncTransactionToSupabase(newTx);
    if (dbId == null) { showToast("Erro ao salvar no Supabase — verifique a conexão"); return; }
    const final = { ...newTx, id: dbId ?? newTx.id };
    setTransactions((prev) => isEdit ? prev.map((t) => t.id === tx.id ? final : t) : [...prev, final]);
    setShowForm(false); setEditingTx(null);
    showToast(isEdit ? "Transação atualizada ✓" : (tx.type === "transferencia" ? "Transferência registrada ✓" : "Lançamento adicionado ✓"));
  }

  function deleteTransaction(id) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    deleteTransactionFromSupabase(id);
    showToast("Transação excluída");
  }

  async function upsertPlanned(p) {
    const newP = { ...p, id: p.id || Date.now() };
    const isEdit = planned.some((x) => x.id === p.id);
    const dbId = await syncPlannedToSupabase(newP);
    const final = { ...newP, id: dbId ?? newP.id };
    setPlanned((prev) => isEdit ? prev.map((x) => x.id === p.id ? final : x) : [...prev, final]);
    if (p.realized) {
      const linked = transactions.some((t) => t.plannedId === final.id);
      if (!linked) realizePlanned(final);
    }
    setShowPlannedForm(false); setEditingPlanned(null);
    showToast(isEdit ? "Previsto atualizado ✓" : "Previsto salvo ✓");
  }

  async function deletePlanned(item, scope) {
    const id = typeof item === "object" ? item.id : item;
    if (scope === "current" && typeof item === "object") {
      const template = planned.find((p) => p.id === id);
      if (!template) return;
      const month = item.dueDate.slice(0, 7);
      const skipped = [...new Set([...(template.skippedMonths || []), month])];
      const updated = { ...template, skippedMonths: skipped };
      setPlanned((prev) => prev.map((p) => (p.id === id ? updated : p)));
      await syncPlannedToSupabase(updated);
      showToast("Ocorrência removida deste mês ✓");
    } else {
      setPlanned((prev) => prev.filter((p) => p.id !== id));
      await deletePlannedFromSupabase(id);
      showToast("Compromisso excluído ✓");
    }
  }

  function movePlannedToNextMonth(id) {
    setPlanned((prev) => prev.map((p) => p.id === id ? { ...p, dueDate: addMonths(p.dueDate, 1) } : p));
  }

  async function payPlanned(item, payload) {
    const newTx = { id: Date.now(), date: payload.date, type: item.type, category: item.category, description: item.description, amount: payload.amount, accountId: payload.accountId, memberId: item.memberId, plannedId: item.id, fonteId: payload.fonteId, attachment: payload.attachment, attachmentMethod: payload.attachmentMethod };
    const dbId = await syncTransactionToSupabase(newTx);
    if (dbId == null) { showToast("Erro ao salvar pagamento no Supabase"); return; }
    const final = { ...newTx, id: dbId ?? newTx.id };
    setTransactions((prev) => [...prev, final]);
    setPayTarget(null);
    showToast(item.type === "income" ? "Recebimento registrado ✓" : "Pagamento registrado ✓");
  }

  async function realizePlanned(item) {
    const newTx = {
      id: Date.now(),
      date: item.dueDate,
      type: item.type,
      category: item.category || null,
      description: item.description,
      amount: item.amount,
      accountId: item.type === "transferencia" ? item.fromAccountId : item.accountId,
      fromAccountId: item.type === "transferencia" ? item.fromAccountId : undefined,
      toAccountId: item.type === "transferencia" ? item.toAccountId : undefined,
      memberId: item.memberId,
      plannedId: item.id,
      fonteId: item.fonteId,
      attachment: item.attachment,
      attachmentMethod: item.attachmentMethod,
    };
    const dbId = await syncTransactionToSupabase(newTx);
    if (dbId == null) { showToast("Erro ao efetivar no Supabase"); return; }
    const final = { ...newTx, id: dbId ?? newTx.id };
    setTransactions((prev) => [...prev, final]);
    showToast(item.type === "income" ? "Recebimento efetivado ✓" : (item.type === "transferencia" ? "Transferência efetivada ✓" : "Pagamento efetivado ✓"));
  }

  function openNewAccount() { setEditingAccount(null); setShowAccountForm(true); }
  function openEditAccount(a) { setEditingAccount(a); setShowAccountForm(true); }
  function requestDeleteAccount(a) { setAccountAction({ account: a, action: "delete" }); }

  function handleAccountSubmit(a) {
    const isEdit = accounts.some((x) => x.id === a.id);
    if (isEdit) {
      setAccountAction({ account: a, action: "edit" });
      setShowAccountForm(false);
    } else {
      saveAccount(a);
    }
  }

  function confirmAccountAction(scope) {
    const { account, action } = accountAction;
    if (action === "delete") deleteAccount(account, scope === "all");
    else saveAccount(account);
    setAccountAction(null);
  }

  async function saveAccount(a) {
    const prevDefaults = accounts.filter((x) => x.isDefault && x.id !== a.id);
    const dbId = await syncAccountToSupabase(a);
    const final = { ...a, id: dbId ?? a.id };
    setAccounts((prev) => {
      let next = final.isDefault ? prev.map((x) => (x.id === final.id ? x : { ...x, isDefault: false })) : prev;
      const exists = next.some((x) => x.id === final.id);
      return exists ? next.map((x) => (x.id === final.id ? final : x)) : [...next, final];
    });
    if (final.isDefault) {
      for (const o of prevDefaults) await syncAccountToSupabase({ ...o, isDefault: false });
    }
    setShowAccountForm(false); setEditingAccount(null);
    showToast("Conta salva ✓");
  }

  async function deleteAccount(a, deleteRecords) {
    if (deleteRecords) {
      setTransactions((prev) => prev.filter((t) => t.accountId !== a.id && t.fromAccountId !== a.id && t.toAccountId !== a.id));
      setPlanned((prev) => prev.filter((p) => p.accountId !== a.id));
    } else {
      setTransactions((prev) => prev.map((t) => {
        if (t.accountId === a.id) return { ...t, accountId: null };
        if (t.fromAccountId === a.id) return { ...t, fromAccountId: null };
        if (t.toAccountId === a.id) return { ...t, toAccountId: null };
        return t;
      }));
      setPlanned((prev) => prev.map((p) => (p.accountId === a.id ? { ...p, accountId: null } : p)));
    }
    setAccounts((prev) => prev.filter((x) => x.id !== a.id));
    await deleteAccountFromSupabase(a.id, deleteRecords);
    showToast(deleteRecords ? "Conta e lançamentos excluídos" : "Conta excluída");
  }

  async function saveSource(s) {
    const dbId = await syncSourceToSupabase(s);
    const final = { ...s, id: dbId ?? s.id };
    setSources((prev) => prev.some((x) => x.id === final.id) ? prev.map((x) => x.id === final.id ? final : x) : [...prev, final]);
    showToast("Fonte salva ✓");
  }
  async function deleteSource(id) {
    setSources((prev) => prev.filter((x) => x.id !== id));
    await deleteSourceFromSupabase(id);
    showToast("Fonte excluída");
  }
  async function finalizePlanned(item) {
    const template = planned.find((p) => p.id === item.id);
    if (!template) return;
    const month = monthKey(item.dueDate || template.dueDate);
    const skipped = [...new Set([...(template.skippedMonths || []), month])];
    const updated = { ...template, skippedMonths: skipped };
    setPlanned((prev) => prev.map((p) => (p.id === item.id ? updated : p)));
    await syncPlannedToSupabase(updated);
    setPayTarget(null);
    showToast("Fechado como está neste mês ✓");
  }
  async function clearSupabase() {
    await clearSupabaseData();
    setTransactions([]); setPlanned([]); setGoals([]); setBudgets([]); setAccounts([]); setSources([]);
    localStorage.removeItem('gf_accounts'); localStorage.removeItem('gf_transactions'); localStorage.removeItem('gf_planned'); localStorage.removeItem('gf_goals');
    setSelectedMonth(TODAY_MONTH); setMemberFilter("todos"); setTab("inicio"); setMoreView(null);
    showToast("Base de dados do Supabase limpa ✓");
  }

  function addGoal(g) {
    setGoals((prev) => [...prev, { ...g, id: Date.now(), saved: 0 }]);
    setShowGoalForm(false);
    showToast("Meta criada ✓");
  }

  function contributeToGoal(goal, payload) {
    setGoals((prev) => prev.map((g) => g.id === goal.id ? { ...g, saved: Math.min(g.target, g.saved + payload.amount) } : g));
    const newTx = { id: Date.now(), date: payload.date, type: "expense", category: "poupanca", description: "Contribuição: " + goal.name, amount: payload.amount, accountId: payload.accountId, memberId: goal.memberId };
    setTransactions((prev) => [...prev, newTx]);
    syncTransactionToSupabase(newTx);
    setContributeTarget(null);
    showToast("Contribuição registrada ✓");
  }

  function resetToSeed() {
    setTransactions(SEED_TRANSACTIONS); setPlanned(SEED_PLANNED); setAccounts(SEED_ACCOUNTS); setGoals(SEED_GOALS); setBudgets(BUDGETS);
    setSelectedMonth(TODAY_MONTH); setMemberFilter("todos"); setTab("inicio"); setMoreView(null);
    localStorage.removeItem('gf_accounts');
    localStorage.removeItem('gf_transactions');
    localStorage.removeItem('gf_planned');
    localStorage.removeItem('gf_goals');
    showToast("Dados de exemplo restaurados ✓");
  }

  function exportData() {
    const payload = { accounts, transactions, planned, goals, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "gestao-financeira-dados.json";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function importData(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (Array.isArray(data.accounts)) setAccounts(data.accounts);
        if (Array.isArray(data.transactions)) setTransactions(data.transactions);
        if (Array.isArray(data.planned)) setPlanned(data.planned);
        if (Array.isArray(data.goals)) setGoals(data.goals);
        showToast("Dados importados ✓");
      } catch (e) { showToast("Erro ao importar arquivo"); }
    };
    reader.readAsText(file);
  }

  return (
    <div style={{ fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif", background: COLORS.paper, color: COLORS.ink, height: 700, width: "100%", maxWidth: 430, margin: "0 auto", position: "relative", borderRadius: 20, overflow: "hidden", border: "1px solid " + COLORS.line, boxShadow: "0 12px 36px rgba(0,0,0,0.15)" }}>
      <div style={{ position: "absolute", inset: 0, overflowY: "auto" }}>
        <div key={tab + (moreView || "")} className="tab-content" style={{ padding: "20px 18px 96px" }}>
          {tab === "inicio" && <><MonthNav month={selectedMonth} onChange={setSelectedMonth} /><MemberFilterBar value={memberFilter} onChange={setMemberFilter} /><InicioView balance={balance} availableNow={availableNow} monthProjection={monthProjection} isCurrentMonth={selectedMonth === TODAY_MONTH} health={health} alerts={alerts} monthIncome={monthIncome} monthExpense={monthExpense} trend={monthlyTrend} openItems={accumulatedOpenItems} memberFilter={memberFilter} hideBalance={hideBalance} onToggleHide={() => setHideBalance((h) => !h)} onSeeAll={() => setTab("transacoes")} onPay={setPayTarget} onEditPlanned={(p) => { setEditingPlanned(p); setShowPlannedForm(true); }} onDeletePlanned={deletePlanned} onNewPlanned={() => { setEditingPlanned(null); setShowPlannedForm(true); }} onCloseMonth={() => setShowCloseMonth(true)} /></>}
          {tab === "transacoes" && <><MemberFilterBar value={memberFilter} onChange={setMemberFilter} /><TransacoesView closedList={filteredTx} openItems={accumulatedOpenItems} memberFilter={memberFilter} search={search} setSearch={setSearch} filterType={filterType} setFilterType={setFilterType} selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} accounts={accounts} onEdit={(t) => { const linkedPlanned = t.plannedId ? planned.find((p) => p.id === t.plannedId) : null; if (linkedPlanned) { setEditingPlanned(linkedPlanned); setShowPlannedForm(true); } else { setEditingTx(t); setShowForm(true); } }} onDelete={deleteTransaction} onPay={setPayTarget} onEditPlanned={(p) => { setEditingPlanned(p); setShowPlannedForm(true); }} onDeletePlanned={deletePlanned} /></>}
          {tab === "orcamento" && <><MonthNav month={selectedMonth} onChange={setSelectedMonth} /><MemberFilterBar value={memberFilter} onChange={setMemberFilter} /><OrcamentoView budgets={budgetsWithSpent} memberFilter={memberFilter} /></>}
          {tab === "mais" && moreView === null && <MaisMenuView onSelect={setMoreView} />}
          {tab === "mais" && moreView === "contas" && <ContasView accounts={accounts} transactions={transactions} onBack={() => setMoreView(null)} onAdd={openNewAccount} onEdit={openEditAccount} onDelete={requestDeleteAccount} onViewStatements={(a) => setExtratoAccount(a)} />}
          {tab === "mais" && moreView === "metas" && <><BackRow onBack={() => setMoreView(null)} /><MemberFilterBar value={memberFilter} onChange={setMemberFilter} /><MetasView goals={goals} memberFilter={memberFilter} accounts={accounts} onContribute={setContributeTarget} onNewGoal={() => setShowGoalForm(true)} /></>}
          {tab === "mais" && moreView === "relatorios" && <><BackRow onBack={() => setMoreView(null)} /><MonthNav month={selectedMonth} onChange={setSelectedMonth} /><MemberFilterBar value={memberFilter} onChange={setMemberFilter} /><RelatoriosView month={selectedMonth} transactions={transactions} planned={planned} sources={sources} /></>}
          {tab === "mais" && moreView === "regra" && <><BackRow onBack={() => setMoreView(null)} /><MonthNav month={selectedMonth} onChange={setSelectedMonth} /><MemberFilterBar value={memberFilter} onChange={setMemberFilter} /><Regra503020View income={monthIncome} expenses={currentMonthTx.filter((t) => t.type === "expense")} /></>}
          {tab === "mais" && moreView === "projecao" && <><BackRow onBack={() => setMoreView(null)} /><ProjecaoView planned={planned} transactions={transactions} balance={balance} memberFilter={memberFilter} setMemberFilter={setMemberFilter} /></>}
          {tab === "mais" && moreView === "dados" && <><BackRow onBack={() => setMoreView(null)} /><DadosView onExport={exportData} onImport={() => fileInputRef.current && fileInputRef.current.click()} onReset={resetToSeed} onClearSupabase={clearSupabase} /></>}
          {tab === "mais" && moreView === "fontes" && <><FontesView sources={sources} onBack={() => setMoreView(null)} onSave={saveSource} onDelete={deleteSource} /></>}
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="application/json" style={{ display: "none" }} onChange={(e) => { if (e.target.files[0]) importData(e.target.files[0]); e.target.value = ""; }} />

      {toast && (
        <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", bottom: 96, background: COLORS.ink, color: "#fff", borderRadius: 12, padding: "10px 16px", fontSize: 13, fontWeight: 500, zIndex: 20, boxShadow: "0 8px 20px rgba(0,0,0,0.25)", whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}

      <BottomNav tab={tab} setTab={(t) => { setTab(t); setMoreView(null); }} onAdd={() => { setEditingPlanned(null); setShowPlannedForm(true); }} />

      {extratoAccount && (
        <div style={{ position: "absolute", inset: 0, background: COLORS.paper, zIndex: 40, overflowY: "auto", padding: "20px 18px 96px" }}>
          <ExtratoView account={extratoAccount} transactions={transactions} sources={sources} onBack={() => setExtratoAccount(null)} />
        </div>
      )}

      {showForm && <TransactionFormModal accounts={accounts} sources={sources} selectedMonth={selectedMonth} editing={editingTx} onClose={() => { setShowForm(false); setEditingTx(null); }} onSubmit={upsertTransaction} />}
      {showPlannedForm && <PlannedFormModal accounts={accounts} sources={sources} selectedMonth={selectedMonth} editing={editingPlanned} onClose={() => { setShowPlannedForm(false); setEditingPlanned(null); }} onSubmit={upsertPlanned} />}
      {payTarget && <PayModal item={payTarget} accounts={accounts} sources={sources} transactions={transactions} selectedMonth={selectedMonth} onClose={() => setPayTarget(null)} onSubmit={(payload) => payPlanned(payTarget, payload)} onFinalize={finalizePlanned} />}
      {contributeTarget && <ContributeModal goal={contributeTarget} accounts={accounts} onClose={() => setContributeTarget(null)} onSubmit={(payload) => contributeToGoal(contributeTarget, payload)} />}
      {showGoalForm && <GoalFormModal accounts={accounts} onClose={() => setShowGoalForm(false)} onSubmit={addGoal} />}
      {showCloseMonth && <CloseMonthModal month={selectedMonth} items={plannedWithStatus} monthIncome={monthIncome} monthExpense={monthExpense} onMove={movePlannedToNextMonth} onClose={() => setShowCloseMonth(false)} />}
      {showAccountForm && <AccountFormModal editing={editingAccount} onClose={() => { setShowAccountForm(false); setEditingAccount(null); }} onSubmit={handleAccountSubmit} />}
      {accountAction && <AccountScopeModal account={accountAction.account} action={accountAction.action} onConfirm={confirmAccountAction} onClose={() => setAccountAction(null)} />}
    </div>
  );
}
