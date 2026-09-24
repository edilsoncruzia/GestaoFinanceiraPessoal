import React, { useState, useRef } from 'react';
import {
  Wallet, EyeOff, Eye, Coins, CalendarClock, Info, ArrowUpRight, ArrowDownLeft, ChevronRight,
  HeartPulse, Bell, TrendingUp, TrendingDown, Calendar,
  Plus, CheckCircle2, MoreVertical, Pencil, Trash2, CreditCard, Download, Users, User, PiggyBank, ShoppingCart, CalendarDays, BarChart3, Tag
} from 'lucide-react';
import { COLORS, PRIORITY, DEFAULT_PRIORITY } from '../../constants/tokens';
import { useCategories } from '../../context/CategoriesContext';
import { usePrivacy } from '../../context/PrivacyContext';
import { TODAY_DATE, TODAY_MONTH } from '../../constants/seedData';
import { fmt, fmtDate, round2, inScope, displayStatus, recurrenceIcon, recurrenceLabel, memberLabel, plannedStatus, monthLabelFull, addMonths } from '../../utils/formatters';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { CategoryIcon } from '../ui/CategoryIcon';
import { BalanceHero } from '../ui/BalanceHero';
import { BillCard } from '../ui/BillCard';
import { MonthNav } from '../ui/MonthNav';
import { HealthModal } from '../ui/HealthModal';
import { AlertsModal } from '../ui/AlertsModal';
import { MemberFilterIcon } from '../ui/MemberFilterIcon';
import { ResumoCards } from '../ui/ResumoCards';
import { MonthAnalysis } from '../ui/MonthAnalysis';

// ============================================================================
// INÍCIO — o que mudou e por quê
//
// ANTES, na ordem em que aparecia na tela (13 blocos, ~6 valores grandes):
//   1. saudação
//   2. Saldo disponível              (34px)
//   3. Reserva mínima disponível     (28px)
//   4. Cartão alimentação            (22px)
//   5. Saldo projetado mês           (26px)
//   6. Saúde financeira              (24px)
//   7. A receber / A pagar           (18px, e os MESMOS valores repetidos
//                                     por extenso dentro do card 5)
//   8. Pacing semanal                "Envelope da semana ... teto diário ..."
//   9. Alertas de hoje
//  10. Gráfico saldo fim do mês (12 barras, rótulo rotacionado −90°)
//  11. Gráfico extrato de saldo dia a dia
//  12. Contas em aberto (lista) + faixa de totais + 2 botões de ordenação
//  13. Postergadas
//
// Três problemas de hierarquia decorriam disso:
//   a) CINCO números competindo pelo mesmo peso visual. O usuário não sabia
//      onde olhar primeiro (regra "one glance").
//   b) REDUNDÂNCIA: "a receber / a pagar" aparecia em card próprio E na
//      descrição do card de saldo projetado. "em aberto" aparecia no card de
//      projeção, na faixa de totais e na lista.
//   c) A lista de trabalho — o motivo de abrir o app — ficava depois de dois
//      gráficos, em ~2.000px de rolagem no celular.
//
// DEPOIS (mesmos dados, mesma lógica, mesma API de props):
//   Coluna de decisão   → 1 saldo + 3 KPI de apoio na mesma faixa, alerta,
//                         e a lista de contas em aberto logo em seguida.
//   Coluna de apoio     → saúde, reserva, cartão alimentação.
//   Análise do mês      → os dois gráficos e o pacing, atrás de um disclosure.
// ============================================================================

const ehDespesaItem = (i) => i.type === "expense" || i.type === "transferencia";
const pad = (n) => String(n).padStart(2, "0");
const dataCurta = (iso) => {
  if (!iso) return "--/--";
  const d = new Date(iso + "T00:00:00");
  return Number.isFinite(d.getTime()) ? pad(d.getDate()) + "/" + pad(d.getMonth() + 1) : "--/--";
};

