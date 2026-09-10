import React, { useState } from 'react';
import { CreditCard, Pencil } from 'lucide-react';
import { COLORS } from '../../constants/tokens';
import { fmt, round2 } from '../../utils/formatters';
import { ModalSheet } from '../ui/ModalSheet';
import { Card } from '../ui/Card';
import { FormField } from '../ui/FormField';

const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid " + COLORS.line, background: COLORS.card, fontSize: 14, outline: "none" };
const primaryBtn = { width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: COLORS.green, color: "#fff", fontSize: 15, fontWeight: 500 };

// Pagar fatura do cartão: lista os lançamentos internos (com data e valor editáveis),
// dá acesso ao cadastro completo de cada lançamento e, ao confirmar, cria uma
// transação individual para cada um (marcada como "via cartão").
export function FaturaModal({ item, selectedMonth, onClose, onSubmit, onEditCharge }) {
  const [date, setDate] = useState(item.dueDate || selectedMonth + "-01");
  const [itens, setItens] = useState(() => (item.itens || []).map((c) => ({ ...c, incluir: true })));

  const selecionados = itens.filter((c) => c.incluir);
  const total = round2(selecionados.reduce((s, c) => s + (Number(c.amount) || 0), 0));

  function toggle(idx) {
    setItens((prev) => prev.map((c, i) => (i === idx ? { ...c, incluir: !c.incluir } : c)));
  }
  function update(idx, field, value) {
    setItens((prev) => prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c)));
  }

  function handleSubmit() {
    if (selecionados.length === 0) return;
    onSubmit({
      date,
      itens: selecionados.map((c) => ({
        occId: c.occId,
        plannedId: c.plannedId,
        description: c.description,
        amount: Number(c.amount) || 0,
        category: c.category,
        memberId: c.memberId,
        date: c.dueDate || date,
      })),
    });
  }

  return (
    <ModalSheet title="Pagar fatura do cartão" onClose={onClose}>
      <Card style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#3B6E8F1E", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <CreditCard size={18} color="#3B6E8F" />
          </div>
          <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: COLORS.ink, flex: 1 }}>{item.description}</p>
          <p className="serif" style={{ fontSize: 20, fontWeight: 600, margin: 0, color: COLORS.ink }}>{fmt(total)}</p>
        </div>
        <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}>Vencimento {item.dueDate} · {selecionados.length} de {itens.length} lançamento(s)</p>
      </Card>

      <FormField label="Data padrão do pagamento"><input value={date} onChange={(e) => setDate(e.target.value)} type="date" style={inputStyle} /></FormField>

      <p style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, margin: "12px 0 8px", textTransform: "uppercase", letterSpacing: 0.4 }}>Lançamentos da fatura</p>
      {itens.length === 0 && <p style={{ fontSize: 13, color: COLORS.muted, margin: "0 0 10px" }}>Nenhum lançamento nesta fatura.</p>}
      {itens.map((c, idx) => (
        <div key={idx} style={{ marginBottom: 10, padding: "8px 10px", borderRadius: 10, border: "1px solid " + COLORS.line, background: COLORS.card, opacity: c.incluir ? 1 : 0.55 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={c.incluir} onChange={() => toggle(idx)} />
            <p style={{ flex: 1, fontSize: 13.5, fontWeight: 500, margin: 0, color: COLORS.ink }}>{c.description}</p>
            <button type="button" onClick={() => onEditCharge && onEditCharge(c.plannedId)} aria-label="Editar lançamento completo" title="Editar (categoria, parcelas, recorrência...)" style={{ background: "none", border: "none", color: COLORS.muted, padding: 4, display: "flex", cursor: "pointer" }}><Pencil size={15} /></button>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 10.5, color: COLORS.muted, margin: "0 0 2px" }}>Vencimento</p>
              <input type="date" value={c.dueDate || ""} onChange={(e) => update(idx, "dueDate", e.target.value)} style={{ ...inputStyle, padding: "7px 9px", fontSize: 12.5 }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 10.5, color: COLORS.muted, margin: "0 0 2px" }}>Valor</p>
              <input type="number" min="0" step="0.01" value={c.amount} onChange={(e) => update(idx, "amount", e.target.value)} style={{ ...inputStyle, padding: "7px 9px", fontSize: 12.5, textAlign: "right" }} />
            </div>
          </div>
        </div>
      ))}

      <button onClick={handleSubmit} disabled={selecionados.length === 0} style={{ ...primaryBtn, marginTop: 6, background: selecionados.length ? COLORS.green : COLORS.line, color: selecionados.length ? "#fff" : COLORS.muted }}>
        Registrar pagamento da fatura ({fmt(total)})
      </button>
      <p style={{ fontSize: 11, color: COLORS.muted, margin: "8px 0 0" }}>Ajuste a data/valor aqui se precisar. Para mudar categoria, parcelas ou recorrência, toque no lápis do lançamento.</p>
    </ModalSheet>
  );
}
