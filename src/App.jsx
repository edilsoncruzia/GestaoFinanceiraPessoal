import React, { useState, useMemo, useRef, useEffect } from 'react';
import { COLORS, CATEGORIES, NECESSIDADES, DESEJOS, PRIORITY, DEFAULT_PRIORITY, buildCategoriesObject, categoriesToRows } from './constants/tokens';
import { CategoriesContext } from './context/CategoriesContext';
import { computeHealthScore } from './utils/health';
import { SEED_ACCOUNTS, SEED_TRANSACTIONS, SEED_PLANNED, SEED_GOALS, BUDGETS, MEMBERS, INITIAL_BALANCE, TODAY_MONTH, TODAY_DATE } from './constants/seedData';
import {
  fmt, fmtDate, monthKey, round2, statusFor, plannedStatus, displayStatus,
  memberLabel, inScope, addMonths, monthDiff, monthLabel, generatePlannedOccurrences,
  accountBalance, buildOpenItems, monthlyCashFlow
} from './utils/formatters';
import {
  loadInitialData, syncTransactionToSupabase, deleteTransactionFromSupabase,
  syncPlannedToSupabase, deletePlannedFromSupabase, isSupabaseConfigured,
  syncAccountToSupabase, deleteAccountFromSupabase,
  syncSourceToSupabase, deleteSourceFromSupabase,
  syncCategoryToSupabase, deleteCategoryFromSupabase,
  syncIdeaToSupabase, deleteIdeaFromSupabase,
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
import { CategoriasView } from './components/views/CategoriasView';
import { DeclaracaoIRView } from './components/views/DeclaracaoIRView';
import { IdeiasView } from './components/views/IdeiasView';
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
import { HoleriteModal } from './components/modals/HoleriteModal';
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
  const [categories, setCategories] = useState(CATEGORIES);
  const [ideas, setIdeas] = useState([]);
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
      if (Array.isArray(data.ideas)) setIdeas(data.ideas);
      if (Array.isArray(data.categories) && data.categories.length) setCategories(buildCategoriesObject(data.categories));
    });
  }, []);

  // Persistir no LocalStorage
  useEffect(() => {
    if (!isSupabaseConfigured) {
      localStorage.setItem('gf_accounts', JSON.stringify(accounts));
      localStorage.setItem('gf_transactions', JSON.stringify(transactions));
      localStorage.setItem('gf_planned', JSON.stringify(planned));
      localStorage.setItem('gf_goals', JSON.stringify(goals));
      localStorage.setItem('gf_categories', JSON.stringify(categoriesToRows(categories)));
      localStorage.setItem('gf_ideas', JSON.stringify(ideas));
    }
  }, [accounts, transactions, planned, goals, categories, ideas]);

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

  // Contas marcadas como Reserva: são um controle à parte. O dinheiro nelas NÃO entra nas
  // Receitas/Despesas normais nem no saldo projetado disponível.
  const reservedAmount = useMemo(() => accounts.filter((a) => a.type === "conta" && a.countInAvailable === false).reduce((s, a) => s + accountBalance(a, transactions), 0), [accounts, transactions]);
  const reservedAccountIds = useMemo(() => accounts.filter((a) => a.countInAvailable === false).map((a) => a.id), [accounts]);
  const availableBalance = balance - reservedAmount;

  const currentMonthTx = useMemo(() => visibleTx.filter((t) => monthKey(t.date) === selectedMonth), [visibleTx, selectedMonth]);
  const currentMonthTxNonReserved = useMemo(() => currentMonthTx.filter((t) => !reservedAccountIds.includes(t.accountId)), [currentMonthTx, reservedAccountIds]);
  const projectedMonth = useMemo(() => generatePlannedOccurrences(planned, selectedMonth).filter((o) => inScope(o.memberId, memberFilter)), [planned, selectedMonth, memberFilter]);

  const monthIncome = useMemo(() => {
    if (currentMonthTxNonReserved.length > 0) return currentMonthTxNonReserved.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    return projectedMonth.filter((o) => o.type === "income" && !reservedAccountIds.includes(o.accountId)).reduce((s, o) => s + o.amount, 0);
  }, [currentMonthTxNonReserved, projectedMonth, reservedAccountIds]);
  const monthExpense = useMemo(() => {
    if (currentMonthTxNonReserved.length > 0) return currentMonthTxNonReserved.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return projectedMonth.filter((o) => o.type === "expense" && !reservedAccountIds.includes(o.accountId)).reduce((s, o) => s + o.amount, 0);
  }, [currentMonthTxNonReserved, projectedMonth, reservedAccountIds]);

  // Descontos em folha (deduções de salário): para exibir o valor LÍQUIDO na página
  // inicial, sem inflar Receitas/Despesas com valores já embutidos no salário.
  const payrollDeductions = useMemo(() => currentMonthTx.filter((t) => t.type === "expense" && t.deductedInPayroll).reduce((s, t) => s + t.amount, 0), [currentMonthTx]);

  // Deduções declaradas no modelo do salário (valor líquido), mesmo em meses ainda não
  // efetivados (projeção) — vale para cadastros existentes e novos.
  const salaryDeductionModel = useMemo(() => {
    let total = 0;
    if (currentMonthTx.length > 0) {
      currentMonthTx.filter((t) => t.type === "income").forEach((t) => {
        const tmpl = planned.find((p) => p.id === t.plannedId);
        total += (tmpl?.salaryDeductions || []).reduce((s, d) => s + (Number(d.amount) || 0), 0);
      });
    } else {
      projectedMonth.filter((o) => o.type === "income").forEach((o) => {
        total += (o.salaryDeductions || []).reduce((s, d) => s + (Number(d.amount) || 0), 0);
      });
    }
    return total;
  }, [currentMonthTx, projectedMonth, planned]);

  const totalDeduction = salaryDeductionModel > 0 ? salaryDeductionModel : payrollDeductions;
  const netIncome = monthIncome - totalDeduction;
  const netExpense = monthExpense - payrollDeductions;


  const categoryBreakdown = useMemo(() => {
    const map = {};
    currentMonthTx.filter((t) => t.type === "expense").forEach((t) => { map[t.category] = (map[t.category] || 0) + t.amount; });
    return Object.entries(map).map(([category, value]) => ({ category, value, color: categories[category]?.color || COLORS.green, label: categories[category]?.label || category })).sort((a, b) => b.value - a.value);
  }, [currentMonthTx, categories]);

  const monthTxAll = useMemo(() => transactions.filter((t) => monthKey(t.date) === selectedMonth), [transactions, selectedMonth]);
  const budgetsWithSpent = useMemo(() => budgets.map((b) => ({
    ...b, spent: monthTxAll.filter((t) => t.type === "expense" && t.category === b.category && (b.memberId == null || t.memberId === b.memberId)).reduce((s, t) => s + t.amount, 0),
  })), [budgets, monthTxAll]);

  // Contas em aberto: mês selecionado + meses anteriores ainda não pagos/recebidos.
  const openItems = useMemo(() => buildOpenItems(planned, transactions, selectedMonth), [planned, transactions, selectedMonth]);
  const openExpenseTotal = useMemo(() => openItems.filter((i) => i.type === "expense").reduce((s, i) => s + (i.amount - i.paid), 0), [openItems]);

  const availableNow = availableBalance - openExpenseTotal;

  // Contas marcadas como reserva: não entram nas projeções (saldo futuro) nem na leitura
  // do que está disponível para uso.
  const nonReservedTx = useMemo(() => transactions.filter((t) => !reservedAccountIds.includes(t.accountId)), [transactions, reservedAccountIds]);
  const nonReservedPlanned = useMemo(() => planned.filter((p) => !["accountId", "fromAccountId", "toAccountId"].some((k) => reservedAccountIds.includes(p[k]))), [planned, reservedAccountIds]);
  const openItemsAvailable = useMemo(() => openItems.filter((i) => !["accountId", "fromAccountId", "toAccountId"].some((k) => reservedAccountIds.includes(i[k]))), [openItems, reservedAccountIds]);

  const health = useMemo(() => computeHealthScore({ budgetsWithSpent, monthIncome, monthExpense, currentMonthTx }), [budgetsWithSpent, monthIncome, monthExpense, currentMonthTx]);

  const monthOccurrences = useMemo(() => generatePlannedOccurrences(planned, selectedMonth), [planned, selectedMonth]);
  const plannedWithStatus = useMemo(() => monthOccurrences.map((o) => {
    const linked = transactions.filter((tx) => monthKey(tx.date) === selectedMonth && (tx.plannedId === o.id));
    return { ...o, paid: o.realized ? o.amount : linked.reduce((s, tx) => s + tx.amount, 0) };
  }), [monthOccurrences, transactions, selectedMonth]);

  const monthProjection = useMemo(() => {
    let pendingIncome = 0, pendingExpense = 0;
    openItemsAvailable.forEach((i) => {
      // Salário em aberto entra pelo LÍQUIDO (bruto − descontos do holerite).
      const deduction = (i.salaryDeductions || []).reduce((s, d) => s + (Number(d.amount) || 0), 0);
      if (i.type === "income") pendingIncome += Math.max(0, (i.amount - i.paid) - deduction);
      else if (i.type === "expense") pendingExpense += (i.amount - i.paid);
    });
    return { pendingIncome, pendingExpense, endBalance: availableBalance + pendingIncome - pendingExpense };
  }, [openItemsAvailable, availableBalance]);
  // Saldo no fim do mês — Melhoria #19 (Ajustes e Melhorias):
  // Cada barra mostra o saldo projetado no FIM do mês. A 1ª barra (mês selecionado)
  // usa a mesma projeção do card "Saldo projetado mês" (saldo disponível + a receber − a pagar);
  // os meses seguintes acumulam o fluxo (Receitas − Despesas) de cada mês. Onde o saldo
  // fica negativo no fim do mês a barra é vermelha (salário entra pelo valor líquido).
  const projectedBalance = useMemo(() => {
    const endMonth = addMonths(selectedMonth, 11);
    const rows = [];
    const firstSaldo = round2(monthProjection.endBalance);
    rows.push({ month: selectedMonth, label: monthLabel(selectedMonth), saldo: firstSaldo, receitas: round2(monthProjection.pendingIncome), despesas: round2(monthProjection.pendingExpense), projected: true, negative: firstSaldo < 0 });
    let running = firstSaldo;
    let m = addMonths(selectedMonth, 1);
    while (m <= endMonth) {
      const flow = monthlyCashFlow(m, transactions, planned, memberFilter, reservedAccountIds);
      running += flow.receitas - flow.despesas;
      rows.push({ month: m, label: monthLabel(m), saldo: round2(running), receitas: flow.receitas, despesas: flow.despesas, projected: flow.projected, negative: running < 0 });
      m = addMonths(m, 1);
    }
    return rows;
  }, [selectedMonth, transactions, planned, memberFilter, reservedAccountIds, monthProjection]);

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
      const label = (categories[b.category]?.label || b.category) + (b.memberId ? " (" + memberLabel(b.memberId) + ")" : "");
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
  }, [todayBudgets, todayOccurrences, categories]);

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

  async function upsertPlanned(p, editMeta) {
    const isEdit = planned.some((x) => x.id === p.id);
    if (isEdit && editMeta && editMeta.scope && editMeta.scope !== "all") {
      await editSeriesOccurrence(p, editMeta);
      setShowPlannedForm(false); setEditingPlanned(null);
      return;
    }
    const newP = { ...p, id: p.id || Date.now() };
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

  // Aplica uma edição a uma ocorrência de série (recorrente/parcelada) com escopo.
  // O histórico já consolidado (transações) nunca é apagado.
  async function editSeriesOccurrence(p, meta) {
    const template = planned.find((x) => x.id === p.id);
    if (!template) { showToast("Série não encontrada"); return; }
    const currentMonth = monthKey(meta.originalDueDate || template.dueDate);
    const curInstallment = meta.originalInstallmentCurrent;

    if (meta.scope === "this") {
      // Pula este mês na série e cria um lançamento único com os novos dados.
      const skipped = [...new Set([...(template.skippedMonths || []), currentMonth])];
      const tUpd = { ...template, skippedMonths: skipped };
      setPlanned((prev) => prev.map((x) => (x.id === template.id ? tUpd : x)));
      await syncPlannedToSupabase(tUpd);

      const newItem = { ...template, ...p, id: Date.now(), recurrence: "unica", dueDate: p.dueDate, installmentCurrent: undefined, installmentTotal: undefined, periodicity: undefined, endMonth: null, skippedMonths: [] };
      const dbId = await syncPlannedToSupabase(newItem);
      const final = { ...newItem, id: dbId ?? newItem.id };
      setPlanned((prev) => [...prev, final]);
      showToast("Alteração aplicada só a este lançamento ✓");
    } else if (meta.scope === "future") {
      if (template.recurrence === "parcelada") {
        // Encerra a série antiga antes desta parcela e cria uma nova daqui em diante.
        const newTotal = curInstallment ? Number(curInstallment) - 1 : 0;
        if (newTotal >= (template.installmentCurrent || 1)) {
          const tUpd = { ...template, installmentTotal: newTotal };
          setPlanned((prev) => prev.map((x) => (x.id === template.id ? tUpd : x)));
          await syncPlannedToSupabase(tUpd);
        } else {
          setPlanned((prev) => prev.filter((x) => x.id !== template.id));
          await deletePlannedFromSupabase(template.id);
        }
        const newTpl = { ...template, ...p, id: Date.now(), recurrence: "parcelada", installmentCurrent: curInstallment || 1, installmentTotal: template.installmentTotal, dueDate: p.dueDate, endMonth: null, skippedMonths: [] };
        const dbId = await syncPlannedToSupabase(newTpl);
        const final = { ...newTpl, id: dbId ?? newTpl.id };
        setPlanned((prev) => [...prev, final]);
      } else {
        // Recorrente: a série antiga termina no mês anterior; a nova começa agora.
        const tUpd = { ...template, endMonth: addMonths(currentMonth, -1) };
        setPlanned((prev) => prev.map((x) => (x.id === template.id ? tUpd : x)));
        await syncPlannedToSupabase(tUpd);

        const newTpl = { ...template, ...p, id: Date.now(), recurrence: "recorrente", dueDate: p.dueDate, endMonth: null, skippedMonths: [] };
        const dbId = await syncPlannedToSupabase(newTpl);
        const final = { ...newTpl, id: dbId ?? newTpl.id };
        setPlanned((prev) => [...prev, final]);
      }
      showToast("Alteração aplicada a este e aos próximos ✓");
    }
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
    const newTx = { id: Date.now(), date: payload.date, type: item.type, category: item.category, description: item.description, amount: payload.amount, accountId: payload.accountId, memberId: item.memberId, plannedId: item.id, fonteId: payload.fonteId, attachment: payload.attachment, attachmentMethod: payload.attachmentMethod, includeInIR: item.type === "expense" ? Boolean(item.includeInIR) : undefined };
    const dbId = await syncTransactionToSupabase(newTx);
    if (dbId == null) { showToast("Erro ao salvar pagamento no Supabase"); return; }
    const final = { ...newTx, id: dbId ?? newTx.id };
    setTransactions((prev) => [...prev, final]);
    setPayTarget(null);
    showToast(item.type === "income" ? "Recebimento registrado ✓" : "Pagamento registrado ✓");
  }

  // Registra o salário (bruto) + os descontos em folha como despesas, em um único fluxo.
  async function registerSalaryReceipt(item, payload) {
    const gross = Number(item.amount) || 0;
    const deductions = payload.deductions || [];

    const incomeTx = { id: Date.now(), date: payload.date, type: "income", category: item.category, description: item.description, amount: gross, accountId: payload.accountId, memberId: item.memberId, plannedId: item.id, fonteId: payload.fonteId };
    const incomeDbId = await syncTransactionToSupabase(incomeTx);
    if (incomeDbId == null) { showToast("Erro ao salvar o salário no Supabase"); return; }
    const incomeFinal = { ...incomeTx, id: incomeDbId ?? incomeTx.id };
    setTransactions((prev) => [...prev, incomeFinal]);

    let n = 0;
    for (const d of deductions) {
      const expenseTx = { id: Date.now() + (++n), date: payload.date, type: "expense", category: d.category, description: d.label, amount: d.amount, accountId: payload.accountId, memberId: item.memberId, plannedId: item.id, deductedInPayroll: true };
      const dbId = await syncTransactionToSupabase(expenseTx);
      if (dbId == null) continue;
      const final = { ...expenseTx, id: dbId ?? expenseTx.id };
      setTransactions((prev) => [...prev, final]);
    }

    if (payload.saveModel) {
      const template = planned.find((x) => x.id === item.id);
      if (template) {
        const model = deductions.map((d) => ({ id: "d-" + Date.now().toString(36), label: d.label, category: d.category, amount: d.amount }));
        const updated = { ...template, salaryDeductions: model };
        setPlanned((prev) => prev.map((x) => (x.id === template.id ? updated : x)));
        await syncPlannedToSupabase(updated);
      }
    }

    setPayTarget(null);
    showToast("Salário e descontos registrados ✓");
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
      includeInIR: item.type === "expense" ? Boolean(item.includeInIR) : undefined,
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
  function saveCategory(cat) {
    setCategories((prev) => ({ ...prev, [cat.key]: { ...(prev[cat.key] || {}), ...cat, icon: CATEGORIES[cat.key]?.icon || prev[cat.key]?.icon } }));
    syncCategoryToSupabase(cat);
    showToast("Categoria salva ✓");
  }
  function deleteCategory(key) {
    setCategories((prev) => { const next = { ...prev }; delete next[key]; return next; });
    deleteCategoryFromSupabase(key);
    showToast("Categoria excluída");
  }
  function attachReceipt(t, dataUrl) {
    if (!dataUrl) { showToast("Erro ao ler o comprovante"); return; }
    const updated = { ...t, attachment: dataUrl };
    setTransactions((prev) => prev.map((x) => (x.id === t.id ? updated : x)));
    syncTransactionToSupabase(updated);
    showToast("Comprovante anexado ✓");
  }
  async function saveIdea(text, attachment, attachmentMethod) {
    const d = new Date();
    const dateStr = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    const idea = { id: Date.now(), text: text.trim(), done: false, date: dateStr, attachment: attachment || null, attachmentMethod: attachmentMethod || null };
    const dbId = await syncIdeaToSupabase(idea);
    const final = { ...idea, id: dbId ?? idea.id };
    setIdeas((prev) => [...prev, final]);
    showToast("Ideia registrada ✓");
  }
  function toggleIdeaDone(id) {
    const idea = ideas.find((x) => x.id === id);
    if (!idea) return;
    const updated = { ...idea, done: !idea.done };
    setIdeas((prev) => prev.map((x) => (x.id === id ? updated : x)));
    syncIdeaToSupabase(updated);
  }
  function deleteIdea(id) {
    setIdeas((prev) => prev.filter((x) => x.id !== id));
    deleteIdeaFromSupabase(id);
    showToast("Ideia removida");
  }
  function updateIdea(id, text) {
    const idea = ideas.find((x) => x.id === id);
    if (!idea) return;
    const updated = { ...idea, text: text.trim() };
    setIdeas((prev) => prev.map((x) => (x.id === id ? updated : x)));
    syncIdeaToSupabase(updated);
    showToast("Ideia atualizada ✓");
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
  async function clearSupabase(scope = "all") {
    await clearSupabaseData(scope);
    if (scope === "income" || scope === "expense") {
      const keep = (x) => x.type !== scope;
      const nTx = transactions.filter(keep);
      const nPl = planned.filter(keep);
      setTransactions(nTx);
      setPlanned(nPl);
      if (!isSupabaseConfigured) {
        localStorage.setItem('gf_transactions', JSON.stringify(nTx));
        localStorage.setItem('gf_planned', JSON.stringify(nPl));
      }
      showToast(scope === "income" ? "Receitas removidas ✓" : "Despesas removidas ✓");
    } else {
      setTransactions([]); setPlanned([]); setGoals([]); setBudgets([]); setAccounts([]); setSources([]); setCategories(CATEGORIES); setIdeas([]);
      localStorage.removeItem('gf_accounts'); localStorage.removeItem('gf_transactions'); localStorage.removeItem('gf_planned'); localStorage.removeItem('gf_goals'); localStorage.removeItem('gf_categories'); localStorage.removeItem('gf_ideas');
      setSelectedMonth(TODAY_MONTH); setMemberFilter("todos"); setTab("inicio"); setMoreView(null);
      showToast("Base de dados do Supabase limpa ✓");
    }
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
    setTransactions(SEED_TRANSACTIONS); setPlanned(SEED_PLANNED); setAccounts(SEED_ACCOUNTS); setGoals(SEED_GOALS); setBudgets(BUDGETS); setCategories(CATEGORIES); setIdeas([]);
    setSelectedMonth(TODAY_MONTH); setMemberFilter("todos"); setTab("inicio"); setMoreView(null);
    localStorage.removeItem('gf_accounts');
    localStorage.removeItem('gf_transactions');
    localStorage.removeItem('gf_planned');
    localStorage.removeItem('gf_goals');
    localStorage.removeItem('gf_categories');
    localStorage.removeItem('gf_ideas');
    showToast("Dados de exemplo restaurados ✓");
  }

  function exportData() {
    const payload = { accounts, transactions, planned, goals, categories: categoriesToRows(categories), ideas, exportedAt: new Date().toISOString() };
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
        if (Array.isArray(data.categories) && data.categories.length) setCategories(buildCategoriesObject(data.categories));
        if (Array.isArray(data.ideas)) setIdeas(data.ideas);
        showToast("Dados importados ✓");
      } catch (e) { showToast("Erro ao importar arquivo"); }
    };
    reader.readAsText(file);
  }

  return (
    <CategoriesContext.Provider value={categories}>
    <div className="app-shell">
      <div style={{ position: "absolute", inset: 0, overflowY: "auto" }}>
        <div key={tab + (moreView || "")} className="tab-content" style={{ padding: "20px 18px 96px" }}>
          {tab === "inicio" && <><MonthNav month={selectedMonth} onChange={setSelectedMonth} /><MemberFilterBar value={memberFilter} onChange={setMemberFilter} /><InicioView balance={balance} availableBalance={availableBalance} reservedAmount={reservedAmount} availableNow={availableNow} monthProjection={monthProjection} isCurrentMonth={selectedMonth === TODAY_MONTH} health={health} alerts={alerts} monthIncome={netIncome} monthExpense={netExpense} projectedBalance={projectedBalance} onSelectMonth={setSelectedMonth} openItems={openItems} memberFilter={memberFilter} hideBalance={hideBalance} onToggleHide={() => setHideBalance((h) => !h)} onSeeAll={() => setTab("transacoes")} onPay={setPayTarget} onEditPlanned={(p) => { setEditingPlanned(p); setShowPlannedForm(true); }} onDeletePlanned={deletePlanned} onNewPlanned={() => { setEditingPlanned(null); setShowPlannedForm(true); }} onCloseMonth={() => setShowCloseMonth(true)} /></>}
          {tab === "transacoes" && <><MemberFilterBar value={memberFilter} onChange={setMemberFilter} /><TransacoesView closedList={filteredTx} openItems={openItems} memberFilter={memberFilter} search={search} setSearch={setSearch} filterType={filterType} setFilterType={setFilterType} selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} accounts={accounts} onEdit={(t) => { const linkedPlanned = t.plannedId ? planned.find((p) => p.id === t.plannedId) : null; if (linkedPlanned) { setEditingPlanned(linkedPlanned); setShowPlannedForm(true); } else { setEditingTx(t); setShowForm(true); } }} onDelete={deleteTransaction} onPay={setPayTarget} onEditPlanned={(p) => { setEditingPlanned(p); setShowPlannedForm(true); }} onDeletePlanned={deletePlanned} /></>}
          {tab === "orcamento" && <><MonthNav month={selectedMonth} onChange={setSelectedMonth} /><MemberFilterBar value={memberFilter} onChange={setMemberFilter} /><OrcamentoView budgets={budgetsWithSpent} memberFilter={memberFilter} /></>}
          {tab === "mais" && moreView === null && <MaisMenuView onSelect={setMoreView} />}
          {tab === "mais" && moreView === "contas" && <ContasView accounts={accounts} transactions={transactions} onBack={() => setMoreView(null)} onAdd={openNewAccount} onEdit={openEditAccount} onDelete={requestDeleteAccount} onViewStatements={(a) => setExtratoAccount(a)} />}
          {tab === "mais" && moreView === "categorias" && <CategoriasView onBack={() => setMoreView(null)} onSave={saveCategory} onDelete={deleteCategory} />}
          {tab === "mais" && moreView === "declaracao" && <DeclaracaoIRView transactions={transactions} onBack={() => setMoreView(null)} onAttach={attachReceipt} />}
          {tab === "mais" && moreView === "ajustes" && <IdeiasView ideas={ideas} onBack={() => setMoreView(null)} onSave={saveIdea} onDelete={deleteIdea} onToggle={toggleIdeaDone} onUpdate={updateIdea} />}
          {tab === "mais" && moreView === "metas" && <><BackRow onBack={() => setMoreView(null)} /><MemberFilterBar value={memberFilter} onChange={setMemberFilter} /><MetasView goals={goals} memberFilter={memberFilter} accounts={accounts} onContribute={setContributeTarget} onNewGoal={() => setShowGoalForm(true)} /></>}
          {tab === "mais" && moreView === "relatorios" && <><BackRow onBack={() => setMoreView(null)} /><MonthNav month={selectedMonth} onChange={setSelectedMonth} /><MemberFilterBar value={memberFilter} onChange={setMemberFilter} /><RelatoriosView month={selectedMonth} transactions={transactions} planned={planned} sources={sources} /></>}
          {tab === "mais" && moreView === "regra" && <><BackRow onBack={() => setMoreView(null)} /><MonthNav month={selectedMonth} onChange={setSelectedMonth} /><MemberFilterBar value={memberFilter} onChange={setMemberFilter} /><Regra503020View income={monthIncome} expenses={currentMonthTx.filter((t) => t.type === "expense")} /></>}
          {tab === "mais" && moreView === "projecao" && <><BackRow onBack={() => setMoreView(null)} /><ProjecaoView planned={nonReservedPlanned} transactions={nonReservedTx} balance={availableBalance} memberFilter={memberFilter} setMemberFilter={setMemberFilter} /></>}
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

      {showForm && <TransactionFormModal accounts={accounts} sources={sources} selectedMonth={selectedMonth} editing={editingTx} onClose={() => { setShowForm(false); setEditingTx(null); }} onSubmit={upsertTransaction} onAddCategory={saveCategory} onAddAccount={openNewAccount} />}
      {showPlannedForm && <PlannedFormModal accounts={accounts} sources={sources} selectedMonth={selectedMonth} editing={editingPlanned} onClose={() => { setShowPlannedForm(false); setEditingPlanned(null); }} onSubmit={upsertPlanned} onAddCategory={saveCategory} onAddAccount={openNewAccount} />}
      {payTarget && (payTarget.type === "income" && (payTarget.salaryDeductions || []).length > 0 ? (
        <HoleriteModal item={payTarget} accounts={accounts} sources={sources} selectedMonth={selectedMonth} onClose={() => setPayTarget(null)} onSubmit={(payload) => registerSalaryReceipt(payTarget, payload)} />
      ) : (
        <PayModal item={payTarget} accounts={accounts} sources={sources} transactions={transactions} selectedMonth={selectedMonth} onClose={() => setPayTarget(null)} onSubmit={(payload) => payPlanned(payTarget, payload)} onFinalize={finalizePlanned} />
      ))}
      {contributeTarget && <ContributeModal goal={contributeTarget} accounts={accounts} onClose={() => setContributeTarget(null)} onSubmit={(payload) => contributeToGoal(contributeTarget, payload)} />}
      {showGoalForm && <GoalFormModal accounts={accounts} onClose={() => setShowGoalForm(false)} onSubmit={addGoal} />}
      {showCloseMonth && <CloseMonthModal month={selectedMonth} items={plannedWithStatus} monthIncome={monthIncome} monthExpense={monthExpense} onMove={movePlannedToNextMonth} onClose={() => setShowCloseMonth(false)} />}
      {showAccountForm && <AccountFormModal editing={editingAccount} onClose={() => { setShowAccountForm(false); setEditingAccount(null); }} onSubmit={handleAccountSubmit} />}
      {accountAction && <AccountScopeModal account={accountAction.account} action={accountAction.action} onConfirm={confirmAccountAction} onClose={() => setAccountAction(null)} />}
    </div>
    </CategoriesContext.Provider>
  );
}