/* ── Card de item em aberto ────────────────────────────────────────────────
   Antes: borda esquerda de 4px colorida por categoria + fundo tingido pelo
   tipo + selo + faixa de prioridade + chip DV/DI + "G 7.3 · atraso 12d · S 4".
   Cinco sinais competindo no mesmo card.

   Agora: o estado vem primeiro (selo com texto), o valor é o segundo olhar,
   e os detalhes técnicos do motor (G, S, DV/DI) ficam em uma linha só de
   11.5px, com rótulo — antes eram siglas soltas sem explicação na própria
   tela. A barra lateral colorida foi trocada por um marcador de categoria ao
   lado do título, que não rouba a leitura da borda do card. */
export function PlannedCard({ item, selectedMonth, onPay, onEdit, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const categories = useCategories();
  const st = displayStatus(item);
  const RecIcon = recurrenceIcon(item);
  const pct = Math.min(100, (item.paid / item.amount) * 100);
  const catColor = categories[item.category]?.color || COLORS.green;
  const prio = PRIORITY[item.priority] || PRIORITY.importante;
  const isCouple = item.memberId == null;
  const MemberIcon = isCouple ? Users : User;

  const diaIndicado = item.dataIndicada != null
    ? item.dataIndicada
    : (item.diaVencimento != null ? item.diaVencimento : null);
  const temDataIndicada = ehDespesaItem(item) && Boolean(selectedMonth) && diaIndicado != null;
  const dataIndicadaISO = selectedMonth + "-" + pad(diaIndicado || 1);

  const salaryDeductions = item.category === "salario" ? (item.salaryDeductions || []) : [];
  const deductionTotal = salaryDeductions.reduce((s, d) => s + (Number(d.amount) || 0), 0);
  const isSalary = item.category === "salario" && deductionTotal > 0;
  const netAmount = round2(item.amount - deductionTotal);
  const valorMostrado = isSalary ? netAmount : item.amount;

  if (confirming) {
    return (
      <Card style={{ padding: "12px 14px", borderColor: COLORS.rust }}>
        <p style={{ fontSize: 14, margin: "0 0 10px", color: COLORS.rust }}>Excluir "{item.description}"?</p>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setConfirming(false)} style={{ flex: 1, minHeight: 44, fontSize: 13.5, borderRadius: 10, border: "1px solid " + COLORS.line, background: "transparent", color: COLORS.fg2 }}>Cancelar</button>
          <button onClick={() => { onDelete(item, "current"); setConfirming(false); }} style={{ flex: 1, minHeight: 44, fontSize: 13.5, borderRadius: 10, border: "1px solid " + COLORS.green, background: "transparent", color: COLORS.green, fontWeight: 600 }}>Apenas este mês</button>
          <button onClick={() => { onDelete(item, "all"); setConfirming(false); }} style={{ flex: 1, minHeight: 44, fontSize: 13.5, borderRadius: 10, border: "none", background: COLORS.rust, color: "#fff", fontWeight: 600 }}>Todos os futuros</button>
        </div>
      </Card>
    );
  }

  const hojeDia = selectedMonth === TODAY_MONTH ? new Date().getDate() : null;
  const vencimentoDia = item.diaVencimento != null
    ? item.diaVencimento
    : (item.dueDate ? Number(item.dueDate.slice(8, 10)) : null);

  return (
    <BillCard
      titulo={item.description}
      valor={valorMostrado}
      pago={item.paid}
      tipo={item.type === "income" ? "income" : "expense"}
      categoria={categories[item.category]?.label}
      prioridade={prio.label}
      pessoa={memberLabel(item.memberId)}
      recorrencia={recurrenceLabel(item)}
      vencimentoDia={vencimentoDia}
      indicadaDia={diaIndicado}
      // Sem `selectedMonth` o cartão ainda desenha: cai no mês corrente em vez
      // de estourar. Era o "Cannot read properties of undefined (reading
      // 'slice')" que aparecia ao abrir Transações.
      mes={selectedMonth ? Number(selectedMonth.slice(5, 7)) : (new Date().getMonth() + 1)}
      hoje={hojeDia}
      Icone={categories[item.category]?.icon || Tag}
      onAbrir={() => onEdit(item)}
      onPagar={() => onPay(item)}
      // Editar e excluir saíram do menu de "três pontinhos" e viraram os dois
      // ícones que ladeiam o botão de registro.
      onEditar={() => onEdit(item)}
      onExcluir={() => setConfirming(true)}
      acoes={
        <div>
          {item.motorStatus === "atencao_necessaria" && (
            <p style={{ fontSize: 12.5, color: COLORS.rust, margin: "12px 0 0", fontWeight: 600 }}>
              O motor indica atenção: {item.motorStatusLabel || "o caixa não cobre este valor no mês"}.
            </p>
          )}
          {(item.formaPagamento || "normal") === "reserva" && (
            <p style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12.5, fontWeight: 600, color: COLORS.warn, margin: "8px 0 0" }}>
              <PiggyBank size={11} />sai da reserva
            </p>
          )}
          {item.agrupadas && <p style={{ fontSize: 12.5, color: COLORS.muted, margin: "6px 0 0" }}>inclui {item.agrupadas}</p>}
        </div>
      }
    />
  );
}

