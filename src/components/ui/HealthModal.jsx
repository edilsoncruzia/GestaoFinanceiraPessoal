import React from "react";
import { TrendingUp, TrendingDown, AlertTriangle, Scale, PiggyBank, BarChart3, Info } from "lucide-react";
import { COLORS } from "../../constants/tokens";
import { ModalSheet } from "./ModalSheet";

// ============================================================================
// HealthModal — "Análise da Saúde Financeira"
//
// O modal antigo era uma lista corrida: "a pontuação começa em 100", três
// blocos de regra e, no fim, os descontos do mês. Quem abria não via a NOTA —
// precisava fechar e olhar o anel de novo.
//
// A ordem agora conta a história na sequência em que a pergunta é feita:
//
//   1. RESUMO DESTE MÊS — o número, em um medidor de arco, e logo abaixo o que
//      ele perdeu neste mês (os fatores), com o impacto em vermelho;
//   2. COMO FUNCIONA O CÁLCULO — a régua, DEPOIS do resultado. É a explicação,
//      não o cabeçalho; quem confia no número não precisa ler.
//
// O medidor é um arco de 180° com o degradê da marca (violeta → ciano →
// verde), sem ponteiro: o número no centro é a leitura, o arco é a proporção.
//
// Props:
//   health  { score, factors[], label, poupancaPct, totalBudgets } — vem de
//           computeHealthScore (src/utils/health.js)
// ============================================================================

// ── Medidor de arco ────────────────────────────────────────────────────────
function MedidorArco({ score }) {
  const cx = 120, cy = 118, r = 86;
  const comprimento = Math.PI * r;           // arco de 180°
  const percorrido = comprimento * (Math.max(0, Math.min(100, score)) / 100);

  return (
    <svg viewBox="0 0 240 142" width="100%" style={{ display: "block", maxWidth: 250, margin: "0 auto" }} role="img"
      aria-label={"Pontuação de saúde financeira: " + score + " de 100"}>
      <defs>
        <linearGradient id="gradSaude" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="52%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>
      </defs>

      {/* trilho */}
      <path
        d={"M " + (cx - r) + " " + cy + " A " + r + " " + r + " 0 0 1 " + (cx + r) + " " + cy}
        fill="none" stroke={COLORS.border} strokeWidth="17" strokeLinecap="round"
      />
      {/* progresso */}
      <path
        d={"M " + (cx - r) + " " + cy + " A " + r + " " + r + " 0 0 1 " + (cx + r) + " " + cy}
        fill="none" stroke="url(#gradSaude)" strokeWidth="17" strokeLinecap="round"
        strokeDasharray={comprimento.toFixed(2)}
        strokeDashoffset={(comprimento - percorrido).toFixed(2)}
        style={{ transition: "stroke-dashoffset .8s cubic-bezier(.22,1,.36,1)" }}
      />
      <text x={cx} y={cy - 14} textAnchor="middle" fontFamily="Plus Jakarta Sans, sans-serif"
        fontSize="52" fontWeight="800" fill={COLORS.ink} letterSpacing="-2">{score}</text>
      <text x={cx} y={cy + 8} textAnchor="middle" fontFamily="Inter, sans-serif"
        fontSize="12" fontWeight="600" fill={COLORS.muted}>de 100 pontos</text>
    </svg>
  );
}

// ── Cartão de uma regra do cálculo (a parte "como funciona") ───────────────
function RegraCalculo({ Icone, cor, titulo, penalidade, ajuste }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 13, padding: "13px 14px",
      borderRadius: 14, background: COLORS.surface, border: "1px solid " + COLORS.border,
    }}>
      <span style={{
        width: 44, height: 44, borderRadius: 13, flexShrink: 0,
        background: cor + "16", color: cor,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icone size={21} strokeWidth={2} />
      </span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: COLORS.ink, letterSpacing: "-.01em" }}>
          {titulo}
        </p>
        <p style={{ margin: "4px 0 0", fontSize: 13.5, color: COLORS.fg2, lineHeight: 1.45 }}>
          <strong style={{ color: COLORS.expense, fontWeight: 700 }}>Penalidade {penalidade}</strong>
          {ajuste ? <span style={{ color: COLORS.muted }}> · Ajuste: <strong style={{ color: COLORS.warn }}>{ajuste}</strong></span> : null}
        </p>
      </div>
    </div>
  );
}

