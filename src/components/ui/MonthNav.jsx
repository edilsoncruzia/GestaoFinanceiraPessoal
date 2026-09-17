import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Calendar, ArrowUpRight, ArrowDownRight, Check, Info } from 'lucide-react';
import { COLORS, TOUCH, RADIUS } from '../../constants/tokens';
import { TODAY_MONTH } from '../../constants/seedData';
import { addMonths, monthDiff, monthLabelFull, pad2 } from '../../utils/formatters';
import { useDevice } from '../../hooks/useDevice';
import { ModalSheet } from './ModalSheet';

// ============================================================================
// MonthNav — o seletor de contexto do app inteiro
//
// Duas apresentações, o MESMO estado e os MESMOS controles:
//   tom="claro"  (padrão) — topbar do desktop e telas de fundo claro;
//   tom="escuro" — dentro do herói da Início.
//
// O painel que abre é o "Período" (modelo aprovado): ícone de calendário,
// faixa de ANOS com setas, os DOZE meses em grade de três colunas e um rodapé
// explicando que a escolha vale para o app inteiro.
//
// ── A COR DE CADA MÊS É UM DADO, NÃO DECORAÇÃO ────────────────────────────
// Verde e vermelho dizem o que aconteceu (ou vai acontecer) com o SALDO NO FIM
// DAQUELE MÊS, dentro do ano selecionado:
//   verde  → o mês fecha no azul ("Receita maior")
//   vermelho → o mês fecha no vermelho ("Despesa alta")
// Quem calcula é `saldoDoMes(month)`, injetado pelo App: o saldo de hoje mais
// o fluxo acumulado até o fim do mês — os meses passados são reconstruídos
// para trás a partir do saldo atual. Sem essa função, os cartões caem no
// neutro em vez de mentir uma cor.
// ============================================================================

const arrowStyle = (tom) => ({
  width: TOUCH.min,
  height: TOUCH.min,
  borderRadius: 10,
  border: "1px solid " + COLORS.line,
  background: COLORS.card,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: COLORS.ink,
  flexShrink: 0,
});

const NOMES_CURTOS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const VERDE = { topo: "#10B981", base: "#047857" };
const VERMELHO = { topo: "#EF4444", base: "#B91C1C" };
const NEUTRO = { topo: "#94A3B8", base: "#64748B" };

// ============================================================================
// Cartão de um mês. Três estados visuais: positivo, negativo e selecionado
// (o selecionado ganha o anel da marca e o selo de conferido).
// ============================================================================
function CartaoMes({ ano, mes, selecionado, ehMesAtual, saldo, onPick }) {
  const chave = ano + "-" + pad2(mes);
  const temSaldo = typeof saldo === "number" && Number.isFinite(saldo);
  const positivo = temSaldo ? saldo >= 0 : null;
  const cor = positivo === null ? NEUTRO : positivo ? VERDE : VERMELHO;
  const IconeSeta = positivo === null ? null : positivo ? ArrowUpRight : ArrowDownRight;
  const legenda = positivo === null ? "Sem projeção" : positivo ? "Receita maior" : "Despesa alta";

  return (
    <button
      type="button"
      onClick={() => onPick(chave)}
      aria-current={selecionado ? "true" : undefined}
      aria-label={
        NOMES_CURTOS[mes - 1] + " de " + ano + " · " + legenda +
        (temSaldo ? " · saldo de " + Math.round(saldo) + " reais no fim do mês" : "") +
        (ehMesAtual ? " · mês atual" : "")
      }
      style={{
        position: "relative",
        display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4,
        minHeight: 84, padding: "10px 10px 9px", borderRadius: 14, overflow: "hidden",
        border: "none",
        background: "linear-gradient(158deg," + cor.topo + " 0%," + cor.base + " 100%)",
        color: "#fff", textAlign: "left",
        boxShadow: selecionado
          ? "0 0 0 3px " + COLORS.accent + ", 0 6px 16px -6px rgba(21,19,42,.4)"
          : "0 2px 6px -3px rgba(21,19,42,.28)",
      }}
    >
      {/* marca d'água: a "onda" clara que dá volume ao cartão no modelo */}
      <span aria-hidden="true" style={{
        position: "absolute", right: -18, bottom: -22, width: 68, height: 68, borderRadius: "50%",
        background: "rgba(255,255,255,.16)",
      }} />
      <span aria-hidden="true" style={{
        position: "absolute", right: -34, bottom: -34, width: 84, height: 84, borderRadius: "50%",
        background: "rgba(255,255,255,.10)",
      }} />

      <span style={{
        width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(255,255,255,.24)", flexShrink: 0,
      }}>
        {IconeSeta ? <IconeSeta size={13} strokeWidth={2.6} /> : <Calendar size={12} />}
      </span>

      <span style={{ position: "relative", fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 800, letterSpacing: "-.02em", lineHeight: 1.1 }}>
        {NOMES_CURTOS[mes - 1]}
      </span>
      <span style={{ position: "relative", fontSize: 11.5, fontWeight: 600, color: "rgba(255,255,255,.88)", lineHeight: 1.15 }}>
        {legenda}
      </span>

      {selecionado && (
        <span aria-hidden="true" style={{
          position: "absolute", top: 7, right: 7, width: 19, height: 19, borderRadius: "50%",
          background: "#fff", color: COLORS.accent, display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 5px rgba(21,19,42,.25)",
        }}>
          <Check size={12} strokeWidth={3.2} />
        </span>
      )}
    </button>
  );
}

