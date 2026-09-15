import React, { useState, useRef, useEffect } from "react";
import { COLORS } from "../../constants/tokens";

// ============================================================================
// BalanceChart — o gráfico de saldo dia a dia, aprovado no protótipo.
//
// O que ele entrega que o gráfico anterior (Recharts, eixo Y escondido) não
// entregava: o eixo de datas na base, os valores de referência na direita, o
// dia de hoje marcado com linha-guia, e a leitura do ponto sob o dedo/cursor.
//
// Por que SVG na mão em vez de Recharts: este gráfico é o único do app que
// precisa de leitura por toque em 30 pontos, com o número seguindo o dedo. Em
// Recharts isso vira um Tooltip customizado com posicionamento próprio — mais
// código e menos controle do que desenhar as 30 posições.
//
// `tom` resolve o fundo: o mesmo gráfico vive dentro do herói violeta
// ("escuro", com a linha ciano-verde do protótipo) e dentro de um cartão
// branco ("claro", com a linha violeta). Sem isso, um dos dois ficaria com
// texto escuro sobre fundo escuro.
//
// Props:
//   dias     [{ dia, saldo, reserva?, restrito? }]  — vem do motor de fluxo
//   hojeDia  número do dia de hoje, ou null quando o mês não é o atual
//   mes      mês em exibição (para as datas "dd/mm")
//   moeda    formatador (v: number) => string
//   tom      "claro" (padrão) | "escuro"
//
// Teclado: o gráfico é focável e as setas ← → percorrem os dias.
// ============================================================================

const W = 320;          // sistema de coordenadas do viewBox (escala com o CSS)
const PL = 10;          // respiro à esquerda
const PR = 56;          // coluna dos valores de referência (direita)
const PT = 14;          // topo
const PB = 28;          // faixa das datas + rótulo "HOJE"

const fmtPadrao = (v) =>
  (v < 0 ? "−" : "") + "R$ " + Math.abs(v).toLocaleString("pt-BR", { maximumFractionDigits: 0 });

const dataCurta = (dia, mes) => String(dia).padStart(2, "0") + "/" + String(mes).padStart(2, "0");

/* Caminho suave (Catmull-Rom convertido em bézier): é o que faz 30 pontos
   virarem uma linha legível em vez de um serrilhado. */
function smoothPath(pts) {
  if (!pts.length) return "";
  if (pts.length < 3) return "M" + pts.map((p) => p[0].toFixed(2) + " " + p[1].toFixed(2)).join(" L");
  let d = "M" + pts[0][0].toFixed(2) + " " + pts[0][1].toFixed(2);
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += " C" + c1x.toFixed(2) + " " + c1y.toFixed(2) + " " + c2x.toFixed(2) + " " + c2y.toFixed(2) + " " + p2[0].toFixed(2) + " " + p2[1].toFixed(2);
  }
  return d;
}

