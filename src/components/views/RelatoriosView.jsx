import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts';
import { COLORS, PRIORITY, DEFAULT_PRIORITY } from '../../constants/tokens';
import { useCategories } from '../../context/CategoriesContext';
import { fmt, monthKey, addMonths, monthLabel } from '../../utils/formatters';
import { SectionTitle } from '../ui/SectionTitle';
import { Card } from '../ui/Card';

const FIXED_CATS = new Set(["moradia", "contas", "assinaturas", "saude", "educacao"]);
const PERIODS = [["mes", "Este mês"], ["3m", "3 meses"], ["6m", "6 meses"], ["12m", "12 meses"], ["tudo", "Tudo"]];

export function RelatoriosView({ month, transactions, planned, sources }) {
  const [period, setPeriod] = useState("mes");
  const categories = useCategories();
  const tx = transactions || [];
  const plannedArr = planned || [];

  let months = null;
  if (period !== "tudo") {
    const n = period === "mes" ? 1 : period === "3m" ? 3 : period === "6m" ? 6 : 12;
    months = [];
    for (let i = n - 1; i >= 0; i--) months.push(addMonths(month, -i));
  }
  const txPeriod = months ? tx.filter((t) => months.includes(monthKey(t.date))) : tx;

  const expenses = txPeriod.filter((t) => t.type === "expense");
  const monthExpense = expenses.reduce((s, t) => s + t.amount, 0);

  const catMap = {};
  expenses.forEach((t) => { catMap[t.category] = (catMap[t.category] || 0) + t.amount; });
  const breakdown = Object.entries(catMap).map(([category, value]) => ({ category, value, color: categories[category]?.color || COLORS.green, name: categories[category]?.label || category })).sort((a, b) => b.value - a.value);

  let fixed = 0, variable = 0;
  expenses.forEach((t) => { if (FIXED_CATS.has(t.category)) fixed += t.amount; else variable += t.amount; });
  const recData = [{ name: "Fixas", value: fixed, color: "#3B6E8F" }, { name: "Variáveis", value: variable, color: "#C98A3B" }];

  const priMap = {};
  expenses.forEach((t) => { const p = DEFAULT_PRIORITY[t.category] || "importante"; priMap[p] = (priMap[p] || 0) + t.amount; });
  const priData = Object.entries(priMap).map(([p, value]) => ({ name: PRIORITY[p]?.label || p, value, color: PRIORITY[p]?.color || COLORS.muted }));

  const donoMap = {};
  txPeriod.forEach((t) => { const d = t.memberId == null ? "Casal" : (t.memberId === 1 ? "Você" : "Esposa"); donoMap[d] = donoMap[d] || { income: 0, expense: 0 }; if (t.type === "income") donoMap[d].income += t.amount; else if (t.type === "expense") donoMap[d].expense += t.amount; });

  const fonteMap = {};
  txPeriod.forEach((t) => { if (!t.fonteId) return; const name = (sources || []).find((s) => s.id === t.fonteId)?.name || "?"; fonteMap[name] = fonteMap[name] || { income: 0, expense: 0 }; if (t.type === "income") fonteMap[name].income += t.amount; else if (t.type === "expense") fonteMap[name].expense += t.amount; });

  const juros = [];
  plannedArr.forEach((p) => {
    const realizado = tx.filter((t) => t.plannedId === p.id).reduce((s, t) => s + t.amount, 0);
    const diff = realizado - p.amount;
    if (diff > 0) juros.push({ desc: p.description, previsto: p.amount, realizado, diff });
  });
  juros.sort((a, b) => b.diff - a.diff);

  let trendMonths;
  if (months) {
    trendMonths = months;
  } else {
    const set = new Set(tx.map((t) => monthKey(t.date)));
    trendMonths = [...set].sort();
    if (trendMonths.length > 12) trendMonths = trendMonths.slice(-12);
  }
  const trend = trendMonths.map((m) => {
    const inM = txPeriod.filter((t) => monthKey(t.date) === m);
    return { label: monthLabel(m), receitas: inM.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0), despesas: inM.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0) };
  });

  const tooltip = { fontSize: 12, borderRadius: 10, border: "1px solid " + COLORS.line };
  const totalOf = (data) => data.reduce((s, d) => s + d.value, 0);
  const donut = (data, height = 160) => (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
            {data.map((d, i) => <Cell key={i} fill={d.color} stroke="none" />)}
          </Pie>
          <Tooltip formatter={(v) => fmt(v)} contentStyle={tooltip} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
  const legend = (data) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
      {data.map((d) => (
        <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color }} />
          <span style={{ fontSize: 12.5, flex: 1 }}>{d.name}</span>
          <span style={{ fontSize: 12.5, fontWeight: 500 }}>{fmt(d.value)}</span>
          <span style={{ fontSize: 11, color: COLORS.muted, minWidth: 30, textAlign: "right" }}>{totalOf(data) > 0 ? Math.round((d.value / totalOf(data)) * 100) : 0}%</span>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <SectionTitle title="Relatórios" subtitle="Para onde vai o seu dinheiro" />

      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {PERIODS.map(([v, l]) => (
          <button key={v} onClick={() => setPeriod(v)} style={{ padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500, border: "1px solid " + (period === v ? COLORS.green : COLORS.line), background: period === v ? COLORS.green : "transparent", color: period === v ? "#fff" : COLORS.muted }}>{l}</button>
        ))}
      </div>

      <Card style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 6px" }}>Despesas por categoria</p>
        <p className="serif" style={{ fontSize: 20, fontWeight: 500, margin: "0 0 10px" }}>{fmt(monthExpense)}</p>
        {breakdown.length === 0 ? (
          <p style={{ fontSize: 13, color: COLORS.muted, textAlign: "center", padding: "20px 0" }}>Nenhuma despesa neste período.</p>
        ) : (
          <>
            {donut(breakdown)}
            {legend(breakdown)}
          </>
        )}
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 10px" }}>Despesas por recorrência</p>
        {monthExpense === 0 ? (
          <p style={{ fontSize: 13, color: COLORS.muted, textAlign: "center", padding: "20px 0" }}>Sem despesas neste período.</p>
        ) : (
          <>
            {donut(recData, 150)}
            {legend(recData)}
          </>
        )}
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 10px" }}>Evolução mensal</p>
        <div style={{ width: "100%", height: 180 }}>
          <ResponsiveContainer>
            <LineChart data={trend}>
              <CartesianGrid vertical={false} stroke={COLORS.line} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: COLORS.muted }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip formatter={(v) => fmt(v)} contentStyle={tooltip} />
              <Line type="monotone" dataKey="receitas" stroke={COLORS.green} strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="despesas" stroke={COLORS.rust} strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
          <span style={{ fontSize: 11, color: COLORS.green, display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 12, height: 3, background: COLORS.green, display: "inline-block" }} /> Receitas</span>
          <span style={{ fontSize: 11, color: COLORS.rust, display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 12, height: 3, background: COLORS.rust, display: "inline-block" }} /> Despesas</span>
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 10px" }}>Despesas por prioridade de pagamento</p>
        {priData.length === 0 ? (
          <p style={{ fontSize: 13, color: COLORS.muted, textAlign: "center", padding: "20px 0" }}>Sem despesas neste período.</p>
        ) : (
          <>
            {donut(priData, 150)}
            {legend(priData)}
          </>
        )}
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 10px" }}>Despesas e receitas por dono</p>
        {Object.keys(donoMap).length === 0 ? (
          <p style={{ fontSize: 13, color: COLORS.muted, textAlign: "center", padding: "20px 0" }}>Sem lançamentos neste período.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Object.entries(donoMap).map(([d, v]) => (
              <div key={d} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, flex: 1 }}>{d}</span>
                <span style={{ fontSize: 12, color: COLORS.green }}>+{fmt(v.income)}</span>
                <span style={{ fontSize: 12, color: COLORS.rust }}>−{fmt(v.expense)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 10px" }}>Despesas e receitas por fonte</p>
        {Object.keys(fonteMap).length === 0 ? (
          <p style={{ fontSize: 13, color: COLORS.muted, textAlign: "center", padding: "20px 0" }}>Nenhum lançamento com fonte neste período.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Object.entries(fonteMap).sort((a, b) => (b[1].expense + b[1].income) - (a[1].expense + a[1].income)).map(([f, v]) => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, flex: 1 }}>{f}</span>
                <span style={{ fontSize: 12, color: COLORS.green }}>+{fmt(v.income)}</span>
                <span style={{ fontSize: 12, color: COLORS.rust }}>−{fmt(v.expense)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 10px" }}>Despesas que mais estouraram o previsto</p>
        {juros.length === 0 ? (
          <p style={{ fontSize: 13, color: COLORS.muted, textAlign: "center", padding: "20px 0" }}>Nenhum estouro detectado (previsto × realizado).</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {juros.slice(0, 8).map((j) => (
              <div key={j.desc} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, margin: 0 }}>{j.desc}</p>
                  <p style={{ fontSize: 11, color: COLORS.muted, margin: 0 }}>Previsto {fmt(j.previsto)} · realizado {fmt(j.realizado)}</p>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.rust }}>+{fmt(j.diff)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