// ============================================================================
// O painel "Período" inteiro — usado igual na gaveta e no popover do desktop.
// ============================================================================
export function SeletorPeriodo({ month, onChange, saldoDoMes, onPick }) {
  const anoSelecionado = Number(month.slice(0, 4));
  const [ano, setAno] = useState(anoSelecionado);
  const mesAtual = Number(TODAY_MONTH.slice(5, 7));
  const anoAtual = Number(TODAY_MONTH.slice(0, 4));

  // A faixa de anos acompanha o ano do mês em exibição: cinco anos centrados
  // nele, para chegar em 2028 ou 2032 com um toque em vez de um scroll infinito.
  const anos = useMemo(
    () => Array.from({ length: 5 }, (_, i) => anoSelecionado - 2 + i),
    [anoSelecionado]
  );

  return (
    <div>
      {/* faixa de anos */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 14 }}>
        <button
          type="button"
          aria-label="Anos anteriores"
          onClick={() => setAno((a) => a - 5)}
          style={{ width: 34, height: 34, borderRadius: 10, border: "1px solid " + COLORS.border, background: COLORS.surface, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.fg2, flexShrink: 0 }}
        >
          <ChevronLeft size={16} />
        </button>
        <div style={{ flex: 1, display: "flex", gap: 4, minWidth: 0 }}>
          {anos.map((a) => {
            const ativo = a === ano;
            return (
              <button
                key={a}
                type="button"
                onClick={() => setAno(a)}
                aria-pressed={ativo}
                style={{
                  flex: 1, minWidth: 0, minHeight: 40, borderRadius: 10,
                  border: "1.5px solid " + (ativo ? COLORS.accent : COLORS.border),
                  background: ativo ? COLORS.accent : COLORS.surface,
                  color: ativo ? "#fff" : COLORS.fg2,
                  fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700,
                }}
              >{a}</button>
            );
          })}
        </div>
        <button
          type="button"
          aria-label="Anos seguintes"
          onClick={() => setAno((a) => a + 5)}
          style={{ width: 34, height: 34, borderRadius: 10, border: "1px solid " + COLORS.border, background: COLORS.surface, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.fg2, flexShrink: 0 }}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* os doze meses */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
        {NOMES_CURTOS.map((_, i) => {
          const mes = i + 1;
          const chave = ano + "-" + pad2(mes);
          return (
            <CartaoMes
              key={chave}
              ano={ano}
              mes={mes}
              selecionado={chave === month}
              ehMesAtual={chave === TODAY_MONTH}
              saldo={saldoDoMes ? saldoDoMes(chave) : undefined}
              onPick={onPick}
            />
          );
        })}
      </div>

      <div style={{
        display: "flex", gap: 10, alignItems: "flex-start", marginTop: 16,
        background: COLORS.infoSoft, border: "1px solid " + COLORS.info + "33",
        borderRadius: RADIUS.control, padding: "11px 13px",
      }}>
        <Info size={16} color={COLORS.info} style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ margin: 0, fontSize: 13.5, color: COLORS.ink, lineHeight: 1.45 }}>
          O período selecionado será aplicado em todo o app, incluindo o saldo projetado e os gráficos.
          {anoAtual !== ano ? " Você está vendo " + ano + "." : ""}
        </p>
      </div>
    </div>
  );
}

