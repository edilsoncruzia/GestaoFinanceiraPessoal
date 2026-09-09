import React from 'react';
import { COLORS } from '../../constants/tokens';

const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid " + COLORS.line, background: COLORS.card, fontSize: 14, outline: "none" };

function grp(sources, type) {
  return (sources || [])
    .filter((s) => (type ? s.type === type : (s.type !== "income" && s.type !== "expense")))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }));
}

// Select de fontes agrupado por Despesa/Receita e ordenado alfabeticamente.
export function SourceSelect({ sources, value, onChange, allowEmpty = true }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle}>
      {allowEmpty && <option value="">Sem fonte</option>}
      {grp(sources, "expense").length > 0 && (
        <optgroup label="Despesas">
          {grp(sources, "expense").map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </optgroup>
      )}
      {grp(sources, "income").length > 0 && (
        <optgroup label="Receitas">
          {grp(sources, "income").map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </optgroup>
      )}
      {grp(sources, null).length > 0 && (
        <optgroup label="Sem tipo">
          {grp(sources, null).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </optgroup>
      )}
    </select>
  );
}
