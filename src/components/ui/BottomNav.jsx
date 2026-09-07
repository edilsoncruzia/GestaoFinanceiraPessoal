import React from 'react';
import { Home, ListChecks, PieChart as PieChartIcon, LayoutGrid, Plus } from 'lucide-react';
import { COLORS } from '../../constants/tokens';

export function BottomNav({ tab, setTab, onAdd }) {
  const left = [
    ["inicio", "Início", Home],
    ["transacoes", "Transações", ListChecks],
  ];
  const right = [
    ["orcamento", "Orçamento", PieChartIcon],
    ["mais", "Mais", LayoutGrid],
  ];
  const navBtn = ([key, label, Icon]) => (
    <button key={key} onClick={() => setTab(key)} style={{ flex: 1, background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: tab === key ? COLORS.green : COLORS.muted }}>
      <Icon size={19} strokeWidth={tab === key ? 2.3 : 2} />
      <span style={{ fontSize: 9.5, fontWeight: tab === key ? 600 : 400 }}>{label}</span>
    </button>
  );

  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, background: COLORS.card, borderTop: "1px solid " + COLORS.line, display: "flex", alignItems: "center", padding: "10px 2px 14px" }}>
      {left.map(navBtn)}
      <button onClick={onAdd} aria-label="Novo previsto" style={{ flex: 1, background: "none", border: "none", position: "relative" }}>
        <span style={{ width: 54, height: 54, borderRadius: "50%", background: COLORS.green, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", boxShadow: "0 8px 18px rgba(31,93,76,0.45)", marginTop: -26 }}>
          <Plus size={28} strokeWidth={2.5} />
        </span>
      </button>
      {right.map(navBtn)}
    </div>
  );
}
