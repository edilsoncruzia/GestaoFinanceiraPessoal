import React, { useState } from 'react';
import { COLORS, CATEGORIES } from '../../constants/tokens';
import { MEMBERS, CONNECTED_MEMBER_ID, TODAY_MONTH } from '../../constants/seedData';
import { ModalSheet } from '../ui/ModalSheet';
import { FormField } from '../ui/FormField';

const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid " + COLORS.line, background: COLORS.card, fontSize: 14, outline: "none" };
const primaryBtn = { width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: COLORS.green, color: "#fff", fontSize: 15, fontWeight: 500 };

export function TransactionFormModal({ accounts, selectedMonth, editing, initialType, onClose, onSubmit }) {
  const [type, setType] = useState(editing ? editing.type : (initialType || "expense"));
  const [category, setCategory] = useState(editing ? editing.category : (initialType === "income" ? "salario" : "alimentacao"));
  const [description, setDescription] = useState(editing ? editing.description : "");
  const [amount, setAmount] = useState(editing ? String(editing.amount) : "");
  const [date, setDate] = useState(editing ? editing.date : (selectedMonth === TODAY_MONTH ? "2026-09-01" : selectedMonth + "-01"));
  const [accountId, setAccountId] = useState(editing && editing.accountId ? editing.accountId : accounts[0]?.id || 1);
  const [fromAccountId, setFromAccountId] = useState(editing && editing.fromAccountId ? editing.fromAccountId : accounts[0]?.id || 1);
  const [toAccountId, setToAccountId] = useState(editing && editing.toAccountId ? editing.toAccountId : (accounts[1] ? accounts[1].id : accounts[0]?.id || 1));
  const [attachment, setAttachment] = useState(editing && editing.attachment ? editing.attachment : "");
  const [memberId, setMemberId] = useState(editing ? (editing.memberId == null ? "null" : String(editing.memberId)) : String(CONNECTED_MEMBER_ID));
  const [error, setError] = useState("");

  const options = Object.entries(CATEGORIES).filter(([, c]) => c.type === type);
  const connectedMember = MEMBERS.find((m) => m.id === CONNECTED_MEMBER_ID);

  function handleTypeChange(newType) {
    setType(newType);
    if (newType !== "transferencia") {
      const first = Object.entries(CATEGORIES).find(([, c]) => c.type === newType);
      setCategory(first[0]);
    }
  }

  function handleSubmit() {
    if (!amount || Number(amount) <= 0) { setError("Informe um valor válido."); return; }
    let payload;
    if (type === "transferencia") {
      if (fromAccountId === toAccountId) { setError("Escolha contas diferentes para origem e destino."); return; }
      payload = { type, description: description.trim() || "Transferência", amount: Number(amount), date, fromAccountId: Number(fromAccountId), toAccountId: Number(toAccountId), memberId: memberId === "null" ? null : Number(memberId) };
    } else {
      if (!description.trim()) { setError("Informe uma descrição."); return; }
      payload = { type, category, description: description.trim(), amount: Number(amount), date, accountId: Number(accountId), memberId: memberId === "null" ? null : Number(memberId) };
      if (attachment.trim()) payload.attachment = attachment.trim();
    }
    if (editing) { payload.id = editing.id; if (editing.plannedId) payload.plannedId = editing.plannedId; }
    onSubmit(payload);
  }

  return (
    <ModalSheet title={editing ? "Editar transação" : "Nova transação"} onClose={onClose}>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {[["expense", "Despesa"], ["income", "Receita"], ["transferencia", "Transferência"]].map(([v, l]) => (
          <button key={v} onClick={() => handleTypeChange(v)} style={{ flex: 1, padding: "10px 0", borderRadius: 10, fontSize: 13, fontWeight: 500, border: "1px solid " + (type === v ? COLORS.green : COLORS.line), background: type === v ? COLORS.green : "transparent", color: type === v ? "#fff" : COLORS.ink }}>{l}</button>
        ))}
      </div>

      {type === "transferencia" ? (
        <>
          <FormField label="Descrição (opcional)"><input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Pagamento da fatura" style={inputStyle} /></FormField>
          <FormField label="Valor (R$)"><input value={amount} onChange={(e) => { setAmount(e.target.value); setError(""); }} type="number" min="0" step="0.01" placeholder="0,00" style={inputStyle} /></FormField>
          <FormField label="De"><select value={fromAccountId} onChange={(e) => setFromAccountId(e.target.value)} style={inputStyle}>{accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></FormField>
          <FormField label="Para"><select value={toAccountId} onChange={(e) => setToAccountId(e.target.value)} style={inputStyle}>{accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></FormField>
          <FormField label="Data" last><input value={date} onChange={(e) => setDate(e.target.value)} type="date" style={inputStyle} /></FormField>
          <p style={{ fontSize: 11, color: COLORS.muted, margin: "-6px 0 12px" }}>Transferências não entram como receita nem despesa nos relatórios — só movem o dinheiro entre contas.</p>
        </>
      ) : (
        <>
          <FormField label="Descrição"><input value={description} onChange={(e) => { setDescription(e.target.value); setError(""); }} placeholder="Ex: Supermercado" style={inputStyle} /></FormField>
          <FormField label="Valor (R$)"><input value={amount} onChange={(e) => { setAmount(e.target.value); setError(""); }} type="number" min="0" step="0.01" placeholder="0,00" style={inputStyle} /></FormField>
          <FormField label="Categoria"><select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>{options.map(([key, c]) => <option key={key} value={key}>{c.label}</option>)}</select></FormField>
          <FormField label="Conta ou cartão"><select value={accountId} onChange={(e) => setAccountId(e.target.value)} style={inputStyle}>{accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></FormField>
          <FormField label={"Dono · detectado por " + connectedMember.email}>
            <select value={memberId} onChange={(e) => setMemberId(e.target.value)} style={inputStyle}>
              {MEMBERS.map((m) => <option key={m.id} value={m.id}>{m.name}{m.id === CONNECTED_MEMBER_ID ? " (conta conectada)" : ""}</option>)}
              <option value="null">Casal (conjunta)</option>
            </select>
          </FormField>
          <FormField label="Anexar comprovante (opcional)"><input value={attachment} onChange={(e) => setAttachment(e.target.value)} placeholder="ex: nota-mercado.jpg" style={inputStyle} /></FormField>
          <FormField label="Data" last><input value={date} onChange={(e) => setDate(e.target.value)} type="date" style={inputStyle} /></FormField>
        </>
      )}
      {error && <p style={{ fontSize: 13, color: COLORS.rust, margin: "0 0 10px" }}>{error}</p>}
      <button onClick={handleSubmit} style={primaryBtn}>{editing ? "Salvar alterações" : "Salvar transação"}</button>
    </ModalSheet>
  );
}
