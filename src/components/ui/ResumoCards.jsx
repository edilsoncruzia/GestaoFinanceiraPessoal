import React from "react";
import { PiggyBank, ShoppingCart } from "lucide-react";
import { COLORS, RADIUS } from "../../constants/tokens";

// ============================================================================
// ResumoCards — reserva mínima e mercado, lado a lado, logo abaixo do herói.
//
// Onde isso vivia antes:
//   · a reserva era um SupportCard grande no FIM da coluna de apoio — a última
//     coisa da tela, depois da saúde financeira;
//   · o mercado era a seção "Ritmo de gasto do mercado", escondida dentro do
//     bloco recolhível "Análise do mês", com três números e dois parágrafos.
//
// Agora são os dois quadros pequenos do protótipo: o número grande é o que
// ainda dá para usar, a barra é o quanto do total já foi, e a legenda traz o
// total. Uma linha de leitura por card, sem frase explicativa.
//
// Clickable só quando existe destino: um card que parece botão e não leva a
// lugar nenhum é pior do que um número parado.
// ============================================================================

function MiniCard({ Icone, cor, fundo, nome, valor, total, pct, unidade, onAbrir }) {
  const Tag = onAbrir ? "button" : "div";
  return (
    <Tag
      onClick={onAbrir}
      data-od-id={"resumo-" + nome.toLowerCase().normalize("NFD").replace(/[^a-z]/g, "")}
      style={{
        display: "block", textAlign: "left", minWidth: 0, width: "100%",
        minHeight: onAbrir ? 44 : undefined,
        background: COLORS.surface, border: "1px solid " + COLORS.border,
        borderRadius: RADIUS.card, padding: 14, boxShadow: "0 1px 2px rgba(21,19,42,.04)",
        color: "inherit", font: "inherit", cursor: onAbrir ? "pointer" : "default",
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
        <i style={{
          width: 26, height: 26, borderRadius: 8, flexShrink: 0, fontStyle: "normal",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: fundo, color: cor,
        }}>
          <Icone size={14} />
        </i>
        <span style={{
          fontSize: 12.5, fontWeight: 600, color: COLORS.fg2, minWidth: 0,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{nome}</span>
      </span>

      <b className="num" style={{
        display: "block", fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800,
        letterSpacing: "-0.02em", color: COLORS.ink, margin: "10px 0 9px",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>{valor}</b>

      <span style={{ display: "block", height: 6, borderRadius: 999, background: COLORS.surface2, overflow: "hidden" }}>
        <i style={{
          display: "block", height: "100%", borderRadius: 999, background: cor,
          width: Math.max(0, Math.min(100, pct)) + "%",
          transition: "width .5s cubic-bezier(.22,1,.36,1)",
        }} />
      </span>

      <u className="num" style={{
        display: "block", marginTop: 7, fontSize: 12, fontWeight: 700, fontStyle: "normal",
        color: cor, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>{unidade}</u>
    </Tag>
  );
}

export function ResumoCards({ reserva, mercado, moeda = (v) => "R$ " + v }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {reserva && (
        <MiniCard
          Icone={PiggyBank}
          cor={COLORS.income}
          fundo={COLORS.incomeSoft}
          nome="Reserva mínima"
          valor={moeda(reserva.disponivel)}
          pct={reserva.total > 0 ? (reserva.usado / reserva.total) * 100 : 0}
          unidade={"de " + moeda(reserva.total)}
          onAbrir={reserva.onAbrir}
        />
      )}
      {mercado && (
        <MiniCard
          Icone={ShoppingCart}
          cor={COLORS.warn}
          fundo={COLORS.warnSoft}
          nome="Mercado"
          valor={moeda(mercado.restante)}
          pct={mercado.total > 0 ? ((mercado.total - mercado.restante) / mercado.total) * 100 : 0}
          unidade={"de " + moeda(mercado.total)}
          onAbrir={mercado.onAbrir}
        />
      )}
    </div>
  );
}

export default ResumoCards;
