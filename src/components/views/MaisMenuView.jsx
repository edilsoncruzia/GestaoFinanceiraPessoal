import React from 'react';
import { Landmark, Target, PieChart as PieChartIcon, LayoutGrid, TrendingUp, FileJson, ChevronRight, ArrowLeft } from 'lucide-react';
import { COLORS } from '../../constants/tokens';
import { SectionTitle } from '../ui/SectionTitle';

export function BackRow({ onBack }) {
  return (
    <button onClick={onBack} style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: 6, color: COLORS.muted, fontSize: 13, padding: 0, marginBottom: 14 }}>
      <ArrowLeft size={16} /> Voltar
    </button>
  );
}

export function MaisMenuView({ onSelect }) {
  const items = [
    ["contas", "Contas e cartões", Landmark],
    ["metas", "Metas", Target],
    ["relatorios", "Relatórios", PieChartIcon],
    ["regra", "Regra 50/30/20", LayoutGrid],
    ["projecao", "Projeção de meses futuros", TrendingUp],
    ["dados", "Exportar / importar dados", FileJson],
  ];
  return (
    <div>
      <SectionTitle title="Mais" />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map(([key, label, Icon]) => (
          <button key={key} onClick={() => onSelect(key)} style={{ background: COLORS.card, border: "1px solid " + COLORS.line, borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left" }}>
            <Icon size={18} color={COLORS.green} />
            <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{label}</span>
            <ChevronRight size={16} color={COLORS.muted} />
          </button>
        ))}
      </div>
    </div>
  );
}
