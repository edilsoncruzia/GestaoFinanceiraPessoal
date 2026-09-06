import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, CartesianGrid, XAxis, YAxis } from 'recharts';
import { COLORS } from '../../constants/tokens';
import { fmt } from '../../utils/formatters';
import { SectionTitle } from '../ui/SectionTitle';
import { Card } from '../ui/Card';

export function RelatoriosView({ trend, breakdown, total }) {
  return (
    <div>
      <SectionTitle title="Relatórios" subtitle="Para onde vai o seu dinheiro" />
      <Card style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 6px" }}>Despesas por categoria (mês selecionado)</p>
        <p className="serif" style={{ fontSize: 20, fontWeight: 500, margin: "0 0 10px" }}>{fmt(total)}</p>
        {breakdown.length === 0 ? (
          <p style={{ fontSize: 13, color: COLORS.muted, textAlign: "center", padding: "20px 0" }}>Nenhuma despesa lançada neste mês ainda.</p>
        ) : (
          <div style={{ width: "100%", height: 180 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={breakdown} dataKey="value" nameKey="label" innerRadius={45} outerRadius={75} paddingAngle={2}>
                  {breakdown.map((d, i) => <Cell key={i} fill={d.color} stroke="none" />)}
                </Pie>
                <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid " + COLORS.line }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
          {breakdown.map((d) => (
            <div key={d.category} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color }} />
              <span style={{ fontSize: 13, flex: 1 }}>{d.label}</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{fmt(d.value)}</span>
              <span style={{ fontSize: 12, color: COLORS.muted, minWidth: 34, textAlign: "right" }}>{total > 0 ? Math.round((d.value / total) * 100) : 0}%</span>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 10px" }}>Evolução mensal</p>
        <div style={{ width: "100%", height: 160 }}>
          <ResponsiveContainer>
            <BarChart data={trend} barGap={4}>
              <CartesianGrid vertical={false} stroke={COLORS.line} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: COLORS.muted }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid " + COLORS.line }} />
              <Bar dataKey="receitas" fill={COLORS.green} radius={[4, 4, 0, 0]} />
              <Bar dataKey="despesas" fill={COLORS.rust} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
