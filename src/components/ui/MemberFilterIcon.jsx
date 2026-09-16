import React, { useState } from "react";
import { SlidersHorizontal, Check } from "lucide-react";
import { COLORS, TOUCH } from "../../constants/tokens";
import { MEMBERS } from "../../constants/seedData";
import { ModalSheet } from "./ModalSheet";

// ============================================================================
// MemberFilterIcon — o filtro de pessoa como ÍCONE, no topo do herói.
//
// Antes: uma barra de três pílulas (Todos · Você · Esposa) ocupando a largura
// inteira ACIMA do bloco violeta. Era a primeira coisa da tela e não é a
// primeira decisão da pessoa — além de empurrar o saldo para baixo.
//
// Agora: o mesmo estado (`memberFilter`), montado como ícone na linha da marca,
// ao lado do anel de saúde e do sino, como no protótipo. Com filtro ativo, o
// ícone ganha um ponto — dá para ver que a tela está recortada sem abrir nada.
//
// Não muda nada de dado: `value` e `onChange` são exatamente os que o
// MemberFilterBar recebia do App.
// ============================================================================

export function MemberFilterIcon({ value = "todos", onChange, escuro = true }) {
  const [aberto, setAberto] = useState(false);
  const ativo = value !== "todos";
  const nomeAtivo = ativo ? (MEMBERS.find((m) => String(m.id) === String(value))?.name || "pessoa") : null;

  const opcoes = [
    { v: "todos", n: "Todos", d: "Você e " + (MEMBERS.map((m) => m.name).join(" e ") || "as outras pessoas") + " juntos" },
    ...MEMBERS.map((m) => ({ v: String(m.id), n: m.name, d: "Somente lançamentos de " + m.name })),
  ];

  const visual = escuro
    ? { background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.22)", color: "#fff" }
    : { background: COLORS.surface, border: "1px solid " + COLORS.border, color: COLORS.ink };

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        aria-label={ativo ? "Filtrando por " + nomeAtivo + ". Trocar filtro" : "Filtrar por pessoa"}
        data-od-id="filtro-pessoa"
        className="icon-btn"
        style={{ position: "relative", width: TOUCH.min, height: TOUCH.min, ...visual }}
      >
        <SlidersHorizontal size={19} />
        {ativo && (
          <span aria-hidden="true" style={{
            position: "absolute", top: 8, right: 8, width: 7, height: 7, borderRadius: "50%",
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
