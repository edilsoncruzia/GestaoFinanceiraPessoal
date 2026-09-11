import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { COLORS, TOUCH } from '../../constants/tokens';
import { TODAY_MONTH } from '../../constants/seedData';
import { addMonths, monthDiff, monthLabelFull } from '../../utils/formatters';
import { useDevice } from '../../hooks/useDevice';
import { ModalSheet } from './ModalSheet';

// ============================================================================
// MonthNav — o seletor de contexto do app inteiro
//
// Mudanças desta rodada:
//  1. Alvos de toque de 36px -> 44px. Em um app usado no ônibus, 36px erra o
//     toque, e as duas setas são o controle mais usado da tela.
//  2. O dropdown usava el.scrollIntoView, que rola o container errado em
//     preview embutido. Trocado por scrollTop calculado — comportamento
//     idêntico (centraliza no mês atual ao abrir) sem o efeito colateral.
//  3. No desktop a lista vira um popover ancorado; no celular continua sendo
//     a gaveta, que é o padrão certo para a mão.
//  4. O estado do mês ("mês atual" / "mês projetado") estava em 11px solto
//     embaixo do título; agora é um selo com cor + texto.
// ============================================================================

const arrowStyle = {
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
};

export function MonthNav({ month, onChange, compact }) {
  const [open, setOpen] = useState(false);
  const listRef = useRef(null);
  const { isDesktop } = useDevice();
  const isFuture = monthDiff(TODAY_MONTH, month) > 0;

  // Lista deslizável de meses (24 para trás, 60 para frente) — sempre mês/ano.
  const months = useMemo(() => Array.from({ length: 85 }, (_, i) => addMonths(TODAY_MONTH, i - 24)), []);

  // Centraliza a lista no MÊS ATUAL (não no selecionado) ao abrir — sem
  // scrollIntoView, para não arrastar a página junto.
  useEffect(() => {
    if (!open || !listRef.current) return;
    const list = listRef.current;
    const el = list.querySelector('[data-month="' + TODAY_MONTH + '"]');
    if (!el) return;
    list.scrollTop = el.offsetTop - list.clientHeight / 2 + el.clientHeight / 2;
  }, [open]);

  function pick(m) {
    onChange(m);
    setOpen(false);
  }

  const status = month === TODAY_MONTH
    ? { label: "mês atual", color: COLORS.muted, bg: COLORS.cardRaised }
    : isFuture
      ? { label: "mês projetado", color: COLORS.amber, bg: COLORS.amber + "1A" }
      : { label: "mês encerrado", color: COLORS.muted, bg: COLORS.cardRaised };

  const listContent = (
    <>
      <p style={{ fontSize: 12, color: COLORS.muted, margin: "0 0 10px" }}>Escolha o mês/ano que será o contexto de todas as telas.</p>
      <div ref={listRef} style={{ maxHeight: 340, overflowY: "auto", overflowX: "hidden", paddingRight: 4 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {months.map((m) => {
            const active = m === month;
            const isToday = m === TODAY_MONTH;
            return (
              <button
                key={m}
                data-month={m}
                onClick={() => pick(m)}
                aria-current={active ? "true" : undefined}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  width: "100%", minHeight: TOUCH.min, padding: "10px 14px", borderRadius: 10,
                  border: "1px solid " + (active ? COLORS.green : COLORS.line),
                  background: active ? COLORS.green : COLORS.card,
                  color: active ? "#fff" : COLORS.ink,
                  fontSize: 14, fontWeight: active ? 600 : 400, textTransform: "capitalize",
                }}
              >
                <span>{monthLabelFull(m)}</span>
                {isToday && (
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20,
                    background: active ? "rgba(255,255,255,0.22)" : COLORS.green + "1A",
                    color: active ? "#fff" : COLORS.green,
                  }}>atual</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
      <button onClick={() => onChange(addMonths(month, -1))} aria-label="Mês anterior" data-od-id="mes-anterior" style={arrowStyle}>
        <ChevronLeft size={17} />
      </button>

      <button
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
          <span className="serif" style={{ fontSize: 17, fontWeight: 500, textTransform: "capitalize", color: COLORS.ink }}>
            {monthLabelFull(month)}
          </span>
          <ChevronDown size={14} color={COLORS.muted} />
        </span>
        <span style={{
          fontSize: 11.5, fontWeight: 600, padding: "1px 8px", borderRadius: 20,
          background: status.bg, color: status.color,
        }}>{status.label}</span>
      </button>

      <button onClick={() => onChange(addMonths(month, 1))} aria-label="Próximo mês" data-od-id="proximo-mes" style={arrowStyle}>
        <ChevronRight size={17} />
      </button>

      {/* Desktop: popover ancorado, sem escurecer a tela inteira. */}
      {open && isDesktop && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 55 }} aria-hidden="true" />
          <div
            role="dialog"
            aria-label="Selecionar mês"
            style={{
              position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 56, width: 320,
              background: COLORS.card, border: "1px solid " + COLORS.line, borderRadius: 14,
              boxShadow: "0 18px 48px rgba(27,42,47,0.22)", padding: 14,
            }}
          >
            {listContent}
          </div>
        </>
      )}

      {/* Celular e tablet: gaveta. */}
      {open && !isDesktop && (
        <ModalSheet title="Selecionar mês" onClose={() => setOpen(false)}>{listContent}</ModalSheet>
      )}
    </div>
  );
}

export default MonthNav;
