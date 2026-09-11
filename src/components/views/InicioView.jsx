import React, { useState, useRef } from 'react';
import {
  Wallet, EyeOff, Eye, Coins, CalendarClock, Clock, Info, ArrowUpRight, ArrowDownLeft, ChevronRight,
  HeartPulse, Bell, AlertTriangle, TrendingUp, TrendingDown, Calendar,
  Plus, Tag, CheckCircle2, MoreVertical, Pencil, Trash2, CreditCard, Download, Users, User, PiggyBank, ShoppingCart, CalendarDays
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, LabelList, CartesianGrid, XAxis, YAxis, Tooltip, Cell, ReferenceLine, LineChart, Line } from 'recharts';
import { COLORS, PRIORITY, DEFAULT_PRIORITY } from '../../constants/tokens';
import { useCategories } from '../../context/CategoriesContext';
import { TODAY_DATE } from '../../constants/seedData';
import { fmt, fmtDate, round2, inScope, displayStatus, recurrenceIcon, recurrenceLabel, memberLabel, plannedStatus, monthLabelFull } from '../../utils/formatters';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { HealthGauge } from '../ui/HealthGauge';
import { CategoryIcon } from '../ui/CategoryIcon';
import { ModalSheet } from '../ui/ModalSheet';

// Valor sem "R$" (apenas o número) para o rótulo de cada barra.
const fmtPlain = (v) => {
  if (v == null) return "";
  const n = Math.abs(v).toLocaleString("pt-BR", { maximumFractionDigits: 0, minimumFractionDigits: 0 });
  return (v < 0 ? "-" : "") + n;
};

// Rótulo de cada barra, na VERTICAL — sem "R$" e com fonte maior.
const renderBarLabel = (props) => {
  const { x, y, width, value } = props;
  if (value == null) return null;
  const cx = x + width / 2;
  const cy = y - 6;
  return (
    <text x={cx} y={cy} textAnchor="start" fill={value < 0 ? COLORS.rust : COLORS.green}
      fontSize={11} fontWeight={600} transform={'rotate(-90 ' + cx + ' ' + cy + ')'}
      style={{ fontVariantNumeric: "tabular-nums" }}>
      {fmtPlain(value)}
    </text>
  );
};

// Tooltip do gráfico "Saldo no fim do mês".
const monthBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ fontSize: 12, borderRadius: 10, border: "1px solid " + COLORS.line, background: COLORS.card, padding: "8px 12px", boxShadow: "0 4px 14px rgba(0,0,0,0.10)" }}>
      <p style={{ fontSize: 12.5, fontWeight: 600, margin: "0 0 4px", color: COLORS.ink, textTransform: "capitalize" }}>{label}</p>
      <p style={{ margin: 0, fontWeight: 600, color: d.saldo < 0 ? COLORS.rust : COLORS.green }}>Saldo no fim do mês: {fmt(d.saldo)}</p>
      {d.projected && <p style={{ margin: "4px 0 0", fontSize: 11.5, color: COLORS.muted }}>projeção</p>}
    </div>
  );
};

const ehDespesaItem = (i) => i.type === "expense" || i.type === "transferencia";
const pad = (n) => String(n).padStart(2, "0");
// Data curta (dd/mm) para o chip de calendário dos cards de despesa.
const dataCurta = (iso) => {
  if (!iso) return "--/--";
  const d = new Date(iso + "T00:00:00");
  return Number.isFinite(d.getTime()) ? pad(d.getDate()) + "/" + pad(d.getMonth() + 1) : "--/--";
};

