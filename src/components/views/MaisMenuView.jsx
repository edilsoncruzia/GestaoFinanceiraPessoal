import React from 'react';
import { Landmark, Target, PieChart as PieChartIcon, LayoutGrid, TrendingUp, FileJson, ChevronRight, ArrowLeft, Users, Tag, Receipt, Lightbulb, LogOut } from 'lucide-react';
import { COLORS } from '../../constants/tokens';
import { SectionTitle } from '../ui/SectionTitle';

export function BackRow({ onBack }) {
  return (
    <button onClick={onBack} style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: 6, color: COLORS.muted, fontSize: 13, padding: 0, marginBottom: 14 }}>
      <ArrowLeft size={16} /> Voltar
    </button>
  );
}

export function MaisMenuView({ onSelect, onLogout, userName }) {
  const items = [
    ["contas", "Contas e cartões", Landmark],
    ["categorias", "Categorias", Tag],
    ["declaracao", "Declaração de IR", Receipt],
    ["metas", "Metas", Target],
    ["relatorios", "Relatórios", PieChartIcon],
    ["regra", "Regra 50/30/20", LayoutGrid],
    ["projecao", "Projeção de meses futuros", TrendingUp],
    ["dados", "Exportar / importar dados", FileJson],
    ["fontes", "Fontes (quem recebe/paga)", Users],
    ["ajustes", "Ajustes e Melhorias", Lightbulb],
  ];
  return (
    <div>
      <SectionTitle title="Mais" />

      {onLogout && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: COLORS.card, border: "1px solid " + COLORS.line, borderRadius: 14, padding: "12px 16px", marginBottom: 14 }}>
          <div style={{ minWidth: 0, marginRight: 12 }}>
            <p style={{ fontSize: 11, color: COLORS.muted, margin: 0 }}>Logado como</p>
            <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: COLORS.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userName || "usuário"}</p>
          </div>
          <button onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, padding: "8px 14px", borderRadius: 10, border: "1px solid " + COLORS.rust, background: "transparent", color: COLORS.rust, flexShrink: 0 }}>
            <LogOut size={15} /> Sair
          </button>
        </div>
      )}

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
