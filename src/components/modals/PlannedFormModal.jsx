import React, { useState } from 'react';
import { COLORS, PRIORITY, DEFAULT_PRIORITY, CATEGORY_PALETTE } from '../../constants/tokens';
import { useCategories } from '../../context/CategoriesContext';
import { MEMBERS, TODAY_MONTH } from '../../constants/seedData';
import { ModalSheet } from '../ui/ModalSheet';
import { FormField } from '../ui/FormField';
import { Plus, Trash2 } from 'lucide-react';
import { SourceSelect } from '../ui/SourceSelect';
import { DEFAULT_POR_CATEGORIA, DEFAULT_CATEGORIA_GENERICA } from '../../services/prioritizador/constantes.js';

const CONSEQ_LABELS = {
  CORTE_SERVICO: "Corte de serviço",
  PERDA_BEM_MORADIA: "Perda de bem / moradia",
  PROTESTO_JUDICIAL: "Protesto judicial",
  NEGATIVACAO_SPC_SERASA: "Negativação SPC/Serasa",
  BLOQUEIO_SERVICO_NAO_ESSENCIAL: "Bloqueio de serviço não essencial",
};

function defaultsPorCategoria(cat) {
  const d = DEFAULT_POR_CATEGORIA[cat] || DEFAULT_CATEGORIA_GENERICA;
  return {
    multa_fixa_porcentagem: d.multa_fixa_porcentagem != null ? String(d.multa_fixa_porcentagem) : "2",
    multa_fixa_valor: "0",
    taxa_juros_diaria: d.taxa_juros_diaria != null ? String(d.taxa_juros_diaria) : "0.033",
    taxa_juros_mensal: d.taxa_juros_mensal != null ? String(d.taxa_juros_mensal) : "0",
    dias_carencia: "0",
    tipo_consequencia: d.tipo_consequencia || "NEGATIVACAO_SPC_SERASA",
    dias_para_sancao: d.dias_para_sancao != null ? String(d.dias_para_sancao) : "30",
    aceita_pagamento_parcial: false,
    valor_minimo: "0",
  };
}

const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid " + COLORS.line, background: COLORS.card, fontSize: 14, outline: "none" };
const primaryBtn = { width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: COLORS.green, color: "#fff", fontSize: 15, fontWeight: 500 };

// Periodicidade para parcelas (com fim definido)
const INSTALLMENT_PERIODS = [
  ["diario", "Diário"], ["semanal", "Semanal"], ["mensal", "Mensal"], ["bimestral", "Bimestral"],
  ["trimestral", "Trimestral"], ["semestral", "Semestral"], ["anual", "Anual"],
];
// Periodicidade para recorrentes (sem fim definido)
const RECURRING_PERIODS = [
  ["quinzenal", "Quinzenal"], ["mensal", "Mensal"], ["bimestral", "Bimestral"],
  ["trimestral", "Trimestral"], ["semestral", "Semestral"], ["anual", "Anual"],
];

// Atalhos de descontos em folha (salário)
const DEDUCTION_PRESETS = [
  ["INSS", "contas"],
  ["IRRF", "contas"],
  ["Plano de saúde", "saude"],
  ["Vale-transporte", "transporte"],
  ["Empréstimo consignado", "contas"],
  ["Outros", "outros"],
];



