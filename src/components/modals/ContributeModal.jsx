import React, { useState } from 'react';
import { COLORS } from '../../constants/tokens';
import { TODAY_MONTH, TODAY_DATE } from '../../constants/seedData';
import { fmt, round2 } from '../../utils/formatters';
import { ModalSheet } from '../ui/ModalSheet';
import { Card } from '../ui/Card';
import { FormField } from '../ui/FormField';

const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid " + COLORS.line, background: COLORS.card, fontSize: 14, outline: "none" };
const primaryBtn = { width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: COLORS.green, color: "#fff", fontSize: 15, fontWeight: 500 };

export function ContributeModal({ goal, accounts, onClose, onSubmit }) {
  const remaining = round2(goal.target - goal.saved);
  const [amount, setAmount] = useState(String(Math.min(100, remaining)));
  const defaultAccount = accounts.find((a) => a.isDefault) || accounts[0];
  const [accountId, setAccountId] = useState(goal.accountId ?? defaultAccount?.id ?? null);
  const [date, setDate] = useState(TODAY_MONTH + "-" + TODAY_DATE.slice(8, 10));
  const [error, setError] = useState("");

  function handleSubmit() {
    if (!amount || Number(amount) <= 0) { setError("Informe um valor válido."); return; }
    onSubmit({ amount: Number(amount), accountId: accountId ? Number(accountId) : null, date });
  }

  return (
    <ModalSheet title="Contribuir para a meta" onClose={onClose}>
      <Card style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 4px" }}>{goal.name}</p>
        <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}>{fmt(goal.saved)} de {fmt(goal.target)} · faltam {fmt(remaining)}</p>
      </Card>
      <FormField label="Valor da contribuição (R$)"><input value={amount} onChange={(e) => { setAmount(e.target.value); setError(""); }} type="number" min="0" step="0.01" style={inputStyle} /></FormField>
      <FormField label="Sai de qual conta?"><select value={accountId} onChange={(e) => setAccountId(e.target.value)} style={inputStyle}>{accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></FormField>
      <FormField label="Data" last><input value={date} onChange={(e) => setDate(e.target.value)} type="date" style={inputStyle} /></FormField>
      {error && <p style={{ fontSize: 13, color: COLORS.rust, margin: "0 0 10px" }}>{error}</p>}
      <button onClick={handleSubmit} style={primaryBtn}>Confirmar contribuição</button>
      <p style={{ fontSize: 11, color: COLORS.muted, margin: "10px 0 0", textAlign: "center" }}>Isso também lança uma despesa de Poupança/Meta na conta escolhida.</p>
    </ModalSheet>
  );
}
