import React, { useState } from 'react';
import { COLORS } from '../../constants/tokens';
import { TODAY_MONTH } from '../../constants/seedData';
import { fmt, round2 } from '../../utils/formatters';
import { ModalSheet } from '../ui/ModalSheet';
import { Card } from '../ui/Card';
import { FormField } from '../ui/FormField';

const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid " + COLORS.line, background: COLORS.card, fontSize: 14, outline: "none" };
const primaryBtn = { width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: COLORS.green, color: "#fff", fontSize: 15, fontWeight: 500 };

export function PayModal({ item, accounts, selectedMonth, onClose, onSubmit }) {
  const remaining = round2(item.amount - item.paid);
  const [amount, setAmount] = useState(String(remaining));
  const [date, setDate] = useState(selectedMonth === TODAY_MONTH ? "2026-09-01" : selectedMonth + "-01");
  const [accountId, setAccountId] = useState(item.accountId || accounts[0]?.id || 1);
  const [error, setError] = useState("");

  function handleSubmit() {
    if (!amount || Number(amount) <= 0) { setError("Informe um valor válido."); return; }
    onSubmit({ amount: Number(amount), date, accountId: Number(accountId) });
  }

  return (
    <ModalSheet title={item.type === "income" ? "Registrar recebimento" : "Registrar pagamento"} onClose={onClose}>
      <Card style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 4px" }}>{item.description}</p>
        <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}>Previsto {fmt(item.amount)} · já {item.type === "income" ? "recebido" : "pago"} {fmt(item.paid)} · restam {fmt(remaining)}</p>
      </Card>
      <FormField label="Valor (R$)"><input value={amount} onChange={(e) => { setAmount(e.target.value); setError(""); }} type="number" min="0" step="0.01" style={inputStyle} /></FormField>
      <FormField label="Conta ou cartão"><select value={accountId} onChange={(e) => setAccountId(e.target.value)} style={inputStyle}>{accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></FormField>
      <FormField label="Data" last><input value={date} onChange={(e) => setDate(e.target.value)} type="date" style={inputStyle} /></FormField>
      {error && <p style={{ fontSize: 13, color: COLORS.rust, margin: "0 0 10px" }}>{error}</p>}
      <button onClick={handleSubmit} style={primaryBtn}>Confirmar</button>
    </ModalSheet>
  );
}
