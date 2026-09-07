import React, { useState } from 'react';
import { COLORS, CATEGORIES, PRIORITY, DEFAULT_PRIORITY } from '../../constants/tokens';
import { MEMBERS, TODAY_MONTH } from '../../constants/seedData';
import { ModalSheet } from '../ui/ModalSheet';
import { FormField } from '../ui/FormField';

const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid " + COLORS.line, background: COLORS.card, fontSize: 14, outline: "none" };
const primaryBtn = { width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: COLORS.green, color: "#fff", fontSize: 15, fontWeight: 500 };

const PERIODICITY = [
  ["diario", "Diário"], ["semanal", "Semanal"], ["mensal", "Mensal"], ["bimestral", "Bimestral"],
  ["trimestral", "Trimestral"], ["semestral", "Semestral"], ["anual", "Anual"],
];



export function PlannedFormModal({ accounts, sources, selectedMonth, editing, onClose, onSubmit }) {
  const [type, setType] = useState(editing ? editing.type : "expense");
  const [category, setCategory] = useState(editing ? editing.category : "alimentacao");
  const [description, setDescription] = useState(editing ? editing.description : "");
  const [amount, setAmount] = useState(editing ? String(editing.amount) : "");
  const [dueDate, setDueDate] = useState(editing ? editing.dueDate : (selectedMonth === TODAY_MONTH ? "2026-09-01" : selectedMonth + "-01"));
  const [accountId, setAccountId] = useState(editing ? editing.accountId : (accounts[0]?.id ?? null));
  const [fromAccountId, setFromAccountId] = useState(editing && editing.fromAccountId ? editing.fromAccountId : (accounts[0]?.id ?? null));
  const [toAccountId, setToAccountId] = useState(editing && editing.toAccountId ? editing.toAccountId : (accounts[1]?.id ?? accounts[0]?.id ?? null));
  const [recurrence, setRecurrence] = useState(editing ? editing.recurrence : "unica");
  const [periodicity, setPeriodicity] = useState(editing ? (editing.periodicity || "mensal") : "mensal");
  const [installmentCurrent, setInstallmentCurrent] = useState(editing && editing.installmentCurrent ? String(editing.installmentCurrent) : "1");
  const [installmentTotal, setInstallmentTotal] = useState(editing && editing.installmentTotal ? String(editing.installmentTotal) : "2");
  const [memberId, setMemberId] = useState(editing ? (editing.memberId == null ? "null" : String(editing.memberId)) : "null");
  const [priority, setPriority] = useState(editing ? (editing.priority || DEFAULT_PRIORITY[editing.category] || "importante") : (DEFAULT_PRIORITY["alimentacao"] || "importante"));
  const [realized, setRealized] = useState(editing ? Boolean(editing.realized) : false);
  const [fonteId, setFonteId] = useState(editing && editing.fonteId ? String(editing.fonteId) : "");
  const [error, setError] = useState("");

  const options = Object.entries(CATEGORIES).filter(([, c]) => c.type === type);

  function handleTypeChange(newType) {
    setType(newType);
    if (newType !== "transferencia") {
      const first = Object.entries(CATEGORIES).find(([, c]) => c.type === newType);
      setCategory(first[0]);
      setPriority(DEFAULT_PRIORITY[first[0]] || "importante");
    }
  }

  function handleCategoryChange(newCategory) {
    setCategory(newCategory);
    if (!editing) setPriority(DEFAULT_PRIORITY[newCategory] || "importante");
  }

  function handleSubmit() {
    if (!description.trim()) { setError("Informe uma descrição."); return; }
    if (!amount || Number(amount) <= 0) { setError("Informe um valor válido."); return; }
    if (type === "transferencia" && fromAccountId === toAccountId) { setError("Escolha contas diferentes para origem e destino."); return; }
    const payload = {
      type,
      category: type === "transferencia" ? null : category,
      description: description.trim(),
      amount: Number(amount),
      dueDate,
      accountId: type === "transferencia" ? null : (accountId ? Number(accountId) : null),
      fromAccountId: type === "transferencia" ? (fromAccountId ? Number(fromAccountId) : null) : undefined,
      toAccountId: type === "transferencia" ? (toAccountId ? Number(toAccountId) : null) : undefined,
      recurrence,
      memberId: memberId === "null" ? null : Number(memberId),
      priority,
      periodicity: recurrence === "parcelada" ? periodicity : undefined,
      realized,
      fonteId: fonteId ? Number(fonteId) : undefined,
    };
    if (recurrence === "parcelada") { payload.installmentCurrent = Number(installmentCurrent) || 1; payload.installmentTotal = Number(installmentTotal) || 1; }
    if (editing) payload.id = editing.id;
    onSubmit(payload);
  }

  return (
    <ModalSheet title={editing ? "Editar previsto" : "Novo previsto"} onClose={onClose}>
      {!editing && (
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {[["expense", "Despesa"], ["income", "Receita"], ["transferencia", "Transferência"]].map(([v, l]) => (
            <button key={v} onClick={() => handleTypeChange(v)} style={{ flex: 1, padding: "10px 0", borderRadius: 10, fontSize: 13, fontWeight: 500, border: "1px solid " + (type === v ? COLORS.green : COLORS.line), background: type === v ? COLORS.green : "transparent", color: type === v ? "#fff" : COLORS.ink }}>{l}</button>
          ))}
        </div>
      )}
      {editing && (
        <p style={{ fontSize: 12, color: COLORS.muted, margin: "0 0 14px" }}>Tipo: <span style={{ color: COLORS.ink, fontWeight: 500 }}>{type === "income" ? "Receita" : type === "transferencia" ? "Transferência" : "Despesa"}</span></p>
      )}

      <FormField label="Descrição"><input value={description} onChange={(e) => { setDescription(e.target.value); setError(""); }} placeholder="Ex: Aluguel" style={inputStyle} /></FormField>
      <FormField label={recurrence === "parcelada" ? "Valor da parcela (R$)" : "Valor previsto (R$)"}><input value={amount} onChange={(e) => { setAmount(e.target.value); setError(""); }} type="number" min="0" step="0.01" placeholder="0,00" style={inputStyle} /></FormField>

      {type === "transferencia" ? (
        <>
          <FormField label="De (conta origem)"><select value={fromAccountId} onChange={(e) => setFromAccountId(e.target.value)} style={inputStyle}>{accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></FormField>
          <FormField label="Para (conta destino)"><select value={toAccountId} onChange={(e) => setToAccountId(e.target.value)} style={inputStyle}>{accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></FormField>
        </>
      ) : (
        <>
          <FormField label="Categoria"><select value={category} onChange={(e) => handleCategoryChange(e.target.value)} style={inputStyle}>{options.map(([key, c]) => <option key={key} value={key}>{c.label}</option>)}</select></FormField>
          {type === "expense" && (
            <FormField label="Prioridade de pagamento">
              <select value={priority} onChange={(e) => setPriority(e.target.value)} style={inputStyle}>
                {Object.entries(PRIORITY).map(([key, p]) => <option key={key} value={key}>{p.label}</option>)}
              </select>
            </FormField>
          )}
        </>
      )}

      <FormField label="Recorrência">
        <select value={recurrence} onChange={(e) => setRecurrence(e.target.value)} style={inputStyle}>
          <option value="unica">Única</option>
          <option value="recorrente">Recorrente (mensal)</option>
          <option value="parcelada">Parcelada</option>
        </select>
      </FormField>
      {recurrence === "parcelada" && (
        <>
          <FormField label="Periodicidade">
            <select value={periodicity} onChange={(e) => setPeriodicity(e.target.value)} style={inputStyle}>
              {PERIODICITY.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </FormField>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}><FormField label="Parcela atual"><input value={installmentCurrent} onChange={(e) => setInstallmentCurrent(e.target.value)} type="number" min="1" style={inputStyle} /></FormField></div>
            <div style={{ flex: 1 }}><FormField label="Total de parcelas"><input value={installmentTotal} onChange={(e) => setInstallmentTotal(e.target.value)} type="number" min="2" style={inputStyle} /></FormField></div>
          </div>
        </>
      )}

      {type === "transferencia" ? null : (
        <FormField label="Conta ou cartão"><select value={accountId} onChange={(e) => setAccountId(e.target.value)} style={inputStyle}>{accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></FormField>
      )}
      <FormField label="Dono"><select value={memberId} onChange={(e) => setMemberId(e.target.value)} style={inputStyle}><option value="null">Casal (conjunto)</option>{MEMBERS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></FormField>
      <FormField label="Vencimento"><input value={dueDate} onChange={(e) => setDueDate(e.target.value)} type="date" style={inputStyle} /></FormField>

      <label style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0 14px", cursor: "pointer" }}>
        <input type="checkbox" checked={realized} onChange={(e) => setRealized(e.target.checked)} />
        <span style={{ fontSize: 13, color: COLORS.ink }}>Efetivado (lançamento já feito)</span>
      </label>

      <FormField label="Fonte (de quem recebe / para quem paga)">
        <select value={fonteId} onChange={(e) => setFonteId(e.target.value)} style={inputStyle}>
          <option value="">Sem fonte</option>
          {(sources || []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </FormField>

      {error && <p style={{ fontSize: 13, color: COLORS.rust, margin: "0 0 10px" }}>{error}</p>}
      <button onClick={handleSubmit} style={primaryBtn}>{editing ? "Salvar alterações" : "Salvar previsto"}</button>
    </ModalSheet>
  );
}
