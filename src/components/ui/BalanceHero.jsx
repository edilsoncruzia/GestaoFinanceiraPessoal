import React from "react";
import { Wallet, TrendingUp, Bell, Star, Eye, EyeOff } from "lucide-react";
import BalanceChart from "./BalanceChart";
import { MASCARA_VALOR } from "../../utils/formatters";

// ============================================================================
// BalanceHero — o bloco de destaque do topo da Início.
//
// Estrutura e valores portados do protótipo `home-mobile-hero-v3.html`
// (componente TopoHero + GraficoSaldo). O CSS vive no index.css sob as classes
// .herofull / .toprow / .brandmark / .iconbtn / .monthnav / .hf-*.
//
// Ordem, de cima para baixo:
//   marca · [filtro] · anel de saúde · sino
//   seletor de mês (contexto)
//   pílula da pessoa filtrada (só quando há filtro)
//   cartão do saldo disponível (com o selo verde de tendência à direita)
//   cartão do saldo previsto no fim do mês
//   gráfico dia a dia, sangrando de ponta a ponta, com a onda no rodapé
//
// Props:
//   disponivel      número — saldo disponível de hoje
//   previsto        número — saldo previsto para o fim do mês
//   escondido       bool — quando true, o saldo aparece mascarado
//   onAlternarVisao fn — o selo verde do cartão de saldo revela/oculta
//   dias            [{ dia, saldo, reserva?, restrito? }]
//   hojeDia         dia de hoje, ou null quando o mês exibido não é o atual
//   mes             mês em exibição (para as datas do gráfico)
//   saude           nota 0–100 do anel (opcional)
//   onAbrirSaude    fn
//   alertas         quantidade para o sino (opcional)
//   onAbrirAlertas  fn
//   onAbrirPrevisto fn
//   topo            nó na linha da marca (ex.: MemberFilterIcon)
//   contexto        nó da linha do mês (ex.: MonthNav)
//   pessoa          nome da pessoa filtrada, ou null
// ============================================================================

const FAIXAS = [
  { ate: 20, lvl: "Crítica", cor: "#FB7185" },
  { ate: 40, lvl: "Ruim", cor: "#FB923C" },
  { ate: 60, lvl: "Atenção", cor: "#FCD34D" },
  { ate: 80, lvl: "Boa", cor: "#4ADE80" },
  { ate: 100, lvl: "Excelente", cor: "#5EEAD4" },
];
const faixaDe = (n) => FAIXAS.find((f) => n <= f.ate) || FAIXAS[FAIXAS.length - 1];

function AnelSaude({ score, onAbrir }) {
  const f = faixaDe(score);
  const R = 16.5, C = 2 * Math.PI * R;
  return (
    <button
      type="button"
      className="hf-ring"
      onClick={onAbrir}
      aria-label={"Saúde financeira " + score + " de 100, nível " + f.lvl + ". Toque para ver detalhes"}
    >
      <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">
        {/* Substrato escuro: sem ele as faixas crítica (2.33:1) e ruim
            (2.77:1) não passavam em 3:1 na base do degradê. Com ele, a pior
            faixa vai a 4.96:1. A trilha é decorativa de propósito — o número
            está escrito no centro do anel. */}
        <circle cx="18" cy="18" r={R} fill="rgba(15,23,42,.55)" />
        <circle cx="18" cy="18" r={R} fill="none" stroke="rgba(255,255,255,.30)" strokeWidth="3.4" />
        <circle
          cx="18" cy="18" r={R} fill="none" stroke={f.cor} strokeWidth="3.4" strokeLinecap="round"
          strokeDasharray={C.toFixed(1)} strokeDashoffset={(C * (1 - score / 100)).toFixed(1)}
          style={{ transition: "stroke-dashoffset .8s cubic-bezier(.22,1,.36,1), stroke .4s" }}
        />
      </svg>
      <b className="num">{score}</b>
      {/* selo com estrela: mesmo tratamento do sino (badge no canto), para
          sinalizar que o anel é tocável e abre mais detalhe. */}
      <span className="go" aria-hidden="true"><Star size={8} /></span>
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
  pessoa = null,
}) {
  const fmt = (v, dec) => (v < 0 ? "−" : "") + "R$ " + Math.abs(v).toLocaleString("pt-BR", {
    minimumFractionDigits: dec === 0 ? 0 : 2,
    maximumFractionDigits: dec === 0 ? 0 : 2,
  });
  const mask = (v) => (escondido ? "R$ • • • • •" : fmt(v));

  return (
    <section className="herofull hero-bleed" aria-labelledby="t-saldo" data-od-id="hero-saldo">
      <div className="inner">
        <div className="toprow">
          <div className="brandmark"><span className="dot">G</span><span>Finanças</span></div>
          {topo}
          {/* Ocultar/mostrar valores: o olho mora aqui no topo, junto do filtro.
              Antes era o selo verde do cartão de saldo — que saiu para o saldo
              poder ficar centralizado. */}
          {onAlternarVisao && (
            <button
              type="button"
              className="iconbtn plain"
              onClick={onAlternarVisao}
              aria-label={escondido ? "Mostrar valores" : "Ocultar valores"}
              aria-pressed={escondido}
              data-od-id="alternar-valores"
            >
              {escondido ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          )}
          {saude != null && <AnelSaude score={saude} onAbrir={onAbrirSaude} />}
          {alertas != null && (
            <button
              type="button"
              className="iconbtn"
              onClick={onAbrirAlertas}
              aria-label={alertas + " alertas de hoje"}
            >
              <Bell size={20} />
              {alertas > 0 && <span className="badge">{alertas}</span>}
            </button>
          )}
        </div>

        {contexto}
        <div className="hf-who">{pessoa ? <span>{pessoa}</span> : null}</div>

        <div className="hf-core">
          <div className="hf-balance" data-od-id="saldo-disponivel">
            <div className="bcol">
              <p className="lbl" id="t-saldo"><i><Wallet size={13} /></i> Saldo disponível</p>
              <p className="val num">{mask(disponivel)}</p>
            </div>
          </div>
        </div>

        <button type="button" className="hf-proj" data-od-id="saldo-fim-mes" onClick={onAbrirPrevisto}>
          <span className="hf-proj-ic"><TrendingUp size={16} /></span>
          <span className="hf-proj-txt">
            <span className="hf-proj-lbl">Saldo previsto no fim do mês</span>
            <b className={"num " + (previsto >= 0 ? "pos" : "neg")}>
              {escondido ? MASCARA_VALOR : (previsto >= 0 ? "+ " : "− ") + fmt(Math.abs(previsto), 0)}
            </b>
          </span>
        </button>

        <BalanceChart
          dias={dias}
          hojeDia={hojeDia}
          mes={mes}
          moeda={(v) => (escondido ? "R$ •••" : fmt(v, 0))}
          tom="escuro"
        />
      </div>
    </section>
  );
}

export default BalanceHero;