export function PlannedCard({ item, selectedMonth, onPay, onEdit, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const categories = useCategories();
  const st = displayStatus(item);
  const RecIcon = recurrenceIcon(item);
  const pct = Math.min(100, (item.paid / item.amount) * 100);
  const catColor = categories[item.category]?.color || COLORS.green;
  // Fundo/borda por tipo: Receita = verde clarinho, Despesa = vermelho clarinho.
  const typeColor = item.type === "income" ? COLORS.green : COLORS.rust;
  const prio = PRIORITY[item.priority] || PRIORITY.importante;
  const isCouple = item.memberId == null;
  const MemberIcon = isCouple ? Users : User;

  // Data indicada (quando o motor indica pagar) x data de vencimento real.
  // As duas aparecem sempre que o motor já calculou a classificação da despesa;
  // quando o caixa não cobre o valor no mês, a indicada repete o vencimento e
  // fica em âmbar (o selo POSTERGADO / ATENÇÃO NECESSÁRIA mostra o risco).
  // Se o motor achou um dia melhor, mostra ele; senão a indicada repete o dia
  // do vencimento (e fica em âmbar). Para contas atrasadas a indicada é sempre
  // a do mês selecionado — é ela que dá a posição delas na lista.
  const diaIndicado = item.dataIndicada != null
    ? item.dataIndicada
    : (item.diaVencimento != null ? item.diaVencimento : null);
  const temDataIndicada = ehDespesaItem(item) && Boolean(selectedMonth) && diaIndicado != null;
  const dataIndicadaISO = selectedMonth + "-" + pad(diaIndicado || 1);
  const dataIndicadaAjustada = item.dataIndicada != null
    ? item.dataIndicada !== item.diaVencimento
    : true;

  // Para salários com descontos em folha, o valor que importa é o LÍQUIDO.
  const salaryDeductions = item.category === "salario" ? (item.salaryDeductions || []) : [];
  const deductionTotal = salaryDeductions.reduce((s, d) => s + (Number(d.amount) || 0), 0);
  const isSalary = item.category === "salario" && deductionTotal > 0;
  const netAmount = round2(item.amount - deductionTotal);

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
    <Card style={{ background: typeColor + "14", border: "1px solid " + typeColor, borderLeft: "4px solid " + catColor, position: "relative", padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
        <CategoryIcon cat={item.category} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="serif" style={{ fontSize: 15.5, fontWeight: 600, margin: 0, color: COLORS.ink }}>{item.description}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
            <RecIcon size={12} color={COLORS.muted} />
            <span style={{ fontSize: 12, color: COLORS.muted }}>{recurrenceLabel(item)}</span>
            {temDataIndicada ? (
              // DV = Data de Vencimento · DI = Data Indicada (calculada pelo motor)
              <span title="DV = data de vencimento · DI = data indicada pelo motor" style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 9px", borderRadius: 20, border: "1px solid " + COLORS.line, background: COLORS.card }}>
                <CalendarDays size={13} color={COLORS.muted} />
                <span style={{ fontSize: 10.5, fontWeight: 700, color: COLORS.muted }}>DV</span>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: COLORS.ink }}>{dataCurta(item.dueDate)}</span>
                <span style={{ color: COLORS.line }}>|</span>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: COLORS.muted }}>DI</span>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: dataIndicadaAjustada ? COLORS.amber : COLORS.ink }}>{dataCurta(dataIndicadaISO)}</span>
              </span>
            ) : (
              <span style={{ fontSize: 12, color: COLORS.muted }}>· vence {fmtDate(item.dueDate)}</span>
            )}
          </div>
          {item.motorG != null && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: COLORS.muted }}>
                G {item.motorG.toFixed(1)}{item.vencida ? " · atraso " + item.diasEmAtraso + "d · S " + item.motorS : ""}
              </span>
              {(item.motorStatus === "postergada" || item.motorStatus === "atencao_necessaria") && (
                <Badge color={item.motorStatus === "atencao_necessaria" ? COLORS.rust : COLORS.amber}>{item.motorStatusLabel}</Badge>
              )}
            </div>
          )}
          {item.agrupadas && (
            <p style={{ fontSize: 11, color: COLORS.muted, margin: "3px 0 0", lineHeight: 1.4 }}>Inclui: {item.agrupadas}</p>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5, flexWrap: "wrap" }}>
            <MemberIcon size={12} color={COLORS.muted} />
            <span style={{ fontSize: 12, color: COLORS.muted }}>{memberLabel(item.memberId)}</span>
            <span style={{ color: COLORS.line }}>|</span>
            <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: prio.color + "1A", color: prio.color }}>{prio.label}</span>
            {(item.formaPagamento || "normal") === "reserva" && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: COLORS.amber + "1A", color: COLORS.amber }}>
                <PiggyBank size={11} />Sai da reserva
              </span>
            )}
            {item.type === "income" && item.restritoCategoria && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: "#C98A3B1A", color: "#8A5A1F" }}>
                <ShoppingCart size={11} />Só {categories[item.restritoCategoria]?.label || item.restritoCategoria}
              </span>
            )}
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
      <p className="serif" style={{ fontSize: 24, fontWeight: 600, margin: "0 0 4px", color: COLORS.ink }}>
        {isSalary ? fmt(netAmount) : fmt(item.amount)}
        {isSalary && <span style={{ fontSize: 12, fontWeight: 500, color: COLORS.muted }}> líquido</span>}
      </p>
      {isSalary && <p style={{ fontSize: 11.5, color: COLORS.muted, margin: "0 0 8px" }}>bruto {fmt(item.amount)} · descontos {fmt(deductionTotal)} · disponível {fmt(netAmount)}</p>}
      <ProgressBar pct={pct} color={st.color} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
        <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}>{fmt(item.paid)} de {isSalary ? fmt(netAmount) : fmt(item.amount)}</p>
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

