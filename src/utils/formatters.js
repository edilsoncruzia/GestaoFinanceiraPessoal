import { COLORS, PRIORITY, DEFAULT_PRIORITY } from "../constants/tokens";
import { MEMBERS, TODAY_DATE, TODAY_MONTH } from "../constants/seedData";
import { RefreshCw, Layers, CalendarClock, Landmark, CreditCard, Building2, Wallet, Smartphone, Globe, PiggyBank } from "lucide-react";

export function pad2(n) {
  return String(n).padStart(2, "0");
}

export function addMonths(month, n) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return d.getFullYear() + "-" + pad2(d.getMonth() + 1);
}

export function monthDiff(a, b) {
  const [ay, am] = a.split("-").map(Number);
  const [by, bm] = b.split("-").map(Number);
  return (by - ay) * 12 + (bm - am);
}

export function monthLabel(month) {
  const [y, m] = month.split("-").map(Number);
  const s = new Date(y, m - 1, 1).toLocaleDateString("pt-BR", { month: "short" });
  return s.replace(".", "");
}

export function monthLabelFull(month) {
  const [y, m] = month.split("-").map(Number);
  const s = new Date(y, m - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Periodicidade → passo em meses (mensal/bimestral/trimestral/semestral/anual).
const PERIOD_MONTH_STEPS = { mensal: 1, bimestral: 2, trimestral: 3, semestral: 6, anual: 12 };
// Periodicidade → passo em dias (diário/semanal/quinzenal).
const PERIOD_DAY_STEPS = { diario: 1, semanal: 7, quinzenal: 15 };

function daysInMonth(y, m) { return new Date(y, m, 0).getDate(); }
function clampDay(y, m, day) { return Math.min(Number(day) || 1, daysInMonth(y, m)); }
function toDateStr(d) { return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()); }

// Datas de vencimento de um template dentro de um mês (YYYY-MM), respeitando
// recorrência (única/recorrente/parcelada), periodicidade e fim opcional (endMonth).
function occurrenceDatesInMonth(t, month) {
  const startMonth = monthKey(t.dueDate);
  if (month < startMonth) return [];
  if (t.endMonth && month > t.endMonth) return [];

  if (t.recurrence === "unica") {
    return startMonth === month ? [{ dueDate: t.dueDate, installmentCurrent: t.installmentCurrent }] : [];
  }

  const periodicity = t.periodicity || "mensal";
  let monthStep = PERIOD_MONTH_STEPS[periodicity];
  const dayStep = PERIOD_DAY_STEPS[periodicity];
  if (!monthStep && !dayStep) monthStep = 1; // fallback seguro

  const [y, m] = month.split("-").map(Number);
  const day = Number(t.dueDate.slice(8, 10)) || 1;

  if (monthStep) {
    const offset = monthDiff(startMonth, month);
    if (offset % monthStep !== 0) return [];
    const occIndex = offset / monthStep;
    const cur = (t.installmentCurrent || 1) + occIndex;
    if (t.recurrence === "parcelada" && cur > t.installmentTotal) return [];
    return [{ dueDate: month + "-" + pad2(clampDay(y, m, day)), installmentCurrent: cur }];
  }

  // Períodos por dia: gera uma ou mais ocorrências dentro do mês.
  const monthStart = new Date(y, m - 1, 1);
  const monthEnd = new Date(y, m, 0, 23, 59, 59, 999);
  const startDate = new Date(t.dueDate + "T00:00:00");
  const DAY_MS = 86400000;
  let idx0 = Math.max(0, Math.ceil((monthStart.getTime() - startDate.getTime()) / (dayStep * DAY_MS)) - 1);
  let cur = new Date(startDate);
  cur.setDate(cur.getDate() + idx0 * dayStep);
  while (cur < monthStart) { cur.setDate(cur.getDate() + dayStep); idx0++; }
  while (idx0 > 0) {
    const prev = new Date(cur);
    prev.setDate(prev.getDate() - dayStep);
    if (prev >= monthStart) { cur = prev; idx0--; } else break;
  }
  const results = [];
  while (cur <= monthEnd) {
    const absInstallment = (t.installmentCurrent || 1) + idx0;
    if (t.recurrence === "parcelada") {
      if (absInstallment <= t.installmentTotal) {
        results.push({ dueDate: toDateStr(cur), installmentCurrent: absInstallment });
      }
    } else {
      results.push({ dueDate: toDateStr(cur), installmentCurrent: t.installmentCurrent });
    }
    cur.setDate(cur.getDate() + dayStep);
    idx0++;
  }
  return results;
}

export function generatePlannedOccurrences(templates, month) {
  const out = [];
  templates.forEach((t) => {
    if ((t.skippedMonths || []).includes(month)) return;
    if (t.realized) return; // encerrado/efetivado não gera mais ocorrências
    occurrenceDatesInMonth(t, month).forEach(({ dueDate, installmentCurrent }) => {
      out.push({ ...t, occId: t.id + "-" + dueDate, dueDate, installmentCurrent: t.recurrence === "parcelada" ? installmentCurrent : t.installmentCurrent });
    });
  });
  return out;
}

export const fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
export const fmtDate = (d) => new Date(d + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
export const monthKey = (d) => d.slice(0, 7);
export const round2 = (v) => Math.round(v * 100) / 100;

export function statusFor(spent, limit) {
  spent = round2(spent); limit = round2(limit);
  if (spent === 0) return { state: "zero", color: COLORS.muted, label: "Nada gasto ainda" };
  if (spent < limit) return { state: "under", color: COLORS.green, label: "Dentro do limite" };
  if (spent === limit) return { state: "exact", color: COLORS.amber, label: "Limite atingido" };
  return { state: "over", color: COLORS.rust, label: "Limite ultrapassado" };
}

export function plannedStatus(paid, amount) {
  paid = round2(paid); amount = round2(amount);
  if (paid === 0) return { state: "pendente", color: COLORS.muted, label: "Pendente" };
  if (paid < amount) return { state: "parcial", color: COLORS.amber, label: "Parcial" };
  if (paid === amount) return { state: "pago", color: COLORS.green, label: "Pago" };
  return { state: "excedido", color: COLORS.rust, label: "Pago a mais" };
}

export function displayStatus(item) {
  const st = plannedStatus(item.paid, item.amount);
  if ((st.state === "pendente" || st.state === "parcial") && item.dueDate < TODAY_DATE) {
    return { state: "vencida", color: COLORS.rust, label: "Vencida" };
  }
  return st;
}

const PERIOD_LABELS = { diario: "Diário", semanal: "Semanal", quinzenal: "Quinzenal", mensal: "Mensal", bimestral: "Bimestral", trimestral: "Trimestral", semestral: "Semestral", anual: "Anual" };

export function recurrenceLabel(item) {
  if (item.recurrence === "unica") return "Única";
  const p = item.periodicity && item.periodicity !== "mensal" && PERIOD_LABELS[item.periodicity] ? " (" + PERIOD_LABELS[item.periodicity] + ")" : "";
  if (item.recurrence === "recorrente") return "Recorrente" + p;
  return "Parcela " + item.installmentCurrent + "/" + item.installmentTotal + p;
}

export function recurrenceIcon(item) {
  if (item.recurrence === "recorrente") return RefreshCw;
  if (item.recurrence === "parcelada") return Layers;
  return CalendarClock;
}

export function memberLabel(id) {
  if (id === null || id === undefined) return "Casal";
  const m = MEMBERS.find((x) => x.id === id);
  return m ? m.name : "Casal";
}

export function memberColor(id) {
  if (id === null || id === undefined) return COLORS.muted;
  const m = MEMBERS.find((x) => x.id === id);
  return m ? m.color : COLORS.muted;
}

export function inScope(memberId, filter) {
  // "Todos" mostra tudo; ao escolher um membro, mostra só o que é daquele membro.
  return filter === "todos" || memberId === filter;
}

// Saldo atual de uma conta, considerando também transferências de entrada/saída.
export function accountBalance(account, transactions) {
  let bal = Number(account?.initialBalance) || 0;
  (transactions || []).forEach((t) => {
    if (t.type === "income" && t.accountId === account.id) bal += Number(t.amount) || 0;
    else if (t.type === "expense" && t.accountId === account.id) bal -= Number(t.amount) || 0;
    else if (t.type === "transferencia") {
      if (t.toAccountId === account.id) bal += Number(t.amount) || 0;
      if (t.fromAccountId === account.id) bal -= Number(t.amount) || 0;
    }
  });
  return bal;
}

// Ícone de uma conta/cartão, derivado do banco, bandeira ou nome.
const BANK_ICON_KEYWORDS = [
  { kw: "nubank", icon: Wallet },
  { kw: "inter", icon: Smartphone },
  { kw: "itau", icon: Building2 },
  { kw: "itú", icon: Building2 },
  { kw: "bradesco", icon: Building2 },
  { kw: "santander", icon: Building2 },
  { kw: "caixa", icon: Building2 },
  { kw: "banco do brasil", icon: Building2 },
  { kw: "sicoob", icon: Building2 },
  { kw: "sicredi", icon: Building2 },
  { kw: "c6", icon: Smartphone },
  { kw: "pagbank", icon: Wallet },
  { kw: "pix", icon: Globe },
  { kw: "picpay", icon: Wallet },
];

export function accountIcon(a) {
  if (!a) return Landmark;
  const text = (((a.bank || "") + " " + (a.brand || "") + " " + (a.name || "")) || "").toLowerCase();
  const hit = BANK_ICON_KEYWORDS.find((b) => text.includes(b.kw));
  if (hit) return hit.icon;
  return a.type === "cartao" ? CreditCard : Landmark;
}

// Cor "oficial" da marca do banco/bandeira, para um visual de logo (fallback na cor da conta).
const BANK_BRAND_COLORS = [
  { kw: "nubank", color: "#820AD1" },
  { kw: "inter", color: "#FF7A00" },
  { kw: "itau", color: "#EC7000" },
  { kw: "itú", color: "#EC7000" },
  { kw: "bradesco", color: "#CC092F" },
  { kw: "santander", color: "#EC0000" },
  { kw: "caixa", color: "#005CA9" },
  { kw: "banco do brasil", color: "#F4D13B" },
  { kw: "sicoob", color: "#006B3F" },
  { kw: "sicredi", color: "#E30613" },
  { kw: "c6", color: "#333333" },
  { kw: "pagbank", color: "#32BCAD" },
  { kw: "picpay", color: "#21C25E" },
  { kw: "visa", color: "#1A1F71" },
  { kw: "mastercard", color: "#EB001B" },
  { kw: "master", color: "#EB001B" },
  { kw: "elo", color: "#00A4E0" },
  { kw: "american express", color: "#2E77BC" },
  { kw: "hipercard", color: "#B3131B" },
];

export function accountBrandColor(a) {
  if (!a) return COLORS.green;
  const text = (((a.bank || "") + " " + (a.brand || "") + " " + (a.name || "")) || "").toLowerCase();
  const hit = BANK_BRAND_COLORS.find((b) => text.includes(b.kw));
  return hit ? hit.color : (a.color || COLORS.green);
}

function computeOccurrencePaid(o, transactions, occMonth) {
  const linked = (transactions || []).filter((t) => t.plannedId === o.id);
  // Compromisso único: pode ser pago/recebido em mês posterior ao vencimento.
  if (o.recurrence === "unica") {
    return linked.reduce((s, t) => s + (Number(t.amount) || 0), 0);
  }
  // Períodos por dia (diário/semanal/quinzenal): vincula pelo dia exato do vencimento.
  if (PERIOD_DAY_STEPS[o.periodicity || "mensal"]) {
    return linked.filter((t) => t.date === o.dueDate).reduce((s, t) => s + (Number(t.amount) || 0), 0);
  }
  return linked.filter((t) => monthKey(t.date) === occMonth).reduce((s, t) => s + (Number(t.amount) || 0), 0);
}

// Contas em aberto: lançamentos do mês selecionado + atrasados (vencidos antes do mês
// atual) que ainda não foram pagos/recebidos. Lançamentos FUTUROS (vencendo no mês
// atual ou depois) NÃO se replicam para os meses seguintes — só aparecem no próprio mês.
export function buildOpenItems(planned, transactions, selectedMonth) {
  if (!planned || !planned.length || !selectedMonth) return [];
  const currentMonth = TODAY_MONTH; // mês real "hoje" (referência para atrasos)
  const out = [];

  // 1) Ocorrências do próprio mês selecionado (futuras ou atuais)
  generatePlannedOccurrences(planned, selectedMonth).forEach((o) => {
    if (o.realized) return;
    const paid = computeOccurrencePaid(o, transactions, selectedMonth);
    const st = plannedStatus(paid, o.amount);
    if (st.state !== "pendente" && st.state !== "parcial") return;
    out.push({ ...o, paid, overdue: false });
  });

  // 2) Atrasados: vencidos ANTES do mês atual. Carregam para o mês em visualização,
  //    mas apenas uma vez (não ficam replicando nos meses seguintes os lançamentos futuros).
  let startMonth = null;
  planned.forEach((t) => {
    if (!t.dueDate) return;
    const m = monthKey(t.dueDate);
    if (m < currentMonth && (startMonth == null || m < startMonth)) startMonth = m;
  });
  if (startMonth != null && startMonth < currentMonth) {
    let m = startMonth;
    while (m < currentMonth) {
      generatePlannedOccurrences(planned, m).forEach((o) => {
        if (o.realized) return;
        const paid = computeOccurrencePaid(o, transactions, m);
        const st = plannedStatus(paid, o.amount);
        if (st.state !== "pendente" && st.state !== "parcial") return;
        out.push({ ...o, paid, overdue: true });
      });
      m = addMonths(m, 1);
    }
  }

  return out;
}