export function MonthNav({ month, onChange, compact, tom = 'claro', saldoDoMes }) {
  const [open, setOpen] = useState(false);
  const { isDesktop } = useDevice();
  const isFuture = monthDiff(TODAY_MONTH, month) > 0;

  function pick(m) {
    onChange(m);
    setOpen(false);
  }

  const status = month === TODAY_MONTH
    ? { label: "mês atual", color: COLORS.muted, bg: COLORS.cardRaised }
    : isFuture
      ? { label: "mês projetado", color: COLORS.amber, bg: COLORS.amber + "1A" }
      : { label: "mês encerrado", color: COLORS.muted, bg: COLORS.cardRaised };
  const statusCurto = month === TODAY_MONTH ? 'atual' : isFuture ? 'projetado' : 'encerrado';

  const painel = <SeletorPeriodo month={month} onChange={onChange} saldoDoMes={saldoDoMes} onPick={pick} />;

  // Botão "Hoje" no cabeçalho: volta para o mês corrente sem precisar caçar o
  // ano na faixa — o atalho que o modelo põe ao lado do X.
  const botaoHoje = (
    <button
      type="button"
      onClick={() => pick(TODAY_MONTH)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6, minHeight: 38, padding: "0 13px",
        borderRadius: 11, border: "1.5px solid " + COLORS.accent, background: COLORS.accentSoft,
        color: COLORS.accent, fontFamily: "var(--font-display)", fontSize: 14.5, fontWeight: 700,
        marginTop: -6,
      }}
    >
      <Calendar size={15} />Hoje
    </button>
  );

  const tituloPainel = (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <span style={{
        width: 38, height: 38, borderRadius: 12, background: COLORS.accentSoft, color: COLORS.accent,
        display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Calendar size={19} />
      </span>
      Período
    </span>
  );

  // ── popover / gaveta ─────────────────────────────────────────────────────
  const painelDesktop = open && isDesktop && (
    <>
      <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 55 }} aria-hidden="true" />
      <div
        role="dialog"
        aria-label="Selecionar período"
        style={{
          position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 56, width: 400,
          background: COLORS.card, border: "1px solid " + COLORS.line, borderRadius: 18,
          boxShadow: "0 18px 48px rgba(21,19,42,0.28)", padding: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <span style={{ flex: 1, fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 9 }}>
            <Calendar size={18} color={COLORS.accent} />Período
          </span>
          {botaoHoje}
        </div>
        {painel}
      </div>
    </>
  );

  const painelMovel = open && !isDesktop && (
    <ModalSheet
      title={tituloPainel}
      subtitulo="Selecione o ano e o mês desejado"
      onClose={() => setOpen(false)}
      posicao="topo"
      acao={botaoHoje}
    >
      {painel}
    </ModalSheet>
  );

  // ── tom escuro: o seletor dentro do herói da Início ──────────────────────
  if (tom === 'escuro') {
    return (
      <div className="monthnav">
        <button type="button" className="chev" onClick={() => onChange(addMonths(month, -1))}
          aria-label="Mês anterior" data-od-id="mes-anterior">
          <ChevronLeft size={18} />
        </button>

        <button
          type="button"
          className="lab"
          onClick={() => setOpen((v) => !v)}
          aria-label="Selecionar mês"
          aria-haspopup="dialog"
          aria-expanded={open}
          data-od-id="seletor-de-mes"
        >
          <strong>{monthLabelFull(month)}</strong>
          <em>{statusCurto}</em>
        </button>

        <button type="button" className="chev" onClick={() => onChange(addMonths(month, 1))}
          aria-label="Próximo mês" data-od-id="proximo-mes">
          <ChevronRight size={18} />
        </button>

        {painelDesktop}
        {painelMovel}
      </div>
    );
  }

  // ── tom claro: topbar e demais telas ─────────────────────────────────────
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
      <button type="button" onClick={() => onChange(addMonths(month, -1))} aria-label="Mês anterior" data-od-id="mes-anterior" style={arrowStyle(tom)}>
        <ChevronLeft size={17} />
      </button>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Selecionar mês"
        aria-haspopup="dialog"
        aria-expanded={open}
        data-od-id="seletor-de-mes"
        style={{
          display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2,
          minHeight: TOUCH.min, padding: "4px 12px", borderRadius: 10,
          background: "none", border: "none", textAlign: "left",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span className="serif" style={{ fontSize: 19, fontWeight: 700, textTransform: "capitalize", color: COLORS.ink }}>
            {monthLabelFull(month)}
          </span>
          <ChevronDown size={15} color={COLORS.muted} />
        </span>
        <span style={{
          fontSize: 13, fontWeight: 600, padding: "1px 8px", borderRadius: 20,
          background: status.bg, color: status.color,
        }}>{status.label}</span>
      </button>

      <button type="button" onClick={() => onChange(addMonths(month, 1))} aria-label="Próximo mês" data-od-id="proximo-mes" style={arrowStyle(tom)}>
        <ChevronRight size={17} />
      </button>

      {painelDesktop}
      {painelMovel}
    </div>
  );
}

export default MonthNav;
