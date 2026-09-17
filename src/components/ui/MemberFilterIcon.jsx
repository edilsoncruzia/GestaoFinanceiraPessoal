import React, { useState } from "react";
import { Check, Users } from "lucide-react";
import { COLORS, TOUCH, RADIUS } from "../../constants/tokens";
import { MEMBERS } from "../../constants/seedData";
import { ModalSheet } from "./ModalSheet";

// ============================================================================
// MemberFilterIcon — o filtro de pessoa como ícone na linha da marca do herói.
//
// O mesmo estado (`memberFilter`) do MemberFilterBar, montado como ícone ao
// lado do olho e do anel de saúde. Com filtro ativo, o ícone ganha um ponto —
// dá para ver que a tela está recortada sem abrir nada.
//
// POSIÇÃO DO DIÁLOGO (o que mudou nesta rodada)
// O ícone vive no TOPO da tela. A gaveta, porém, subia de baixo: o olho lia o
// gatilho em cima e a resposta aparecia a 700px de distância, no rodapé. Agora
// ela é ancorada no topo (ModalSheet posicao="topo"), logo abaixo do próprio
// ícone — a resposta nasce onde o toque aconteceu. No desktop continua sendo o
// diálogo centralizado de sempre.
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

// Iniciais para o avatar: "Você" -> V, "Esposa" -> E.
const iniciais = (nome) => (nome || "").trim().charAt(0).toUpperCase() || "?";

export function MemberFilterIcon({ value = "todos", onChange }) {
  const [aberto, setAberto] = useState(false);
  const ativo = value !== "todos";
  const membroAtivo = MEMBERS.find((m) => String(m.id) === String(value)) || null;

  const opcoes = [
    {
      v: "todos",
      n: "Todos",
      d: "Você e " + (MEMBERS.map((m) => m.name).join(" e ") || "as outras pessoas") + " juntos",
      cor: COLORS.accent,
      Icone: Users,
    },
    ...MEMBERS.map((m) => ({
      v: String(m.id),
      n: m.name,
      d: "Somente lançamentos de " + m.name,
      cor: m.color || COLORS.accent,
      Icone: Users,
    })),
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        aria-label={ativo ? "Filtrando por " + membroAtivo?.name + ". Trocar filtro" : "Filtrar por pessoa"}
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
        <ModalSheet
          title="Ver dados de"
          subtitulo="O filtro vale para todas as telas"
          onClose={() => setAberto(false)}
          posicao="topo"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {opcoes.map((o) => {
              const marcado = String(value) === o.v;
              const Icone = o.Icone;
              return (
                <button
                  key={o.v}
                  type="button"
                  onClick={() => { onChange(o.v); setAberto(false); }}
                  aria-pressed={marcado}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
                    minHeight: TOUCH.min, padding: "12px 14px", borderRadius: RADIUS.control,
                    border: "1.5px solid " + (marcado ? o.cor : COLORS.border),
                    background: marcado ? o.cor + "14" : COLORS.surface,
                    transition: "border-color .15s ease, background .15s ease",
                  }}
                >
                  <span style={{
                    width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                    background: o.cor + "1E", color: o.cor,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16,
                  }}>
                    {o.v === "todos" ? <Icone size={18} /> : iniciais(o.n)}
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <b style={{ display: "block", fontSize: 16, fontWeight: 700, color: COLORS.ink }}>{o.n}</b>
                    <span style={{ display: "block", fontSize: 13.5, color: COLORS.muted, marginTop: 2 }}>{o.d}</span>
                  </span>
                  <span style={{
                    width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                    border: "2px solid " + (marcado ? o.cor : COLORS.border),
                    background: marcado ? o.cor : "transparent",
                    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {marcado && <Check size={14} strokeWidth={3} />}
                  </span>
                </button>
              );
            })}
          </div>
        </ModalSheet>
      )}
    </>
  );
}

export default MemberFilterIcon;
