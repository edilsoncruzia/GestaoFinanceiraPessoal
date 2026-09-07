import React, { useState } from 'react';
import {
  Wallet, EyeOff, Eye, Coins, CalendarClock, Info, ArrowUpRight,
  HeartPulse, Bell, AlertTriangle, TrendingUp, TrendingDown, Calendar,
  Plus, Tag, CheckCircle2, MoreVertical, Pencil, Trash2, CreditCard, Download, Users, User
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { COLORS, CATEGORIES, PRIORITY, DEFAULT_PRIORITY } from '../../constants/tokens';
import { TODAY_DATE } from '../../constants/seedData';
import { fmt, fmtDate, inScope, displayStatus, recurrenceIcon, recurrenceLabel, memberLabel, plannedStatus } from '../../utils/formatters';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { HealthGauge } from '../ui/HealthGauge';
import { CategoryIcon } from '../ui/CategoryIcon';

export function PlannedCard({ item, onPay, onEdit, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const st = displayStatus(item);
  const RecIcon = recurrenceIcon(item);
  const pct = Math.min(100, (item.paid / item.amount) * 100);
  const catColor = CATEGORIES[item.category]?.color || COLORS.green;
  const prio = PRIORITY[item.priority] || PRIORITY.importante;
  const isCouple = item.memberId == null;
  const MemberIcon = isCouple ? Users : User;

  if (confirming) {
    return (
      <Card style={{ padding: "12px 14px", borderColor: COLORS.rust }}>
        <p style={{ fontSize: 13, margin: "0 0 10px", color: COLORS.rust }}>Excluir "{item.description}"?</p>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setConfirming(false)} style={{ flex: 1, fontSize: 12, padding: "8px 0", borderRadius: 8, border: "1px solid " + COLORS.line, background: "transparent", color: COLORS.muted }}>Cancelar</button>
          <button onClick={() => { onDelete(item, "current"); setConfirming(false); }} style={{ flex: 1, fontSize: 12, padding: "8px 0", borderRadius: 8, border: "1px solid " + COLORS.green, background: "transparent", color: COLORS.green, fontWeight: 500 }}>Apenas este mês</button>
          <button onClick={() => { onDelete(item, "all"); setConfirming(false); }} style={{ flex: 1, fontSize: 12, padding: "8px 0", borderRadius: 8, border: "none", background: COLORS.rust, color: "#fff", fontWeight: 500 }}>Todos os futuros</button>
        </div>
      </Card>
    );
  }

  return (
    <Card style={{ borderLeft: "4px solid " + catColor, position: "relative", padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
        <CategoryIcon cat={item.category} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="serif" style={{ fontSize: 15.5, fontWeight: 600, margin: 0, color: COLORS.ink }}>{item.description}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
            <RecIcon size={12} color={COLORS.muted} />
            <span style={{ fontSize: 12, color: COLORS.muted }}>{recurrenceLabel(item)} · vence {fmtDate(item.dueDate)}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5, flexWrap: "wrap" }}>
            <MemberIcon size={12} color={COLORS.muted} />
            <span style={{ fontSize: 12, color: COLORS.muted }}>{memberLabel(item.memberId)}</span>
            <span style={{ color: COLORS.line }}>|</span>
            <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: prio.color + "1A", color: prio.color }}>{prio.label}</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
          <Badge color={st.color}>{st.label}</Badge>
          <button onClick={() => setMenuOpen((v) => !v)} aria-label="Mais opções" className="icon-btn" style={{ background: "none", border: "none", padding: 4, color: COLORS.muted }}><MoreVertical size={16} /></button>
        </div>
        {menuOpen && (
          <div style={{ position: "absolute", top: 40, right: 14, background: COLORS.card, border: "1px solid " + COLORS.line, borderRadius: 10, boxShadow: "0 6px 18px rgba(0,0,0,0.12)", zIndex: 3, overflow: "hidden" }}>
            <button onClick={() => { setMenuOpen(false); onEdit(item); }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 14px", background: "none", border: "none", fontSize: 13, color: COLORS.ink, whiteSpace: "nowrap" }}><Pencil size={14} />Editar</button>
            <button onClick={() => { setMenuOpen(false); setConfirming(true); }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 14px", background: "none", border: "none", borderTop: "1px solid " + COLORS.line, fontSize: 13, color: COLORS.rust, whiteSpace: "nowrap" }}><Trash2 size={14} />Excluir</button>
          </div>
        )}
      </div>
      <p className="serif" style={{ fontSize: 24, fontWeight: 600, margin: "0 0 8px", color: COLORS.ink }}>{fmt(item.amount)}</p>
      <ProgressBar pct={pct} color={st.color} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
        <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}>{fmt(item.paid)} de {fmt(item.amount)}</p>
        {st.state !== "pago" && st.state !== "excedido" && (
          item.type === "income" ? (
            <button onClick={() => onPay(item)} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, padding: "8px 14px", borderRadius: 20, border: "none", background: COLORS.green, color: "#fff", fontWeight: 600 }}>
              <Download size={13} />Registrar recebimento
            </button>
          ) : (
            <button onClick={() => onPay(item)} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, padding: "8px 14px", borderRadius: 20, border: "1px solid " + COLORS.green, background: COLORS.green + "12", color: COLORS.green, fontWeight: 600 }}>
              <CreditCard size={13} />Registrar pagamento
            </button>
          )
        )}
      </div>
    </Card>
  );
}

