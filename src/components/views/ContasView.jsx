import React, { useState } from 'react';
import { CreditCard, Landmark, Plus } from 'lucide-react';
import { COLORS } from '../../constants/tokens';
import { MEMBERS } from '../../constants/seedData';
import { fmt, statusFor } from '../../utils/formatters';
import { SectionTitle } from '../ui/SectionTitle';
import { Card } from '../ui/Card';
import { MemberBadge } from '../ui/MemberBadge';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { BackRow } from './MaisMenuView';

export function ContasView({ accounts, transactions, onBack, onAdd }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("conta");
  const [bank, setBank] = useState("");
  const [limit, setLimit] = useState("");
  const [closingDay, setClosingDay] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [memberId, setMemberId] = useState("null");

  function submit() {
    if (!name.trim()) return;
    onAdd({
      name: name.trim(), type, bank: bank.trim(),
      limit: type === "cartao" ? Number(limit) || 0 : undefined,
      closingDay: type === "cartao" && closingDay ? Number(closingDay) : undefined,
      dueDay: type === "cartao" && dueDay ? Number(dueDay) : undefined,
      color: type === "cartao" ? "#3B6E8F" : "#1F5D4C", memberId: memberId === "null" ? null : Number(memberId),
    });
    setName(""); setBank(""); setLimit(""); setClosingDay(""); setDueDay(""); setMemberId("null"); setShowForm(false);
  }

  return (
    <div>
      <BackRow onBack={onBack} />
      <SectionTitle title="Contas e cartões" subtitle="Onde suas transações são registradas" />
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        {accounts.map((a) => {
          const spent = transactions.filter((t) => t.type === "expense" && t.accountId === a.id).reduce((s, t) => s + t.amount, 0);
          const income = transactions.filter((t) => t.type === "income" && t.accountId === a.id).reduce((s, t) => s + t.amount, 0);
          const Icon = a.type === "cartao" ? CreditCard : Landmark;
          const st = a.type === "cartao" ? statusFor(spent, a.limit) : null;
          return (
            <Card key={a.id}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: a.type === "cartao" ? 10 : 0 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: a.color + "1E", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon size={18} color={a.color} /></div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{a.name}</p>
                  <p style={{ fontSize: 12, color: COLORS.muted, margin: "0 0 2px" }}>{a.bank || (a.type === "cartao" ? "Cartão de crédito" : "Conta")}</p>
                  <MemberBadge memberId={a.memberId} />
                </div>
                {a.type === "conta" && <p style={{ fontSize: 13, margin: 0 }}><span style={{ color: COLORS.green }}>{fmt(income)}</span> <span style={{ color: COLORS.muted }}>/</span> <span style={{ color: COLORS.rust }}>{fmt(spent)}</span></p>}
              </div>
              {a.type === "cartao" && (
                <>
                  <ProgressBar pct={Math.min(100, (spent / a.limit) * 100)} color={st.color} />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                    <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}>Fatura: {fmt(spent)} de {fmt(a.limit)}</p>
                    <Badge color={st.color}>{st.label}</Badge>
                  </div>
                  {(a.closingDay || a.dueDay) && (
                    <p style={{ fontSize: 11, color: COLORS.muted, margin: "6px 0 0" }}>
                      {a.closingDay ? "Fecha dia " + a.closingDay : ""}{a.closingDay && a.dueDay ? " · " : ""}{a.dueDay ? "Vence dia " + a.dueDay : ""}
                    </p>
                  )}
                </>
              )}
            </Card>
          );
        })}
      </div>

      {!showForm && (
        <button onClick={() => setShowForm(true)} style={{ width: "100%", padding: "12px 0", borderRadius: 10, border: "1px dashed " + COLORS.line, background: "transparent", color: COLORS.green, fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Plus size={16} /> Nova conta ou cartão
        </button>
      )}
      {showForm && (
        <Card>
          <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 12px" }}>Nova conta ou cartão</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {[["conta", "Conta"], ["cartao", "Cartão"]].map(([v, l]) => (
              <button key={v} onClick={() => setType(v)} style={{ flex: 1, padding: "9px 0", borderRadius: 10, fontSize: 13, fontWeight: 500, border: "1px solid " + (type === v ? COLORS.green : COLORS.line), background: type === v ? COLORS.green : "transparent", color: type === v ? "#fff" : COLORS.ink }}>{l}</button>
            ))}
          </div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome (ex: Nubank)" style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid " + COLORS.line, background: COLORS.paper, fontSize: 14, marginBottom: 10, outline: "none" }} />
          <input value={bank} onChange={(e) => setBank(e.target.value)} placeholder="Banco (opcional)" style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid " + COLORS.line, background: COLORS.paper, fontSize: 14, marginBottom: 10, outline: "none" }} />
          {type === "cartao" && <input value={limit} onChange={(e) => setLimit(e.target.value)} type="number" placeholder="Limite (R$)" style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid " + COLORS.line, background: COLORS.paper, fontSize: 14, marginBottom: 10, outline: "none" }} />}
          {type === "cartao" && (
            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <input value={closingDay} onChange={(e) => setClosingDay(e.target.value)} type="number" min="1" max="31" placeholder="Dia que fecha" style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: "1px solid " + COLORS.line, background: COLORS.paper, fontSize: 14, outline: "none" }} />
              <input value={dueDay} onChange={(e) => setDueDay(e.target.value)} type="number" min="1" max="31" placeholder="Dia que vence" style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: "1px solid " + COLORS.line, background: COLORS.paper, fontSize: 14, outline: "none" }} />
            </div>
          )}
          <label style={{ fontSize: 12, color: COLORS.muted }}>Dono</label>
          <select value={memberId} onChange={(e) => setMemberId(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid " + COLORS.line, background: COLORS.paper, fontSize: 14, margin: "6px 0 12px", outline: "none" }}>
            <option value="null">Casal (conjunta)</option>
            {MEMBERS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1px solid " + COLORS.line, background: "transparent", color: COLORS.muted, fontSize: 14 }}>Cancelar</button>
            <button onClick={submit} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: COLORS.green, color: "#fff", fontSize: 14, fontWeight: 500 }}>Salvar</button>
          </div>
        </Card>
      )}
    </div>
  );
}
