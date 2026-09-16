import React, { useState } from "react";
import { Check } from "lucide-react";
import { COLORS, TOUCH } from "../../constants/tokens";
import { MEMBERS } from "../../constants/seedData";
import { ModalSheet } from "./ModalSheet";

// ============================================================================
// MemberFilterIcon — o filtro de pessoa como ícone na linha da marca do herói.
//
// O mesmo estado (`memberFilter`) do MemberFilterBar, montado como ícone ao
// lado do anel de saúde e do sino, como no protótipo. Com filtro ativo, o
// ícone ganha um ponto — dá para ver que a tela está recortada sem abrir nada.
//
// O glifo é o do protótipo (três linhas decrescentes), desenhado aqui porque
// não há equivalente exato no lucide; a classe `iconbtn plain` é a mesma dos
// outros controles do topo do herói.
// ============================================================================

// I.Filter do protótipo: três linhas centradas de largura decrescente.
const IconeFiltro = ({ size = 19 }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
  >
    <path d="M4 6h16" />
    <path d="M7 12h10" />
    <path d="M10 18h4" />
  </svg>
);

export function MemberFilterIcon({ value = "todos", onChange }) {
  const [aberto, setAberto] = useState(false);
  const ativo = value !== "todos";
  const nomeAtivo = ativo ? (MEMBERS.find((m) => String(m.id) === String(value))?.name || "pessoa") : null;

  const opcoes = [
    { v: "todos", n: "Todos", d: "Você e " + (MEMBERS.map((m) => m.name).join(" e ") || "as outras pessoas") + " juntos" },
    ...MEMBERS.map((m) => ({ v: String(m.id), n: m.name, d: "Somente lançamentos de " + m.name })),
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        aria-label={ativo ? "Filtrando por " + nomeAtivo + ". Trocar filtro" : "Filtrar por pessoa"}
        aria-haspopup="dialog"
        data-od-id="filtro-pessoa"
        className="iconbtn plain"
      >
        <IconeFiltro size={19} />
        {ativo && (
          <span aria-hidden="true" style={{
            position: "absolute", top: 8, right: 9, width: 7, height: 7, borderRadius: "50%",
            background: "#DDD6FE", border: "1.5px solid #4C1D95",
          }} />
        )}
      </button>

      {aberto && (
        <ModalSheet title="Ver dados de" onClose={() => setAberto(false)}>
          <p style={{ fontSize: 12.5, color: COLORS.muted, margin: "0 0 14px" }}>
            O filtro vale para todas as telas.
          </p>
          {opcoes.map((o) => {
            const marcado = String(value) === o.v;
            return (
              <button
                key={o.v}
                type="button"
                onClick={() => { onChange(o.v); setAberto(false); }}
                aria-pressed={marcado}
                style={{
                  display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
                  minHeight: TOUCH.min, padding: "12px 14px", marginBottom: 8, borderRadius: 14,
                  border: "1px solid " + (marcado ? COLORS.accent : COLORS.border),
                  background: marcado ? COLORS.accentSoft : COLORS.surface,
                }}
              >
                <span style={{
                  width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                  border: "1.5px solid " + (marcado ? COLORS.accent : COLORS.border),
                  background: marcado ? COLORS.accent : "transparent",
                  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {marcado && <Check size={13} />}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <b style={{ display: "block", fontSize: 14, fontWeight: 600, color: COLORS.ink }}>{o.n}</b>
                  <span style={{ display: "block", fontSize: 11.5, color: COLORS.muted, marginTop: 2 }}>{o.d}</span>
                </span>
              </button>
            );
          })}
        </ModalSheet>
      )}
    </>
  );
}

export default MemberFilterIcon;
