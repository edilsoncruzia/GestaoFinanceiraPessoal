import React, { useState } from 'react';
import { Wallet, ArrowDown, CheckCircle2 } from 'lucide-react';
import { COLORS } from '../../constants/tokens';
import { fmt, round2 } from '../../utils/formatters';
import { ModalSheet } from '../ui/ModalSheet';
import { Card } from '../ui/Card';
import { FormField } from '../ui/FormField';

const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid " + COLORS.line, background: COLORS.card, fontSize: 14, outline: "none" };
const primaryBtn = { width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: COLORS.green, color: "#fff", fontSize: 15, fontWeight: 500 };

export function HoleriteModal({ item, accounts, sources, selectedMonth, onClose, onSubmit }) {
  const gross = Number(item.amount) || 0;
  const [date, setDate] = useState(item.dueDate || selectedMonth + "-01");
  const [accountId, setAccountId] = useState(item.accountId ?? accounts[0]?.id ?? null);
  const [fonteId, setFonteId] = useState(item.fonteId ? String(item.fonteId) : "");
  const [saveModel, setSaveModel] = useState(false);
  const [deductions, setDeductions] = useState((item.salaryDeductions || []).map((d) => ({ label: d.label, category: d.category, amount: String(d.amount || "") })));

  const totalDeductions = deductions.reduce((s, d) => s + (Number(d.amount) || 0), 0);
  const net = round2(gross - totalDeductions);

  function updateAmount(idx, value) {
    setDeductions((prev) => prev.map((d, i) => (i === idx ? { ...d, amount: value } : d)));
  }

  function handleSubmit() {
    onSubmit({
      date,
      accountId: accountId ? Number(accountId) : null,
      fonteId: fonteId ? Number(fonteId) : undefined,
      deductions: deductions
        .filter((d) => d.label.trim() && (Number(d.amount) || 0) > 0)
        .map((d) => ({ label: d.label.trim(), category: d.category, amount: Number(d.amount) || 0 })),
      saveModel,
    });
  }

  return (
    <ModalSheet title="Holerite — registrar recebimento" onClose={onClose}>
      <Card style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: COLORS.green + "1E", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Wallet size={18} color={COLORS.green} />
          </div>
          <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: COLORS.ink, flex: 1 }}>{item.description}</p>
          <p className="serif" style={{ fontSize: 20, fontWeight: 600, margin: 0, color: COLORS.ink }}>{fmt(gross)}</p>
        </div>
        <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}>Salário bruto</p>
      </Card>

      <FormField label="Data"><input value={date} onChange={(e) => setDate(e.target.value)} type="date" style={inputStyle} /></FormField>
      <FormField label="Conta de depósito"><select value={accountId} onChange={(e) => setAccountId(e.target.value)} style={inputStyle}>{accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></FormField>
      <FormField label="Fonte (de quem recebe)">
        <select value={fonteId} onChange={(e) => setFonteId(e.target.value)} style={inputStyle}>
          <option value="">Sem fonte</option>
          {(sources || []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </FormField>

      <p style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, margin: "12px 0 8px", textTransform: "uppercase", letterSpacing: 0.4 }}>Descontos em folha</p>
      {deductions.length === 0 && <p style={{ fontSize: 13, color: COLORS.muted, margin: "0 0 10px" }}>Nenhum desconto configurado.</p>}
      {deductions.map((d, idx) => (
        <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13.5, fontWeight: 500, margin: 0, color: COLORS.ink }}>{d.label}</p>
          </div>
          <input value={d.amount} onChange={(e) => updateAmount(idx, e.target.value)} type="number" min="0" step="0.01" placeholder="0,00" style={{ ...inputStyle, width: 110, padding: "8px 10px", textAlign: "right" }} />
        </div>
      ))}

      <div style={{ display: "flex", justifyContent: "space-between", margin: "12px 0 4px", paddingTop: 10, borderTop: "1px solid " + COLORS.line }}>
        <span style={{ fontSize: 13, color: COLORS.muted }}>Total de descontos</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.rust }}>− {fmt(totalDeductions)}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.ink }}>Salário líquido</span>
        <span className="serif" style={{ fontSize: 22, fontWeight: 600, color: net >= 0 ? COLORS.green : COLORS.rust }}>{fmt(net)}</span>
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0 14px", cursor: "pointer" }}>
        <input type="checkbox" checked={saveModel} onChange={(e) => setSaveModel(e.target.checked)} />
        <span style={{ fontSize: 13, color: COLORS.ink }}>Salvar estes valores como modelo para os próximos meses</span>
      </label>

      <button onClick={handleSubmit} style={primaryBtn}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><CheckCircle2 size={16} /> Confirmar recebimento</span>
      </button>
      <p style={{ fontSize: 11, color: COLORS.muted, margin: "10px 0 0", textAlign: "center" }}>Registra a receita bruta e as despesas dos descontos de uma só vez. O líquido é o que entra como disponível.</p>
    </ModalSheet>
  );
}
