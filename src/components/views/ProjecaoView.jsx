import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Line } from 'recharts';
import { COLORS } from '../../constants/tokens';
import { TODAY_MONTH } from '../../constants/seedData';
import { fmt, addMonths, monthLabel, monthLabelFull, monthlyCashFlow } from '../../utils/formatters';
import { SectionTitle } from '../ui/SectionTitle';
import { MemberFilterBar } from '../ui/MemberFilterBar';
import { Card } from '../ui/Card';

export function ProjecaoView({ planned, transactions, balance, memberFilter, setMemberFilter }) {
  const [horizon, setHorizon] = useState(6);
  const startMonth = addMonths(TODAY_MONTH, 1);

  const rows = useMemo(() => {
    const months = Array.from({ length: horizon }, (_, i) => addMonths(startMonth, i));
    let acumulado = balance;
    return months.map((m) => {
      // Salário entra sempre pelo valor LÍQUIDO (os arrays já chegam sem contas-reserva).
      const flow = monthlyCashFlow(m, transactions, planned, memberFilter, []);
      acumulado = acumulado + flow.receitas - flow.despesas;
      return { month: m, label: monthLabel(m), receitas: flow.receitas, despesas: flow.despesas, saldoAcumulado: acumulado, projected: flow.projected };
    });
  }, [horizon, startMonth, planned, transactions, balance, memberFilter]);

  const finalRow = rows[rows.length - 1];
  const firstNegative = rows.find((r) => r.saldoAcumulado < 0);

  return (
    <div>
      <SectionTitle title="Projeção" subtitle={"A partir de " + monthLabelFull(startMonth) + ", com base no que já está no Previsto (salário pelo valor líquido)"} />
      <MemberFilterBar value={memberFilter} onChange={setMemberFilter} />
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[[3, "3 meses"], [6, "6 meses"], [12, "12 meses"]].map(([v, l]) => (
          <button key={v} onClick={() => setHorizon(v)} style={{ flex: 1, padding: "8px 0", borderRadius: 20, fontSize: 13, fontWeight: 500, border: "1px solid " + (horizon === v ? COLORS.green : COLORS.line), background: horizon === v ? COLORS.green : "transparent", color: horizon === v ? "#fff" : COLORS.muted }}>{l}</button>
        ))}
      </div>

      {finalRow && (
        <Card style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: COLORS.muted, margin: "0 0 4px" }}>Saldo projetado em {monthLabelFull(finalRow.month)}</p>
          <p className="serif" style={{ fontSize: 30, fontWeight: 500, margin: "0 0 6px", color: finalRow.saldoAcumulado >= 0 ? COLORS.green : COLORS.rust }}>{fmt(finalRow.saldoAcumulado)}</p>
          {firstNegative
            ? <p style={{ fontSize: 12, color: COLORS.rust, margin: 0 }}>Atenção: no ritmo atual de compromissos previstos, o saldo fica negativo em {monthLabelFull(firstNegative.month)}.</p>
            : <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}>Considerando salários, aluguel, contas e parcelas já cadastrados no Previsto.</p>}
        </Card>
      )}

      <Card style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 10px" }}>Receitas x despesas projetadas</p>
        <div style={{ width: "100%", height: 170 }}>
          <ResponsiveContainer>
            <ComposedChart data={rows} barGap={4}>
              <CartesianGrid vertical={false} stroke={COLORS.line} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: COLORS.muted }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid " + COLORS.line }} />
              <Bar dataKey="receitas" fill={COLORS.green} radius={[4, 4, 0, 0]} fillOpacity={0.75} />
              <Bar dataKey="despesas" fill={COLORS.rust} radius={[4, 4, 0, 0]} fillOpacity={0.75} />
              <Line type="monotone" dataKey="saldoAcumulado" stroke={COLORS.ink} strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <p style={{ fontSize: 11, color: COLORS.muted, margin: "8px 0 0" }}>A linha escura é o saldo acumulado da família mês a mês.</p>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {rows.map((r) => (
          <Card key={r.month} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px" }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 500, margin: 0, textTransform: "capitalize" }}>{monthLabelFull(r.month)}</p>
              <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}><span style={{ color: COLORS.green }}>+{fmt(r.receitas)}</span> · <span style={{ color: COLORS.rust }}>−{fmt(r.despesas)}</span></p>
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: r.saldoAcumulado >= 0 ? COLORS.green : COLORS.rust }}>{fmt(r.saldoAcumulado)}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