export function InicioView({ balance, availableNow, monthProjection, isCurrentMonth, health, alerts, monthIncome, monthExpense, trend, openItems: allOpenItems, memberFilter, hideBalance, onToggleHide, onSeeAll, onPay, onEditPlanned, onDeletePlanned, onNewPlanned, onCloseMonth }) {
  const [sortBy, setSortBy] = useState("vencimento");
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const hasProjected = trend.some((t) => t.projected);
  const mask = (v) => (hideBalance ? "R$ • • • • •" : fmt(v));
  const openItems = allOpenItems
    .filter((i) => inScope(i.memberId, memberFilter))
    .map((i) => ({ ...i, priority: i.priority || DEFAULT_PRIORITY[i.category] || "importante" }))
    .sort((a, b) => {
      if (sortBy === "prioridade") {
        const pa = PRIORITY[a.priority].rank, pb = PRIORITY[b.priority].rank;
        if (pa !== pb) return pa - pb;
      }
      return a.dueDate < b.dueDate ? -1 : 1;
    });
  const endPositive = monthProjection.endBalance >= 0;
  const openTotal = openItems.reduce((s, i) => s + (i.amount - i.paid), 0);
  const dueThisWeek = openItems.filter((i) => {
    const diff = Math.round((new Date(i.dueDate + "T00:00:00") - new Date(TODAY_DATE + "T00:00:00")) / 86400000);
    return diff >= 0 && diff <= 7;
  }).length;

  return (
    <div>
      <p style={{ fontSize: 14, color: COLORS.muted, margin: "0 0 12px" }}>{greeting}</p>

      <Card style={{ marginBottom: alerts.length ? 10 : 18, padding: 0, overflow: "hidden" }}>
        <div style={{ display: "flex" }}>
          <div style={{ flex: "1 1 58%", padding: "18px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: COLORS.green + "1E", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Wallet size={19} color={COLORS.green} />
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, margin: 0, color: COLORS.ink, flex: 1 }}>Livre para usar agora</p>
              <button onClick={onToggleHide} aria-label={hideBalance ? "Mostrar saldo" : "Ocultar saldo"} className="icon-btn" style={{ background: "none", border: "none", padding: 2, color: COLORS.muted, display: "flex" }}>
                {hideBalance ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="serif" style={{ fontSize: 32, fontWeight: 600, margin: "0 0 12px", color: availableNow >= 0 ? COLORS.green : COLORS.rust }}>{mask(availableNow)}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: COLORS.green + "12", borderRadius: 10, padding: "8px 12px", marginBottom: 16 }}>
              <Coins size={15} color={COLORS.green} />
              <span style={{ fontSize: 12.5, color: COLORS.ink }}>Saldo em conta: <strong>{mask(balance)}</strong></span>
            </div>

            <div style={{ height: 1, background: COLORS.line, margin: "0 0 16px" }} />

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#3B6E8F1E", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <CalendarClock size={19} color="#3B6E8F" />
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, margin: 0, color: COLORS.ink, flex: 1, lineHeight: 1.25 }}>Projeção para o final do mês</p>
              <Info size={15} color={COLORS.muted} />
            </div>
            <p className="serif" style={{ fontSize: 26, fontWeight: 600, margin: "0 0 10px", color: endPositive ? COLORS.green : COLORS.rust }}>{mask(monthProjection.endBalance)}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#3B6E8F12", borderRadius: 10, padding: "8px 12px" }}>
              <ArrowUpRight size={15} color={COLORS.green} />
              <span style={{ fontSize: 12, color: COLORS.ink }}>Faltam receber {mask(monthProjection.pendingIncome)} · Faltam pagar {mask(monthProjection.pendingExpense)}</span>
            </div>
          </div>

          <div style={{ width: 1, background: COLORS.line, margin: "16px 0" }} />

          <div style={{ flex: "1 1 42%", padding: "18px 14px", background: "#3B6E8F0A", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, alignSelf: "flex-start", marginBottom: 8 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: "#3B6E8F1E", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <HeartPulse size={17} color="#3B6E8F" />
              </div>
              <p style={{ fontSize: 13.5, fontWeight: 700, margin: 0, color: COLORS.ink, lineHeight: 1.2 }}>Saúde<br />financeira</p>
            </div>
            <HealthGauge score={health.score} />
            <p className="serif" style={{ fontSize: 30, fontWeight: 600, margin: "2px 0 8px", color: COLORS.ink }}>{health.score}</p>
            <span style={{ fontSize: 13, fontWeight: 700, padding: "5px 16px", borderRadius: 20, background: health.color + "1E", color: health.color, marginBottom: 10 }}>{health.shortLabel}</span>
            <p style={{ fontSize: 11.5, color: COLORS.muted, margin: 0, textAlign: "center", lineHeight: 1.4 }}>
              {health.poupancaPct >= 0 ? "guardando " + health.poupancaPct + "% da renda" : "gastando " + Math.abs(health.poupancaPct) + "% além da renda"}
            </p>
          </div>
        </div>
      </Card>

      {alerts.length > 0 && (
        <Card style={{ marginBottom: 18, padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <Bell size={14} color={COLORS.ink} />
            <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>Alertas de hoje</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {alerts.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                <AlertTriangle size={13} color={a.level === "rust" ? COLORS.rust : COLORS.amber} style={{ marginTop: 1, flexShrink: 0 }} />
                <span style={{ fontSize: 12.5, color: COLORS.ink, lineHeight: 1.4 }}>{a.text}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
        <Card style={{ padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><TrendingUp size={14} color={COLORS.green} /><span style={{ fontSize: 12, color: COLORS.muted }}>Receitas (mês)</span></div>
          <p style={{ fontSize: 18, fontWeight: 600, margin: 0, color: COLORS.green }}>{mask(monthIncome)}</p>
        </Card>
        <Card style={{ padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><TrendingDown size={14} color={COLORS.rust} /><span style={{ fontSize: 12, color: COLORS.muted }}>Despesas (mês)</span></div>
          <p style={{ fontSize: 18, fontWeight: 600, margin: 0, color: COLORS.rust }}>{mask(monthExpense)}</p>
        </Card>
      </div>

      <Card style={{ marginBottom: 18 }}>
        <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 10px" }}>Receitas x despesas — últimos 6 meses</p>
        <div style={{ width: "100%", height: 150 }}>
          <ResponsiveContainer>
            <BarChart data={trend} barGap={4}>
              <CartesianGrid vertical={false} stroke={COLORS.line} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: COLORS.muted }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid " + COLORS.line }} />
              <Bar dataKey="receitas" fill={COLORS.green} radius={[4, 4, 0, 0]}>
                {trend.map((d, i) => <Cell key={i} fillOpacity={d.projected ? 0.4 : 1} />)}
              </Bar>
              <Bar dataKey="despesas" fill={COLORS.rust} radius={[4, 4, 0, 0]}>
                {trend.map((d, i) => <Cell key={i} fillOpacity={d.projected ? 0.4 : 1} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {hasProjected && <p style={{ fontSize: 11, color: COLORS.muted, margin: "8px 0 0" }}>Barras mais claras = projeção com base no Previsto, sem transação lançada ainda.</p>}
      </Card>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: COLORS.green + "1E", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Wallet size={21} color={COLORS.green} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <p className="serif" style={{ fontSize: 19, fontWeight: 600, margin: 0, color: COLORS.ink }}>Contas em aberto</p>
              {openItems.length > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.green, background: COLORS.green + "1E", borderRadius: 20, padding: "1px 10px" }}>{openItems.length}</span>}
            </div>
            <p style={{ fontSize: 12, color: COLORS.muted, margin: "2px 0 0" }}>deste mês e dos últimos 6, enquanto não forem pagas</p>
          </div>
        </div>

      </div>

      {openItems.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", background: COLORS.green + "12", borderRadius: 14, padding: "14px 16px", marginBottom: 14, gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
            <Coins size={18} color={COLORS.green} />
            <div>
              <p style={{ fontSize: 17, fontWeight: 700, margin: 0, color: COLORS.ink }}>{mask(openTotal)}</p>
              <p style={{ fontSize: 11.5, color: COLORS.muted, margin: 0 }}>em aberto</p>
            </div>
          </div>
          <div style={{ width: 1, height: 34, background: COLORS.line }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
            <Calendar size={18} color="#3B6E8F" />
            <div>
              <p style={{ fontSize: 17, fontWeight: 700, margin: 0, color: COLORS.ink }}>{dueThisWeek}</p>
              <p style={{ fontSize: 11.5, color: COLORS.muted, margin: 0 }}>vencem esta semana</p>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {[["vencimento", "Vencimento", CalendarClock], ["prioridade", "Prioridade", Tag]].map(([v, l, Icon]) => (
          <button key={v} onClick={() => setSortBy(v)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, fontWeight: 500, padding: "9px 0", borderRadius: 20, border: "1px solid " + (sortBy === v ? COLORS.green : COLORS.line), background: sortBy === v ? COLORS.green : "transparent", color: sortBy === v ? "#fff" : COLORS.muted }}>
            <Icon size={14} />{l}
          </button>
        ))}
        <button onClick={onCloseMonth} aria-label="Fechar mês" className="icon-btn" style={{ background: "none", border: "1px solid " + COLORS.line, borderRadius: 20, padding: "0 12px", color: COLORS.muted, display: "flex", alignItems: "center" }}><CheckCircle2 size={15} /></button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {openItems.length === 0 && (
          <Card style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CheckCircle2 size={18} color={COLORS.green} />
            <p style={{ fontSize: 13, margin: 0 }}>Tudo em dia por aqui — nada pendente.</p>
          </Card>
        )}
        {openItems.map((item) => <PlannedCard key={item.occId} item={item} onPay={onPay} onEdit={onEditPlanned} onDelete={onDeletePlanned} />)}
      </div>
    </div>
  );
}