export function PlannedFormModal({ accounts, sources, selectedMonth, editing, onClose, onSubmit, onAddCategory, onAddAccount }) {
  // Conta padrão = a marcada como isDefault; senão a primeira da lista.
  const defaultAccount = accounts.find((a) => a.isDefault) || accounts[0];
  const [type, setType] = useState(editing ? editing.type : "expense");
  const [category, setCategory] = useState(editing ? editing.category : "alimentacao");
  const [description, setDescription] = useState(editing ? editing.description : "");
  const [amount, setAmount] = useState(editing ? String(editing.amount) : "");
  const [dueDate, setDueDate] = useState(editing ? editing.dueDate : (selectedMonth === TODAY_MONTH ? "2026-09-01" : selectedMonth + "-01"));
  const [accountId, setAccountId] = useState(editing ? editing.accountId : (defaultAccount?.id ?? null));
  const [fromAccountId, setFromAccountId] = useState(editing && editing.fromAccountId ? editing.fromAccountId : (defaultAccount?.id ?? null));
  const [toAccountId, setToAccountId] = useState(editing && editing.toAccountId ? editing.toAccountId : ((accounts.find((a) => a.id !== defaultAccount?.id) || accounts[1] || defaultAccount)?.id ?? null));
  const [recurrence, setRecurrence] = useState(editing ? editing.recurrence : "unica");
  const [periodicity, setPeriodicity] = useState(editing ? (editing.periodicity || "mensal") : "mensal");
  const [installmentCurrent, setInstallmentCurrent] = useState(editing && editing.installmentCurrent ? String(editing.installmentCurrent) : "1");
  const [installmentTotal, setInstallmentTotal] = useState(editing && editing.installmentTotal ? String(editing.installmentTotal) : "2");
  const [memberId, setMemberId] = useState(editing ? (editing.memberId == null ? "null" : String(editing.memberId)) : "1");
  const [priority, setPriority] = useState(editing ? (editing.priority || DEFAULT_PRIORITY[editing.category] || "importante") : (DEFAULT_PRIORITY["alimentacao"] || "importante"));
  const [realized, setRealized] = useState(editing ? Boolean(editing.realized) : false);
  const [fonteId, setFonteId] = useState(editing && editing.fonteId ? String(editing.fonteId) : "");
  const [error, setError] = useState("");
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState(CATEGORY_PALETTE[0]);
  const [scope, setScope] = useState("all"); // this | future | all (ao editar série)
  const [salaryDeductions, setSalaryDeductions] = useState(editing && Array.isArray(editing.salaryDeductions) ? editing.salaryDeductions : []);
  const [includeInIR, setIncludeInIR] = useState(editing ? Boolean(editing.includeInIR) : false);
  const [showCustos, setShowCustos] = useState(false);
  const [campos, setCampos] = useState(() => {
    const d = defaultsPorCategoria(editing ? editing.category : "alimentacao");
    return {
      multa_fixa_porcentagem: editing && editing.multa_fixa_porcentagem != null ? String(editing.multa_fixa_porcentagem) : d.multa_fixa_porcentagem,
      multa_fixa_valor: editing && editing.multa_fixa_valor != null ? String(editing.multa_fixa_valor) : d.multa_fixa_valor,
      taxa_juros_diaria: editing && editing.taxa_juros_diaria != null ? String(editing.taxa_juros_diaria) : d.taxa_juros_diaria,
      taxa_juros_mensal: editing && editing.taxa_juros_mensal != null ? String(editing.taxa_juros_mensal) : d.taxa_juros_mensal,
      dias_carencia: editing && editing.dias_carencia != null ? String(editing.dias_carencia) : d.dias_carencia,
      tipo_consequencia: editing && editing.tipo_consequencia ? editing.tipo_consequencia : d.tipo_consequencia,
      dias_para_sancao: editing && editing.dias_para_sancao != null ? String(editing.dias_para_sancao) : d.dias_para_sancao,
      aceita_pagamento_parcial: editing ? Boolean(editing.aceita_pagamento_parcial) : d.aceita_pagamento_parcial,
      valor_minimo: editing && editing.valor_minimo != null ? String(editing.valor_minimo) : d.valor_minimo,
    };
  });
  const setCampo = (k, v) => setCampos((prev) => ({ ...prev, [k]: v }));
  const [formaPagamento, setFormaPagamento] = useState(editing ? (editing.formaPagamento || "normal") : "normal");

  const categories = useCategories();
  const options = Object.entries(categories).filter(([, c]) => c.type === type);
  const expenseOptions = Object.entries(categories).filter(([, c]) => c.type === "expense");

  function handleTypeChange(newType) {
    setType(newType);
    if (newType !== "transferencia") {
      const first = Object.entries(categories).find(([, c]) => c.type === newType);
      setCategory(first[0]);
      setPriority(DEFAULT_PRIORITY[first[0]] || "importante");
      if (newType === "expense" && !editing) setCampos((prev) => ({ ...prev, ...defaultsPorCategoria(first[0]) }));
    }
  }

  function handleCategoryChange(newCategory) {
    if (newCategory === "__new__") { setShowNewCat(true); return; }
    setCategory(newCategory);
    if (!editing) setPriority(DEFAULT_PRIORITY[newCategory] || "importante");
    if (!editing && type === "expense") setCampos((prev) => ({ ...prev, ...defaultsPorCategoria(newCategory) }));
  }

  function createCategory() {
    const label = newCatName.trim();
    if (!label) return;
    const key = "cat-" + Date.now().toString(36);
    if (onAddCategory) onAddCategory({ key, label, color: newCatColor, type });
    setCategory(key);
    if (!editing) setPriority(DEFAULT_PRIORITY[key] || "importante");
    if (!editing && type === "expense") setCampos((prev) => ({ ...prev, ...defaultsPorCategoria(key) }));
    setShowNewCat(false);
    setNewCatName("");
  }

  function updateDeduction(idx, field, value) {
    setSalaryDeductions((prev) => prev.map((d, i) => (i === idx ? { ...d, [field]: value } : d)));
  }
  function removeDeduction(idx) {
    setSalaryDeductions((prev) => prev.filter((_, i) => i !== idx));
  }
  function addDeduction() {
    setSalaryDeductions((prev) => [...prev, { id: "d-" + Date.now().toString(36) + prev.length, label: "", category: "contas", amount: "" }]);
  }
  function addDeductionPreset(label, cat) {
    setSalaryDeductions((prev) => [...prev, { id: "d-" + Date.now().toString(36) + prev.length, label, category: cat, amount: "" }]);
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
      periodicity: (recurrence === "parcelada" || recurrence === "recorrente") ? periodicity : undefined,
      realized,
      salaryDeductions: (type === "income" && category === "salario") ? salaryDeductions.filter((d) => d.label.trim()) : undefined,
      includeInIR: type === "expense" ? includeInIR : undefined,
      formaPagamento: type === "expense" ? formaPagamento : undefined,
      ...(type === "expense" ? {
        multa_fixa_porcentagem: campos.multa_fixa_porcentagem === "" ? null : Number(campos.multa_fixa_porcentagem),
        multa_fixa_valor: Number(campos.multa_fixa_valor) || 0,
        taxa_juros_diaria: campos.taxa_juros_diaria === "" ? null : Number(campos.taxa_juros_diaria),
        taxa_juros_mensal: Number(campos.taxa_juros_mensal) || 0,
        dias_carencia: Number(campos.dias_carencia) || 0,
        tipo_consequencia: campos.tipo_consequencia || null,
        dias_para_sancao: Number(campos.dias_para_sancao) || 30,
        aceita_pagamento_parcial: campos.aceita_pagamento_parcial,
        valor_minimo: Number(campos.valor_minimo) || 0,
      } : {}),
      fonteId: fonteId ? Number(fonteId) : undefined,
    };
    if (recurrence === "parcelada") { payload.installmentCurrent = Number(installmentCurrent) || 1; payload.installmentTotal = Number(installmentTotal) || 1; }
    if (editing) payload.id = editing.id;
    const editMeta = editing && editing.recurrence !== "unica"
      ? { scope, originalDueDate: editing.dueDate, originalInstallmentCurrent: editing.installmentCurrent, originalRecurrence: editing.recurrence }
      : undefined;
    onSubmit(payload, editMeta);
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
          <FormField label="De (conta origem)">
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <select value={fromAccountId} onChange={(e) => setFromAccountId(e.target.value)} style={{ ...inputStyle, flex: 1 }}>{accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
              <button type="button" onClick={onAddAccount} aria-label="Nova conta ou cartão" title="Nova conta ou cartão" style={{ width: 38, height: 38, borderRadius: 10, border: "1px solid " + COLORS.green, background: COLORS.green + "12", color: COLORS.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Plus size={18} /></button>
            </div>
          </FormField>
          <FormField label="Para (conta destino)">
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <select value={toAccountId} onChange={(e) => setToAccountId(e.target.value)} style={{ ...inputStyle, flex: 1 }}>{accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
              <button type="button" onClick={onAddAccount} aria-label="Nova conta ou cartão" title="Nova conta ou cartão" style={{ width: 38, height: 38, borderRadius: 10, border: "1px solid " + COLORS.green, background: COLORS.green + "12", color: COLORS.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Plus size={18} /></button>
            </div>
          </FormField>
        </>
      ) : (
        <>
          {showNewCat ? (
            <FormField label="Nova categoria">
              <input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder={"Nome da categoria de " + (type === "income" ? "receita" : "despesa")} style={inputStyle} />
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                {CATEGORY_PALETTE.map((c) => (
                  <button key={c} type="button" onClick={() => setNewCatColor(c)} aria-label="Cor" style={{ width: 26, height: 26, borderRadius: "50%", background: c, border: newCatColor === c ? "2px solid " + COLORS.ink : "2px solid transparent", cursor: "pointer" }} />
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button type="button" onClick={() => setShowNewCat(false)} style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: "1px solid " + COLORS.line, background: "transparent", color: COLORS.muted, fontSize: 13 }}>Cancelar</button>
                <button type="button" onClick={createCategory} style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: "none", background: COLORS.green, color: "#fff", fontSize: 13, fontWeight: 500 }}>Criar categoria</button>
              </div>
            </FormField>
          ) : (
            <FormField label="Categoria">
              <select value={category} onChange={(e) => handleCategoryChange(e.target.value)} style={inputStyle}>
                {options.map(([key, c]) => <option key={key} value={key}>{c.label}</option>)}
                <option value="__new__">+ Nova categoria</option>
              </select>
            </FormField>
          )}
          {type === "expense" && (
            <FormField label="Prioridade de pagamento">
              <select value={priority} onChange={(e) => setPriority(e.target.value)} style={inputStyle}>
                {Object.entries(PRIORITY).map(([key, p]) => <option key={key} value={key}>{p.label}</option>)}
              </select>
            </FormField>
          )}
          {type === "expense" && (
            <FormField label="Forma de pagamento">
              <select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)} style={inputStyle}>
                <option value="normal">Normal (eu escolho quando pagar)</option>
                <option value="debito_automatico">Débito automático</option>
                <option value="cartao">Cartão (automático)</option>
                <option value="pix_automatico">Pix automático</option>
              </select>
            </FormField>
          )}
          {type === "expense" && (
            <label style={{ display: "flex", alignItems: "flex-start", gap: 8, margin: "4px 0 12px", cursor: "pointer" }}>
              <input type="checkbox" checked={includeInIR} onChange={(e) => setIncludeInIR(e.target.checked)} style={{ marginTop: 2 }} />
              <span style={{ fontSize: 13, color: COLORS.ink }}>
                Incluir na Declaração de IR
                <span style={{ display: "block", fontSize: 11, color: COLORS.muted, marginTop: 2 }}>Quando a despesa for paga, entra na declaração do ano seguinte.</span>
              </span>
            </label>
          )}
          {type === "expense" && (
            <div style={{ margin: "0 0 14px" }}>
              <button type="button" onClick={() => setShowCustos((v) => !v)} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: COLORS.green, background: "none", border: "none", padding: 0, cursor: "pointer" }}>
                {showCustos ? "Ocultar" : "Mostrar"} custos de atraso (opcional)
              </button>
              {showCustos && (
                <div style={{ marginTop: 8, padding: "12px 14px", borderRadius: 12, border: "1px solid " + COLORS.line, background: COLORS.card }}>
                  <p style={{ fontSize: 11.5, color: COLORS.muted, margin: "0 0 10px" }}>Pré-preenchido pela categoria (Seção 2.1). Ajuste apenas se necessário.</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <FormField label="Tipo de consequência">
                      <select value={campos.tipo_consequencia} onChange={(e) => setCampo("tipo_consequencia", e.target.value)} style={inputStyle}>
                        {Object.entries(CONSEQ_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </FormField>
                    <FormField label="Dias para sanção">
                      <input value={campos.dias_para_sancao} onChange={(e) => setCampo("dias_para_sancao", e.target.value)} type="number" min="0" style={inputStyle} />
                    </FormField>
                    <FormField label="Multa fixa (%)">
                      <input value={campos.multa_fixa_porcentagem} onChange={(e) => setCampo("multa_fixa_porcentagem", e.target.value)} type="number" min="0" step="0.1" style={inputStyle} />
                    </FormField>
                    <FormField label="Multa fixa (R$)">
                      <input value={campos.multa_fixa_valor} onChange={(e) => setCampo("multa_fixa_valor", e.target.value)} type="number" min="0" step="0.01" style={inputStyle} />
                    </FormField>
                    <FormField label="Juros diário (%)">
                      <input value={campos.taxa_juros_diaria} onChange={(e) => setCampo("taxa_juros_diaria", e.target.value)} type="number" min="0" step="0.001" style={inputStyle} />
                    </FormField>
                    <FormField label="Juros mensal (%)">
                      <input value={campos.taxa_juros_mensal} onChange={(e) => setCampo("taxa_juros_mensal", e.target.value)} type="number" min="0" step="0.01" style={inputStyle} />
                    </FormField>
                    <FormField label="Carência (dias)">
                      <input value={campos.dias_carencia} onChange={(e) => setCampo("dias_carencia", e.target.value)} type="number" min="0" style={inputStyle} />
                    </FormField>
                    <FormField label="Valor mínimo (R$)">
                      <input value={campos.valor_minimo} onChange={(e) => setCampo("valor_minimo", e.target.value)} type="number" min="0" step="0.01" style={inputStyle} />
                    </FormField>
                  </div>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, cursor: "pointer" }}>
                    <input type="checkbox" checked={campos.aceita_pagamento_parcial} onChange={(e) => setCampo("aceita_pagamento_parcial", e.target.checked)} />
                    <span style={{ fontSize: 13, color: COLORS.ink }}>Aceita pagamento parcial</span>
                  </label>
                </div>
              )}
            </div>
          )}
          {type === "income" && category === "salario" && (
            <div style={{ margin: "4px 0 14px", padding: "12px 14px", borderRadius: 12, background: COLORS.card, border: "1px solid " + COLORS.line }}>
              <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 4px", color: COLORS.ink }}>Descontos em folha (opcional)</p>
              <p style={{ fontSize: 11.5, color: COLORS.muted, margin: "0 0 10px" }}>INSS, IRRF, plano de saúde etc. — são descontados automaticamente ao registrar o recebimento do salário.</p>
              {salaryDeductions.map((d, idx) => (
                <div key={d.id} style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "center" }}>
                  <input value={d.label} onChange={(e) => updateDeduction(idx, "label", e.target.value)} placeholder="Desconto" style={{ ...inputStyle, flex: 2, padding: "8px 10px" }} />
                  <select value={d.category} onChange={(e) => updateDeduction(idx, "category", e.target.value)} style={{ ...inputStyle, flex: 2, padding: "8px 10px" }}>
                    {expenseOptions.map(([key, c]) => <option key={key} value={key}>{c.label}</option>)}
                  </select>
                  <input value={d.amount} onChange={(e) => updateDeduction(idx, "amount", e.target.value)} type="number" min="0" step="0.01" placeholder="0,00" style={{ ...inputStyle, flex: 1, padding: "8px 10px" }} />
                  <button type="button" onClick={() => removeDeduction(idx)} aria-label="Remover desconto" style={{ background: "none", border: "none", color: COLORS.rust, cursor: "pointer", padding: 4, flexShrink: 0 }}><Trash2 size={15} /></button>
                </div>
              ))}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "4px 0 8px" }}>
                {DEDUCTION_PRESETS.map(([label, cat]) => (
                  <button key={label} type="button" onClick={() => addDeductionPreset(label, cat)} style={{ fontSize: 11, padding: "5px 10px", borderRadius: 14, border: "1px solid " + COLORS.line, background: "transparent", color: COLORS.green, fontWeight: 500 }}>{label}</button>
                ))}
              </div>
              <button type="button" onClick={addDeduction} style={{ fontSize: 12, padding: "6px 12px", borderRadius: 8, border: "1px dashed " + COLORS.line, background: "transparent", color: COLORS.green, display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 500 }}>
                <Plus size={13} /> Adicionar desconto
              </button>
            </div>
          )}
        </>
      )}

      <FormField label="Recorrência">
        <select value={recurrence} onChange={(e) => setRecurrence(e.target.value)} style={inputStyle}>
          <option value="unica">Única</option>
          <option value="recorrente">Recorrente (sem fim)</option>
          <option value="parcelada">Parcelada (com fim)</option>
        </select>
      </FormField>
      {recurrence === "recorrente" && (
        <FormField label="Periodicidade">
          <select value={periodicity} onChange={(e) => setPeriodicity(e.target.value)} style={inputStyle}>
            {RECURRING_PERIODS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </FormField>
      )}
      {recurrence === "parcelada" && (
        <>
          <FormField label="Periodicidade">
            <select value={periodicity} onChange={(e) => setPeriodicity(e.target.value)} style={inputStyle}>
              {INSTALLMENT_PERIODS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </FormField>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}><FormField label="Parcela atual"><input value={installmentCurrent} onChange={(e) => setInstallmentCurrent(e.target.value)} type="number" min="1" style={inputStyle} /></FormField></div>
            <div style={{ flex: 1 }}><FormField label="Total de parcelas"><input value={installmentTotal} onChange={(e) => setInstallmentTotal(e.target.value)} type="number" min="2" style={inputStyle} /></FormField></div>
          </div>
        </>
      )}

      {type === "transferencia" ? null : (
        <FormField label="Conta ou cartão">
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <select value={accountId} onChange={(e) => setAccountId(e.target.value)} style={{ ...inputStyle, flex: 1 }}>{accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
            <button type="button" onClick={onAddAccount} aria-label="Nova conta ou cartão" title="Nova conta ou cartão" style={{ width: 38, height: 38, borderRadius: 10, border: "1px solid " + COLORS.green, background: COLORS.green + "12", color: COLORS.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Plus size={18} /></button>
          </div>
        </FormField>
      )}
      <FormField label="Dono"><select value={memberId} onChange={(e) => setMemberId(e.target.value)} style={inputStyle}><option value="null">Casal (conjunto)</option>{MEMBERS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></FormField>
      <FormField label="Vencimento"><input value={dueDate} onChange={(e) => setDueDate(e.target.value)} type="date" style={inputStyle} /></FormField>

      <label style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0 14px", cursor: "pointer" }}>
        <input type="checkbox" checked={realized} onChange={(e) => setRealized(e.target.checked)} />
        <span style={{ fontSize: 13, color: COLORS.ink }}>Efetivado (lançamento já feito)</span>
      </label>

      <FormField label="Fonte (de quem recebe / para quem paga)">
        <SourceSelect sources={sources} value={fonteId} onChange={setFonteId} />
      </FormField>

      {editing && editing.recurrence !== "unica" && (
        <FormField label="Aplicar alteração em">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              ["this", "Somente este lançamento"],
              ["future", "Este e os próximos"],
              ["all", "Toda a série"],
            ].map(([v, l]) => (
              <label key={v} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 10, border: "1px solid " + (scope === v ? COLORS.green : COLORS.line), background: scope === v ? COLORS.green + "0D" : COLORS.card, cursor: "pointer" }}>
                <input type="radio" name="edit-scope" checked={scope === v} onChange={() => setScope(v)} />
                <span style={{ fontSize: 13, color: COLORS.ink }}>{l}</span>
              </label>
            ))}
          </div>
          <p style={{ fontSize: 11, color: COLORS.muted, margin: "6px 0 0" }}>O histórico já consolidado é sempre preservado.</p>
        </FormField>
      )}

      {error && <p style={{ fontSize: 13, color: COLORS.rust, margin: "0 0 10px" }}>{error}</p>}
      <button onClick={handleSubmit} style={primaryBtn}>{editing ? "Salvar alterações" : "Salvar previsto"}</button>
    </ModalSheet>
  );
}
