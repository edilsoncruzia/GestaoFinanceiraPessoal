import React, { useState } from 'react';
import { COLORS } from '../../constants/tokens';
import { MEMBERS } from '../../constants/seedData';
import { ModalSheet } from '../ui/ModalSheet';
import { FormField } from '../ui/FormField';

const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid " + COLORS.line, background: COLORS.card, fontSize: 14, outline: "none" };
const primaryBtn = { width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: COLORS.green, color: "#fff", fontSize: 15, fontWeight: 500 };

const BANDEIRAS = ["Visa", "Mastercard", "Elo", "American Express", "Hipercard", "Outra"];

export function AccountFormModal({ editing, onClose, onSubmit }) {
  const [type, setType] = useState(editing ? editing.type : "conta");
  const [name, setName] = useState(editing ? editing.name : "");
  const [bank, setBank] = useState(editing && editing.bank ? editing.bank : "");
  const [brand, setBrand] = useState(editing && editing.brand ? editing.brand : "Visa");
  const [initialBalance, setInitialBalance] = useState(editing ? String(editing.initialBalance || "") : "");
  const [currentInvoice, setCurrentInvoice] = useState(editing ? String(editing.currentInvoice || "") : "");
  const [limit, setLimit] = useState(editing ? String(editing.limit || "") : "");
  const [closingDay, setClosingDay] = useState(editing && editing.closingDay ? String(editing.closingDay) : "");
  const [dueDay, setDueDay] = useState(editing && editing.dueDay ? String(editing.dueDay) : "");
  const [isDefault, setIsDefault] = useState(editing ? Boolean(editing.isDefault) : false);
  const [memberId, setMemberId] = useState(editing ? (editing.memberId == null ? "null" : String(editing.memberId)) : "null");
  const [error, setError] = useState("");

  function handleSubmit() {
    if (!name.trim()) { setError("Informe o nome da conta/cartão."); return; }
    const payload = {
      name: name.trim(),
      type,
      bank: bank.trim(),
      color: type === "cartao" ? "#3B6E8F" : "#1F5D4C",
      memberId: memberId === "null" ? null : Number(memberId),
      isDefault,
      limit: type === "cartao" ? (Number(limit) || 0) : undefined,
      closingDay: type === "cartao" && closingDay ? Number(closingDay) : undefined,
      dueDay: type === "cartao" && dueDay ? Number(dueDay) : undefined,
      initialBalance: type === "conta" ? (Number(initialBalance) || 0) : undefined,
      brand: type === "cartao" ? brand : undefined,
      currentInvoice: type === "cartao" ? (Number(currentInvoice) || 0) : undefined,
    };
    if (editing) payload.id = editing.id;
    onSubmit(payload);
  }

  return (
    <ModalSheet title={editing ? "Editar conta/cartão" : "Nova conta ou cartão"} onClose={onClose}>
      {!editing && (
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {[["conta", "Conta"], ["cartao", "Cartão"]].map(([v, l]) => (
            <button key={v} onClick={() => setType(v)} style={{ flex: 1, padding: "10px 0", borderRadius: 10, fontSize: 13, fontWeight: 500, border: "1px solid " + (type === v ? COLORS.green : COLORS.line), background: type === v ? COLORS.green : "transparent", color: type === v ? "#fff" : COLORS.ink }}>{l}</button>
          ))}
        </div>
      )}
      {editing && (
        <p style={{ fontSize: 12, color: COLORS.muted, margin: "0 0 14px" }}>Tipo: <span style={{ color: COLORS.ink, fontWeight: 500 }}>{type === "cartao" ? "Cartão" : "Conta"}</span></p>
      )}

      <FormField label="Nome"><input value={name} onChange={(e) => { setName(e.target.value); setError(""); }} placeholder="ex: Nubank" style={inputStyle} /></FormField>
      <FormField label="Banco (opcional)"><input value={bank} onChange={(e) => setBank(e.target.value)} placeholder="ex: Banco Ipê" style={inputStyle} /></FormField>

      {type === "conta" ? (
        <FormField label="Saldo inicial (R$)"><input value={initialBalance} onChange={(e) => setInitialBalance(e.target.value)} type="number" min="0" step="0.01" placeholder="0,00" style={inputStyle} /></FormField>
      ) : (
        <>
          <FormField label="Bandeira"><select value={brand} onChange={(e) => setBrand(e.target.value)} style={inputStyle}>{BANDEIRAS.map((b) => <option key={b} value={b}>{b}</option>)}</select></FormField>
          <FormField label="Fatura atual (R$)"><input value={currentInvoice} onChange={(e) => setCurrentInvoice(e.target.value)} type="number" min="0" step="0.01" placeholder="0,00" style={inputStyle} /></FormField>
          <FormField label="Limite (R$)"><input value={limit} onChange={(e) => setLimit(e.target.value)} type="number" min="0" step="0.01" placeholder="0,00" style={inputStyle} /></FormField>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}><FormField label="Fecha dia"><input value={closingDay} onChange={(e) => setClosingDay(e.target.value)} type="number" min="1" max="31" placeholder="ex: 25" style={inputStyle} /></FormField></div>
            <div style={{ flex: 1 }}><FormField label="Vence dia"><input value={dueDay} onChange={(e) => setDueDay(e.target.value)} type="number" min="1" max="31" placeholder="ex: 5" style={inputStyle} /></FormField></div>
          </div>
        </>
      )}

      <label style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0 12px", cursor: "pointer" }}>
        <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
        <span style={{ fontSize: 13, color: COLORS.ink }}>Conta padrão (novos lançamentos usam esta conta)</span>
      </label>

      <FormField label="Dono">
        <select value={memberId} onChange={(e) => setMemberId(e.target.value)} style={inputStyle}>
          <option value="null">Casal (conjunta)</option>
          {MEMBERS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </FormField>

      {error && <p style={{ fontSize: 13, color: COLORS.rust, margin: "0 0 10px" }}>{error}</p>}
      <button onClick={handleSubmit} style={primaryBtn}>{editing ? "Salvar alterações" : "Salvar conta"}</button>
    </ModalSheet>
  );
}
