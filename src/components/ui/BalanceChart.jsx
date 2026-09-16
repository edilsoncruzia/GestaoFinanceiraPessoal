import React, { useState, useRef, useEffect } from "react";

// ============================================================================
// BalanceChart — o gráfico de saldo dia a dia do herói.
//
// Portado do protótipo `home-mobile-hero-v3.html` (componente GraficoSaldo).
// O que ele entrega: o eixo de datas na base, os valores de referência na
// coluna da direita, o dia de hoje marcado com linha-guia, o dia de menor
// saldo em âmbar, a leitura do ponto sob o dedo/cursor e a onda decorativa que
// faz a transição para o conteúdo branco abaixo.
//
// O contêiner é `.hf-chart`: no CSS ele sangra de ponta a ponta do herói
// (margin lateral negativa) e ancora a onda no rodapé.
//
// Teclado: o gráfico é focável e as setas ← → percorrem os dias.
//
// Props:
//   dias     [{ dia, saldo, reserva?, restrito? }] — vem do motor de fluxo
//   hojeDia  dia de hoje, ou null quando o mês exibido não é o atual
//   mes      mês em exibição (para as datas "dd/mm")
//   moeda    formatador (v: number) => string
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

export function BalanceChart({ dias = [], hojeDia = null, mes = 9, moeda = fmtPadrao }) {
  const H = 132;
  const [idx, setIdx] = useState(null);
  const boxRef = useRef(null);
  const timer = useRef(null);

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

  // Datas da base: 1, 10, 20 e o último dia do mês — funciona para 28, 29, 30
  // ou 31 dias sem depender de números fixos.
  const ultimoDia = n ? (Number(dias[n - 1].dia) || n) : 30;
  const iTicks = n ? [...new Set([1, 10, 20, ultimoDia].filter((d) => d >= 1 && d <= ultimoDia))].map((d) => d - 1) : [];

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
      <div className="hf-chart" style={{ padding: "0 20px" }}>
        <p style={{ fontSize: 12.5, color: "#EDE9FE", margin: "10px 0 2px" }}>
          Sem movimentação prevista para desenhar o saldo dia a dia.
        </p>
      </div>
    );
  }

  const p = idx != null ? dias[idx] : null;
  const tipX = p ? (x(idx) / W) * 100 : 0;
  const tipY = p ? (y(p.saldo) / H) * 100 : 0;
  const tipAbaixo = tipY < 42;

  return (
    <div
      className="hf-chart"
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
        "Saldo previsto dia a dia: menor valor " + moeda(lo) + ", maior valor " + moeda(hi) +
        ". Passe o dedo sobre o gráfico ou use as setas para ver um dia."
      }
    >
      <svg viewBox={"0 0 " + W + " " + H} width="100%" height={H} aria-hidden="true">
        <defs>
          <linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.42" />
            <stop offset="55%" stopColor="#2DD4BF" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#34D399" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="55%" stopColor="#2DD4BF" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
          <filter id="fGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3.4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* valores de referência: a grade deixa de ser decorativa e passa a
            dizer de quanto é cada linha */}
        {[0, 0.5, 1].map((f, i) => (
          <g key={f}>
            <line x1={PL} x2={W - PR} y1={PT + ih * f} y2={PT + ih * f}
              stroke="rgba(255,255,255,.20)" strokeWidth="1" strokeDasharray="3 6" />
            <text x={W - 2} y={PT + ih * f + 3.4} textAnchor="end" fontSize="9" fontWeight="600"
              fill="#EDE9FE" opacity=".82">
              {moeda(i === 0 ? hi : i === 1 ? (hi + lo) / 2 : lo)}
            </text>
          </g>
        ))}

        {/* datas principais na base; a do dia atual em branco e com o rótulo */}
        {iTicks.map((i, k) => (
          <text key={i} x={x(i)} y={H - 14}
            textAnchor={k === 0 ? "start" : k === iTicks.length - 1 ? "end" : "middle"}
            fontSize="9" fontWeight={i === iHoje ? 800 : 600}
            fill={i === iHoje ? "#FFFFFF" : "#EDE9FE"}>
            {dataCurta(dias[i].dia, mes)}
          </text>
        ))}
        {iHoje >= 0 && (
          <text x={x(iHoje)} y={H - 4} textAnchor="middle" fontSize="8" fontWeight="800"
            letterSpacing=".1em" fill="#FFFFFF">HOJE</text>
        )}

        {area && <path d={area} fill="url(#gArea)" className="area-anim" />}

        {/* reserva mínima disponível: linha de apoio, tracejada, para não
            competir com o saldo — a leitura principal é uma só */}
        {reservas.length === n && (
          <path d={smoothPath(dias.map((d, i) => [x(i), y(d.reserva)]))} fill="none"
            stroke="#FBBF24" strokeWidth="1.6" strokeDasharray="4 4" opacity=".55" />
        )}
        {restritos.length === n && (
          <path d={smoothPath(dias.map((d, i) => [x(i), y(d.restrito)]))} fill="none"
            stroke="#FBBF24" strokeWidth="1.4" strokeDasharray="2 4" opacity=".38" />
        )}

        <path d={linha} fill="none" stroke="url(#gLine)" strokeWidth="3" strokeLinecap="round"
          filter="url(#fGlow)" className="line-anim" />

        {/* dia atual: linha-guia até a base + ponto */}
        {iHoje >= 0 && (
          <>
            <line x1={x(iHoje)} x2={x(iHoje)} y1={y(dias[iHoje].saldo) + 6} y2={PT + ih}
              stroke="rgba(255,255,255,.34)" strokeWidth="1" strokeDasharray="2 4" />
            <circle cx={x(iHoje)} cy={y(dias[iHoje].saldo)} r="9.5" fill="#22D3EE" opacity=".22" />
            <circle cx={x(iHoje)} cy={y(dias[iHoje].saldo)} r="4.6" fill="#fff" stroke="#22D3EE" strokeWidth="2.6" />
          </>
        )}

        {/* dia de menor saldo — o momento crítico do mês */}
        {iMin >= 0 && iMin !== iHoje && (
          <>
            <circle cx={x(iMin)} cy={y(dias[iMin].saldo)} r="8.5" fill="#FBBF24" opacity=".25" />
            <circle cx={x(iMin)} cy={y(dias[iMin].saldo)} r="4" fill="#FBBF24" stroke="#78350F" strokeWidth="1" strokeOpacity=".35" />
          </>
        )}

        {/* ponto sob o cursor/dedo */}
        {p && (
          <>
            <line x1={x(idx)} x2={x(idx)} y1={PT - 6} y2={PT + ih}
              stroke="rgba(255,255,255,.5)" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx={x(idx)} cy={y(p.saldo)} r="8" fill="#fff" opacity=".16" />
            <circle cx={x(idx)} cy={y(p.saldo)} r="4.4" fill="#fff" stroke="#22D3EE" strokeWidth="2.4" />
          </>
        )}
      </svg>

      {/* leitura do ponto: acompanha o dedo e é presa dentro do cartão pelo
          clamp — nas pontas do mês ela encosta na borda em vez de vazar */}
      {p && (
        <div
          className={"hf-tip" + (tipAbaixo ? " abaixo" : "")}
          style={{ left: "clamp(48px, " + tipX + "%, calc(100% - 48px))", top: tipY + "%" }}
        >
          <span>{dataCurta(dias[idx].dia, mes)}{idx === iHoje ? " · hoje" : ""}</span>
          <b className="num">{moeda(p.saldo)}</b>
          {typeof p.reserva === "number" && <span>reserva {moeda(p.reserva)}</span>}
          {typeof p.restrito === "number" && <span>alimentação {moeda(p.restrito)}</span>}
        </div>
      )}

      {/* onda decorativa: transição suave entre o herói e o conteúdo abaixo */}
      <svg className="hf-wave" viewBox="0 0 320 46" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="gWave1" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity=".55" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity=".55" />
          </linearGradient>
          <linearGradient id="gWave2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#A78BFA" stopOpacity=".5" />
            <stop offset="100%" stopColor="#818CF8" stopOpacity=".5" />
          </linearGradient>
        </defs>
        <path d="M0 22 C 55 4, 105 40, 170 24 S 265 6, 320 20 V46 H0 Z" fill="url(#gWave1)" />
        <path d="M0 32 C 70 18, 135 44, 200 30 S 275 16, 320 30 V46 H0 Z" fill="url(#gWave2)" />
      </svg>
    </div>
  );
}

export default BalanceChart;