export function BalanceChart({ dias = [], hojeDia = null, mes = 9, moeda = fmtPadrao, tom = "claro" }) {
  const H = 132;
  const [idx, setIdx] = useState(null);
  const boxRef = useRef(null);
  const timer = useRef(null);

  // Paleta do gráfico por fundo. `escuro` é o herói violeta.
  const T = tom === "escuro"
    ? {
        rotulo: "#EDE9FE", destaque: "#FFFFFF", grade: "rgba(255,255,255,.22)",
        linhaA: "#22D3EE", linhaB: "#34D399", areaA: "#22D3EE", areaB: "#34D399",
        ponto: "#FFFFFF", anel: "#22D3EE", legenda: "rgba(237,233,254,.85)",
        trilhaPonto: "rgba(255,255,255,.5)",
      }
    : {
        rotulo: COLORS.fg2, destaque: COLORS.ink, grade: "rgba(21,19,42,.10)",
        linhaA: COLORS.accentDeep, linhaB: COLORS.accentBright, areaA: COLORS.accentBright, areaB: COLORS.accentBright,
        ponto: "#FFFFFF", anel: COLORS.accent, legenda: COLORS.muted,
        trilhaPonto: COLORS.accent,
      };

  const n = dias.length;
  const iw = W - PL - PR;
  const ih = H - PT - PB;

  const saldos = dias.map((d) => d.saldo);
  const reservas = dias.map((d) => (typeof d.reserva === "number" ? d.reserva : null)).filter((v) => v !== null);
  const restritos = dias.map((d) => (typeof d.restrito === "number" ? d.restrito : null)).filter((v) => v !== null);
  const todos = saldos.concat(reservas, restritos);
  const lo = todos.length ? Math.min(...todos) : 0;
  const hi = todos.length ? Math.max(...todos) : 1;
  const span = hi - lo || 1;

  const x = (i) => PL + (n < 2 ? 0 : (i / (n - 1)) * iw);
  const y = (v) => PT + ih - ((v - lo) / span) * ih;

  const pts = dias.map((d, i) => [x(i), y(d.saldo)]);
  const linha = smoothPath(pts);
  const area = linha
    ? linha + " L" + pts[n - 1][0].toFixed(2) + " " + (PT + ih) + " L" + pts[0][0].toFixed(2) + " " + (PT + ih) + " Z"
    : "";

  const iHoje = hojeDia != null ? dias.findIndex((d) => d.dia === hojeDia) : -1;
  const iMin = saldos.length ? saldos.indexOf(Math.min(...saldos)) : -1;

  // Quatro datas na base: primeira, dois terços e última do mês — funciona
  // para 28, 29, 30 ou 31 dias sem depender de números fixos.
  const iTicks = n ? [0, Math.round((n - 1) / 3), Math.round((2 * (n - 1)) / 3), n - 1] : [];

  const posDe = (clientX) => {
    if (!boxRef.current || n < 2) return 0;
    const r = boxRef.current.getBoundingClientRect();
    const rel = ((clientX - r.left) / r.width) * W;
    return Math.max(0, Math.min(n - 1, Math.round(((rel - PL) / iw) * (n - 1))));
  };
  const marcar = (clientX) => { clearTimeout(timer.current); setIdx(posDe(clientX)); };
  const soltar = (tipo) => {
    clearTimeout(timer.current);
    // No dedo a leitura fica um instante depois de levantar: sem isso o número
    // some antes de dar tempo de ler.
    if (tipo === "touch") timer.current = setTimeout(() => setIdx(null), 2600);
    else setIdx(null);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  const andar = (e) => {
    const passo = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!passo || !n) return;
    e.preventDefault();
    const base = idx == null ? (iHoje >= 0 ? iHoje : 0) : idx;
    setIdx(Math.max(0, Math.min(n - 1, base + passo)));
  };

  if (!n) {
    return (
      <p style={{ fontSize: 12.5, color: T.legenda, margin: "10px 0 2px" }}>
        Sem movimentação prevista para desenhar o saldo dia a dia.
      </p>
    );
  }

  const p = idx != null ? dias[idx] : null;
  const tipX = p ? (x(idx) / W) * 100 : 0;
  const tipY = p ? (y(p.saldo) / H) * 100 : 0;
  const tipAbaixo = tipY < 42;

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <div
        ref={boxRef}
        tabIndex={0}
        role="img"
        onKeyDown={andar}
        onBlur={() => setIdx(null)}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); marcar(e.clientX); }}
        onPointerMove={(e) => marcar(e.clientX)}
        onPointerUp={(e) => { if (e.pointerType === "touch") soltar("touch"); }}
        onPointerCancel={() => soltar("touch")}
        onPointerLeave={(e) => { if (e.pointerType !== "touch") soltar("mouse"); }}
        aria-label={
          "Saldo previsto dia a dia: menor valor " + moeda(lo) + " e maior valor " + moeda(hi) +
          ". Passe o dedo sobre o gráfico ou use as setas para ver um dia."
        }
        style={{ touchAction: "pan-y", userSelect: "none", cursor: "crosshair", borderRadius: 16 }}
      >
        <svg viewBox={"0 0 " + W + " " + H} width="100%" height={H} aria-hidden="true" style={{ display: "block" }}>
          <defs>
            <linearGradient id={"bcArea" + tom} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={T.areaA} stopOpacity="0.38" />
              <stop offset="55%" stopColor={T.areaB} stopOpacity="0.14" />
              <stop offset="100%" stopColor={T.areaB} stopOpacity="0" />
            </linearGradient>
            <linearGradient id={"bcLine" + tom} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={T.linhaA} />
              <stop offset="100%" stopColor={T.linhaB} />
            </linearGradient>
          </defs>

          {/* valores de referência: a grade diz de quanto é cada linha */}
          {[0, 0.5, 1].map((f, i) => (
            <g key={f}>
              <line x1={PL} x2={W - PR} y1={PT + ih * f} y2={PT + ih * f}
                stroke={T.grade} strokeWidth="1" strokeDasharray="3 6" />
              <text x={W - 2} y={PT + ih * f + 3.4} textAnchor="end"
                fontSize="9" fontWeight="600" fill={T.rotulo}>
                {moeda(i === 0 ? hi : i === 1 ? (hi + lo) / 2 : lo)}
              </text>
            </g>
          ))}

          {/* datas principais na base */}
          {iTicks.map((i, k) => (
            <text key={i} x={x(i)} y={H - 14}
              textAnchor={k === 0 ? "start" : k === iTicks.length - 1 ? "end" : "middle"}
              fontSize="9" fontWeight={iHoje === i ? 800 : 600}
              fill={iHoje === i ? T.destaque : T.rotulo}>
              {dataCurta(dias[i].dia, mes)}
            </text>
          ))}
          {iHoje >= 0 && (
            <text x={x(iHoje)} y={H - 4} textAnchor="middle" fontSize="8" fontWeight="800"
              letterSpacing=".1em" fill={T.destaque}>HOJE</text>
          )}

          {area && <path d={area} fill={"url(#bcArea" + tom + ")"} />}

          {/* reserva mínima disponível: linha de apoio, tracejada, para não
              competir com o saldo — a leitura principal é uma só */}
          {reservas.length === n && (
            <path d={smoothPath(dias.map((d, i) => [x(i), y(d.reserva)]))} fill="none"
              stroke={COLORS.warn} strokeWidth="1.6" strokeDasharray="4 4" opacity=".9" />
          )}
          {restritos.length === n && (
            <path d={smoothPath(dias.map((d, i) => [x(i), y(d.restrito)]))} fill="none"
              stroke={COLORS.warn} strokeWidth="1.4" strokeDasharray="2 4" opacity=".6" />
          )}

          <path d={linha} fill="none" stroke={"url(#bcLine" + tom + ")"} strokeWidth="2.6" strokeLinecap="round" />

          {/* dia de hoje: linha-guia até a base + ponto */}
          {iHoje >= 0 && (
            <>
              <line x1={x(iHoje)} x2={x(iHoje)} y1={y(dias[iHoje].saldo) + 6} y2={PT + ih}
                stroke={T.anel} strokeWidth="1" strokeDasharray="2 4" opacity=".6" />
              <circle cx={x(iHoje)} cy={y(dias[iHoje].saldo)} r="8" fill={T.anel} opacity=".22" />
              <circle cx={x(iHoje)} cy={y(dias[iHoje].saldo)} r="4.2" fill={T.ponto} stroke={T.anel} strokeWidth="2.4" />
            </>
          )}

          {/* menor saldo do mês — o momento crítico */}
          {iMin >= 0 && iMin !== iHoje && (
            <>
              <circle cx={x(iMin)} cy={y(dias[iMin].saldo)} r="7.5" fill={COLORS.warn} opacity=".18" />
              <circle cx={x(iMin)} cy={y(dias[iMin].saldo)} r="3.6" fill={COLORS.warn} />
            </>
          )}

          {/* ponto sob o cursor/dedo */}
          {p && (
            <>
              <line x1={x(idx)} x2={x(idx)} y1={PT - 6} y2={PT + ih}
                stroke={T.trilhaPonto} strokeWidth="1" strokeDasharray="3 3" opacity=".55" />
              <circle cx={x(idx)} cy={y(p.saldo)} r="7.5" fill={T.ponto} opacity=".35" />
              <circle cx={x(idx)} cy={y(p.saldo)} r="4.2" fill={T.ponto} stroke={T.anel} strokeWidth="2.4" />
            </>
          )}
        </svg>

        {/* leitura do ponto: acompanha o dedo e é presa dentro do cartão pelo
            clamp — nas pontas do mês encosta na borda em vez de vazar */}
        {p && (
          <div
            style={{
              position: "absolute", zIndex: 3, pointerEvents: "none", whiteSpace: "nowrap",
              display: "flex", flexDirection: "column", gap: 1, padding: "7px 11px",
              borderRadius: 12, background: "#15132A", border: "1px solid rgba(255,255,255,.18)",
              boxShadow: "0 12px 26px -10px rgba(6,2,26,.7)",
              left: "clamp(58px, " + tipX + "%, calc(100% - 58px))",
              top: tipY + "%",
              transform: tipAbaixo ? "translate(-50%, 12px)" : "translate(-50%, calc(-100% - 12px))",
            }}
          >
            <span style={{ fontSize: 10.5, fontWeight: 700, color: "#DDD6FE" }}>
              {dataCurta(dias[idx].dia, mes)}{idx === iHoje ? " · hoje" : ""}
            </span>
            <b className="num" style={{ fontFamily: "var(--font-display)", fontSize: 13.5, fontWeight: 800, color: "#fff" }}>
              {moeda(p.saldo)}
            </b>
            {typeof p.reserva === "number" && (
              <span style={{ fontSize: 10.5, fontWeight: 600, color: "#D9D5EC" }}>reserva {moeda(p.reserva)}</span>
            )}
            {typeof p.restrito === "number" && (
              <span style={{ fontSize: 10.5, fontWeight: 600, color: "#D9D5EC" }}>alimentação {moeda(p.restrito)}</span>
            )}
          </div>
        )}
      </div>

      {/* legenda nomeada com amostra de traço — só aparece o que existe */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 8, fontSize: 11.5, color: T.legenda }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 14, height: 2.5, borderRadius: 2, background: T.linhaB }} />saldo previsto
        </span>
        {reservas.length === n && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 14, height: 2, borderRadius: 2, background: COLORS.warn }} />reserva mínima disponível
          </span>
        )}
        {restritos.length === n && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 14, height: 2, borderRadius: 2, background: COLORS.warn, opacity: 0.6 }} />cartão alimentação
          </span>
        )}
      </div>
    </div>
  );
}

export default BalanceChart;