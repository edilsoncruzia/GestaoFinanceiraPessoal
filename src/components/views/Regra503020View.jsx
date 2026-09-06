import React from 'react';
import { COLORS, NECESSIDADES, DESEJOS } from '../../constants/tokens';
import { fmt } from '../../utils/formatters';
import { SectionTitle } from '../ui/SectionTitle';
import { Card } from '../ui/Card';

export function Regra503020View({ income, expenses }) {
  const necessidades = expenses.filter((t) => NECESSIDADES.includes(t.category)).reduce((s, t) => s + t.amount, 0);
  const desejos = expenses.filter((t) => DESEJOS.includes(t.category)).reduce((s, t) => s + t.amount, 0);
  const poupanca = income - necessidades - desejos;
  const pct = (v) => income ? Math.round((v / income) * 100) : 0;

  const rows = [
    { label: "Necessidades", desc: "Moradia, contas, mercado, transporte, saúde", value: necessidades, target: 50, color: COLORS.green },
    { label: "Desejos", desc: "Lazer, assinaturas, compras não essenciais", value: desejos, target: 30, color: COLORS.amber },
    { label: "Poupança e investimentos", desc: "O que sobra para guardar ou investir", value: poupanca, target: 20, color: "#3B6E8F" },
  ];

  return (
    <div>
      <SectionTitle title="Regra 50/30/20" subtitle="50% necessidades · 30% desejos · 20% poupança" />
      <Card style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 13, color: COLORS.ink, margin: 0, lineHeight: 1.6 }}>
          A ideia é dividir a sua renda mensal em três blocos: metade para o essencial, quase um terço para o que dá prazer, e um quinto para guardar ou quitar dívidas. Comparamos abaixo sua renda de setembro com essa referência.
        </p>
      </Card>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.map((r) => {
          const actualPct = pct(r.value);
          const over = actualPct > r.target;
          return (
            <Card key={r.label}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 2 }}>
                <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{r.label}</p>
                <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: over ? COLORS.rust : r.color }}>{actualPct}% <span style={{ color: COLORS.muted, fontWeight: 400 }}>/ meta {r.target}%</span></p>
              </div>
              <p style={{ fontSize: 12, color: COLORS.muted, margin: "0 0 10px" }}>{r.desc}</p>
              <div style={{ position: "relative", height: 8, borderRadius: 6, background: COLORS.line, overflow: "hidden" }}>
                <div style={{ position: "absolute", left: Math.min(100, r.target) + "%", top: -2, width: 2, height: 12, background: COLORS.ink, opacity: 0.4 }} />
                <div style={{ height: "100%", width: Math.max(0, Math.min(100, actualPct)) + "%", background: over ? COLORS.rust : r.color, borderRadius: 6, transition: "width 0.4s ease" }} />
              </div>
              <p style={{ fontSize: 12, color: COLORS.muted, margin: "6px 0 0" }}>{fmt(r.value)}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
