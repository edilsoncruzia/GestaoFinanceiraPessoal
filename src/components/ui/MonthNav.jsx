import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { COLORS } from '../../constants/tokens';
import { TODAY_MONTH } from '../../constants/seedData';
import { addMonths, monthDiff, monthLabelFull } from '../../utils/formatters';
import { ModalSheet } from './ModalSheet';

export function MonthNav({ month, onChange }) {
  const [open, setOpen] = useState(false);
  const isFuture = monthDiff(TODAY_MONTH, month) > 0;

  // Lista deslizável de meses (24 para trás, 60 para frente) — sempre em formato mês/ano.
  const months = useMemo(() => Array.from({ length: 85 }, (_, i) => addMonths(TODAY_MONTH, i - 24)), []);

  function pick(m) {
    onChange(m);
    setOpen(false);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
      <button onClick={() => onChange(addMonths(month, -1))} aria-label="Mês anterior" style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid " + COLORS.line, background: COLORS.card, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.ink, flexShrink: 0 }}>
        <ChevronLeft size={16} />
      </button>

      <button onClick={() => setOpen(true)} aria-label="Selecionar mês" style={{ flex: 1, margin: "0 8px", textAlign: "center", background: "none", border: "none", padding: "4px 0" }}>
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
          <span className="serif" style={{ fontSize: 16, fontWeight: 500, textTransform: "capitalize", color: COLORS.ink }}>{monthLabelFull(month)}</span>
          <ChevronDown size={14} color={COLORS.muted} />
        </span>
        {isFuture && <span style={{ display: "block", fontSize: 11, color: COLORS.amber, margin: 0 }}>mês projetado</span>}
        {month === TODAY_MONTH && <span style={{ display: "block", fontSize: 11, color: COLORS.muted, margin: 0 }}>mês atual</span>}
      </button>

      <button onClick={() => onChange(addMonths(month, 1))} aria-label="Próximo mês" style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid " + COLORS.line, background: COLORS.card, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.ink, flexShrink: 0 }}>
        <ChevronRight size={16} />
      </button>

      {open && (
        <ModalSheet title="Selecionar mês" onClose={() => setOpen(false)}>
          <p style={{ fontSize: 12, color: COLORS.muted, margin: "0 0 10px" }}>Escolha o mês/ano que será o contexto da tela.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {months.map((m) => {
              const active = m === month;
              const isToday = m === TODAY_MONTH;
              return (
                <button
                  key={m}
                  onClick={() => pick(m)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1px solid " + (active ? COLORS.green : COLORS.line),
                    background: active ? COLORS.green : COLORS.card,
                    color: active ? "#fff" : COLORS.ink,
                    fontSize: 14,
                    fontWeight: active ? 600 : 400,
                    textTransform: "capitalize",
                  }}
                >
                  <span>{monthLabelFull(m)}</span>
                  {isToday && (
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 20, background: active ? "rgba(255,255,255,0.2)" : COLORS.green + "1A", color: active ? "#fff" : COLORS.green }}>atual</span>
                  )}
                </button>
              );
            })}
          </div>
        </ModalSheet>
      )}
    </div>
  );
}
