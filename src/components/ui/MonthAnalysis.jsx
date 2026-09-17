import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { COLORS, RADIUS } from "../../constants/tokens";

// ============================================================================
// MonthAnalysis — "Análise do mês": a tendência dos próximos 12 meses.
//
// Antes era um bloco recolhível (<details>) com um BarChart do Recharts, um
// parágrafo explicando as barras claras, mais três parágrafos condicionais
// ("cadastre receitas…", "atenção: o saldo fica negativo…", "em todos os meses
// o saldo fecha positivo"), mais os três KPIs do ritmo de gasto do mercado.
//
// Agora é o painel do protótipo: doze barras, mês atual mais escuro, projeção
// mais clara, negativo em vermelho, uma legenda de três itens e UMA linha de
// leitura. O ritmo de gasto do mercado saiu daqui — virou o card "Mercado" ao
// lado da reserva, logo abaixo do gráfico, que é onde ele é consultado.
//
// O toque na barra saiu junto: eram 12 alvos de ~22px, abaixo dos 44px que o
// dedo precisa. Quem manda no mês é o seletor de mês do topo.
//
// Props:
//   meses  [{ month, label, saldo, projected?, negative? }]  — 12 itens
//   moeda  formatador
// ============================================================================

export function MonthAnalysis({ meses = [], moeda = (v) => "R$ " + v }) {
  if (!meses.length) return null;

  const saldos = meses.map((m) => Number(m.saldo) || 0);
  const lo = Math.min(0, ...saldos);
  const hi = Math.max(0, ...saldos);
  const span = hi - lo || 1;
  const alturaPct = (v) => 14 + ((v - lo) / span) * 86;   // 14%..100% da caixa
  const zeroPct = ((0 - lo) / span) * 100;                // onde fica a linha do zero
  const temNegativo = lo < 0;

  const pior = meses.reduce((a, m) => (Number(m.saldo) < Number(a.saldo) ? m : a), meses[0]);
  const negativo = temNegativo && Number(pior.saldo) < 0;

  const rotulos = [0, Math.floor((meses.length - 1) / 2), meses.length - 1];

  return (
    <section
      data-od-id="card-analise-do-mes"
      aria-labelledby="titulo-analise"
      style={{
        background: COLORS.surface, border: "1px solid " + COLORS.border,
        borderRadius: RADIUS.card, padding: "16px 16px 14px",
        boxShadow: "0 1px 2px rgba(21,19,42,.04)",
      }}
    >
      <h2 id="titulo-analise" style={{
        margin: 0, fontFamily: "var(--font-display)", fontSize: 16.5, fontWeight: 800,
        letterSpacing: "-0.025em", color: COLORS.ink,
      }}>
        Saldo nos próximos 12 meses
      </h2>
      <p style={{ margin: "3px 0 0", fontSize: 13, color: COLORS.muted, fontWeight: 500 }}>
        Tendência com as recorrências já cadastradas
      </p>

      <div style={{ position: "relative", display: "flex", alignItems: "flex-end", gap: 5, height: 84, marginTop: 16 }}>
        {temNegativo && (
          <span aria-hidden="true" style={{
            position: "absolute", left: 0, right: 0, bottom: zeroPct + "%",
            borderTop: "1px dashed " + COLORS.borderSoft,
          }} />
        )}
        {meses.map((m, i) => {
          const v = Number(m.saldo) || 0;
          const cor = v < 0 ? COLORS.expense : m.projected ? "#C4B5FD" : COLORS.accent;
          return (
            <span
              key={m.month || i}
              title={(m.label || "") + " · " + moeda(v)}
              style={{
                flex: 1, minWidth: 0, height: alturaPct(v) + "%",
                borderRadius: "6px 6px 3px 3px", background: cor,
              }}
            />
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12, color: COLORS.muted, fontWeight: 600 }}>
        {rotulos.map((i) => <span key={i}>{meses[i].label}</span>)}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginTop: 12, fontSize: 12.5, color: COLORS.muted }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <i style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.accent }} />mês atual
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <i style={{ width: 8, height: 8, borderRadius: "50%", background: "#C4B5FD" }} />projeção
        </span>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5, marginLeft: "auto",
          fontWeight: 700, color: negativo ? COLORS.expense : COLORS.income,
        }}>
          {negativo ? <TrendingDown size={13} /> : <TrendingUp size={13} />}
          {negativo
            ? "Fecha negativo em " + pior.label + " (" + moeda(pior.saldo) + ")"
            : "Nenhum mês fecha negativo"}
        </span>
      </div>
    </section>
  );
}

export default MonthAnalysis;