export function InicioView({ balance, availableBalance, reservedAmount, availableNow, monthProjection, isCurrentMonth, health, alerts, monthIncome, monthExpense, projectedBalance, onSelectMonth, openItems: allOpenItems, memberFilter, hideBalance, onToggleHide, onSeeAll, onPay, onEditPlanned, onDeletePlanned, onNewPlanned, onCloseMonth, postergadas, pacing, dias, reservaMinima, reservaUsada, reservaDisponivel, reservaConfigurada, reservaAporte, reservaReceita, reservaDespesa, reservaSobra, reservaDeficit, beneficio, carryRestrito, selectedMonth, onOpenReserva, autoDetalhes }) {
  const [sortBy, setSortBy] = useState("indicada");
  const [showHealthInfo, setShowHealthInfo] = useState(false);
  const lastTapRef = useRef({ month: null, time: 0 });
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const hasProjected = projectedBalance.some((t) => t.projected);
  const firstNegative = projectedBalance.find((t) => t.negative);
  const hasAnyMovement = projectedBalance.some((d) => (d.receitas || 0) > 0 || (d.despesas || 0) > 0);
  const mask = (v) => (hideBalance ? "R$ • • • • •" : fmt(v));

  function handleBarTap(data) {
    const month = (data && (data.payload || data).month) || null;
    if (!month) return;
    const now = Date.now();
    if (lastTapRef.current.month === month && now - lastTapRef.current.time < 400) {
      lastTapRef.current = { month: null, time: 0 };
      if (onSelectMonth) onSelectMonth(month);
    } else {
      lastTapRef.current = { month, time: now };
    }
  }
  const pad2 = (n) => String(n).padStart(2, "0");
  const ehDespesa = (i) => i.type === "expense" || i.type === "transferencia";

  // DATA INDICADA — quando o motor indica pagar. É ela que ordena a lista.
  // TODAS as despesas entram na MESMA linha do tempo do mês selecionado,
  // inclusive as atrasadas de meses anteriores: o atraso NÃO promove a conta
  // para o topo. Ele pesa na classificação (motorRank, que já considera o tempo
  // de atraso) — e essa classificação só decide quando as datas empatam.
  const diaDoVencimento = (i) => {
    const d = i.diaVencimento != null
      ? Number(i.diaVencimento)
      : new Date((i.dueDate || "") + "T00:00:00").getDate();
    return Number.isFinite(d) && d > 0 ? d : 1;
  };
  const chaveData = (i) => {
    if (!ehDespesa(i)) return i.dueDate || "";
    // Data indicada quando o motor calculou; senão o dia do vencimento real
    // colocado no mês selecionado (assim o dia 20 vem antes do dia 23).
    const dia = i.dataIndicada != null ? i.dataIndicada : diaDoVencimento(i);
    return selectedMonth + "-" + pad2(dia);
  };
  // Empate de data → critério de criticidade calculado pelo motor (motorRank).
  const criticidade = (a, b) => (a.motorRank ?? 999) - (b.motorRank ?? 999);

  const baseItems = allOpenItems
    .filter((i) => inScope(i.memberId, memberFilter))
    .map((i) => ({ ...i, priority: i.priority || DEFAULT_PRIORITY[i.category] || "importante" }));

  const despesas = baseItems.filter(ehDespesa);
  const receitas = baseItems.filter((i) => !ehDespesa(i));

  const despesasOrdenadas = sortBy === "indicada"
    ? [...despesas].sort((a, b) => {
        const ka = chaveData(a), kb = chaveData(b);
        if (ka !== kb) return ka < kb ? -1 : 1;
        return criticidade(a, b);
      })
    : [...despesas].sort((a, b) => (a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0));

  // As receitas entram na sequência das despesas pela data determinada delas.
  // Empate de dia → a RECEITA vem primeiro (primeiro recebo, depois eu pago),
  // por isso a procura é pelo primeiro item com data >= a da receita.
  const openItems = (() => {
    const lista = [...despesasOrdenadas];
    [...receitas]
      .sort((a, b) => (a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0))
      .forEach((r) => {
        const kr = r.dueDate || "";
        const idx = lista.findIndex((d) => chaveData(d) >= kr);
        lista.splice(idx < 0 ? lista.length : idx, 0, r);
      });
    return lista;
  })();
  // Dias/categorias do dinheiro restrito (cartão alimentação) do mês.
  const diasBeneficio = beneficio && beneficio.porDia
    ? Object.keys(beneficio.porDia).map(Number).sort((a, b) => a - b).join(", ")
    : "";
  const categoriasBeneficio = beneficio && beneficio.itens && beneficio.itens.length
    ? [...new Set(beneficio.itens.map((i) => i.category))].join(", ")
    : "mercado";
  const temRestrito = Boolean(beneficio && beneficio.total > 0) || (dias || []).some((d) => (d.restrito || 0) > 0);

  const endPositive = monthProjection.endBalance >= 0;
  const openTotal = openItems.reduce((s, i) => s + (i.amount - i.paid), 0);
  const dueThisWeek = openItems.filter((i) => {
    const diff = Math.round((new Date(i.dueDate + "T00:00:00") - new Date(TODAY_DATE + "T00:00:00")) / 86400000);
    return diff >= 0 && diff <= 7;
  }).length;

  return (
    <div>
      <p style={{ fontSize: 14, color: COLORS.muted, margin: "0 0 12px" }}>{greeting}</p>

      {/* Card Saldo disponível — #20: NÃO considera o reservado (só o que está de fato disponível para usar) */}
      <Card style={{ marginBottom: 10, padding: "0 0 16px", borderLeft: "4px solid " + COLORS.green, overflow: "hidden" }}>
        <div style={{ padding: "16px 16px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: COLORS.green + "1E", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Wallet size={19} color={COLORS.green} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, margin: 0, color: COLORS.ink, flex: 1 }}>Saldo disponível</p>
            <button onClick={onToggleHide} aria-label={hideBalance ? "Mostrar saldo" : "Ocultar saldo"} className="icon-btn" style={{ background: "none", border: "none", padding: 2, color: COLORS.muted, display: "flex" }}>
              {hideBalance ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <ChevronRight size={18} color={COLORS.muted} />
          </div>
          <p className="serif" style={{ fontSize: 34, fontWeight: 600, margin: 0, color: availableBalance >= 0 ? COLORS.green : COLORS.rust }}>{mask(availableBalance)}</p>
        </div>
      </Card>

      {/* Reserva mínima — mesma lógica do limite do cartão: conforme você lança nela,
          o disponível cai e a linha tracejada do gráfico desce. */}
      <Card style={{ marginBottom: 10, padding: "14px 16px", borderLeft: "4px solid " + COLORS.amber, background: COLORS.amber + "0A" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: COLORS.amber + "1E", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <PiggyBank size={17} color={COLORS.amber} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13.5, fontWeight: 700, margin: 0, color: COLORS.ink }}>Reserva mínima disponível</p>
            <p style={{ fontSize: 11, color: COLORS.muted, margin: 0 }}>{reservaConfigurada ? "aporte mensal configurado" : "15% do salário líquido"}</p>
          </div>
          <button onClick={onOpenReserva} aria-label="Configurar reserva mínima" className="icon-btn" style={{ background: "none", border: "none", padding: 2, color: COLORS.muted, display: "flex" }}>
            <Pencil size={15} />
          </button>
          <ChevronRight size={18} color={COLORS.muted} onClick={onOpenReserva} style={{ cursor: "pointer" }} />
        </div>
        <p className="serif" style={{ fontSize: 28, fontWeight: 600, margin: "0 0 8px", color: reservaDisponivel >= 0 ? COLORS.ink : COLORS.rust }}>{mask(reservaDisponivel)}</p>
        <ProgressBar pct={reservaMinima > 0 ? Math.min(100, (reservaUsada / reservaMinima) * 100) : 0} color={reservaDisponivel < 0 ? COLORS.rust : COLORS.amber} />
        <p style={{ fontSize: 11.5, color: COLORS.muted, margin: "8px 0 0" }}>
          Aporte do mês {mask(reservaAporte)} · usado {mask(reservaUsada)} · reserva <strong style={{ color: COLORS.ink }}>{mask(reservaMinima)}</strong>
        </p>
        <p style={{ fontSize: 11, color: COLORS.muted, margin: "2px 0 0" }}>
          {reservaDeficit > 0
            ? "Fechou negativa em " + mask(reservaDeficit) + " — esse valor entra como Despesa no mês seguinte."
            : "Sobrou " + mask(reservaSobra) + " — esse valor entra como Receita no mês seguinte."}
          {" A reserva não acumula: no mês seguinte vale o aporte cheio."}
        </p>
        {(reservaReceita > 0 || reservaDespesa > 0) && (
          <p style={{ fontSize: 11, color: COLORS.muted, margin: "2px 0 0" }}>
            Neste mês entrou {reservaReceita > 0 ? "como Receita " + mask(reservaReceita) : "como Despesa " + mask(reservaDespesa)} do fechamento anterior.
          </p>
        )}
      </Card>

      {/* Dinheiro restrito (cartão alimentação) — NÃO conta no saldo disponível */}
      {beneficio && beneficio.total > 0 && (
        <Card style={{ marginBottom: 10, padding: "12px 16px", borderLeft: "4px solid #C98A3B", background: "#C98A3B0A" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "#C98A3B1E", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ShoppingCart size={17} color="#8A5A1F" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13.5, fontWeight: 700, margin: 0, color: COLORS.ink }}>Cartão alimentação</p>
              <p style={{ fontSize: 11, color: COLORS.muted, margin: 0 }}>
                entra dia {diasBeneficio} · só {categoriasBeneficio}
              </p>
            </div>
            <Badge color="#8A5A1F">fora do disponível</Badge>
          </div>
          <p className="serif" style={{ fontSize: 22, fontWeight: 600, margin: 0, color: COLORS.ink }}>{mask(beneficio.total)}</p>
          <p style={{ fontSize: 11.5, color: COLORS.muted, margin: "4px 0 0" }}>
            {carryRestrito > 0 ? "Inclui " + mask(carryRestrito) + " que sobrou do mês anterior (o cartão acumula). " : ""}
            Este valor não pode pagar as outras contas — no cálculo da data de pagamento ele fica num bolso separado.
          </p>
        </Card>
      )}

      {/* Saldo projetado mês — como termina o mês */}
      <Card style={{ marginBottom: 10, padding: "14px 16px", background: "#3B6E8F0F", border: "1px solid #3B6E8F22" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <CalendarClock size={16} color="#3B6E8F" />
          <p style={{ fontSize: 13.5, fontWeight: 700, margin: 0, color: COLORS.ink, flex: 1 }}>Saldo projetado mês</p>
          <Info size={14} color={COLORS.muted} />
        </div>
        <p className="serif" style={{ fontSize: 26, fontWeight: 600, margin: "0 0 6px", color: endPositive ? COLORS.green : COLORS.rust }}>{mask(monthProjection.endBalance)}</p>
        <p style={{ fontSize: 11.5, color: COLORS.muted, margin: 0 }}>Com base nas movimentações atuais · Faltam receber {mask(monthProjection.pendingIncome)} · Faltam pagar {mask(monthProjection.pendingExpense)}</p>
      </Card>

      {/* Saúde financeira — abaixo dos dois valores */}
      <Card style={{ marginBottom: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: "#3B6E8F1E", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <HeartPulse size={17} color="#3B6E8F" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <p style={{ fontSize: 13.5, fontWeight: 700, margin: 0, color: COLORS.ink }}>Saúde financeira</p>
            <button onClick={() => setShowHealthInfo(true)} aria-label="Como é calculada" style={{ background: "none", border: "none", padding: 0, color: COLORS.muted, cursor: "pointer", display: "flex" }}><Info size={14} /></button>
          </div>
          <div style={{ height: 8, borderRadius: 6, background: COLORS.line, overflow: "hidden", marginTop: 6 }}>
            <div style={{ height: "100%", width: Math.max(0, Math.min(100, health.score)) + "%", background: "linear-gradient(90deg, #C98A3B, " + health.color + ")", borderRadius: 6 }} />
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p className="serif" style={{ fontSize: 24, fontWeight: 600, margin: 0, color: COLORS.ink }}>{health.score}</p>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: health.color }}>{health.shortLabel}</span>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
        <Card style={{ padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><ArrowDownLeft size={14} color={COLORS.green} /><span style={{ fontSize: 12, color: COLORS.muted }}>A receber</span></div>
          <p style={{ fontSize: 18, fontWeight: 600, margin: 0, color: COLORS.green }}>{mask(monthProjection.pendingIncome)}</p>
          <p style={{ fontSize: 10.5, color: COLORS.muted, margin: "2px 0 0" }}>disponível em contas em aberto</p>
        </Card>
        <Card style={{ padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><ArrowUpRight size={14} color={COLORS.rust} /><span style={{ fontSize: 12, color: COLORS.muted }}>A pagar</span></div>
          <p style={{ fontSize: 18, fontWeight: 600, margin: 0, color: COLORS.rust }}>{mask(monthProjection.pendingExpense)}</p>
          <p style={{ fontSize: 10.5, color: COLORS.muted, margin: "2px 0 0" }}>em aberto</p>
        </Card>
      </div>

      {pacing && (
        <Card style={{ marginBottom: 10, padding: "12px 16px", background: "#3B6E8F0A" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <TrendingDown size={14} color="#3B6E8F" />
            <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>Mercado — pacing semanal</p>
          </div>
          <p style={{ fontSize: 12, color: COLORS.ink, margin: 0 }}>Envelope da semana <strong>{fmt(pacing.envelopeSemanal)}</strong> · disponível <strong>{fmt(pacing.saldoSemanalRestante)}</strong> · teto diário <strong>{fmt(pacing.tetoDiario)}</strong></p>
        </Card>
      )}

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

      <Card style={{ marginBottom: 18 }}>
        <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 2px" }}>Saldo no fim do mês — próximos 12 meses</p>
        <p style={{ fontSize: 11, color: COLORS.muted, margin: "0 0 10px" }}>Duplo toque na barra abre o mês.</p>
        <div style={{ width: "100%", height: 175 }}>
          <ResponsiveContainer>
            <BarChart data={projectedBalance} barGap={2} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={COLORS.line} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: COLORS.muted }} axisLine={false} tickLine={false} interval={0} />
              <YAxis hide />
              <Tooltip content={monthBarTooltip} />
              <ReferenceLine y={0} stroke={COLORS.ink} strokeOpacity={0.5} strokeDasharray="3 3" />
              <Bar dataKey="saldo" name="Saldo no fim do mês" radius={[4, 4, 4, 4]} onClick={handleBarTap} maxBarSize={22}>
                {projectedBalance.map((d, i) => (
                  <Cell key={i} fill={d.saldo < 0 ? COLORS.rust : COLORS.green} fillOpacity={d.projected ? 0.75 : 1} />
                ))}
                <LabelList dataKey="saldo" content={renderBarLabel} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 8 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: COLORS.muted }}><span style={{ width: 10, height: 10, borderRadius: 3, background: COLORS.green }} /> Saldo positivo</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: COLORS.muted }}><span style={{ width: 10, height: 10, borderRadius: 3, background: COLORS.rust }} /> Saldo negativo</span>
          {hasProjected && <span style={{ fontSize: 11, color: COLORS.muted }}>barras claras = previsão</span>}
        </div>
        {!hasAnyMovement ? (
          <p style={{ fontSize: 12, color: COLORS.muted, margin: "10px 0 0" }}>Cadastre receitas/despesas ou compromissos no Previsto para ver o saldo de cada mês.</p>
        ) : firstNegative ? (
          <p style={{ fontSize: 12, color: COLORS.rust, margin: "10px 0 0" }}>Atenção: o saldo fica negativo no fim de <strong>{monthLabelFull(firstNegative.month)}</strong> ({fmt(firstNegative.saldo)}).</p>
        ) : (
          <p style={{ fontSize: 12, color: COLORS.green, margin: "10px 0 0" }}>Em todos os meses o saldo fica positivo no fim do mês ✓</p>
        )}
      </Card>

      {dias.length > 0 && (
        <Card style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <CalendarClock size={15} color={COLORS.green} />
            <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>Extrato de saldo — dia a dia</p>
          </div>
          <div style={{ width: "100%", height: 150 }}>
            <ResponsiveContainer>
              <LineChart data={dias} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={COLORS.line} />
                <XAxis dataKey="dia" tick={{ fontSize: 10, fill: COLORS.muted }} axisLine={false} tickLine={false} interval={4} />
                <YAxis hide />
                <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid " + COLORS.line }} />
                <Line type="monotone" dataKey="saldo" stroke={COLORS.green} strokeWidth={2.5} dot={false} />
                {/* Reserva mínima: a linha tracejada desce conforme você lança e
                    liquida o que tirou da reserva. */}
                <Line type="stepAfter" dataKey="reserva" stroke={COLORS.amber} strokeWidth={2} strokeDasharray="4 4" dot={false} name="Reserva mínima disponível" />
                {temRestrito && (
                  <Line type="stepAfter" dataKey="restrito" stroke="#C98A3B" strokeWidth={1.5} strokeDasharray="2 3" dot={false} name="Cartão alimentação" />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p style={{ fontSize: 11, color: COLORS.muted, margin: "4px 0 0" }}>
            Saldo previsto ao longo do mês — sobe com receitas e cai com as despesas pagas.
            Linha tracejada = reserva mínima disponível: começa em {fmt(reservaMinima)} e vai baixando conforme você usa
            {reservaUsada > 0 ? " (" + fmt(reservaUsada) + " usados, restam " + fmt(reservaDisponivel) + ")" : ""}.
            {temRestrito ? " A linha pontilhada clara é o cartão alimentação, que só paga " + categoriasBeneficio + "." : ""}
          </p>
        </Card>
      )}

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
            <p style={{ fontSize: 12, color: COLORS.muted, margin: "2px 0 0" }}>do mês selecionado e de meses anteriores ainda não pagos</p>
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
        {[["indicada", "Data indicada", CalendarClock], ["vencimento", "Vencimento", Calendar]].map(([v, l, Icon]) => (
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
        {openItems.map((item) => <PlannedCard key={item.occId} item={item} selectedMonth={selectedMonth} onPay={onPay} onEdit={onEditPlanned} onDelete={onDeletePlanned} />)}
        {postergadas.length > 0 && (
          <Card style={{ marginTop: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <Clock size={14} color={COLORS.amber} />
              <p style={{ fontSize: 12.5, fontWeight: 500, margin: 0 }}>Postergadas taticamente para o próximo mês</p>
            </div>
            {postergadas.map((p) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                <span style={{ flex: 1, color: COLORS.ink }}>{p.descricao}</span>
                <span style={{ color: COLORS.ink }}>{fmt(p.valor)}</span>
                {p.jurosEstimados > 0 && <span style={{ color: COLORS.rust }}>+{fmt(p.jurosEstimados)}</span>}
              </div>
            ))}
          </Card>
        )}
      </div>

      {showHealthInfo && (
        <ModalSheet title="Saúde financeira — como é calculada" onClose={() => setShowHealthInfo(false)}>
          <p style={{ fontSize: 13, color: COLORS.muted, margin: "0 0 12px" }}>A pontuação vai de <strong>0 a 100</strong> e começa em 100. Cada situação abaixo desconta pontos:</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {[
              ["Orçamentos estourados", "−15 por orçamento acima do limite · −5 no limite"],
              ["Despesas acima da receita", "−25 quando o mês fechou no vermelho"],
              ["Poupança insuficiente", "−20 se gastou além da renda · −8 se guarda menos de 15%"],
            ].map(([t, d]) => (
              <div key={t} style={{ padding: "10px 12px", borderRadius: 12, background: COLORS.card, border: "1px solid " + COLORS.line }}>
                <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 2px", color: COLORS.ink }}>{t}</p>
                <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}>{d}</p>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 12, fontWeight: 600, color: COLORS.green, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 0.4 }}>Neste mês</p>
          {health.factors.length === 0 ? (
            <p style={{ fontSize: 13, color: COLORS.green, margin: 0 }}>Nenhum desconto aplicado — pontuação máxima! ✓</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {health.factors.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 30, fontSize: 12, fontWeight: 700, color: COLORS.rust, flexShrink: 0 }}>{f.impact}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, margin: 0, color: COLORS.ink }}>{f.label}</p>
                    <p style={{ fontSize: 11.5, color: COLORS.muted, margin: 0 }}>{f.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ModalSheet>
      )}
    </div>
  );
}
