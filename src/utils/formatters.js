import { COLORS, CATEGORIES, PRIORITY, DEFAULT_PRIORITY } from "../constants/tokens";
import { MEMBERS, TODAY_DATE } from "../constants/seedData";
import { RefreshCw, Layers, CalendarClock } from "lucide-react";

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

export function generatePlannedOccurrences(templates, month) {
  const out = [];
  templates.forEach((t) => {
    if (t.recurrence === "unica") {
      if (monthKey(t.dueDate) === month) out.push({ ...t, occId: t.id + "-" + month });
    } else if (t.recurrence === "recorrente") {
      const day = t.dueDate.slice(8, 10);
      out.push({ ...t, occId: t.id + "-" + month, dueDate: month + "-" + day });
    } else if (t.recurrence === "parcelada") {
      const refMonth = monthKey(t.dueDate);
      const offset = monthDiff(refMonth, month);
      const cur = t.installmentCurrent + offset;
      if (cur >= 1 && cur <= t.installmentTotal) {
        const day = t.dueDate.slice(8, 10);
        out.push({ ...t, occId: t.id + "-" + month, dueDate: month + "-" + day, installmentCurrent: cur });
      }
    }
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

export function recurrenceLabel(item) {
  if (item.recurrence === "unica") return "Única";
  if (item.recurrence === "recorrente") return "Recorrente";
  return "Parcela " + item.installmentCurrent + "/" + item.installmentTotal;
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
  return filter === "todos" || memberId === null || memberId === undefined || memberId === filter;
}
