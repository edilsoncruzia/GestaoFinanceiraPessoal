import React from 'react';
import { PiggyBank, Plus } from 'lucide-react';
import { COLORS } from '../../constants/tokens';
import { fmt, inScope } from '../../utils/formatters';
import { SectionTitle } from '../ui/SectionTitle';
import { Card } from '../ui/Card';
import { MemberBadge } from '../ui/MemberBadge';
import { ProgressBar } from '../ui/ProgressBar';

export function MetasView({ goals: allGoals, memberFilter, accounts, onContribute, onNewGoal }) {
  const goals = allGoals.filter((g) => inScope(g.memberId, memberFilter));
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <SectionTitle title="Metas" subtitle="Seus objetivos de economia" />
        <button onClick={onNewGoal} style={{ fontSize: 12, padding: "6px 10px", borderRadius: 8, border: "1px solid " + COLORS.line, background: COLORS.card, color: COLORS.ink, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
          <Plus size={13} /> Nova meta
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {goals.length === 0 && <p style={{ fontSize: 13, color: COLORS.muted, textAlign: "center", padding: "24px 0" }}>Nenhuma meta neste filtro ainda.</p>}
        {goals.map((g) => {
          const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
          const done = g.saved >= g.target;
          const account = accounts.find((a) => a.id === g.accountId);
          return (
            <Card key={g.id}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: COLORS.green + "1E", display: "flex", alignItems: "center", justifyContent: "center" }}><PiggyBank size={18} color={COLORS.green} /></div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{g.name}</p>
                  <p style={{ fontSize: 12, color: COLORS.muted, margin: "0 0 2px" }}>{fmt(g.saved)} de {fmt(g.target)}{account ? " · guardado em " + account.name : ""}</p>
                  <MemberBadge memberId={g.memberId} />
                </div>
                {done ? <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.green }}>Concluída</span> : <button onClick={() => onContribute(g)} style={{ fontSize: 12, padding: "6px 10px", borderRadius: 8, border: "1px solid " + COLORS.green, background: "transparent", color: COLORS.green, fontWeight: 500 }}>Contribuir</button>}
              </div>
              <ProgressBar pct={pct} color={COLORS.green} />
            </Card>
          );
        })}
      </div>
    </div>
  );
}
