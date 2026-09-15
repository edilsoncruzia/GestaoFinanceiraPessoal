import React from "react";
import { Wallet, TrendingUp, Bell, Eye, EyeOff, Sparkle } from "lucide-react";
import { COLORS } from "../../constants/tokens";
import BalanceChart from "./BalanceChart";

// ============================================================================
// BalanceHero — o bloco de destaque do topo da Início, aprovado no protótipo.
//
// Antes a tela começava com um cartão branco de "saldo disponível" seguido de
// uma faixa de KPIs. Agora o topo é UM bloco: marca, contexto do mês, saldo,
// saldo previsto para o fim do mês e o gráfico dia a dia dentro dele.
//
// Por que um bloco só: o saldo é a informação que a pessoa abre o app para ver.
// Dividido em três cartões brancos iguais, nada era destaque. O degradê violeta
// é o único elemento sólido da tela — e é o que dá o "acima da dobra".
//
// As datas e a linha vêm do motor de fluxo de caixa (`dias`), não de uma cópia:
// o gráfico é o mesmo dado que o app já calculava, agora com eixo e leitura.
//
// Props (todas já formatadas fora, quando o caso):
//   disponivel      número — saldo disponível de hoje
//   previsto        número — saldo previsto para o fim do mês
//   escondido       bool — olho fechado (o mesmo estado que a tela já tinha)
//   onAlternarVisao fn
//   dias            [{ dia, saldo, reserva?, restrito? }]
//   hojeDia         dia de hoje, ou null quando o mês exibido não é o atual
//   mes             mês em exibição
//   saude           nota 0–100 do anel (opcional)
//   onAbrirSaude    fn
//   alertas         quantidade para o sino (opcional)
//   onAbrirAlertas  fn
//   onAbrirPrevisto fn
//   topo            nó opcional no lugar do filtro (ex.: MemberFilterBar)
//   contexto        nó opcional na linha do mês (ex.: MonthNav)
// ============================================================================

const FAIXAS = [
  { ate: 20, lvl: "Crítica", cor: "#FB7185" },
  { ate: 40, lvl: "Ruim", cor: "#FB923C" },
  { ate: 60, lvl: "Atenção", cor: "#FCD34D" },
  { ate: 80, lvl: "Boa", cor: "#4ADE80" },
  { ate: 100, lvl: "Excelente", cor: "#5EEAD4" },
];
const faixaDe = (n) => FAIXAS.find((f) => n <= f.ate) || FAIXAS[FAIXAS.length - 1];

const HERO_BG = [
  "radial-gradient(130% 70% at 88% -12%, rgba(56,189,248,.30), rgba(56,189,248,0) 60%)",
  "radial-gradient(110% 60% at 6% 112%, rgba(217,70,239,.26), rgba(217,70,239,0) 62%)",
  "radial-gradient(90% 55% at 50% 42%, rgba(124,58,237,.50), rgba(124,58,237,0) 72%)",
  "linear-gradient(180deg,#2A0A63 0%,#3B1483 26%,#4C1D95 52%,#5B21B6 78%,#6D28D9 100%)",
].join(",");

function AnelSaude({ score, onAbrir }) {
  const f = faixaDe(score);
  const R = 16.5, C = 2 * Math.PI * R;
  return (
    <button
      onClick={onAbrir}
      aria-label={"Saúde financeira " + score + " de 100, nível " + f.lvl + ". Toque para ver detalhes"}
      style={{
        position: "relative", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.22)", borderRadius: 14,
        color: "#fff", padding: 0,
      }}
    >
      <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true" style={{ position: "absolute", inset: 4, transform: "rotate(-90deg)" }}>
        {/* substrato escuro: sem ele as faixas crítica e ruim não passavam em
            3:1 na base do degradê; com ele a pior faixa vai a 4,96:1 */}
        <circle cx="18" cy="18" r={R} fill="rgba(15,23,42,.55)" />
        <circle cx="18" cy="18" r={R} fill="none" stroke="rgba(255,255,255,.30)" strokeWidth="3.4" />
        <circle cx="18" cy="18" r={R} fill="none" stroke={f.cor} strokeWidth="3.4" strokeLinecap="round"
          strokeDasharray={C.toFixed(1)} strokeDashoffset={(C * (1 - score / 100)).toFixed(1)} />
      </svg>
      <b className="num" style={{ position: "relative", fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 800, letterSpacing: "-0.04em" }}>
        {score}
      </b>
    </button>
  );
}

