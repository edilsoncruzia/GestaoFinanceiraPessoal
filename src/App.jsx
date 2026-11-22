import React, { useState, useMemo, useRef, useEffect } from 'react';
import { COLORS, CATEGORIES, NECESSIDADES, DESEJOS, PRIORITY, DEFAULT_PRIORITY, buildCategoriesObject, categoriesToRows, MAIN_TABS } from './constants/tokens';
import { CategoriesContext } from './context/CategoriesContext';
import { PrivacyProvider, usePrivacy } from './context/PrivacyContext';
import { computeHealthScore } from './utils/health';
import { INITIAL_BALANCE, TODAY_MONTH, TODAY_DATE } from './constants/seedData';
import {
  fmtDate, monthKey, dateInNextMonth, round2, statusFor, plannedStatus, displayStatus,
  memberLabel, inScope, addMonths, monthDiff, monthLabel, monthLabelFull, generatePlannedOccurrences,
  accountBalance, buildOpenItems, monthlyCashFlow, salarioLiquidoDoMes
} from './utils/formatters';
import { processarContas, pacing, agruparDespesas } from './services/prioritizador/index.js';
import { resumoReserva, entradasRestritasPorDia, saldoRestritoAcumulado, ehReceitaRestrita } from './services/prioritizador/reserva.js';
import {
  loadInitialData, syncTransactionToSupabase, deleteTransactionFromSupabase,
  syncPlannedToSupabase, deletePlannedFromSupabase, isSupabaseConfigured,
  syncAccountToSupabase, deleteAccountFromSupabase,
  syncSourceToSupabase, deleteSourceFromSupabase,
  syncCategoryToSupabase, deleteCategoryFromSupabase,
  syncIdeaToSupabase, deleteIdeaFromSupabase,
  saveSetting, clearSupabaseData, syncGoalToSupabase, contributeToGoalInSupabase, skipPlannedMonth, updatePlannedDate,
  restoreSupabaseBackup, splitPlanned, recordTransactionBatch, saveRealizedPlanned
} from './lib/supabase';
import { exampleFinanceData, parseFinanceBackup, readLocalFinanceData, saveLocalFinanceData } from './lib/localFinance';

// UI & Layout Components
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { MonthNav } from './components/ui/MonthNav';
import { MemberFilterBar } from './components/ui/MemberFilterBar';
import { AppShell } from './components/shell/AppShell';

// Views
import { FinanceAccess } from './components/views/FinanceAccess';
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
import { PriorizacaoView } from './components/views/PriorizacaoView';
import { DadosView } from './components/views/DadosView';
import { FontesView } from './components/views/FontesView';
import { ExtratoView } from './components/views/ExtratoView';
import { ReservaView } from './components/views/ReservaView';

// Modals
import { TransactionFormModal } from './components/modals/TransactionFormModal';
import { PlannedFormModal } from './components/modals/PlannedFormModal';
import { PayModal } from './components/modals/PayModal';
import { HoleriteModal } from './components/modals/HoleriteModal';
import { FaturaModal } from './components/modals/FaturaModal';
import { ContributeModal } from './components/modals/ContributeModal';
import { GoalFormModal } from './components/modals/GoalFormModal';
import { CloseMonthModal } from './components/modals/CloseMonthModal';
import { AccountFormModal } from './components/modals/AccountFormModal';
import { AccountScopeModal } from './components/modals/AccountScopeModal';

export default function App() {
  return (
    <ErrorBoundary>
      <PrivacyProvider>
        {isSupabaseConfigured ? (
          <FinanceAccess>
            {({ userId, logOut, error }) => <CloudFinance key={userId} onSignOut={logOut} sessionError={error} />}
          </FinanceAccess>
        ) : <FinanceApp />}
      </PrivacyProvider>
    </ErrorBoundary>
  );
}

function CloudFinance({ onSignOut, sessionError }) {
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let current = true;
    loadInitialData().then((result) => {
      if (current) setData(result);
    }).catch(() => {
      if (current) setFailed(true);
    });
    return () => { current = false; };
  }, [attempt]);

  if (data) return <FinanceApp initialData={data} onSignOut={onSignOut} sessionError={sessionError} />;

  return (
    <main className="finance-status">
      {failed ? (
        <>
          <p role="alert">Não foi possível carregar os dados do Supabase.</p>
          <button onClick={() => { setFailed(false); setAttempt((value) => value + 1); }}>Tentar novamente</button>
        </>
      ) : <p role="status">Carregando dados financeiros…</p>}
      <button onClick={onSignOut}>Sair</button>
      {sessionError && <p role="alert">{sessionError}</p>}
    </main>
  );
}

function categoriesFor(data) {
  const categories = buildCategoriesObject(data.categories);
  const usesReserve = [...data.planned, ...data.transactions].some((row) => row.category === 'reserva');
  if (usesReserve && !categories.reserva) categories.reserva = CATEGORIES.reserva;
  return categories;
}

let lastEntryId = 0;
function nextEntryId() {
  lastEntryId = Math.max(Date.now(), lastEntryId + 1);
  return lastEntryId;
}