function Kpi({ icon: Icon, color, label, value, hint }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 12, background: COLORS.cardSunken, border: "1px solid " + COLORS.lineSoft, minWidth: 0 }}>
      <Icon size={16} color={color} style={{ flexShrink: 0 }} />
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 17.5, fontWeight: 600, margin: 0, color }}>{value}</p>
        <p style={{ fontSize: 12.5, color: COLORS.muted, margin: 0 }}>{label}{hint ? " · " + hint : ""}</p>
      </div>
    </div>
  );
}

function SupportCard({ icon: Icon, color, title, subtitle, children, action }) {
  return (
    <Card data-od-id={"apoio-" + title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span style={{ width: 34, height: 34, borderRadius: 10, background: color + "1E", color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={16} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 600, margin: 0, color: COLORS.ink }}>{title}</p>
          {subtitle && <p style={{ fontSize: 12.5, color: COLORS.muted, margin: "1px 0 0" }}>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}

export function InicioView({ balance, availableBalance, reservedAmount, availableNow, monthProjection, isCurrentMonth, health, alerts, monthIncome, monthExpense, projectedBalance, onSelectMonth, saldoDoMes, openItems: allOpenItems, memberFilter, onChangeMemberFilter, hideBalance, onToggleHide, onSeeAll, onPay, onEditPlanned, onDeletePlanned, onNewPlanned, onCloseMonth, postergadas, pacing, dias, reservaMinima, reservaUsada, reservaDisponivel, reservaConfigurada, reservaAporte, reservaReceita, reservaDespesa, reservaSobra, reservaDeficit, beneficio, carryRestrito, selectedMonth, onOpenReserva, autoDetalhes }) {
  const [sortBy, setSortBy] = useState("indicada");
  const [showHealthInfo, setShowHealthInfo] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const categories = useCategories();
  // O mesmo "olho" global: aqui só pegamos o formatador já mascarado, para os
  // poucos lugares que passam número CRU (gráficos, pílulas) e não texto pronto.
  const { mascarar } = usePrivacy();
  const mask = mascarar;

  const pad2 = (n) => String(n).padStart(2, "0");
  const ehDespesa = (i) => i.type === "expense" || i.type === "transferencia";

  const diaDoVencimento = (i) => {
    const d = i.diaVencimento != null
      ? Number(i.diaVencimento)
      : new Date((i.dueDate || "") + "T00:00:00").getDate();
    return Number.isFinite(d) && d > 0 ? d : 1;
  };
  const chaveData = (i) => {
    if (!ehDespesa(i)) return i.dueDate || "";
    const dia = i.dataIndicada != null ? i.dataIndicada : diaDoVencimento(i);
    return selectedMonth + "-" + pad2(dia);
  };
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

  const diasBeneficio = beneficio && beneficio.porDia
    ? Object.keys(beneficio.porDia).map(Number).sort((a, b) => a - b).join(", ")
    : "";
  const categoriasBeneficio = beneficio && beneficio.itens && beneficio.itens.length
    ? [...new Set(beneficio.itens.map((i) => i.category))].map((k) => (categories[k]?.label || k).toLowerCase()).join(", ")
    : "mercado";
  const temRestrito = Boolean(beneficio && beneficio.total > 0) || (dias || []).some((d) => (d.restrito || 0) > 0);

  const endPositive = monthProjection.endBalance >= 0;
  const openTotal = openItems.reduce((s, i) => s + (i.amount - i.paid), 0);
  const dueThisWeek = openItems.filter((i) => {
    const diff = Math.round((new Date(i.dueDate + "T00:00:00") - new Date(TODAY_DATE + "T00:00:00")) / 86400000);
    return diff >= 0 && diff <= 7;
  }).length;
  const restanteDoItem = (i) => Math.max(0, (i.amount || 0) - (i.paid || 0));
  const openPagar = openItems.filter(ehDespesaItem).reduce((s, i) => s + restanteDoItem(i), 0);
  const openReceber = openItems.filter((i) => !ehDespesaItem(i)).reduce((s, i) => s + restanteDoItem(i), 0);

  // Quanto do orçamento do mês já foi usado — o dado que dá sentido ao número
  // de saúde financeira, que antes aparecia sem contexto nenhum.
  const usoDaRenda = monthIncome > 0 ? Math.round((monthExpense / monthIncome) * 100) : 0;
  const temReserva = reservaMinima > 0 || reservaConfigurada;

  // Arrastar a tela para o lado troca o mês — o mesmo que os chevrons do
  // seletor fazem, com o gesto que a mão já conhece. Só dispara quando o
  // arrasto é claramente horizontal e curto no tempo, para não roubar a
  // rolagem vertical; e não dispara a partir do gráfico, onde o arrasto é a
  // leitura do ponto.
  const toqueRef = useRef({ x: 0, y: 0, t: 0 });
  function aoIniciarToque(e) {
    const t = e.touches && e.touches[0];
    if (!t) return;
    const alvo = e.target;
    if (alvo && alvo.closest && alvo.closest(".hf-chart")) { toqueRef.current = { x: 0, y: 0, t: 0 }; return; }
    toqueRef.current = { x: t.clientX, y: t.clientY, t: Date.now() };
  }
  function aoSoltarToque(e) {
    const s = toqueRef.current;
    if (!s.t) return;
    const t = e.changedTouches && e.changedTouches[0];
    toqueRef.current = { x: 0, y: 0, t: 0 };
    if (!t || !onSelectMonth) return;
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    if (Date.now() - s.t > 1000) return;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.6) return;
    onSelectMonth(addMonths(selectedMonth, dx < 0 ? 1 : -1));
  }
  // Nome da pessoa filtrada (a pílula do herói) — null quando o filtro é "Todos".
  const pessoa = memberFilter != null && String(memberFilter) !== "todos" ? memberLabel(Number(memberFilter)) : null;

  return (
    <div className="grid-auto" onTouchStart={aoIniciarToque} onTouchEnd={aoSoltarToque}>
      {/* ─────────────── coluna de decisão ─────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
        {/* 1. HERÓI — marca, saldo, saldo previsto e o gráfico dia a dia. */}
        <BalanceHero
          disponivel={availableBalance}
          previsto={monthProjection.endBalance}
          escondido={hideBalance}
          onAlternarVisao={onToggleHide}
          dias={dias}
          hojeDia={isCurrentMonth ? new Date().getDate() : null}
          mes={Number(selectedMonth.slice(5, 7))}
          saude={health?.score}
          onAbrirSaude={() => setShowHealthInfo(true)}
          alertas={alerts.length}
          onAbrirAlertas={() => setShowAlerts(true)}
          onAbrirPrevisto={onCloseMonth}
          topo={<MemberFilterIcon value={memberFilter} onChange={onChangeMemberFilter} />}
          contexto={<MonthNav month={selectedMonth} onChange={onSelectMonth} saldoDoMes={saldoDoMes} tom="escuro" />}
          pessoa={pessoa}
        />

        {/* 2. Reserva e mercado — dois quadros pequenos, lado a lado. */}
        <ResumoCards
          moeda={mask}
          reserva={temReserva ? {
            disponivel: reservaDisponivel,
            total: reservaMinima,
            usado: reservaUsada,
            onAbrir: onOpenReserva,
          } : null}
          mercado={pacing ? {
            restante: pacing.saldoSemanalRestante,
            total: pacing.envelopeSemanal,
          } : null}
        />

        {/* 3. LISTA DE TRABALHO — promovida para logo depois do saldo. */}
        <section
          aria-labelledby="titulo-contas-abertas"
          style={{
            marginTop: 10,
            padding: "24px 20px 22px",
            borderRadius: 24,
            background: COLORS.surface,
            border: "1px solid " + COLORS.borderSoft,
            boxShadow: "0 18px 42px -30px rgba(21,19,42,.34)",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 22 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
            <h2 id="titulo-contas-abertas" className="serif" style={{ fontSize: "clamp(24px, 5.8vw, 32px)", lineHeight: 1.05, fontWeight: 800, margin: 0, color: COLORS.ink }}>
              Contas em aberto
            </h2>
            <p style={{ margin: "8px 0 0", fontSize: "clamp(13px, 3.6vw, 17px)", color: COLORS.muted, lineHeight: 1.25 }}>
              Veja o que ainda vai entrar e sair da sua conta.
            </p>
            </div>
            <button
              type="button"
              onClick={onSeeAll}
              style={{
                minHeight: 44,
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                border: 0,
                background: "transparent",
                color: COLORS.accentDeep,
                fontSize: "clamp(13px, 3.4vw, 16px)",
                fontWeight: 800,
                padding: "0 2px",
                whiteSpace: "nowrap",
              }}
            >
              <BarChart3 size={25} color={COLORS.ink} strokeWidth={2.8} />
              Ver todas
              <ChevronRight size={25} strokeWidth={2.8} />
            </button>
          </div>

          {openItems.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14, marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, padding: "14px 12px", borderRadius: 18, background: "linear-gradient(135deg, " + COLORS.expenseSoft + " 0%, #fff 100%)" }}>
                <span style={{ width: "clamp(40px, 11vw, 56px)", height: "clamp(40px, 11vw, 56px)", borderRadius: 16, background: COLORS.expenseSoft, color: COLORS.expense, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <ArrowUpRight size={28} strokeWidth={2.7} />
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6, color: COLORS.fg2, fontSize: "clamp(13px, 3.6vw, 18px)", fontWeight: 500 }}>
                    A pagar
                    <b style={{ flexShrink: 0, padding: "4px 10px", borderRadius: 999, background: COLORS.expenseSoft, color: COLORS.expense, fontSize: "clamp(11px, 3vw, 14px)", fontWeight: 800 }}>
                      {openItems.filter(ehDespesaItem).length} contas
                    </b>
                  </span>
                  <b className="num" style={{ display: "block", marginTop: 4, color: COLORS.expense, fontFamily: "var(--font-display)", fontSize: "clamp(17px, 4.5vw, 26px)", lineHeight: 1.1, fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {mask(openPagar)}
                  </b>
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, padding: "14px 12px", borderRadius: 18, background: "linear-gradient(135deg, " + COLORS.incomeSoft + " 0%, #fff 100%)" }}>
                <span style={{ width: "clamp(40px, 11vw, 56px)", height: "clamp(40px, 11vw, 56px)", borderRadius: 16, background: COLORS.incomeSoft, color: COLORS.income, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <ArrowDownLeft size={28} strokeWidth={2.7} />
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6, color: COLORS.fg2, fontSize: "clamp(13px, 3.6vw, 18px)", fontWeight: 500 }}>
                    A receber
                    <b style={{ flexShrink: 0, padding: "4px 10px", borderRadius: 999, background: COLORS.incomeSoft, color: COLORS.income, fontSize: "clamp(11px, 3vw, 14px)", fontWeight: 800 }}>
                      {openItems.filter((i) => !ehDespesaItem(i)).length} contas
                    </b>
                  </span>
                  <b className="num" style={{ display: "block", marginTop: 4, color: COLORS.income, fontFamily: "var(--font-display)", fontSize: "clamp(17px, 4.5vw, 26px)", lineHeight: 1.1, fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {mask(openReceber)}
                  </b>
                </span>
              </div>
            </div>
          )}

          <div className="open-sort-tabs" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, padding: 4, marginBottom: 18, borderRadius: 18, border: "1px solid " + COLORS.border, background: COLORS.surface }}>
            {[["indicada", "Data indicada", Calendar], ["vencimento", "Vencimento", CalendarDays]].map(([v, l, Icon]) => (
              <button key={v} onClick={() => setSortBy(v)} aria-pressed={sortBy === v}
                style={{
                  minHeight: 52,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "0 10px",
                  borderRadius: 14,
                  fontSize: "clamp(13px, 3.5vw, 16px)",
                  fontWeight: 750,
                  border: "1px solid " + (sortBy === v ? "rgba(255,255,255,.22)" : "transparent"),
                  background: sortBy === v ? "linear-gradient(135deg, " + COLORS.accentBright + ", " + COLORS.accent + ")" : "transparent",
                  color: sortBy === v ? "#fff" : COLORS.fg2,
                  boxShadow: sortBy === v ? "0 12px 26px -16px rgba(76,29,149,.65)" : "none",
                }}>
                <Icon size={20} strokeWidth={2.4} />{l}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {openItems.length === 0 && (
              <Card style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <CheckCircle2 size={18} color={COLORS.green} />
                <p style={{ fontSize: 14.5, margin: 0 }}>Tudo em dia por aqui — nada pendente.</p>
              </Card>
            )}
            {openItems.slice(0, 5).map((item) => (
              <PlannedCard key={item.occId} item={item} selectedMonth={selectedMonth} onPay={onPay} onEdit={onEditPlanned} onDelete={onDeletePlanned} />
            ))}

            {openItems.length > 5 && (
              <button onClick={onSeeAll} style={{
                width: "100%", minHeight: 48, marginTop: 4, borderRadius: 12,
                border: "1px solid " + COLORS.line, background: COLORS.card,
                color: COLORS.accent, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5,
              }}>
                Ver todas as {openItems.length} contas em aberto
              </button>
            )}

            {postergadas.length > 0 && (
              <Card>
                <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 8px", display: "flex", alignItems: "center", gap: 6 }}>
                  <TrendingDown size={14} color={COLORS.amber} />
                  Postergadas para o próximo mês
                </p>
                {postergadas.map((p) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, padding: "6px 0", borderTop: "1px solid " + COLORS.lineSoft }}>
                    <span style={{ flex: 1, color: COLORS.ink, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.descricao}</span>
                    <span style={{ color: COLORS.ink }}>{fmt(p.valor)}</span>
                    {p.jurosEstimados > 0 && <span style={{ color: COLORS.rust }}>+{fmt(p.jurosEstimados)} de juros</span>}
                  </div>
                ))}
              </Card>
            )}

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={onNewPlanned} style={{ minHeight: 44, padding: "0 16px", borderRadius: 10, border: "1px solid " + COLORS.green, background: "transparent", color: COLORS.green, fontWeight: 600, fontSize: 14 }}>
                <Plus size={15} style={{ verticalAlign: -2, marginRight: 6 }} />Novo previsto
              </button>
              {/* "Fechar mês" era um ícone solto sem rótulo entre dois filtros. */}
              <button onClick={onCloseMonth} style={{ minHeight: 44, padding: "0 16px", borderRadius: 10, border: "1px solid " + COLORS.line, background: COLORS.card, color: COLORS.fg2, fontWeight: 600, fontSize: 14 }}>
                <CheckCircle2 size={15} style={{ verticalAlign: -2, marginRight: 6 }} />Fechar o mês
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ─────────────── coluna de apoio ─────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>

        {temRestrito && (
          <SupportCard
            icon={ShoppingCart}
            color={COLORS.amber}
            title="Cartão alimentação"
            subtitle={"entra " + (diasBeneficio ? "nos dias " + diasBeneficio : "no mês") + " · só " + categoriasBeneficio}
          >
            <p className="serif" style={{ fontSize: 24, fontWeight: 600, margin: 0, color: COLORS.ink }}>{mask(beneficio.total)}</p>
          </SupportCard>
        )}

        <MonthAnalysis meses={projectedBalance} moeda={mask} />
      </div>

      {/* O detalhe da nota: o número primeiro, a régua do cálculo depois. */}
      {showHealthInfo && <HealthModal health={health} onClose={() => setShowHealthInfo(false)} />}

      {/* Alertas: lista com hierarquia e o atalho de pagar na própria linha. */}
      {showAlerts && (
        <AlertsModal
          alerts={alerts}
          onPay={(alvo) => { setShowAlerts(false); onPay(alvo); }}
          onClose={() => setShowAlerts(false)}
        />
      )}
    </div>
  );
}

export default InicioView;
