import React from 'react';
import { PiggyBank } from 'lucide-react';
import { COLORS, CATEGORIES } from '../../constants/tokens';
import { fmt, statusFor, inScope } from '../../utils/formatters';
import { SectionTitle } from '../ui/SectionTitle';
import { Card } from '../ui/Card';
import { CategoryIcon } from '../ui/CategoryIcon';
import { MemberBadge } from '../ui/MemberBadge';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';

export function OrcamentoView({ budgets: allBudgets, memberFilter }) {
  const budgets = allBudgets.filter((b) => inScope(b.memberId, memberFilter));
  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const totalLeft = Math.max(0, totalLimit - totalSpent);

  return (
    <div>
      <SectionTitle title="Orçamento" subtitle="Limites por categoria neste mês" />
      {totalLeft > 0 && (
        <Card style={{ marginBottom: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <PiggyBank size={16} color={COLORS.amber} />
          <p style={{ fontSize: 12.5, margin: 0, color: COLORS.ink }}>{fmt(totalLeft)} ainda reservados desses orçamentos — descontados do "saldo disponível" na Início</p>
        </Card>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {budgets.map((b) => {
          const c = CATEGORIES[b.category];
          const st = statusFor(b.spent, b.limit);
          const pct = Math.min(100, (b.spent / b.limit) * 100);
          return (
            <Card key={b.category + "-" + (b.memberId ?? "casal")}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <CategoryIcon cat={b.category} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{c ? c.label : b.category}</p>
                  <p style={{ fontSize: 12, color: COLORS.muted, margin: "0 0 2px" }}>{fmt(b.spent)} de {fmt(b.limit)}</p>
                  <MemberBadge memberId={b.memberId} />
                </div>
                <Badge color={st.color}>{st.label}</Badge>
              </div>
              <ProgressBar pct={pct} color={st.color} />
              {st.state === "over" && <p style={{ fontSize: 12, color: COLORS.rust, margin: "6px 0 0" }}>Ultrapassou em {fmt(b.spent - b.limit)}</p>}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
