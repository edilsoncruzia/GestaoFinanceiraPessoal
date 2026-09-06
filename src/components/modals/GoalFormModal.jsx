import React, { useState } from 'react';
import { COLORS } from '../../constants/tokens';
import { MEMBERS } from '../../constants/seedData';
import { ModalSheet } from '../ui/ModalSheet';
import { FormField } from '../ui/FormField';

const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid " + COLORS.line, background: COLORS.card, fontSize: 14, outline: "none" };
const primaryBtn = { width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: COLORS.green, color: "#fff", fontSize: 15, fontWeight: 500 };

export function GoalFormModal({ accounts, onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [memberId, setMemberId] = useState("null");
  const [accountId, setAccountId] = useState(accounts[0]?.id || 1);
  const [error, setError] = useState("");

  function handleSubmit() {
    if (!name.trim()) { setError("Dê um nome para a meta."); return; }
    if (!target || Number(target) <= 0) { setError("Informe um valor alvo válido."); return; }
    onSubmit({ name: name.trim(), target: Number(target), memberId: memberId === "null" ? null : Number(memberId), accountId: Number(accountId) });
  }

  return (
    <ModalSheet title="Nova meta" onClose={onClose}>
      <FormField label="Nome da meta"><input value={name} onChange={(e) => { setName(e.target.value); setError(""); }} placeholder="Ex: Viagem de férias" style={inputStyle} /></FormField>
      <FormField label="Valor alvo (R$)"><input value={target} onChange={(e) => { setTarget(e.target.value); setError(""); }} type="number" min="0" step="0.01" style={inputStyle} /></FormField>
      <FormField label="De quem é a meta?"><select value={memberId} onChange={(e) => setMemberId(e.target.value)} style={inputStyle}><option value="null">Casal (conjunta)</option>{MEMBERS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></FormField>
      <FormField label="Onde vai ficar guardado" last><select value={accountId} onChange={(e) => setAccountId(e.target.value)} style={inputStyle}>{accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></FormField>
      {error && <p style={{ fontSize: 13, color: COLORS.rust, margin: "0 0 10px" }}>{error}</p>}
      <button onClick={handleSubmit} style={primaryBtn}>Criar meta</button>
    </ModalSheet>
  );
}
