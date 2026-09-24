import React from "react";
import { ChevronRight, PiggyBank, ShoppingCart } from "lucide-react";
import { COLORS } from "../../constants/tokens";

function MiniCard({ Icone, cor, fundo, borda, brilho, nome, valor, pct, unidade, onAbrir }) {
  const Tag = onAbrir ? "button" : "div";
  const pctSeguro = Math.max(0, Math.min(100, Math.round(pct || 0)));

  return (
    <Tag
      onClick={onAbrir}
      data-od-id={"resumo-" + nome.toLowerCase().normalize("NFD").replace(/[^a-z]/g, "")}
      style={{
        display: "block",
        textAlign: "left",
        minWidth: 0,
        width: "100%",
        minHeight: onAbrir ? 44 : undefined,
        background: brilho,
        border: "1px solid " + borda,
        borderRadius: 22,
        padding: "20px 18px 18px",
        boxShadow: "0 16px 34px -24px rgba(21,19,42,.24)",
        color: "inherit",
        font: "inherit",
        cursor: onAbrir ? "pointer" : "default",
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <i
          style={{
            width: "clamp(40px, 10vw, 54px)",
            height: "clamp(40px, 10vw, 54px)",
            borderRadius: 16,
            flexShrink: 0,
            fontStyle: "normal",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: fundo,
            color: cor,
          }}
        >
          <Icone size={26} strokeWidth={2.4} />
        </i>
        <span
          style={{
            flex: 1,
            fontSize: "clamp(13px, 3.2vw, 18px)",
            lineHeight: 1.1,
            fontWeight: 800,
            color: COLORS.ink,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {nome}
        </span>
        <ChevronRight size={24} color={COLORS.fg2} strokeWidth={2.8} style={{ flexShrink: 0 }} />
      </span>

      <b
        className="num"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          fontFamily: "var(--font-display)",
          fontSize: "clamp(18px, 4.8vw, 30px)",
          fontWeight: 800,
          letterSpacing: "-0.02em",
          color: cor,
          margin: "24px 0 14px",
          lineHeight: 1,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>{valor}</span>
        <span
          style={{
            flexShrink: 0,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "clamp(30px, 8vw, 40px)",
            padding: "0 clamp(10px, 3vw, 18px)",
            borderRadius: 999,
            background: fundo,
            color: cor,
            fontSize: "clamp(11.5px, 3vw, 14px)",
            fontWeight: 800,
          }}
        >
          {pctSeguro}%
        </span>
      </b>

      <span style={{ display: "block", height: 14, borderRadius: 999, background: "rgba(21,19,42,.12)", overflow: "hidden" }}>
        <i
          style={{
            display: "block",
            height: "100%",
            borderRadius: 999,
            background: cor,
            width: pctSeguro + "%",
            transition: "width .5s cubic-bezier(.22,1,.36,1)",
          }}
        />
      </span>

      <span
        className="num"
        style={{
          display: "block",
          marginTop: 12,
          fontSize: "clamp(12.5px, 3.2vw, 16px)",
          fontWeight: 500,
          fontStyle: "normal",
          color: COLORS.fg2,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {unidade}
      </span>
    </Tag>
  );
}

export function ResumoCards({ reserva, mercado, moeda = (v) => "R$ " + v }) {
  return (
    <section aria-labelledby="titulo-planejamento" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2
            id="titulo-planejamento"
            className="serif"
            style={{
              margin: 0,
              fontSize: "clamp(26px, 6vw, 34px)",
              lineHeight: 1.05,
              fontWeight: 800,
              color: COLORS.ink,
            }}
          >
            Planejamento
          </h2>
          <p style={{ margin: "6px 0 0", fontSize: "clamp(14px, 3.6vw, 17px)", lineHeight: 1.3, color: COLORS.muted }}>
            Suas reservas e gastos controlados para o mês.
          </p>
        </div>
        <button
          type="button"
          onClick={reserva?.onAbrir}
          style={{
            minHeight: 44,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            border: 0,
            background: "transparent",
            color: COLORS.fg2,
            fontSize: "clamp(13px, 3.4vw, 16px)",
            fontWeight: 700,
            padding: "0 2px",
            whiteSpace: "nowrap",
          }}
        >
          Ver detalhes <ChevronRight size={25} strokeWidth={2.8} />
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 }}>
        {reserva && (
          <MiniCard
            Icone={PiggyBank}
            cor={COLORS.income}
            fundo={COLORS.incomeSoft}
            borda={COLORS.incomeBorder}
            brilho={"linear-gradient(135deg, " + COLORS.incomeSoft + " 0%, #fff 58%, " + COLORS.surface + " 100%)"}
            nome="Reserva mínima"
            valor={moeda(reserva.disponivel)}
            pct={reserva.total > 0 ? (reserva.disponivel / reserva.total) * 100 : 0}
            unidade={"de " + moeda(reserva.total)}
            onAbrir={reserva.onAbrir}
          />
        )}
        {mercado && (
          <MiniCard
            Icone={ShoppingCart}
            cor={COLORS.warn}
            fundo={COLORS.warnSoft}
            borda={COLORS.warnBorder}
            brilho={"linear-gradient(135deg, " + COLORS.warnSoft + " 0%, #fff 58%, " + COLORS.surface + " 100%)"}
            nome="Mercado"
            valor={moeda(mercado.restante)}
            pct={mercado.total > 0 ? (mercado.restante / mercado.total) * 100 : 0}
            unidade={"de " + moeda(mercado.total)}
            onAbrir={mercado.onAbrir}
          />
        )}
      </div>
    </section>
  );
}

export default ResumoCards;