export function BalanceHero({
  disponivel = 0,
  previsto = 0,
  escondido = false,
  onAlternarVisao,
  dias = [],
  hojeDia = null,
  mes = 9,
  saude = null,
  onAbrirSaude,
  alertas = null,
  onAbrirAlertas,
  onAbrirPrevisto,
  topo,
  contexto,
  moeda,
  children,
}) {
  const fmt = moeda || ((v) =>
    (v < 0 ? "−" : "") + "R$ " + Math.abs(v).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  const mask = (v) => (escondido ? "R$ • • • • •" : fmt(v));

  return (
    <section
      data-od-id="hero-saldo"
      aria-label="Saldo disponível"
      style={{
        position: "relative",
        color: "#fff",
        borderRadius: "0 0 32px 32px",
        margin: "0 0 16px",
        padding: "12px 20px 20px",
        background: HERO_BG,
        boxShadow: "0 26px 50px -18px rgba(46,16,101,.55)",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, minHeight: 44 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginRight: "auto" }}>
            <span style={{
              width: 30, height: 30, borderRadius: 11, color: "#fff",
              background: "rgba(255,255,255,.18)", backdropFilter: "blur(6px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14,
            }}>G</span>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 14.5, fontWeight: 700, letterSpacing: "-0.01em" }}>
              Finanças
            </span>
          </div>
          {topo}
          {saude != null && <AnelSaude score={saude} onAbrir={onAbrirSaude} />}
          {alertas != null && (
            <button
              onClick={onAbrirAlertas}
              aria-label={alertas + " alertas"}
              className="icon-btn"
              style={{ background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.22)", color: "#fff", position: "relative" }}
            >
              <Bell size={20} />
              {alertas > 0 && (
                <span style={{
                  position: "absolute", top: 3, right: 3, minWidth: 17, height: 17, padding: "0 4px",
                  borderRadius: 999, background: "#FB7185", color: "#2A0A38", border: "2px solid #4C1D95",
                  fontSize: 10.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
                }}>{alertas}</span>
              )}
            </button>
          )}
        </div>

        {contexto && <div style={{ marginTop: 6 }}>{contexto}</div>}

        {/* saldo disponível: cartão translúcido. É o número que a pessoa abre o
            app para ver — por isso é o único em 38px na tela. */}
        <div
          data-od-id="card-saldo-disponivel"
          style={{
            marginTop: 16, display: "flex", alignItems: "center", gap: 12,
            background: "rgba(255,255,255,.10)", border: "1px solid rgba(255,255,255,.17)",
            borderRadius: 22, padding: "15px 17px",
            backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,.20), 0 14px 30px -14px rgba(10,4,30,.55)",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 600, color: "#DDD6FE", margin: 0 }}>
              <span style={{
                width: 26, height: 26, borderRadius: 9, background: "rgba(255,255,255,.14)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <Wallet size={13} />
              </span>
              Saldo disponível
            </p>
            <p className="num" style={{
              fontFamily: "var(--font-display)", fontSize: "clamp(31px,9.6vw,38px)", fontWeight: 800,
              letterSpacing: "-0.03em", lineHeight: 1.04, margin: "8px 0 0",
            }}>
              {mask(disponivel)}
            </p>
          </div>
          {onAlternarVisao && (
            <button
              onClick={onAlternarVisao}
              aria-label={escondido ? "Mostrar saldo" : "Ocultar saldo"}
              className="icon-btn"
              style={{ background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.2)", color: "#fff" }}
            >
              {escondido ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>

        <button
          onClick={onAbrirPrevisto}
          data-od-id="card-saldo-previsto"
          style={{
            width: "100%", marginTop: 10, display: "flex", alignItems: "center", gap: 12, textAlign: "left",
            color: "inherit", background: "rgba(255,255,255,.10)", border: "1px solid rgba(255,255,255,.17)",
            borderRadius: 18, padding: "12px 16px", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,.18), 0 12px 26px -14px rgba(10,4,30,.5)",
          }}
        >
          <span style={{
            flexShrink: 0, width: 34, height: 34, borderRadius: 11, background: "rgba(255,255,255,.15)",
            display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
          }}>
            <TrendingUp size={16} />
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#DDD6FE" }}>
              Saldo previsto no fim do mês
            </span>
            <b className="num" style={{
              display: "block", fontFamily: "var(--font-display)", fontSize: 21, fontWeight: 800,
              letterSpacing: "-0.02em", marginTop: 3, color: previsto >= 0 ? "#6EE7B7" : "#FCA5A5",
            }}>
              {previsto >= 0 ? "+ " : "− "}{fmt(Math.abs(previsto))}
            </b>
          </span>
          {previsto >= 0 && <Sparkle size={14} style={{ opacity: 0.7 }} aria-hidden="true" />}
        </button>

        <div style={{ marginTop: 14 }}>
          <BalanceChart dias={dias} hojeDia={hojeDia} mes={mes} moeda={fmt} tom="escuro" />
        </div>

        {children}
      </div>
    </section>
  );
}

export default BalanceHero;