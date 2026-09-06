import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { COLORS } from '../../constants/tokens';
import { TODAY_MONTH } from '../../constants/seedData';
import { addMonths, monthDiff, monthLabelFull } from '../../utils/formatters';

export function MonthNav({ month, onChange }) {
  const isFuture = monthDiff(TODAY_MONTH, month) > 0;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
      <button onClick={() => onChange(addMonths(month, -1))} aria-label="Mês anterior" style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid " + COLORS.line, background: COLORS.card, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.ink }}>
        <ChevronLeft size={16} />
      </button>
      <div style={{ textAlign: "center" }}>
        <p className="serif" style={{ fontSize: 16, fontWeight: 500, margin: 0, textTransform: "capitalize" }}>{monthLabelFull(month)}</p>
        {isFuture && <p style={{ fontSize: 11, color: COLORS.amber, margin: 0 }}>mês projetado</p>}
        {month === TODAY_MONTH && <p style={{ fontSize: 11, color: COLORS.muted, margin: 0 }}>mês atual</p>}
      </div>
      <button onClick={() => onChange(addMonths(month, 1))} aria-label="Próximo mês" style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid " + COLORS.line, background: COLORS.card, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.ink }}>
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
