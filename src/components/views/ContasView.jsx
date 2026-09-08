import React, { useState } from 'react';
import { CreditCard, Landmark, Plus, Pencil, Trash2 } from 'lucide-react';
import { COLORS } from '../../constants/tokens';
import { fmt, statusFor, accountBalance } from '../../utils/formatters';
import { SectionTitle } from '../ui/SectionTitle';
import { Card } from '../ui/Card';
import { MemberBadge } from '../ui/MemberBadge';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { BackRow } from './MaisMenuView';

export function ContasView({ accounts, transactions, onBack, onAdd, onEdit, onDelete, onViewStatements }) {
  const [filter, setFilter] = useState("todos");
  const filtered = accounts.filter((a) => filter === "todos" || a.type === filter);

  return (
    <div>
      <BackRow onBack={onBack} />
      <SectionTitle title="Contas e cartões" subtitle="Onde suas transações são registradas" />
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {[["todos", "Todos"], ["conta", "Contas"], ["cartao", "Cartões"]].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{ flex: 1, padding: "9px 0", borderRadius: 10, fontSize: 13, fontWeight: 500, border: "1px solid " + (filter === v ? COLORS.green : COLORS.line), background: filter === v ? COLORS.green : "transparent", color: filter === v ? "#fff" : COLORS.ink }}>{l}</button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        {filtered.map((a) => {
          const spent = transactions.filter((t) => t.type === "expense" && t.accountId === a.id).reduce((s, t) => s + t.amount, 0);
          const saldo = accountBalance(a, transactions);
          const Icon = a.type === "cartao" ? CreditCard : Landmark;
          const st = a.type === "cartao" ? statusFor(spent, a.limit) : null;
          return (
            <Card key={a.id}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: a.color + "1E", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon size={18} color={a.color} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{a.name}</p>
                  <p style={{ fontSize: 12, color: COLORS.muted, margin: "0 0 2px" }}>
                    {[a.bank, a.type === "cartao" ? a.brand : null].filter(Boolean).join(" · ") || (a.type === "cartao" ? "Cartão de crédito" : "Conta")}
                  </p>
                  <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
                    <MemberBadge memberId={a.memberId} />
                    {a.isDefault && <Badge color={COLORS.green}>Padrão</Badge>}
                    {a.type === "conta" && a.countInAvailable === false && <Badge color={COLORS.amber}>Reserva</Badge>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => onEdit(a)} aria-label="Editar" className="icon-btn" style={{ background: "none", border: "none", color: COLORS.muted, cursor: "pointer", padding: 6 }}><Pencil size={17} /></button>
                  <button onClick={() => onDelete(a)} aria-label="Excluir" className="icon-btn" style={{ background: "none", border: "none", color: COLORS.rust, cursor: "pointer", padding: 6 }}><Trash2 size={17} /></button>
                </div>
              </div>

              {a.type === "conta" && (
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, paddingTop: 8, borderTop: "1px solid " + COLORS.line }}>
                  <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}>{a.countInAvailable === false ? "Saldo (fora do disponível)" : "Saldo"}</p>
                  <p style={{ fontSize: 13, margin: 0, color: saldo >= 0 ? COLORS.green : COLORS.rust }}>{fmt(saldo)}</p>
                </div>
              )}

              {a.type === "cartao" && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                    <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}>Fatura atual: {fmt(a.currentInvoice || 0)}</p>
                    <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}>Limite: {fmt(a.limit || 0)}</p>
                  </div>
                  <ProgressBar pct={a.limit > 0 ? Math.min(100, (spent / a.limit) * 100) : 0} color={st ? st.color : COLORS.muted} />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                    <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}>Gasto no mês: {fmt(spent)}</p>
                    {st && <Badge color={st.color}>{st.label}</Badge>}
                  </div>
                  {(a.closingDay || a.dueDay) && (
                    <p style={{ fontSize: 11, color: COLORS.muted, margin: "6px 0 0" }}>
                      {a.closingDay ? "Fecha dia " + a.closingDay : ""}{a.closingDay && a.dueDay ? " · " : ""}{a.dueDay ? "Vence dia " + a.dueDay : ""}
                    </p>
                  )}
                </>
              )}
              {onViewStatements && (
                <button onClick={() => onViewStatements(a)} style={{ width: "100%", marginTop: 10, padding: "8px 0", borderRadius: 10, border: "1px solid " + COLORS.line, background: "transparent", color: COLORS.green, fontSize: 12.5, fontWeight: 500 }}>Ver extrato</button>
              )}
            </Card>
          );
        })}
      </div>

      <button onClick={onAdd} style={{ width: "100%", padding: "12px 0", borderRadius: 10, border: "1px dashed " + COLORS.line, background: "transparent", color: COLORS.green, fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <Plus size={16} /> Nova conta ou cartão
      </button>
    </div>
  );
}
