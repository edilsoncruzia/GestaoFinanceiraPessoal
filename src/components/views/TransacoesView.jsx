import React, { useState } from "react";
import {
  AlertTriangle,
  ArrowLeftRight,
  CreditCard,
  Link2,
  MoreVertical,
  Paperclip,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import { COLORS } from "../../constants/tokens";
import { useCategories } from "../../context/CategoriesContext";
import { fmt, fmtDate, inScope, monthKey } from "../../utils/formatters";
import { MonthNav } from "../ui/MonthNav";
import { Card } from "../ui/Card";
import { MemberBadge } from "../ui/MemberBadge";
import { PlannedCard } from "./InicioView";

const MESES = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
const DIAS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];

function dateParts(iso) {
  const d = new Date((iso || "") + "T00:00:00");
  if (!Number.isFinite(d.getTime())) return { dia: "--", mes: "---", semana: "" };
  return {
    dia: String(d.getDate()).padStart(2, "0"),
    mes: MESES[d.getMonth()],
    semana: DIAS[d.getDay()],
  };
}

export function TxRow({ t, accounts, onEdit, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const categories = useCategories();
  const isTransfer = t.type === "transferencia";
  const c = isTransfer ? null : categories[t.category];

  if (confirming) {
    return (
      <Card style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderColor: COLORS.rust }}>
        <AlertTriangle size={16} color={COLORS.rust} style={{ flexShrink: 0 }} />
        <p style={{ fontSize: 14, margin: 0, flex: 1 }}>Excluir "{t.description}"?</p>
        <button onClick={() => setConfirming(false)} style={{ fontSize: 13, padding: "6px 10px", borderRadius: 8, border: "1px solid " + COLORS.line, background: "transparent", color: COLORS.muted }}>Cancelar</button>
        <button onClick={() => onDelete(t.id)} style={{ fontSize: 13, padding: "6px 10px", borderRadius: 8, border: "none", background: COLORS.rust, color: "#fff", fontWeight: 500 }}>Excluir</button>
      </Card>
    );
  }

  if (isTransfer) {
    const from = accounts && accounts.find((a) => a.id === t.fromAccountId);
    const to = accounts && accounts.find((a) => a.id === t.toAccountId);
    return (
      <Card style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#3B6E8F1E", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <ArrowLeftRight size={17} color="#3B6E8F" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 500, margin: 0 }}>{t.description || "Transferencia"}</p>
          <p style={{ fontSize: 13, color: COLORS.muted, margin: 0 }}>{(from ? from.name : "?") + " -> " + (to ? to.name : "?")} • {fmtDate(t.date)}</p>
        </div>
        <p style={{ fontSize: 15, fontWeight: 600, margin: 0, color: "#3B6E8F", whiteSpace: "nowrap" }}>{fmt(t.amount)}</p>
        {onEdit && <button onClick={() => onEdit(t)} aria-label="Editar" className="icon-btn" style={{ background: "none", border: "none", padding: 4, color: COLORS.muted }}><Pencil size={15} /></button>}
        {onDelete && <button onClick={() => setConfirming(true)} aria-label="Excluir" className="icon-btn" style={{ background: "none", border: "none", padding: 4, color: COLORS.muted }}><Trash2 size={16} /></button>}
      </Card>
    );
  }

  const receita = t.type === "income";
  const txTint = receita ? COLORS.income : COLORS.rust;
  const txSoft = receita ? COLORS.incomeSoft : COLORS.expenseSoft;
  const txBorder = receita ? COLORS.incomeBorder : COLORS.expenseBorder;
  const TxIcon = c?.icon || CreditCard;
  const { dia, mes, semana } = dateParts(t.date);

  return (
    <div
      className="tx-card-row"
      style={{
        position: "relative",
        overflow: "hidden",
        display: "grid",
        gridTemplateColumns: "80px minmax(0, 1fr) auto 28px",
        gap: 14,
        alignItems: "center",
        padding: "14px 14px 14px 22px",
        borderRadius: 22,
        background: COLORS.surface,
        border: "1px solid " + COLORS.borderSoft,
        boxShadow: "0 14px 30px -24px rgba(21,19,42,.32)",
      }}
    >
      <span aria-hidden="true" style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 7, background: txTint }} />
      <span style={{ width: 64, borderRadius: 13, overflow: "hidden", background: COLORS.surface, border: "1px solid " + txBorder, textAlign: "center", boxShadow: "0 8px 18px -15px rgba(21,19,42,.45)" }}>
        <span style={{ display: "block", background: txTint, color: "#fff", fontSize: 12, fontWeight: 800, padding: "5px 0" }}>{mes}</span>
        <span className="num" style={{ display: "block", fontFamily: "var(--font-display)", fontSize: 26, lineHeight: 1, fontWeight: 800, color: COLORS.ink, paddingTop: 8 }}>{dia}</span>
        <span style={{ display: "block", color: COLORS.fg2, fontSize: 12.5, fontWeight: 700, padding: "3px 0 7px" }}>{semana}</span>
      </span>

      <div style={{ display: "grid", gridTemplateColumns: "56px minmax(0, 1fr)", gap: 12, alignItems: "center", minWidth: 0 }}>
        <span style={{ width: 52, height: 52, borderRadius: "50%", background: txSoft, color: txTint, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <TxIcon size={26} strokeWidth={2.4} />
        </span>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 19, lineHeight: 1.12, fontWeight: 800, margin: 0, color: COLORS.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.description}</p>
          <p style={{ fontSize: 14.5, color: COLORS.fg2, margin: "4px 0 3px", display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
            <span>{c ? c.label : t.category} • {fmtDate(t.date)}</span>
            {t.attachment && <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><Paperclip size={12} />{t.attachment}</span>}
            {t.plannedId && <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: COLORS.accent }}><Link2 size={12} />Previsto</span>}
            {t.formaPagamento === "cartao" && <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: COLORS.info }}><CreditCard size={12} />Cartao</span>}
          </p>
          <MemberBadge memberId={t.memberId} />
          {(t.deductedInPayroll || t.includeInIR) && (
            <span style={{ display: "inline-flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
              {t.deductedInPayroll && <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.income, padding: "1px 7px", borderRadius: 10, background: COLORS.incomeSoft }}>Descontado em folha</span>}
              {t.includeInIR && <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.amber, padding: "1px 7px", borderRadius: 10, background: COLORS.warnSoft }}>IR</span>}
            </span>
          )}
        </div>
      </div>

      <p className="num tx-card-value" style={{ fontFamily: "var(--font-display)", fontSize: 24, lineHeight: 1.1, fontWeight: 800, margin: 0, color: txTint, whiteSpace: "nowrap" }}>
        {receita ? "+" : "-"} {fmt(t.amount)}
      </p>
      <div className="tx-card-menu" style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", color: COLORS.fg2 }}>
        <MoreVertical size={22} strokeWidth={2.6} />
      </div>

      <div style={{ gridColumn: "2 / -1", display: "flex", gap: 10, justifyContent: "flex-end", marginTop: -2 }}>
        {onEdit && (
          <button onClick={() => onEdit(t)} aria-label="Editar" style={{ minHeight: 42, padding: "0 18px", borderRadius: 999, border: "1px solid " + COLORS.border, background: "linear-gradient(180deg, #fff, " + COLORS.surface2 + ")", color: COLORS.ink, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Pencil size={17} /> Editar
          </button>
        )}
        {onDelete && (
          <button onClick={() => setConfirming(true)} aria-label="Excluir" style={{ width: 42, minHeight: 42, borderRadius: "50%", border: "1px solid " + COLORS.expenseBorder, background: COLORS.expenseSoft, color: COLORS.expense, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

export function TransacoesView({ closedList, openItems: rawOpenItems, memberFilter, search, setSearch, filterType, setFilterType, accounts, onEdit, onDelete, onPay, onEditPlanned, onDeletePlanned, selectedMonth, onMonthChange, saldoDoMes }) {
  const [status, setStatus] = useState("todos");
  const closedForMonth = closedList.filter((t) => monthKey(t.date) === selectedMonth);
  const openItems = rawOpenItems
    .filter((i) => inScope(i.memberId, memberFilter))
    .filter((i) => filterType === "todos" || i.type === filterType)
    .filter((i) => !search || i.description.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.dueDate < b.dueDate ? -1 : 1);
  const showOpen = status === "todos" || status === "aberto";
  const showClosed = status === "todos" || status === "fechado";

  return (
    <div>
      {selectedMonth && <MonthNav month={selectedMonth} onChange={onMonthChange} saldoDoMes={saldoDoMes} />}
      <p className="serif" style={{ fontSize: 22, fontWeight: 500, margin: "0 0 14px" }}>Transacoes</p>
      <div style={{ position: "relative", marginBottom: 10 }}>
        <Search size={16} color={COLORS.muted} style={{ position: "absolute", left: 12, top: 11 }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar transacao" style={{ width: "100%", padding: "10px 12px 10px 34px", borderRadius: 10, border: "1px solid " + COLORS.line, background: COLORS.card, fontSize: 15, color: COLORS.ink, outline: "none" }} />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8, overflowX: "auto", paddingBottom: 2 }}>
        {[["todos", "Todas"], ["income", "Receitas"], ["expense", "Despesas"], ["transferencia", "Transferencias"]].map(([v, l]) => (
          <button key={v} onClick={() => setFilterType(v)} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 14, border: "1px solid " + (filterType === v ? COLORS.green : COLORS.line), background: filterType === v ? COLORS.green : "transparent", color: filterType === v ? "#fff" : COLORS.muted, whiteSpace: "nowrap" }}>{l}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, overflowX: "auto", paddingBottom: 2 }}>
        {[["todos", "Todas"], ["aberto", "Em aberto"], ["fechado", "Fechadas"]].map(([v, l]) => (
          <button key={v} onClick={() => setStatus(v)} style={{ padding: "5px 12px", borderRadius: 20, fontSize: 12.5, border: "1px solid " + (status === v ? COLORS.green : COLORS.line), background: status === v ? COLORS.green + "1A" : "transparent", color: status === v ? COLORS.green : COLORS.muted, whiteSpace: "nowrap" }}>{l}</button>
        ))}
      </div>

      {showOpen && openItems.length > 0 && (
        <div style={{ marginBottom: showClosed ? 18 : 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.amber, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 0.4 }}>Em aberto ({openItems.length})</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {openItems.map((item) => <PlannedCard key={item.occId} item={item} selectedMonth={selectedMonth} onPay={onPay} onEdit={onEditPlanned} onDelete={onDeletePlanned} />)}
          </div>
        </div>
      )}

      {showClosed && (
        <div>
          {status === "todos" && <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.muted, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 0.4 }}>Fechadas ({closedForMonth.length})</p>}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {closedForMonth.length === 0 && <p style={{ fontSize: 14, color: COLORS.muted, textAlign: "center", padding: "24px 0" }}>Nenhuma transacao encontrada.</p>}
            {closedForMonth.map((t) => <TxRow key={t.id} t={t} accounts={accounts} onEdit={onEdit} onDelete={onDelete} />)}
          </div>
        </div>
      )}

      {showOpen && !showClosed && openItems.length === 0 && <p style={{ fontSize: 14, color: COLORS.muted, textAlign: "center", padding: "24px 0" }}>Nada em aberto por aqui.</p>}
    </div>
  );
}
