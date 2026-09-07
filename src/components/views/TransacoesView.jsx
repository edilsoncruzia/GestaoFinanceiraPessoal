import React, { useState } from 'react';
import { Search, AlertTriangle, ArrowLeftRight, Paperclip, Link2, Pencil, Trash2 } from 'lucide-react';
import { COLORS, CATEGORIES } from '../../constants/tokens';
import { fmt, fmtDate, inScope, monthKey } from '../../utils/formatters';
import { MonthNav } from '../ui/MonthNav';
import { Card } from '../ui/Card';
import { CategoryIcon } from '../ui/CategoryIcon';
import { MemberBadge } from '../ui/MemberBadge';
import { PlannedCard } from './InicioView';

export function TxRow({ t, accounts, onEdit, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const isTransfer = t.type === "transferencia";
  const c = isTransfer ? null : CATEGORIES[t.category];

  if (confirming) {
    return (
      <Card style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderColor: COLORS.rust }}>
        <AlertTriangle size={16} color={COLORS.rust} style={{ flexShrink: 0 }} />
        <p style={{ fontSize: 13, margin: 0, flex: 1 }}>Excluir "{t.description}"?</p>
        <button onClick={() => setConfirming(false)} style={{ fontSize: 12, padding: "6px 10px", borderRadius: 8, border: "1px solid " + COLORS.line, background: "transparent", color: COLORS.muted }}>Cancelar</button>
        <button onClick={() => onDelete(t.id)} style={{ fontSize: 12, padding: "6px 10px", borderRadius: 8, border: "none", background: COLORS.rust, color: "#fff", fontWeight: 500 }}>Excluir</button>
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
          <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{t.description || "Transferência"}</p>
          <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}>{(from ? from.name : "?") + " → " + (to ? to.name : "?")} · {fmtDate(t.date)}</p>
        </div>
        <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: "#3B6E8F", whiteSpace: "nowrap" }}>{fmt(t.amount)}</p>
        {onEdit && <button onClick={() => onEdit(t)} aria-label="Editar" className="icon-btn" style={{ background: "none", border: "none", padding: 4, color: COLORS.muted }}><Pencil size={15} /></button>}
        {onDelete && <button onClick={() => setConfirming(true)} aria-label="Excluir" className="icon-btn" style={{ background: "none", border: "none", padding: 4, color: COLORS.muted }}><Trash2 size={16} /></button>}
      </Card>
    );
  }

  return (
    <Card style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px" }}>
      <CategoryIcon cat={t.category} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 500, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.description}</p>
        <p style={{ fontSize: 12, color: COLORS.muted, margin: "0 0 2px", display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
          <span>{c ? c.label : t.category} · {fmtDate(t.date)}</span>
          {t.attachment && <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><Paperclip size={11} />{t.attachment}</span>}
          {t.plannedId && <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: COLORS.green }}><Link2 size={11} />Previsto</span>}
        </p>
        <MemberBadge memberId={t.memberId} />
      </div>
      <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: t.type === "income" ? COLORS.green : COLORS.rust, whiteSpace: "nowrap" }}>{t.type === "income" ? "+" : "−"} {fmt(t.amount)}</p>
      {onEdit && <button onClick={() => onEdit(t)} aria-label="Editar" className="icon-btn" style={{ background: "none", border: "none", padding: 4, color: COLORS.muted }}><Pencil size={15} /></button>}
      {onDelete && <button onClick={() => setConfirming(true)} aria-label="Excluir" className="icon-btn" style={{ background: "none", border: "none", padding: 4, color: COLORS.muted }}><Trash2 size={16} /></button>}
    </Card>
  );
}

export function TransacoesView({ closedList, openItems: rawOpenItems, memberFilter, search, setSearch, filterType, setFilterType, accounts, onEdit, onDelete, onPay, onEditPlanned, onDeletePlanned, selectedMonth, onMonthChange }) {
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
      {selectedMonth && <MonthNav month={selectedMonth} onChange={onMonthChange} />}
      <p className="serif" style={{ fontSize: 22, fontWeight: 500, margin: "0 0 14px" }}>Transações</p>
      <div style={{ position: "relative", marginBottom: 10 }}>
        <Search size={16} color={COLORS.muted} style={{ position: "absolute", left: 12, top: 11 }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar transação" style={{ width: "100%", padding: "10px 12px 10px 34px", borderRadius: 10, border: "1px solid " + COLORS.line, background: COLORS.card, fontSize: 14, color: COLORS.ink, outline: "none" }} />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        {[["todos", "Todas"], ["income", "Receitas"], ["expense", "Despesas"], ["transferencia", "Transferências"]].map(([v, l]) => (
          <button key={v} onClick={() => setFilterType(v)} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 13, border: "1px solid " + (filterType === v ? COLORS.green : COLORS.line), background: filterType === v ? COLORS.green : "transparent", color: filterType === v ? "#fff" : COLORS.muted }}>{l}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {[["todos", "Todas"], ["aberto", "Em aberto"], ["fechado", "Fechadas"]].map(([v, l]) => (
          <button key={v} onClick={() => setStatus(v)} style={{ padding: "5px 12px", borderRadius: 20, fontSize: 11.5, border: "1px solid " + (status === v ? COLORS.green : COLORS.line), background: status === v ? COLORS.green + "1A" : "transparent", color: status === v ? COLORS.green : COLORS.muted }}>{l}</button>
        ))}
      </div>

      {showOpen && openItems.length > 0 && (
        <div style={{ marginBottom: showClosed ? 18 : 0 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: COLORS.amber, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 0.4 }}>Em aberto ({openItems.length})</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {openItems.map((item) => <PlannedCard key={item.occId} item={item} onPay={onPay} onEdit={onEditPlanned} onDelete={onDeletePlanned} />)}
          </div>
        </div>
      )}

      {showClosed && (
        <div>
          {status === "todos" && <p style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 0.4 }}>Fechadas ({closedForMonth.length})</p>}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {closedForMonth.length === 0 && <p style={{ fontSize: 13, color: COLORS.muted, textAlign: "center", padding: "24px 0" }}>Nenhuma transação encontrada.</p>}
            {closedForMonth.map((t) => <TxRow key={t.id} t={t} accounts={accounts} onEdit={onEdit} onDelete={onDelete} />)}
          </div>
        </div>
      )}

      {showOpen && !showClosed && openItems.length === 0 && <p style={{ fontSize: 13, color: COLORS.muted, textAlign: "center", padding: "24px 0" }}>Nada em aberto por aqui.</p>}
    </div>
  );
}
