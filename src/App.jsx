import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { COLORS, CATEGORIES, NECESSIDADES, DESEJOS, PRIORITY, DEFAULT_PRIORITY } from './constants/tokens';
import { SEED_ACCOUNTS, SEED_TRANSACTIONS, SEED_PLANNED, SEED_GOALS, BUDGETS, MEMBERS, INITIAL_BALANCE, TODAY_MONTH, TODAY_DATE } from './constants/seedData';
import {
  fmt, fmtDate, monthKey, round2, statusFor, plannedStatus, displayStatus,
  memberLabel, inScope, addMonths, monthDiff, monthLabel, generatePlannedOccurrences
} from './utils/formatters';
import {
  loadInitialData, syncTransactionToSupabase, deleteTransactionFromSupabase,
  syncPlannedToSupabase, deletePlannedFromSupabase, isSupabaseConfigured
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

// Modals
import { TransactionFormModal } from './components/modals/TransactionFormModal';
import { PlannedFormModal } from './components/modals/PlannedFormModal';
import { PayModal } from './components/modals/PayModal';
import { ContributeModal } from './components/modals/ContributeModal';
import { GoalFormModal } from './components/modals/GoalFormModal';
import { CloseMonthModal } from './components/modals/CloseMonthModal';

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
  const [transactions, setTransactions] = useState(SEED_TRANSACTIONS);
  const [planned, setPlanned] = useState(SEED_PLANNED);
  const [accounts, setAccounts] = useState(SEED_ACCOUNTS);
  const [goals, setGoals] = useState(SEED_GOALS);
  const [showForm, setShowForm] = useState(false);
  const [showPlannedForm, setShowPlannedForm] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [editingPlanned, setEditingPlanned] = useState(null);
  const [payTarget, setPayTarget] = useState(null);
  const [contributeTarget, setContributeTarget] = useState(null);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showCloseMonth, setShowCloseMonth] = useState(false);
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
  const balance = useMemo(() => INITIAL_BALANCE + transactions.reduce((s, t) => s + (t.type === "income" ? t.amount : t.type === "expense" ? -t.amount : 0), 0), [transactions]);
  const currentMonthTx = useMemo(() => visibleTx.filter((t) => monthKey(t.date) === selectedMonth), [visibleTx, selectedMonth]);
  const monthIncome = currentMonthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const monthExpense = currentMonthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

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
  const budgetsWithSpent = useMemo(() => BUDGETS.map((b) => ({
    ...b, spent: monthTxAll.filter((t) => t.type === "expense" && t.category === b.category && (b.memberId == null || t.memberId === b.memberId)).reduce((s, t) => s + t.amount, 0),
  })), [monthTxAll]);

  const openWindowMonths = useMemo(() => Array.from({ length: 6 }, (_, i) => addMonths(TODAY_MONTH, i - 5)), []);
  const accumulatedOpenItems = useMemo(() => {
    const all = [];
    openWindowMonths.forEach((m) => {
      generatePlannedOccurrences(planned, m).forEach((o) => {
        const linked = transactions.filter((tx) => monthKey(tx.date) === m && (tx.plannedId === o.id || (!tx.plannedId && tx.category === o.category && tx.type === o.type && tx.memberId === o.memberId)));
        const paid = linked.reduce((s, tx) => s + tx.amount, 0);
        const st = plannedStatus(paid, o.amount);
        if (st.state === "pendente" || st.state === "parcial") all.push({ ...o, paid });
      });
    });
    return all;
  }, [planned, transactions, openWindowMonths]);

  const pendingExpenseTotal = useMemo(() => accumulatedOpenItems.filter((i) => i.type === "expense").reduce((s, i) => s + (i.amount - i.paid), 0), [accumulatedOpenItems]);
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
    const linked = transactions.filter((tx) => monthKey(tx.date) === selectedMonth && (tx.plannedId === o.id || (!tx.plannedId && tx.category === o.category && tx.type === o.type && tx.memberId === o.memberId)));
    return { ...o, paid: linked.reduce((s, tx) => s + tx.amount, 0) };
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
      const linked = transactions.filter((tx) => monthKey(tx.date) === TODAY_MONTH && (tx.plannedId === o.id || (!tx.plannedId && tx.category === o.category && tx.type === o.type && tx.memberId === o.memberId)));
      return { ...o, paid: linked.reduce((s, tx) => s + tx.amount, 0) };
    });
  }, [planned, transactions]);

  const todayBudgets = useMemo(() => {
    const txMonth = transactions.filter((t) => monthKey(t.date) === TODAY_MONTH);
    return BUDGETS.map((b) => ({ ...b, spent: txMonth.filter((t) => t.type === "expense" && t.category === b.category && (b.memberId == null || t.memberId === b.memberId)).reduce((s, t) => s + t.amount, 0) }));
  }, [transactions]);

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

  function upsertTransaction(tx) {
    const isEdit = transactions.some((t) => t.id === tx.id);
    const newTx = { ...tx, id: tx.id || Date.now() };
    setTransactions((prev) => isEdit ? prev.map((t) => t.id === tx.id ? newTx : t) : [...prev, newTx]);
    syncTransactionToSupabase(newTx);
    setShowForm(false); setEditingTx(null);
    showToast(isEdit ? "Transação atualizada ✓" : (tx.type === "transferencia" ? "Transferência registrada ✓" : "Lançamento adicionado ✓"));
  }

  function deleteTransaction(id) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    deleteTransactionFromSupabase(id);
    showToast("Transação excluída");
  }

  function upsertPlanned(p) {
    const newP = { ...p, id: p.id || Date.now() };
    setPlanned((prev) => prev.some((x) => x.id === p.id) ? prev.map((x) => x.id === p.id ? newP : x) : [...prev, newP]);
    syncPlannedToSupabase(newP);
    setShowPlannedForm(false); setEditingPlanned(null);
    showToast("Previsto salvo ✓");
  }

  function deletePlanned(id) {
    setPlanned((prev) => prev.filter((p) => p.id !== id));
    deletePlannedFromSupabase(id);
    showToast("Previsto excluído");
  }

  function movePlannedToNextMonth(id) {
    setPlanned((prev) => prev.map((p) => p.id === id ? { ...p, dueDate: addMonths(p.dueDate, 1) } : p));
  }

  function payPlanned(item, payload) {
    const newTx = { id: Date.now(), date: payload.date, type: item.type, category: item.category, description: item.description, amount: payload.amount, accountId: payload.accountId, memberId: item.memberId, plannedId: item.id };
    setTransactions((prev) => [...prev, newTx]);
    syncTransactionToSupabase(newTx);
    setPayTarget(null);
    showToast(item.type === "income" ? "Recebimento registrado ✓" : "Pagamento registrado ✓");
  }

  function addAccount(a) {
    setAccounts((prev) => [...prev, { ...a, id: Date.now() }]);
    showToast("Conta criada ✓");
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
    setTransactions(SEED_TRANSACTIONS); setPlanned(SEED_PLANNED); setAccounts(SEED_ACCOUNTS); setGoals(SEED_GOALS);
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

  const fabHandler = () => { setEditingTx(null); setShowForm(true); };
  const showFab = tab === "inicio" || tab === "transacoes";

  return (
    <div style={{ fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif", background: COLORS.paper, color: COLORS.ink, height: 700, width: "100%", maxWidth: 430, margin: "0 auto", position: "relative", borderRadius: 20, overflow: "hidden", border: "1px solid " + COLORS.line, boxShadow: "0 12px 36px rgba(0,0,0,0.15)" }}>
      <div style={{ position: "absolute", inset: 0, overflowY: "auto" }}>
        <div key={tab + (moreView || "")} className="tab-content" style={{ padding: "20px 18px 96px" }}>
          {tab === "inicio" && <><MonthNav month={selectedMonth} onChange={setSelectedMonth} /><MemberFilterBar value={memberFilter} onChange={setMemberFilter} /><InicioView balance={balance} availableNow={availableNow} monthProjection={monthProjection} isCurrentMonth={selectedMonth === TODAY_MONTH} health={health} alerts={alerts} monthIncome={monthIncome} monthExpense={monthExpense} trend={monthlyTrend} openItems={accumulatedOpenItems} memberFilter={memberFilter} hideBalance={hideBalance} onToggleHide={() => setHideBalance((h) => !h)} onSeeAll={() => setTab("transacoes")} onPay={setPayTarget} onEditPlanned={(p) => { setEditingPlanned(p); setShowPlannedForm(true); }} onDeletePlanned={deletePlanned} onNewPlanned={() => { setEditingPlanned(null); setShowPlannedForm(true); }} onCloseMonth={() => setShowCloseMonth(true)} /></>}
          {tab === "transacoes" && <><MemberFilterBar value={memberFilter} onChange={setMemberFilter} /><TransacoesView closedList={filteredTx} openItems={accumulatedOpenItems} memberFilter={memberFilter} search={search} setSearch={setSearch} filterType={filterType} setFilterType={setFilterType} accounts={accounts} onEdit={(t) => { setEditingTx(t); setShowForm(true); }} onDelete={deleteTransaction} onPay={setPayTarget} onEditPlanned={(p) => { setEditingPlanned(p); setShowPlannedForm(true); }} onDeletePlanned={deletePlanned} /></>}
          {tab === "orcamento" && <><MonthNav month={selectedMonth} onChange={setSelectedMonth} /><MemberFilterBar value={memberFilter} onChange={setMemberFilter} /><OrcamentoView budgets={budgetsWithSpent} memberFilter={memberFilter} /></>}
          {tab === "mais" && moreView === null && <MaisMenuView onSelect={setMoreView} />}
          {tab === "mais" && moreView === "contas" && <ContasView accounts={accounts} transactions={monthTxAll} onBack={() => setMoreView(null)} onAdd={addAccount} />}
          {tab === "mais" && moreView === "metas" && <><BackRow onBack={() => setMoreView(null)} /><MemberFilterBar value={memberFilter} onChange={setMemberFilter} /><MetasView goals={goals} memberFilter={memberFilter} accounts={accounts} onContribute={setContributeTarget} onNewGoal={() => setShowGoalForm(true)} /></>}
          {tab === "mais" && moreView === "relatorios" && <><BackRow onBack={() => setMoreView(null)} /><MonthNav month={selectedMonth} onChange={setSelectedMonth} /><MemberFilterBar value={memberFilter} onChange={setMemberFilter} /><RelatoriosView trend={monthlyTrend} breakdown={categoryBreakdown} total={monthExpense} /></>}
          {tab === "mais" && moreView === "regra" && <><BackRow onBack={() => setMoreView(null)} /><MonthNav month={selectedMonth} onChange={setSelectedMonth} /><MemberFilterBar value={memberFilter} onChange={setMemberFilter} /><Regra503020View income={monthIncome} expenses={currentMonthTx.filter((t) => t.type === "expense")} /></>}
          {tab === "mais" && moreView === "projecao" && <><BackRow onBack={() => setMoreView(null)} /><ProjecaoView planned={planned} transactions={transactions} balance={balance} memberFilter={memberFilter} setMemberFilter={setMemberFilter} /></>}
          {tab === "mais" && moreView === "dados" && <><BackRow onBack={() => setMoreView(null)} /><DadosView onExport={exportData} onImport={() => fileInputRef.current && fileInputRef.current.click()} onReset={resetToSeed} /></>}
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="application/json" style={{ display: "none" }} onChange={(e) => { if (e.target.files[0]) importData(e.target.files[0]); e.target.value = ""; }} />

      {showFab && (
        <button onClick={fabHandler} aria-label="Adicionar" className="fab-btn" style={{ position: "absolute", right: 18, bottom: 84, width: 52, height: 52, borderRadius: "50%", background: COLORS.green, border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(31,93,76,0.35)", zIndex: 5 }}>
          <Plus size={24} />
        </button>
      )}

      {toast && (
        <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", bottom: 96, background: COLORS.ink, color: "#fff", borderRadius: 12, padding: "10px 16px", fontSize: 13, fontWeight: 500, zIndex: 20, boxShadow: "0 8px 20px rgba(0,0,0,0.25)", whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}

      <BottomNav tab={tab} setTab={(t) => { setTab(t); setMoreView(null); }} />

      {showForm && <TransactionFormModal accounts={accounts} selectedMonth={selectedMonth} editing={editingTx} onClose={() => { setShowForm(false); setEditingTx(null); }} onSubmit={upsertTransaction} />}
      {showPlannedForm && <PlannedFormModal accounts={accounts} selectedMonth={selectedMonth} editing={editingPlanned} onClose={() => { setShowPlannedForm(false); setEditingPlanned(null); }} onSubmit={upsertPlanned} />}
      {payTarget && <PayModal item={payTarget} accounts={accounts} selectedMonth={selectedMonth} onClose={() => setPayTarget(null)} onSubmit={(payload) => payPlanned(payTarget, payload)} />}
      {contributeTarget && <ContributeModal goal={contributeTarget} accounts={accounts} onClose={() => setContributeTarget(null)} onSubmit={(payload) => contributeToGoal(contributeTarget, payload)} />}
      {showGoalForm && <GoalFormModal accounts={accounts} onClose={() => setShowGoalForm(false)} onSubmit={addGoal} />}
      {showCloseMonth && <CloseMonthModal month={selectedMonth} items={plannedWithStatus} monthIncome={monthIncome} monthExpense={monthExpense} onMove={movePlannedToNextMonth} onClose={() => setShowCloseMonth(false)} />}
    </div>
  );
}