export function HealthModal({ health, onClose }) {
  const fatores = (health && health.factors) || [];
  const descontoTotal = fatores.reduce((s, f) => s + Math.abs(Number(f.impact) || 0), 0);

  return (
    <ModalSheet
      title="Análise da Saúde Financeira"
      subtitulo={health ? health.label : null}
      onClose={onClose}
      posicao="topo"
      width={560}
    >
      {/* ── 1. O MÊS ────────────────────────────────────────────────────── */}
      <p className="eyebrow" style={{ color: COLORS.accent, margin: "0 0 6px" }}>Resumo deste mês</p>

      <MedidorArco score={health?.score ?? 0} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 2, marginBottom: 16 }}>
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: COLORS.accent }} aria-hidden="true" />
        <span style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: COLORS.ink }}>Sua Pontuação</span>
        {descontoTotal === 0
          ? <TrendingUp size={15} color={COLORS.income} />
          : <TrendingDown size={15} color={COLORS.expense} />}
      </div>

      {/* O que o mês custou na nota */}
      <div style={{
        border: "1px solid " + COLORS.border, borderRadius: 16, background: COLORS.surface,
        padding: "14px 15px", marginBottom: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{
            width: 46, height: 46, borderRadius: 14, flexShrink: 0,
            background: descontoTotal === 0 ? COLORS.incomeSoft : COLORS.expenseSoft,
            color: descontoTotal === 0 ? COLORS.income : COLORS.expense,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <PiggyBank size={23} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 21, fontWeight: 800, letterSpacing: "-.02em",
              color: descontoTotal === 0 ? COLORS.income : COLORS.expense }}>
              {descontoTotal === 0 ? "0 pts" : "−" + descontoTotal + " pts"}
            </p>
            <p style={{ margin: "1px 0 0", fontSize: 13.5, color: COLORS.muted, fontWeight: 600 }}>
              Pontuação deste mês
            </p>
          </div>
        </div>

        {fatores.length === 0 ? (
          <p style={{ margin: "12px 0 0", fontSize: 14.5, color: COLORS.income, fontWeight: 600 }}>
            Nenhum desconto aplicado — o mês está no melhor estado possível.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 13 }}>
            {fatores.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 11, paddingTop: i === 0 ? 0 : 11, borderTop: i === 0 ? "none" : "1px solid " + COLORS.borderSoft }}>
                <span style={{ minWidth: 38, fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, color: COLORS.expense, flexShrink: 0 }}>
                  {f.impact}
                </span>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: COLORS.ink }}>{f.label}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 13.5, color: COLORS.muted, lineHeight: 1.45 }}>{f.detail}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 2. A RÉGUA ──────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <h3 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 16.5, fontWeight: 800, letterSpacing: "-.02em", color: COLORS.ink }}>
          Como funciona o cálculo
        </h3>
        <Info size={14} color={COLORS.muted} />
      </div>
      <p style={{ margin: "0 0 12px", fontSize: 14, color: COLORS.fg2, lineHeight: 1.5 }}>
        A pontuação começa em <strong style={{ color: COLORS.ink }}>100</strong>. Os pontos são deduzidos por:
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <RegraCalculo
          Icone={BarChart3}
          cor={COLORS.expense}
          titulo="Orçamentos estourados"
          penalidade="−15 pts por orçamento acima do limite."
          ajuste="−5 pts se estiver no limite."
        />
        <RegraCalculo
          Icone={Scale}
          cor={COLORS.info}
          titulo="Despesas acima da receita"
          penalidade="−25 pts se o mês fechar com mais despesas que receitas."
        />
        <RegraCalculo
          Icone={PiggyBank}
          cor={COLORS.income}
          titulo="Poupança insuficiente"
          penalidade="−20 pts por gastar além da renda."
          ajuste="−8 pts por guardar menos de 15% da renda."
        />
      </div>

      {health && health.totalBudgets > 0 && (
        <p style={{ margin: "14px 0 0", fontSize: 13, color: COLORS.muted, lineHeight: 1.5 }}>
          Neste mês o cálculo olhou {health.totalBudgets} orçamento{health.totalBudgets > 1 ? "s" : ""} e uma
          poupança de {health.poupancaPct ?? 0}% da renda.
        </p>
      )}
    </ModalSheet>
  );
}

export default HealthModal;
