import React, { useState, useRef } from 'react';
import {
  Wallet, EyeOff, Eye, Coins, CalendarClock, Info, ArrowUpRight, ArrowDownLeft, ChevronRight,
  HeartPulse, Bell, AlertTriangle, TrendingUp, TrendingDown, Calendar,
  Plus, CheckCircle2, MoreVertical, Pencil, Trash2, CreditCard, Download, Users, User, PiggyBank, ShoppingCart, CalendarDays, BarChart3, Tag
} from 'lucide-react';
import { COLORS, PRIORITY, DEFAULT_PRIORITY } from '../../constants/tokens';
import { useCategories } from '../../context/CategoriesContext';
import { TODAY_DATE, TODAY_MONTH } from '../../constants/seedData';
import { fmt, fmtDate, round2, inScope, displayStatus, recurrenceIcon, recurrenceLabel, memberLabel, plannedStatus, monthLabelFull } from '../../utils/formatters';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { CategoryIcon } from '../ui/CategoryIcon';
import { ModalSheet } from '../ui/ModalSheet';
import { BalanceHero } from '../ui/BalanceHero';
import { BillCard } from '../ui/BillCard';
import { MonthNav } from '../ui/MonthNav';
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
  const [menuOpen, setMenuOpen] = useState(false);
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
        <p style={{ fontSize: 13, margin: "0 0 10px", color: COLORS.rust }}>Excluir "{item.description}"?</p>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setConfirming(false)} style={{ flex: 1, minHeight: 44, fontSize: 12.5, borderRadius: 10, border: "1px solid " + COLORS.line, background: "transparent", color: COLORS.fg2 }}>Cancelar</button>
          <button onClick={() => { onDelete(item, "current"); setConfirming(false); }} style={{ flex: 1, minHeight: 44, fontSize: 12.5, borderRadius: 10, border: "1px solid " + COLORS.green, background: "transparent", color: COLORS.green, fontWeight: 600 }}>Apenas este mês</button>
          <button onClick={() => { onDelete(item, "all"); setConfirming(false); }} style={{ flex: 1, minHeight: 44, fontSize: 12.5, borderRadius: 10, border: "none", background: COLORS.rust, color: "#fff", fontWeight: 600 }}>Todos os futuros</button>
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
      mes={Number(selectedMonth.slice(5, 7))}
      hoje={hojeDia}
      Icone={categories[item.category]?.icon || Tag}
      onAbrir={() => onEdit(item)}
      onPagar={() => onPay(item)}
      acoes={
        <div>
          {item.motorStatus === "atencao_necessaria" && (
            <p style={{ fontSize: 11.5, color: COLORS.rust, margin: "12px 0 0", fontWeight: 600 }}>
              O motor indica atenção: {item.motorStatusLabel || "o caixa não cobre este valor no mês"}.
            </p>
          )}
          {(item.formaPagamento || "normal") === "reserva" && (
            <p style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 600, color: COLORS.warn, margin: "8px 0 0" }}>
              <PiggyBank size={11} />sai da reserva
            </p>
          )}
          {item.agrupadas && <p style={{ fontSize: 11.5, color: COLORS.muted, margin: "6px 0 0" }}>inclui {item.agrupadas}</p>}
          <div style={{ position: "relative", marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
            <button onClick={() => setMenuOpen((v) => !v)} aria-label="Mais opções" className="icon-btn" style={{ background: "none", border: "none", color: COLORS.muted }}>
              <MoreVertical size={16} />
            </button>
            {menuOpen && (
              <div style={{ position: "absolute", top: 40, right: 0, background: COLORS.card, border: "1px solid " + COLORS.line, borderRadius: 10, boxShadow: "0 6px 18px rgba(0,0,0,0.12)", zIndex: 3, overflow: "hidden" }}>
                <button onClick={() => { setMenuOpen(false); onEdit(item); }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", minHeight: 44, padding: "0 14px", background: "none", border: "none", fontSize: 13, color: COLORS.ink, whiteSpace: "nowrap" }}><Pencil size={14} />Editar</button>
                <button onClick={() => { setMenuOpen(false); setConfirming(true); }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", minHeight: 44, padding: "0 14px", background: "none", border: "none", borderTop: "1px solid " + COLORS.line, fontSize: 13, color: COLORS.rust, whiteSpace: "nowrap" }}><Trash2 size={14} />Excluir</button>
              </div>
            )}
          </div>
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
        <p style={{ fontSize: 16.5, fontWeight: 600, margin: 0, color }}>{value}</p>
        <p style={{ fontSize: 11.5, color: COLORS.muted, margin: 0 }}>{label}{hint ? " · " + hint : ""}</p>
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
          <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: COLORS.ink }}>{title}</p>
          {subtitle && <p style={{ fontSize: 11.5, color: COLORS.muted, margin: "1px 0 0" }}>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}

export function InicioView({ balance, availableBalance, reservedAmount, availableNow, monthProjection, isCurrentMonth, health, alerts, monthIncome, monthExpense, projectedBalance, onSelectMonth, openItems: allOpenItems, memberFilter, onChangeMemberFilter, hideBalance, onToggleHide, onSeeAll, onPay, onEditPlanned, onDeletePlanned, onNewPlanned, onCloseMonth, postergadas, pacing, dias, reservaMinima, reservaUsada, reservaDisponivel, reservaConfigurada, reservaAporte, reservaReceita, reservaDespesa, reservaSobra, reservaDeficit, beneficio, carryRestrito, selectedMonth, onOpenReserva, autoDetalhes }) {
  const [sortBy, setSortBy] = useState("indicada");
  const [showHealthInfo, setShowHealthInfo] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const categories = useCategories();
  const mask = (v) => (hideBalance ? "R$ • • • • •" : fmt(v));

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
  // Nome da pessoa filtrada (a pílula do herói) — null quando o filtro é "Todos".
  const pessoa = memberFilter != null && String(memberFilter) !== "todos" ? memberLabel(Number(memberFilter)) : null;

  return (
    <div className="grid-auto">
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
          contexto={<MonthNav month={selectedMonth} onChange={onSelectMonth} tom="escuro" />}
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
        <section aria-labelledby="titulo-contas-abertas" style={{ marginTop: 4 }}>
          <div className="screen-head" style={{ marginBottom: 10 }}>
            <h2 id="titulo-contas-abertas" className="serif" style={{ fontSize: 21, fontWeight: 500, margin: 0 }}>
              Contas em aberto
            </h2>
            <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
              {[["indicada", "Data indicada"], ["vencimento", "Vencimento"]].map(([v, l]) => (
                <button key={v} onClick={() => setSortBy(v)} aria-pressed={sortBy === v}
                  style={{
                    minHeight: 36, padding: "0 12px", borderRadius: 10, fontSize: 12.5, fontWeight: 600,
                    border: "1px solid " + (sortBy === v ? COLORS.green : COLORS.line),
                    background: sortBy === v ? COLORS.green : COLORS.card,
                    color: sortBy === v ? "#fff" : COLORS.fg2,
                  }}>{l}</button>
              ))}
            </div>
          </div>

          {openItems.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "0 11px", minHeight: 30,
                borderRadius: 999, background: COLORS.surface, border: "1px solid " + COLORS.border,
                fontSize: 12, fontWeight: 600, color: COLORS.fg2 }}>
                <b className="num" style={{ color: COLORS.expense }}>{mask(openPagar)}</b> a pagar
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "0 11px", minHeight: 30,
                borderRadius: 999, background: COLORS.surface, border: "1px solid " + COLORS.border,
                fontSize: 12, fontWeight: 600, color: COLORS.fg2 }}>
                <b className="num" style={{ color: COLORS.income }}>{mask(openReceber)}</b> a receber
              </span>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {openItems.length === 0 && (
              <Card style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <CheckCircle2 size={18} color={COLORS.green} />
                <p style={{ fontSize: 13.5, margin: 0 }}>Tudo em dia por aqui — nada pendente.</p>
              </Card>
            )}
            {openItems.slice(0, 5).map((item) => (
              <PlannedCard key={item.occId} item={item} selectedMonth={selectedMonth} onPay={onPay} onEdit={onEditPlanned} onDelete={onDeletePlanned} />
            ))}

            {openItems.length > 5 && (
              <button onClick={onSeeAll} style={{
                width: "100%", minHeight: 48, marginTop: 4, borderRadius: 12,
                border: "1px solid " + COLORS.line, background: COLORS.card,
                color: COLORS.accent, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13.5,
              }}>
                Ver todas as {openItems.length} contas em aberto
              </button>
            )}

            {postergadas.length > 0 && (
              <Card>
                <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 8px", display: "flex", alignItems: "center", gap: 6 }}>
                  <TrendingDown size={14} color={COLORS.amber} />
                  Postergadas para o próximo mês
                </p>
                {postergadas.map((p) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, padding: "6px 0", borderTop: "1px solid " + COLORS.lineSoft }}>
                    <span style={{ flex: 1, color: COLORS.ink, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.descricao}</span>
                    <span style={{ color: COLORS.ink }}>{fmt(p.valor)}</span>
                    {p.jurosEstimados > 0 && <span style={{ color: COLORS.rust }}>+{fmt(p.jurosEstimados)} de juros</span>}
                  </div>
                ))}
              </Card>
            )}

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={onNewPlanned} style={{ minHeight: 44, padding: "0 16px", borderRadius: 10, border: "1px solid " + COLORS.green, background: "transparent", color: COLORS.green, fontWeight: 600, fontSize: 13 }}>
                <Plus size={15} style={{ verticalAlign: -2, marginRight: 6 }} />Novo previsto
              </button>
              {/* "Fechar mês" era um ícone solto sem rótulo entre dois filtros. */}
              <button onClick={onCloseMonth} style={{ minHeight: 44, padding: "0 16px", borderRadius: 10, border: "1px solid " + COLORS.line, background: COLORS.card, color: COLORS.fg2, fontWeight: 600, fontSize: 13 }}>
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

      {showHealthInfo && (
        <ModalSheet title="Saúde financeira — como é calculada" onClose={() => setShowHealthInfo(false)}>
          <p style={{ fontSize: 13, color: COLORS.fg2, margin: "0 0 12px" }}>
            A pontuação vai de <strong>0 a 100</strong> e começa em 100. Cada situação abaixo desconta pontos:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {[
              ["Orçamentos estourados", "−15 por orçamento acima do limite · −5 no limite"],
              ["Despesas acima da receita", "−25 quando o mês fechou no vermelho"],
              ["Poupança insuficiente", "−20 se gastou além da renda · −8 se guarda menos de 15%"],
            ].map(([t, d]) => (
              <div key={t} style={{ padding: "10px 12px", borderRadius: 12, background: COLORS.cardSunken, border: "1px solid " + COLORS.lineSoft }}>
                <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 2px", color: COLORS.ink }}>{t}</p>
                <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}>{d}</p>
              </div>
            ))}
          </div>

          <p className="eyebrow" style={{ color: COLORS.green, marginBottom: 8 }}>Neste mês</p>
          {health.factors.length === 0 ? (
            <p style={{ fontSize: 13, color: COLORS.green, margin: 0 }}>Nenhum desconto aplicado — pontuação máxima.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {health.factors.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ minWidth: 34, fontSize: 13, fontWeight: 700, color: COLORS.rust, flexShrink: 0 }}>{f.impact}</span>
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

      {showAlerts && (
        <ModalSheet title={alerts.length === 1 ? "1 alerta" : alerts.length + " alertas"} onClose={() => setShowAlerts(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {alerts.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px", borderRadius: 12, background: COLORS.cardSunken, border: "1px solid " + COLORS.lineSoft }}>
                <AlertTriangle size={16} color={a.level === "rust" ? COLORS.rust : COLORS.amber} style={{ marginTop: 2, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: COLORS.ink, lineHeight: 1.45 }}>{a.text}</span>
              </div>
            ))}
          </div>
        </ModalSheet>
      )}
    </div>
  );
}

export default InicioView;