function FinanceApp({ initialData, onSignOut, sessionError }) {
  const [data] = useState(() => initialData ?? readLocalFinanceData());
  const [tab, setTab] = useState("inicio");
  const [moreView, setMoreView] = useState(null);
  const [transactions, setTransactions] = useState(data.transactions);
  const [planned, setPlanned] = useState(data.planned);
  const [accounts, setAccounts] = useState(data.accounts);
  const [goals, setGoals] = useState(data.goals);
  const [budgets, setBudgets] = useState(data.budgets);
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
  const [sources, setSources] = useState(data.sources);
  const [categories, setCategories] = useState(() => categoriesFor(data));
  const [ideas, setIdeas] = useState(data.ideas);
  const [reservaConfig, setReservaConfig] = useState(data.reserva);
  const [extratoAccount, setExtratoAccount] = useState(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("todos");
  const [memberFilter, setMemberFilter] = useState("todos");
  const [selectedMonth, setSelectedMonth] = useState(TODAY_MONTH);
  // Ocultar valores: estado global (PrivacyProvider), padrão OCULTO.
  const { oculto: hideBalance, alternar: alternarValores } = usePrivacy();
  const [toast, setToast] = useState("");
  const fileInputRef = useRef(null);

  const snapshot = useMemo(() => ({
    accounts, transactions, planned, goals, budgets, sources,
    categories: categoriesToRows(categories), ideas, reserva: reservaConfig,
  }), [accounts, transactions, planned, goals, budgets, sources, categories, ideas, reservaConfig]);
  const [storageFailed, setStorageFailed] = useState(false);
  const pendingWrites = useRef(new Set());

  useEffect(() => {
    if (isSupabaseConfigured) return;
    try {
      saveLocalFinanceData(snapshot);
      setStorageFailed(false);
    } catch {
      setStorageFailed(true);
    }
  }, [snapshot]);

  async function withWrite(key, operation) {
    if (pendingWrites.current.has(key)) return;
    pendingWrites.current.add(key);
    try {
      return await operation();
    } finally {
      pendingWrites.current.delete(key);
    }
  }

  function replaceData(next) {
    setAccounts(next.accounts);
    setTransactions(next.transactions);
    setPlanned(next.planned);
    setGoals(next.goals);
    setBudgets(next.budgets);
    setSources(next.sources);
    setCategories(categoriesFor(next));
    setIdeas(next.ideas);
    setReservaConfig(next.reserva);
  }

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

  // Reserva mínima do mês: teto (valor fixo configurado ou 15% do salário
  // líquido) menos o que foi lançado com a forma de pagamento "Reserva mínima".
  // É o mesmo número que vira a linha tracejada do gráfico e a trava de liquidez.
  const salarioMes = useMemo(() => salarioLiquidoDoMes(selectedMonth, planned, transactions, memberFilter), [selectedMonth, planned, transactions, memberFilter]);
  // A reserva é MENSAL (não acumula): o saldo do mês é liquidado no fechamento
  // e entra no mês seguinte como Receita (positivo) ou Despesa (negativo).
  const reservaMes = useMemo(
    () => resumoReserva({
      planned, selectedMonth, memberFilter: "todos", config: reservaConfig,
      salarioDoMes: (m) => salarioLiquidoDoMes(m, planned, transactions, memberFilter),
    }),
    [planned, selectedMonth, reservaConfig, transactions, memberFilter]
  );

  // Dinheiro restrito (cartão alimentação): só paga a categoria dele e É
  // acumulativo — o que não foi gasto entra positivo no mês seguinte.
  const carryRestrito = useMemo(
    () => saldoRestritoAcumulado({ planned, selectedMonth, memberFilter: "todos" }),
    [planned, selectedMonth]
  );
  const beneficioMes = useMemo(
    () => entradasRestritasPorDia({ planned, selectedMonth, memberFilter: "todos", carryInicial: carryRestrito }),
    [planned, selectedMonth, carryRestrito]
  );

  // Classificação do Motor de Priorização + simulação diária (tópico #23).
  // Recebimentos ficam primeiro; despesas seguem a fila. Despesas de cartão viram
  // uma "Fatura <cartão>" (rotativo G4); débito/pix automático saem da fila.
  const priorizacaoHome = useMemo(() => {
    // Reserva mínima também quando não há contas em aberto (para o card da Início).
    const reservaPayload = {
      reservaMinima: reservaMes.limite,
      reservaUsada: reservaMes.usado,
      reservaDisponivel: reservaMes.disponivel,
      reservaItens: reservaMes.itens,
      reservaConfigurada: reservaMes.configurado,
      reservaAporte: reservaMes.aporte,
      reservaReceita: reservaMes.receitaDoMesAnterior,
      reservaDespesa: reservaMes.despesaDoMesAnterior,
      reservaSobra: reservaMes.sobra,
      reservaDeficit: reservaMes.deficit,
    };
    if (!openItems.length) return { items: openItems, postergadas: [], pacing: null, dias: [], autoDetalhes: [], ...reservaPayload };
    const expenses = openItems.filter((i) => i.type === "expense").map((i) => ({ ...i, formaPagamento: i.formaPagamento || "normal" }));
    const incomes = openItems.filter((i) => i.type !== "expense");
    const ded = (o) => (o.salaryDeductions || []).reduce((s, d) => s + (Number(d.amount) || 0), 0);
    const occ = generatePlannedOccurrences(planned, selectedMonth);

    // Teto da reserva: valor fixo configurado ou 15% do salário líquido.
    const reservaMinima = reservaMes.limite;

    const entradas = {};
    // Receita restrita (cartão alimentação) NÃO entra no caixa livre — ela vai
    // para o bolso restrito do dia e só paga a categoria dela.
    occ.filter((o) => o.type === "income" && !ehReceitaRestrita(o) && inScope(o.memberId, memberFilter)).forEach((o) => {
      const d = Number(o.dueDate.slice(8, 10));
      entradas[d] = (entradas[d] || 0) + Math.max(0, (Number(o.amount) || 0) - ded(o));
    });

    const g = agruparDespesas(expenses, accounts, selectedMonth);
    const res = processarContas(g.contas, {
      referenciaHoje: TODAY_DATE,
      saldoInicial: availableBalance,
      reservaMinima,
      // Uso da reserva por dia: faz a trava de liquidez (e a linha tracejada) cair.
      usosReserva: reservaMes.porDia,
      entradas,
      entradasRestritas: beneficioMes.porDia,
      pagamentosAgendados: g.agendados,
    });

    const meta = {};
    res.contas.forEach((c) => { meta[c.id] = { motorRank: c.prioridade, motorG: c.G, motorS: c.S, motorStatus: c.status, motorStatusLabel: c.statusLabel, diasEmAtraso: c.diasEmAtraso, vencida: c.vencida, jurosEstimados: c.jurosEstimados, dataIndicada: c.dataIndicada, diaVencimento: c.diaVencimento }; });
    // A data sugerida (dia pago pelo motor) é a data indicada quando existe.
    (res.fluxoDiario?.pagas || []).forEach((p) => { if (meta[p.id]) meta[p.id].dataSugerida = p.dia; });

    // Ids a excluir da lista individual (auto / cartão agrupado).
    const autoIds = new Set(g.autoDetalhes.map((a) => a.id));
    const cartaoIds = new Set();
    expenses.forEach((e) => { if ((e.formaPagamento || "normal") === "cartao" && accounts.some((a) => a.id === e.accountId && a.type === "cartao")) cartaoIds.add(e.occId); });

    const normais = expenses.filter((e) => !autoIds.has(e.occId) && !cartaoIds.has(e.occId)).map((e) => ({ ...e, ...(meta[e.occId] || {}) }));
    const faturas = g.cartaoFaturas.map((f) => ({ occId: f.id, id: f.id, description: f.description, amount: f.amount, dueDate: f.dueDate, category: f.category, memberId: f.memberId, priority: f.priority, recurrence: "unica", paid: 0, salaryDeductions: [], agrupadas: f.agrupadas, itens: f.itens, ...(meta[f.id] || {}) }));

    // Receitas entram na lista pela DATA (o motor não calcula data para elas).
    const inc = incomes.map((i) => ({ ...i })).sort((a, b) => (a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0));
    const exp = [...normais, ...faturas].sort((a, b) => (a.motorRank ?? 999) - (b.motorRank ?? 999));

    // Pacing de mercado.
    const budgetMercado = budgets.find((b) => b.category === "alimentacao");
    const gastoMercado = transactions.filter((t) => t.type === "expense" && t.category === "alimentacao" && monthKey(t.date) === selectedMonth).reduce((s, t) => s + t.amount, 0);
    const previstoMercado = occ.filter((o) => o.type === "expense" && o.category === "alimentacao").reduce((s, o) => s + Number(o.amount || 0), 0);
    const orcamentoMercado = (budgetMercado && budgetMercado.limit > 0) ? budgetMercado.limit : Math.max(gastoMercado, previstoMercado);
    const diaHoje = new Date(TODAY_DATE + "T00:00:00").getDate();
    const semanaAtual = Math.min(4, Math.ceil(diaHoje / 7));
    const gastoSemana = transactions.filter((t) => t.type === "expense" && t.category === "alimentacao" && monthKey(t.date) === selectedMonth && Math.min(4, Math.ceil(new Date(t.date + "T00:00:00").getDate() / 7)) === semanaAtual).reduce((s, t) => s + t.amount, 0);
    const pac = orcamentoMercado > 0 ? pacing({ orcamentoMensalMercado: orcamentoMercado, gastosSemana: gastoSemana, diasRestantesSemana: Math.max(1, 7 - ((diaHoje - 1) % 7)) }) : null;

    return { items: [...inc, ...exp], postergadas: res.fluxoDiario?.postergadas || [], pacing: pac, dias: res.fluxoDiario?.dias || [], autoDetalhes: g.autoDetalhes, ...reservaPayload };
  }, [openItems, transactions, planned, selectedMonth, availableBalance, budgets, memberFilter, accounts, reservaMes, beneficioMes]);

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
    let pendingIncome = 0, pendingExpense = 0, pendingRestrito = 0;
    openItemsAvailable.forEach((i) => {
      // Salário em aberto entra pelo LÍQUIDO (bruto − descontos do holerite).
      const deduction = (i.salaryDeductions || []).reduce((s, d) => s + (Number(d.amount) || 0), 0);
      if (i.type === "income") {
        const valor = Math.max(0, (i.amount - i.paid) - deduction);
        // Receita restrita (cartão alimentação) não paga as outras contas:
        // fica fora do "a receber" e do saldo projetado.
        if (ehReceitaRestrita(i)) pendingRestrito += valor;
        else pendingIncome += valor;
      } else if (i.type === "expense") pendingExpense += (i.amount - i.paid);
    });
    return { pendingIncome, pendingExpense, pendingRestrito, endBalance: availableBalance + pendingIncome - pendingExpense };
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

  // ── A ÂNCORA FIXA DO SELETOR DE PERÍODO ──────────────────────────────
  // Saldo projetado no fim do MÊS CORRENTE. É a mesma conta do card "Saldo
  // previsto no fim do mês" do herói, só que sempre calculada para HOJE.
  //
  // Existe separado de `monthProjection` de propósito: aquele segue o mês em
  // exibição. Se a cor dos meses partisse dele, o mesmo "Março de 2027" ficaria
  // verde ou vermelho conforme o mês que a pessoa estivesse olhando — era
  // exatamente a incoerência relatada (a cor "mudava a cada vez").
  const projecaoHoje = useMemo(() => {
    const itens = buildOpenItems(planned, transactions, TODAY_MONTH)
      .filter((i) => !["accountId", "fromAccountId", "toAccountId"].some((k) => reservedAccountIds.includes(i[k])));
    let entradas = 0, saidas = 0;
    itens.forEach((i) => {
      const ded = (i.salaryDeductions || []).reduce((s, d) => s + (Number(d.amount) || 0), 0);
      if (i.type === "income") {
        const valor = Math.max(0, (i.amount - i.paid) - ded);
        if (!ehReceitaRestrita(i)) entradas += valor;
      } else if (i.type === "expense") {
        saidas += (i.amount - i.paid);
      }
    });
    return { entradas: round2(entradas), saidas: round2(saidas), saldo: round2(availableBalance + entradas - saidas) };
  }, [planned, transactions, availableBalance, reservedAccountIds]);

  // Saldo projetado no FIM de um mês QUALQUER — o dado que pinta os cartões do
  // seletor de "Período" (verde = fecha no azul, vermelho = fecha no vermelho).
  //
  // A função é PURA em relação ao mês: `saldoDoMes("2027-03")` devolve sempre o
  // mesmo número, não importa o mês selecionado nem quantas vezes o painel for
  // aberto. Parte da âncora de hoje e anda para frente (somando o fluxo) ou
  // para trás (subtraindo o fluxo realizado), sempre em passos de um mês — e
  // memoriza cada mês, porque o painel pede os doze de uma vez.
  //
  // Sem nenhum dado cadastrado devolve `null`: o cartão cai no estado neutro
  // em vez de pintar tudo de verde no primeiro paint, antes de o Supabase
  // responder.
  const saldoDoMes = useMemo(() => {
    const cache = new Map();
    const calcular = (m) => {
      if (!transactions.length && !planned.length) return null;
      let saldo = projecaoHoje.saldo;
      if (m > TODAY_MONTH) {
        let cur = TODAY_MONTH;
        while (cur < m) {
          cur = addMonths(cur, 1);
          const f = monthlyCashFlow(cur, transactions, planned, memberFilter, reservedAccountIds);
          saldo += f.receitas - f.despesas;
        }
      } else if (m < TODAY_MONTH) {
        let cur = TODAY_MONTH;
        while (cur > m) {
          const f = monthlyCashFlow(cur, transactions, planned, memberFilter, reservedAccountIds);
          saldo -= f.receitas - f.despesas;
          cur = addMonths(cur, -1);
        }
      }
      return round2(saldo);
    };
    return (m) => {
      if (!cache.has(m)) cache.set(m, calcular(m));
      return cache.get(m);
    };
  }, [projecaoHoje, transactions, planned, memberFilter, reservedAccountIds]);
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

  // ==========================================================================
  // ALERTAS — agora ESTRUTURADOS, não uma frase pronta
  //
  // Antes cada alerta era { level, text }: uma string montada aqui dentro. A
  // lista só sabia desenhar parágrafos — sem ícone próprio, sem o valor em
  // destaque, sem o atalho de pagar, e sem como separar título de detalhe.
  //
  // Agora cada alerta carrega as partes que a tela precisa e NENHUM texto
  // formatado: nome, frase de situação, detalhe, valor cru e o item pagável.
  // Além de deixar o cartão bonito, isso resolve de graça o modo privacidade —
  // o valor é formatado na hora de desenhar, então o "olho" alcança o alerta.
  // ==========================================================================
  const alerts = useMemo(() => {
    const list = [];
    todayBudgets.forEach((b) => {
      const st = statusFor(b.spent, b.limit);
      const label = (categories[b.category]?.label || b.category) + (b.memberId ? " (" + memberLabel(b.memberId) + ")" : "");
      const id = "orc-" + b.category + "-" + (b.memberId == null ? "casal" : b.memberId);
      if (st.state === "over") {
        list.push({ id, nivel: "rust", titulo: label, texto: "ultrapassou o limite do mês", detalhe: "Estourou o orçamento", valor: round2(b.spent - b.limit), ordem: 0, rank: 0 });
      } else if (st.state === "exact") {
        list.push({ id, nivel: "amber", titulo: label, texto: "atingiu o limite do mês", detalhe: "Sem margem até o fim do mês", valor: null, ordem: 1, rank: 1 });
      } else if (b.limit > 0 && b.spent / b.limit >= 0.8) {
        list.push({ id, nivel: "amber", titulo: label, texto: "já está em " + Math.round((b.spent / b.limit) * 100) + "% do limite", detalhe: "Resta " + Math.round(100 - (b.spent / b.limit) * 100) + "% do orçamento", valor: null, ordem: 2, rank: 1 });
      }
    });
    todayOccurrences.forEach((o) => {
      const st = plannedStatus(o.paid, o.amount);
      if (st.state !== "pendente" && st.state !== "parcial") return;
      const diffDays = Math.round((new Date(o.dueDate + "T00:00:00") - new Date(TODAY_DATE + "T00:00:00")) / 86400000);
      const rank = PRIORITY[o.priority || DEFAULT_PRIORITY[o.category] || "importante"]?.rank || 1;
      const base = {
        id: "occ-" + o.occId,
        titulo: o.description,
        valor: Math.max(0, (Number(o.amount) || 0) - (Number(o.paid) || 0)),
        alvo: o,
        pagavel: true,
        parcial: st.state === "parcial",
        rank,
      };
      if (diffDays < 0) {
        list.push({ ...base, nivel: "rust", texto: "está atrasado desde " + fmtDate(o.dueDate), detalhe: "Atrasado desde " + fmtDate(o.dueDate), ordem: -10000 + diffDays });
      } else if (diffDays <= 3) {
        list.push({ ...base, nivel: "amber", texto: diffDays === 0 ? "vence hoje" : "vence em " + diffDays + " dia" + (diffDays > 1 ? "s" : ""), detalhe: diffDays === 0 ? "Vence hoje" : "Vence em " + diffDays + " dia" + (diffDays > 1 ? "s" : ""), ordem: diffDays });
      }
    });
    return list.sort((a, b) => (a.nivel === b.nivel ? (a.ordem - b.ordem) || (a.rank - b.rank) : a.nivel === "rust" ? -1 : 1));
  }, [todayBudgets, todayOccurrences, categories]);

  const filteredTx = useMemo(() => sorted.filter((t) => {
    if (filterType !== "todos" && t.type !== filterType) return false;
    if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [sorted, filterType, search]);

  function writeError(message) {
    showToast(message);
    return false;
  }

  function upsertTransaction(tx) {
    return withWrite('transaction-form', async () => {
      const isEdit = transactions.some((row) => row.id === tx.id);
      const row = { ...tx, id: tx.id ?? nextEntryId() };
      const id = await syncTransactionToSupabase(row);
      if (id == null) return writeError("Não foi possível salvar a transação.");
      const saved = { ...row, id };
      setTransactions((prev) => isEdit ? prev.map((entry) => entry.id === id ? saved : entry) : [...prev, saved]);
      setShowForm(false);
      setEditingTx(null);
      showToast(isEdit ? "Transação atualizada ✓" : "Transação adicionada ✓");
      return true;
    });
  }

  function deleteTransaction(id) {
    return withWrite('transaction-' + id, async () => {
      if (!await deleteTransactionFromSupabase(id)) return writeError("Não foi possível excluir a transação.");
      setTransactions((prev) => prev.filter((row) => row.id !== id));
      showToast("Transação excluída");
      return true;
    });
  }

  function upsertPlanned(item, editMeta) {
    return withWrite('planned-form', async () => {
      const existing = planned.find((row) => row.id === item.id);
      const scopedEdit = existing && editMeta?.scope && editMeta.scope !== "all";
      const saved = scopedEdit
        ? await editSeriesOccurrence(existing, item, editMeta)
        : await savePlannedEntry(existing, item);
      if (!saved) return writeError("Não foi possível salvar o previsto.");
      setShowPlannedForm(false);
      setEditingPlanned(null);
      showToast(existing ? "Previsto atualizado ✓" : "Previsto salvo ✓");
      return true;
    });
  }

  function planAsTransaction(item) {
    return {
      id: nextEntryId(),
      date: item.dueDate,
      type: item.type,
      category: item.category,
      description: item.description,
      amount: item.amount,
      accountId: item.type === "transferencia" ? item.fromAccountId : item.accountId,
      fromAccountId: item.fromAccountId,
      toAccountId: item.toAccountId,
      memberId: item.memberId,
      plannedId: item.id,
      fonteId: item.fonteId,
      attachment: item.attachment,
      attachmentMethod: item.attachmentMethod,
      includeInIR: item.includeInIR,
      formaPagamento: item.formaPagamento,
    };
  }

  async function savePlannedEntry(existing, item) {
    const row = { ...existing, ...item, id: item.id ?? nextEntryId() };
    const result = row.realized
      ? await saveRealizedPlanned(row, planAsTransaction(row), transactions)
      : { id: await syncPlannedToSupabase(row) };
    if (result?.id == null) return false;

    const saved = { ...row, id: result.id };
    setPlanned((prev) => existing ? prev.map((entry) => entry.id === saved.id ? saved : entry) : [...prev, saved]);
    if (result.transaction) setTransactions((prev) => [...prev, result.transaction]);
    return true;
  }

  async function editSeriesOccurrence(original, item, meta) {
    const month = monthKey(meta.originalDueDate || original.dueDate);
    const next = {
      ...original, ...item, id: nextEntryId(), endMonth: null, skippedMonths: [],
    };
    let updated;
    let changes;
    if (meta.scope === "this") {
      Object.assign(next, { recurrence: "unica", installmentCurrent: null, installmentTotal: null, periodicity: null });
      updated = { ...original, skippedMonths: [...new Set([...(original.skippedMonths || []), month])] };
      changes = { skip_month: month };
    } else if (original.recurrence === "parcelada") {
      const installment = Number(meta.originalInstallmentCurrent) || 1;
      Object.assign(next, { recurrence: "parcelada", installmentCurrent: installment, installmentTotal: original.installmentTotal });
      if (installment > (original.installmentCurrent || 1)) {
        updated = { ...original, installmentTotal: installment - 1 };
        changes = { installment_total: updated.installmentTotal };
      } else {
        updated = { ...original, endMonth: addMonths(month, -1) };
        changes = { end_month: updated.endMonth };
      }
    } else {
      next.recurrence = "recorrente";
      updated = { ...original, endMonth: addMonths(month, -1) };
      changes = { end_month: updated.endMonth };
    }

    const result = await splitPlanned(original, changes, next, next.realized ? planAsTransaction(next) : null);
    if (!result) return false;
    setPlanned((prev) => [...prev.map((row) => row.id === original.id ? updated : row), { ...next, id: result.id }]);
    if (result.transaction) setTransactions((prev) => [...prev, result.transaction]);
    return true;
  }

  function deletePlanned(item, scope) {
    const id = typeof item === "object" ? item.id : item;
    return withWrite('planned-' + id, async () => {
      if (scope === "current" && typeof item === "object") {
        return skipPlannedOccurrence(item, "Ocorrência removida deste mês ✓");
      }
      if (!await deletePlannedFromSupabase(id)) return writeError("Não foi possível excluir o previsto.");
      setPlanned((prev) => prev.filter((row) => row.id !== id));
      setTransactions((prev) => prev.map((row) => row.plannedId === id ? { ...row, plannedId: null } : row));
      showToast("Compromisso excluído ✓");
      return true;
    });
  }

  async function skipPlannedOccurrence(item, message) {
    const original = planned.find((row) => row.id === item.id);
    if (!original) return false;
    const month = monthKey(item.dueDate || original.dueDate);
    const skippedMonths = await skipPlannedMonth(original, month);
    if (!skippedMonths) return writeError("Não foi possível atualizar o previsto.");
    setPlanned((prev) => prev.map((row) => row.id === item.id ? { ...row, skippedMonths } : row));
    showToast(message);
    return true;
  }

  function movePlannedToNextMonth(id) {
    return withWrite('planned-' + id, async () => {
      const original = planned.find((row) => row.id === id);
      if (!original) return false;
      const dueDate = dateInNextMonth(original.dueDate);
      if (!await updatePlannedDate(id, dueDate)) return writeError("Não foi possível mover o previsto.");
      setPlanned((prev) => prev.map((row) => row.id === id ? { ...row, dueDate } : row));
      return true;
    });
  }

  function payPlanned(item, payload) {
    return withWrite('payment', async () => {
      const row = {
        id: nextEntryId(), date: payload.date, type: item.type, category: item.category,
        description: item.description, amount: payload.amount, accountId: payload.accountId,
        memberId: item.memberId, plannedId: item.id, fonteId: payload.fonteId,
        attachment: payload.attachment, attachmentMethod: payload.attachmentMethod, includeInIR: item.includeInIR,
      };
      const id = await syncTransactionToSupabase(row);
      if (id == null) return writeError("Não foi possível salvar o pagamento.");
      setTransactions((prev) => [...prev, { ...row, id }]);
      setPayTarget(null);
      showToast(item.type === "income" ? "Recebimento registrado ✓" : "Pagamento registrado ✓");
      return true;
    });
  }

  function registerSalaryReceipt(item, payload) {
    return withWrite('payment', async () => {
      const deductions = payload.deductions || [];
      const common = {
        date: payload.date, accountId: payload.accountId, memberId: item.memberId, plannedId: item.id,
      };
      const entries = [{
        ...common, id: nextEntryId(), type: "income", category: item.category,
        description: item.description, amount: Number(item.amount) || 0, fonteId: payload.fonteId,
      }, ...deductions.map((row) => ({
        ...common, id: nextEntryId(), type: "expense", category: row.category,
        description: row.label, amount: row.amount, deductedInPayroll: true,
      }))];

      const template = payload.saveModel ? planned.find((row) => row.id === item.id) : null;
      const model = template && {
        ...template,
        salaryDeductions: deductions.map((row) => ({ ...row, id: "d-" + nextEntryId().toString(36) })),
      };
      const saved = await recordTransactionBatch(entries, model);
      if (!saved) return writeError("Não foi possível salvar o salário e os descontos.");
      setTransactions((prev) => [...prev, ...saved]);
      if (model) setPlanned((prev) => prev.map((row) => row.id === model.id ? model : row));
      setPayTarget(null);
      showToast("Salário e descontos registrados ✓");
      return true;
    });
  }

  function pagarFatura(fatura, payload) {
    return withWrite('payment', async () => {
      const entries = (payload.itens || []).map((row) => ({
        id: nextEntryId(), date: row.date || payload.date, type: "expense", category: row.category,
        description: row.description, amount: row.amount, accountId: fatura.accountId,
        memberId: row.memberId ?? fatura.memberId, plannedId: row.plannedId, formaPagamento: "cartao",
      }));
      if (!entries.length) return false;
      const saved = await recordTransactionBatch(entries);
      if (!saved) return writeError("Não foi possível salvar os lançamentos da fatura.");
      setTransactions((prev) => [...prev, ...saved]);
      setPayTarget(null);
      showToast("Fatura paga · " + saved.length + " lançamento(s) registrado(s) ✓");
      return true;
    });
  }

  function abrirEdicaoLancamento(plannedId) {
    const tpl = planned.find((x) => x.id === plannedId);
    if (!tpl) return;
    setPayTarget(null);
    setEditingPlanned(tpl);
    setShowPlannedForm(true);
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

  async function confirmAccountAction(scope) {
    const { account, action } = accountAction;
    const done = action === "delete" ? await deleteAccount(account, scope === "all") : await saveAccount(account);
    if (done) setAccountAction(null);
  }

  function saveAccount(account) {
    return withWrite('account', async () => {
      const row = { ...account, id: account.id ?? nextEntryId() };
      const id = await syncAccountToSupabase(row);
      if (id == null) return writeError("Não foi possível salvar a conta.");
      const saved = { ...row, id };
      setAccounts((prev) => {
        const others = saved.isDefault ? prev.map((item) => ({ ...item, isDefault: false })) : prev;
        return others.some((item) => item.id === id)
          ? others.map((item) => item.id === id ? saved : item)
          : [...others, saved];
      });
      setShowAccountForm(false);
      setEditingAccount(null);
      showToast("Conta salva ✓");
      return true;
    });
  }

  function deleteAccount(account, deleteRecords) {
    return withWrite('account', async () => {
      const id = account.id;
      if (!await deleteAccountFromSupabase(id, deleteRecords)) return writeError("Não foi possível excluir a conta.");

      const attached = (row) => [row.accountId, row.fromAccountId, row.toAccountId].includes(id);
      const withoutAccount = (row) => ({
        ...row,
        accountId: row.accountId === id ? null : row.accountId,
        fromAccountId: row.fromAccountId === id ? null : row.fromAccountId,
        toAccountId: row.toAccountId === id ? null : row.toAccountId,
      });
      const removed = new Set(deleteRecords ? planned.filter(attached).map((row) => row.id) : []);
      setTransactions((prev) => deleteRecords
        ? prev.filter((row) => !attached(row)).map((row) => removed.has(row.plannedId) ? { ...row, plannedId: null } : row)
        : prev.map(withoutAccount));
      setPlanned((prev) => deleteRecords ? prev.filter((row) => !attached(row)) : prev.map(withoutAccount));
      setGoals((prev) => prev.map((row) => row.accountId === id ? { ...row, accountId: null } : row));
      setAccounts((prev) => prev.filter((row) => row.id !== id));
      showToast(deleteRecords ? "Conta e lançamentos excluídos" : "Conta excluída");
      return true;
    });
  }

  function saveSource(source) {
    return withWrite('source-form', async () => {
      const row = { ...source, id: source.id ?? nextEntryId() };
      const id = await syncSourceToSupabase(row);
      if (id == null) return writeError("Não foi possível salvar a fonte.");
      const saved = { ...row, id };
      setSources((prev) => prev.some((item) => item.id === id)
        ? prev.map((item) => item.id === id ? saved : item)
        : [...prev, saved]);
      showToast("Fonte salva ✓");
      return true;
    });
  }

  async function deleteSource(id) {
    if (!await deleteSourceFromSupabase(id)) return writeError("Não foi possível excluir a fonte.");
    const detach = (row) => row.fonteId === id ? { ...row, fonteId: null } : row;
    setSources((prev) => prev.filter((row) => row.id !== id));
    setTransactions((prev) => prev.map(detach));
    setPlanned((prev) => prev.map(detach));
    showToast("Fonte excluída");
    return true;
  }

  function saveCategory(category) {
    return withWrite('category-form', async () => {
      if (!await syncCategoryToSupabase(category)) return writeError("Não foi possível salvar a categoria.");
      setCategories((prev) => ({
        ...prev,
        [category.key]: { ...category, icon: CATEGORIES[category.key]?.icon || prev[category.key]?.icon },
      }));
      showToast("Categoria salva ✓");
      return true;
    });
  }

  async function deleteCategory(key) {
    if (!await deleteCategoryFromSupabase(key)) return writeError("Não foi possível excluir a categoria.");
    setCategories((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    showToast("Categoria excluída");
    return true;
  }

  async function attachReceipt(entry, dataUrl) {
    if (!dataUrl) return writeError("Não foi possível ler o comprovante.");
    const updated = { ...entry, attachment: dataUrl };
    if (await syncTransactionToSupabase(updated) == null) return writeError("Não foi possível salvar o comprovante.");
    setTransactions((prev) => prev.map((row) => row.id === entry.id ? updated : row));
    showToast("Comprovante anexado ✓");
    return true;
  }

  function saveIdea(text, attachment, attachmentMethod) {
    return withWrite('idea-form', async () => {
      const idea = { id: nextEntryId(), text: text.trim(), done: false, date: TODAY_DATE, attachment, attachmentMethod };
      const id = await syncIdeaToSupabase(idea);
      if (id == null) return writeError("Não foi possível salvar a ideia.");
      setIdeas((prev) => [...prev, { ...idea, id }]);
      showToast("Ideia registrada ✓");
      return true;
    });
  }

  function updateIdea(id, changes) {
    return withWrite('idea-' + id, async () => {
      const idea = ideas.find((row) => row.id === id);
      if (!idea) return false;
      const updated = { ...idea, ...changes };
      if (await syncIdeaToSupabase(updated) == null) return writeError("Não foi possível atualizar a ideia.");
      setIdeas((prev) => prev.map((row) => row.id === id ? updated : row));
      return true;
    });
  }

  async function deleteIdea(id) {
    if (!await deleteIdeaFromSupabase(id)) return writeError("Não foi possível remover a ideia.");
    setIdeas((prev) => prev.filter((row) => row.id !== id));
    showToast("Ideia removida");
    return true;
  }

  function finalizePlanned(item) {
    return withWrite('planned-' + item.id, async () => {
      if (await skipPlannedOccurrence(item, "Fechado como está neste mês ✓")) setPayTarget(null);
    });
  }

  function clearSupabase(scope) {
    return withWrite('backup', async () => {
      if (!await clearSupabaseData(scope)) return writeError("Não foi possível limpar os dados do Supabase.");
      if (scope === "all") {
        replaceData({
          accounts: [], transactions: [], planned: [], goals: [], budgets: [], sources: [],
          categories: exampleFinanceData().categories, ideas: [], reserva: reservaConfig,
        });
        setTab("inicio");
        setMoreView(null);
      } else {
        const removed = new Set(planned.filter((row) => row.type === scope).map((row) => row.id));
        setPlanned((prev) => prev.filter((row) => row.type !== scope));
        setTransactions((prev) => prev.filter((row) => row.type !== scope)
          .map((row) => removed.has(row.plannedId) ? { ...row, plannedId: null } : row));
      }
      showToast("Dados removidos ✓");
      return true;
    });
  }

  function addGoal(goal) {
    return withWrite('goal-form', async () => {
      const row = { ...goal, id: nextEntryId(), saved: 0 };
      const id = await syncGoalToSupabase(row);
      if (id == null) return writeError("Não foi possível criar a meta.");
      setGoals((prev) => [...prev, { ...row, id }]);
      setShowGoalForm(false);
      showToast("Meta criada ✓");
      return true;
    });
  }

  function contributeToGoal(goal, payload) {
    return withWrite('goal-contribution', async () => {
      const transaction = {
        id: nextEntryId(), date: payload.date, type: "expense", category: "poupanca",
        description: "Contribuição: " + goal.name, amount: payload.amount,
        accountId: payload.accountId, memberId: goal.memberId,
      };
      if (isSupabaseConfigured) {
        const saved = await contributeToGoalInSupabase(goal, transaction);
        if (!saved) return writeError("Não foi possível salvar a contribuição.");
        setGoals((prev) => prev.map((row) => row.id === goal.id ? saved.goal : row));
        setTransactions((prev) => [...prev, saved.transaction]);
      } else {
        setGoals((prev) => prev.map((row) => row.id === goal.id
          ? { ...row, saved: Math.min(row.target, row.saved + payload.amount) }
          : row));
        setTransactions((prev) => [...prev, transaction]);
      }
      setContributeTarget(null);
      showToast("Contribuição registrada ✓");
      return true;
    });
  }

  function saveReserve(config) {
    return withWrite('reserve', async () => {
      if (!await saveSetting('reserva', config)) return writeError("Não foi possível salvar a configuração da reserva.");
      setReservaConfig(config);
      showToast("Configuração da reserva salva ✓");
      return true;
    });
  }

  function resetToSeed() {
    const example = exampleFinanceData();
    try {
      saveLocalFinanceData(example);
      replaceData(example);
      setSelectedMonth(TODAY_MONTH);
      setMemberFilter("todos");
      setTab("inicio");
      setMoreView(null);
      showToast("Dados de exemplo restaurados ✓");
    } catch {
      writeError("Não foi possível gravar os dados neste navegador.");
    }
  }

  function exportData() {
    const payload = { ...snapshot, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "gestao-financeira-dados.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function importData(file) {
    return withWrite('backup', async () => {
      let backup;
      try {
        backup = parseFinanceBackup(await file.text());
      } catch {
        return writeError("O arquivo não é um backup válido do Gestão Financeira.");
      }
      if (!window.confirm("Substituir os dados atuais pelas seções presentes no backup?")) return false;
      try {
        if (isSupabaseConfigured) {
          await restoreSupabaseBackup(backup);
        } else {
          const next = { ...snapshot, ...backup };
          saveLocalFinanceData(next);
          replaceData(next);
        }
      } catch {
        return writeError("Não foi possível confirmar a restauração do backup.");
      }

      if (isSupabaseConfigured) {
        try {
          replaceData(await loadInitialData());
        } catch {
          window.location.reload();
          return true;
        }
      }
      showToast("Dados importados ✓");
      return true;
    });
  }

  // Rota ativa: acende a aba na barra inferior (celular) e o item na barra
  // lateral (desktop). Telas de "Mais" também são rotas — ex.: Priorização.
  const activeRoute = tab === "mais" && moreView ? moreView : tab;

  return (
    <CategoriesContext.Provider value={categories}>
      <AppShell
        activeRoute={activeRoute}
        onNavigate={(key) => {
          if (MAIN_TABS.includes(key)) { setTab(key); setMoreView(null); }
          else { setTab("mais"); setMoreView(key === "mais" ? null : key); }
        }}
        onAdd={() => { setEditingPlanned(null); setShowPlannedForm(true); }}
        topbar={
          <>
            <MonthNav month={selectedMonth} onChange={setSelectedMonth} saldoDoMes={saldoDoMes} />
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
              <MemberFilterBar value={memberFilter} onChange={setMemberFilter} />
              <button
                onClick={() => { setEditingPlanned(null); setShowPlannedForm(true); }}
                style={{ minHeight: 44, padding: "0 18px", borderRadius: 10, border: "none",
                         background: COLORS.green, color: "#fff", fontWeight: 600, fontSize: 14.5 }}>
                Novo previsto
              </button>
            </div>
          </>
        }
      >
          {tab === "inicio" && (
          <>
            {/* O mês e o filtro agora vivem DENTRO do herói (InicioView) — não
                há faixa acima dele. */}
            <InicioView balance={balance} availableBalance={availableBalance} reservedAmount={reservedAmount} availableNow={availableNow} monthProjection={monthProjection} isCurrentMonth={selectedMonth === TODAY_MONTH} health={health} alerts={alerts} monthIncome={netIncome} monthExpense={netExpense} projectedBalance={projectedBalance} onSelectMonth={setSelectedMonth} openItems={priorizacaoHome.items} postergadas={priorizacaoHome.postergadas} pacing={priorizacaoHome.pacing} dias={priorizacaoHome.dias} reservaMinima={priorizacaoHome.reservaMinima} reservaUsada={priorizacaoHome.reservaUsada} reservaDisponivel={priorizacaoHome.reservaDisponivel} reservaItens={priorizacaoHome.reservaItens} reservaConfigurada={priorizacaoHome.reservaConfigurada} reservaAporte={priorizacaoHome.reservaAporte} reservaReceita={priorizacaoHome.reservaReceita} reservaDespesa={priorizacaoHome.reservaDespesa} reservaSobra={priorizacaoHome.reservaSobra} reservaDeficit={priorizacaoHome.reservaDeficit} beneficio={beneficioMes} carryRestrito={carryRestrito} selectedMonth={selectedMonth} saldoDoMes={saldoDoMes} onOpenReserva={() => { setTab("mais"); setMoreView("reserva"); }} autoDetalhes={priorizacaoHome.autoDetalhes} memberFilter={memberFilter} onChangeMemberFilter={setMemberFilter} hideBalance={hideBalance} onToggleHide={alternarValores} onSeeAll={() => setTab("transacoes")} onPay={setPayTarget} onEditPlanned={(p) => { setEditingPlanned(p); setShowPlannedForm(true); }} onDeletePlanned={deletePlanned} onNewPlanned={() => { setEditingPlanned(null); setShowPlannedForm(true); }} onCloseMonth={() => setShowCloseMonth(true)} />
          </>
        )}
          {tab === "transacoes" && (
          <>
            <div className="only-phone" style={{ marginBottom: 12 }}>
              <MonthNav month={selectedMonth} onChange={setSelectedMonth} saldoDoMes={saldoDoMes} />
            </div>
            <div className="only-phone" style={{ marginBottom: 12 }}>
              <MemberFilterBar value={memberFilter} onChange={setMemberFilter} />
            </div>
            <TransacoesView closedList={filteredTx} openItems={openItems} memberFilter={memberFilter} search={search} setSearch={setSearch} filterType={filterType} setFilterType={setFilterType} selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} accounts={accounts} onEdit={(t) => { const linkedPlanned = t.plannedId ? planned.find((p) => p.id === t.plannedId) : null; if (linkedPlanned) { setEditingPlanned(linkedPlanned); setShowPlannedForm(true); } else { setEditingTx(t); setShowForm(true); } }} onDelete={deleteTransaction} onPay={setPayTarget} onEditPlanned={(p) => { setEditingPlanned(p); setShowPlannedForm(true); }} onDeletePlanned={deletePlanned} saldoDoMes={saldoDoMes} />
          </>
        )}
          {tab === "orcamento" && (
          <>
            <div className="only-phone" style={{ marginBottom: 12 }}>
              <MonthNav month={selectedMonth} onChange={setSelectedMonth} saldoDoMes={saldoDoMes} />
            </div>
            <div className="only-phone" style={{ marginBottom: 12 }}>
              <MemberFilterBar value={memberFilter} onChange={setMemberFilter} />
            </div>
            <OrcamentoView budgets={budgetsWithSpent} memberFilter={memberFilter} />
          </>
        )}
          {tab === "priorizacao" && (
            <>
              <div className="only-phone" style={{ marginBottom: 12 }}>
                <MonthNav month={selectedMonth} onChange={setSelectedMonth} saldoDoMes={saldoDoMes} />
              </div>
              <div className="only-phone" style={{ marginBottom: 12 }}>
                <MemberFilterBar value={memberFilter} onChange={setMemberFilter} />
              </div>
              <PriorizacaoView planned={nonReservedPlanned} transactions={nonReservedTx} budgets={budgets} accounts={accounts} selectedMonth={selectedMonth} availableBalance={availableBalance} memberFilter={memberFilter} reservaConfig={reservaConfig} />
            </>
          )}
          {tab === "mais" && moreView === null && <MaisMenuView onSelect={setMoreView} />}
          {tab === "mais" && moreView === "contas" && <ContasView accounts={accounts} transactions={transactions} onBack={() => setMoreView(null)} onAdd={openNewAccount} onEdit={openEditAccount} onDelete={requestDeleteAccount} onViewStatements={(a) => setExtratoAccount(a)} />}
          {tab === "mais" && moreView === "categorias" && <CategoriasView onBack={() => setMoreView(null)} onSave={saveCategory} onDelete={deleteCategory} />}
          {tab === "mais" && moreView === "declaracao" && <DeclaracaoIRView transactions={transactions} onBack={() => setMoreView(null)} onAttach={attachReceipt} />}
          {tab === "mais" && moreView === "ajustes" && <IdeiasView ideas={ideas} onBack={() => setMoreView(null)} onSave={saveIdea} onDelete={deleteIdea} onToggle={(id) => updateIdea(id, { done: !ideas.find((row) => row.id === id)?.done })} onUpdate={(id, text) => updateIdea(id, { text: text.trim() })} />}
          {tab === "mais" && moreView === "metas" && <><BackRow onBack={() => setMoreView(null)} /><div className="only-phone" style={{ marginBottom: 12 }}><MemberFilterBar value={memberFilter} onChange={setMemberFilter} /></div><MetasView goals={goals} memberFilter={memberFilter} accounts={accounts} onContribute={setContributeTarget} onNewGoal={() => setShowGoalForm(true)} /></>}
          {tab === "mais" && moreView === "relatorios" && <><BackRow onBack={() => setMoreView(null)} /><div className="only-phone" style={{ marginBottom: 12 }}><MonthNav month={selectedMonth} onChange={setSelectedMonth} saldoDoMes={saldoDoMes} /></div><div className="only-phone" style={{ marginBottom: 12 }}><MemberFilterBar value={memberFilter} onChange={setMemberFilter} /></div><RelatoriosView month={selectedMonth} transactions={transactions} planned={planned} sources={sources} /></>}
          {tab === "mais" && moreView === "regra" && <><BackRow onBack={() => setMoreView(null)} /><div className="only-phone" style={{ marginBottom: 12 }}><MonthNav month={selectedMonth} onChange={setSelectedMonth} saldoDoMes={saldoDoMes} /></div><div className="only-phone" style={{ marginBottom: 12 }}><MemberFilterBar value={memberFilter} onChange={setMemberFilter} /></div><Regra503020View income={monthIncome} expenses={currentMonthTx.filter((t) => t.type === "expense")} /></>}
          {tab === "mais" && moreView === "projecao" && <><BackRow onBack={() => setMoreView(null)} /><ProjecaoView planned={nonReservedPlanned} transactions={nonReservedTx} balance={availableBalance} memberFilter={memberFilter} setMemberFilter={setMemberFilter} /></>}
          {tab === "mais" && moreView === "priorizacao" && <><BackRow onBack={() => setMoreView(null)} /><div className="only-phone" style={{ marginBottom: 12 }}><MonthNav month={selectedMonth} onChange={setSelectedMonth} saldoDoMes={saldoDoMes} /></div><PriorizacaoView planned={nonReservedPlanned} transactions={nonReservedTx} budgets={budgets} accounts={accounts} selectedMonth={selectedMonth} availableBalance={availableBalance} memberFilter={memberFilter} reservaConfig={reservaConfig} /></>}
          {tab === "mais" && moreView === "dados" && <><BackRow onBack={() => setMoreView(null)} /><DadosView onSignOut={onSignOut} sessionError={sessionError} onExport={exportData} onImport={() => fileInputRef.current && fileInputRef.current.click()} onReset={resetToSeed} onClearSupabase={clearSupabase} /></>}
          {tab === "mais" && moreView === "fontes" && <><FontesView sources={sources} onBack={() => setMoreView(null)} onSave={saveSource} onDelete={deleteSource} /></>}
          {tab === "mais" && moreView === "reserva" && <ReservaView onBack={() => setMoreView(null)} month={selectedMonth} onMonthChange={setSelectedMonth} reserva={reservaMes} config={reservaConfig} salario={salarioMes} onSaveConfig={saveReserve} saldoDoMes={saldoDoMes} />}
      </AppShell>

      {storageFailed && <p className="finance-storage-error" role="alert">O navegador não conseguiu gravar os dados. Exporte um backup para preservar as alterações desta sessão.</p>}
      <input ref={fileInputRef} type="file" accept="application/json" style={{ display: "none" }} onChange={(e) => { if (e.target.files[0]) importData(e.target.files[0]); e.target.value = ""; }} />

      {/* ── Overlays: agora FORA do shell ─────────────────────────────────────
          Antes todo modal era position:absolute dentro de .app-shell, então não
          tinha como virar um diálogo centralizado no desktop. Como o ModalSheet
          usa position:fixed, os modais sobem um nível e funcionam nos dois
          formatos sem nenhuma outra mudança. */}
      {toast && (
        <div role="status" style={{ position: "fixed", left: "50%", transform: "translateX(-50%)",
          bottom: "calc(var(--tabbar-height) + 24px)", background: COLORS.ink, color: "#fff",
          borderRadius: 12, padding: "11px 18px", fontSize: 14, fontWeight: 500, zIndex: 80,
          boxShadow: "0 10px 28px rgba(27,42,47,.26)", maxWidth: "min(92vw, 420px)", textAlign: "center" }}>
          {toast}
        </div>
      )}

      {extratoAccount && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, background: COLORS.paper, overflowY: "auto", padding: "20px 16px 96px" }}>
          <ExtratoView account={extratoAccount} transactions={transactions} sources={sources} onBack={() => setExtratoAccount(null)} />
        </div>
      )}

      {showForm && <TransactionFormModal accounts={accounts} sources={sources} selectedMonth={selectedMonth} editing={editingTx} onClose={() => { setShowForm(false); setEditingTx(null); }} onSubmit={upsertTransaction} onAddCategory={saveCategory} onAddAccount={openNewAccount} />}
      {showPlannedForm && <PlannedFormModal accounts={accounts} sources={sources} selectedMonth={selectedMonth} editing={editingPlanned} onClose={() => { setShowPlannedForm(false); setEditingPlanned(null); }} onSubmit={upsertPlanned} onAddCategory={saveCategory} onAddAccount={openNewAccount} />}
      {payTarget && (payTarget.itens && payTarget.itens.length > 0 ? (
        <FaturaModal item={payTarget} selectedMonth={selectedMonth} onClose={() => setPayTarget(null)} onSubmit={(payload) => pagarFatura(payTarget, payload)} onEditCharge={abrirEdicaoLancamento} />
      ) : payTarget.type === "income" && (payTarget.salaryDeductions || []).length > 0 ? (
        <HoleriteModal item={payTarget} accounts={accounts} sources={sources} selectedMonth={selectedMonth} onClose={() => setPayTarget(null)} onSubmit={(payload) => registerSalaryReceipt(payTarget, payload)} />
      ) : (
        <PayModal item={payTarget} accounts={accounts} sources={sources} transactions={transactions} selectedMonth={selectedMonth} onClose={() => setPayTarget(null)} onSubmit={(payload) => payPlanned(payTarget, payload)} onFinalize={finalizePlanned} />
      ))}
      {contributeTarget && <ContributeModal goal={contributeTarget} accounts={accounts} onClose={() => setContributeTarget(null)} onSubmit={(payload) => contributeToGoal(contributeTarget, payload)} />}
      {showGoalForm && <GoalFormModal accounts={accounts} onClose={() => setShowGoalForm(false)} onSubmit={addGoal} />}
      {showCloseMonth && <CloseMonthModal month={selectedMonth} items={plannedWithStatus} monthIncome={monthIncome} monthExpense={monthExpense} onMove={movePlannedToNextMonth} reserva={reservaMes} onClose={() => setShowCloseMonth(false)} />}
      {showAccountForm && <AccountFormModal editing={editingAccount} onClose={() => { setShowAccountForm(false); setEditingAccount(null); }} onSubmit={handleAccountSubmit} />}
      {accountAction && <AccountScopeModal account={accountAction.account} action={accountAction.action} onConfirm={confirmAccountAction} onClose={() => setAccountAction(null)} />}
    </CategoriesContext.Provider>
  );
}
