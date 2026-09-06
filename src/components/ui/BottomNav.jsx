import React from 'react';
import { Home, ListChecks, PieChart as PieChartIcon, LayoutGrid } from 'lucide-react';
import { COLORS } from '../../constants/tokens';

export function BottomNav({ tab, setTab }) {
  const items = [
    ["inicio", "Início", Home],
    ["transacoes", "Transações", ListChecks],
    ["orcamento", "Orçamento", PieChartIcon],
    ["mais", "Mais", LayoutGrid],
  ];
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, background: COLORS.card, borderTop: "1px solid " + COLORS.line, display: "flex", padding: "10px 2px 14px" }}>
      {items.map(([key, label, Icon]) => (
        <button key={key} onClick={() => setTab(key)} style={{ flex: 1, background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: tab === key ? COLORS.green : COLORS.muted }}>
          <Icon size={19} strokeWidth={tab === key ? 2.3 : 2} />
          <span style={{ fontSize: 9.5, fontWeight: tab === key ? 600 : 400 }}>{label}</span>
        </button>
      ))}
    </div>
  );
}
