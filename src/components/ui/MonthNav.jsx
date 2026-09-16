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
// Duas apresentações, o MESMO estado e os MESMOS controles:
//   tom="claro"  (padrão) — topbar do desktop e telas de fundo claro;
//   tom="escuro" — dentro do herói da Início, com a estrutura do protótipo
//                  `home-mobile-hero-v3.html`: setas sem caixa, rótulo grande
//                  centralizado e o selo do mês ao lado.
//
// O rótulo continua sendo um botão (abre a lista de meses) — no protótipo ele
// é um <div>, aqui precisa continuar clicável porque é o único caminho para
// escolher um mês distante. No desktop a lista é um popover ancorado; no
// celular, a gaveta, que é o padrão certo para a mão.
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

export function MonthNav({ month, onChange, compact, tom = 'claro' }) {
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
  const statusCurto = month === TODAY_MONTH ? 'atual' : isFuture ? 'projetado' : 'encerrado';

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
                type="button"
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
                boxShadow: "0 18px 48px rgba(21,19,42,0.28)", padding: 14,
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

  // ── tom claro: topbar e demais telas ─────────────────────────────────────
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
      <button type="button" onClick={() => onChange(addMonths(month, -1))} aria-label="Mês anterior" data-od-id="mes-anterior" style={arrowStyle}>
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

      <button type="button" onClick={() => onChange(addMonths(month, 1))} aria-label="Próximo mês" data-od-id="proximo-mes" style={arrowStyle}>
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
              boxShadow: "0 18px 48px rgba(21,19,42,0.28)", padding: 14,
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
