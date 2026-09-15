import React from "react";
import { Calendar, Check, Sparkle, Target, ArrowDownToLine, CreditCard, AlertTriangle, Zap } from "lucide-react";
import { COLORS, RADIUS, SHADOW } from "../../constants/tokens";

// ============================================================================
// BillCard — o cartão de conta em aberto aprovado no protótipo.
//
// É um componente APRESENTACIONAL: recebe valores prontos e devolve o cartão.
// Nada de regra de negócio aqui — o motor de priorização, os lançamentos
// agrupados, o salário com descontos e o menu de editar/excluir continuam onde
// estão. É isso que permite trocar o visual do card sem tocar em nenhuma
// decisão do app.
//
// O que o cartão mostra, na ordem:
//   ícone da categoria + título + valor cheio
//   linha "pago/recebido : restante"
//   barra com o % dentro do preenchimento
//   dois quadros: vencimento (com o selo de prazo) e data recomendada
//   ação sólida na cor do dinheiro
//
// A cor é o SINAL: verde para receita, vermelho para despesa. A urgência tem
// cor própria no selo de prazo, e a ação é sempre o violeta da marca.
// ============================================================================

const fmtPadrao = (v) =>
  (v < 0 ? "−" : "") + "R$ " + Math.abs(v).toLocaleString("pt-BR", { maximumFractionDigits: 0 });

const dataCurta = (dia, mes) => String(dia).padStart(2, "0") + "/" + String(mes).padStart(2, "0");

/* Estado pelo VENCIMENTO, que é a data que o mundo cobra. A data recomendada
   pelo motor é outra coisa e vive no quadro ao lado. */
function estadoDe({ receita, quitada, vencimentoDia, hoje }) {
  if (quitada) return receita
    ? { l: "Recebido", tone: "in", Icon: Check }
    : { l: "Pago", tone: "done", Icon: Check };
  if (vencimentoDia == null || hoje == null) return { l: "Em aberto", tone: "later", Icon: Calendar };
  const d = vencimentoDia - hoje;
  if (d < 0) return { l: "Atrasada " + Math.abs(d) + "d", tone: "late", Icon: AlertTriangle };
  if (d === 0) return { l: "Hoje", tone: "today", Icon: Zap };
  return { l: "Em " + d + "d", tone: d <= 7 ? "soon" : "later", Icon: Calendar };
}

const chip = (tone) => {
  if (tone === "late") return { background: COLORS.expenseSoft, color: COLORS.expense };
  if (tone === "today" || tone === "soon") return { background: COLORS.warnSoft, color: COLORS.warn };
  if (tone === "in") return { background: COLORS.incomeSoft, color: COLORS.income };
  if (tone === "done") return { background: COLORS.surface2, color: COLORS.fg2 };
  return { background: COLORS.surface2, color: COLORS.fg2 };
};

export function BillCard({
  titulo,
  valor,
  pago = 0,
  tipo = "expense",
  categoria,          // rótulo da categoria, ex.: "Educação"
  prioridade,         // "Essencial" | "Importante" | "Flexível"
  pessoa,             // "Você" | "Esposa" | "Casal"
  recorrencia,        // "Parcela 3/12" | "Recorrente" | "Única"
  vencimentoDia,
  indicadaDia,        // data recomendada pelo motor de fluxo de caixa
  mes = 9,
  hoje = null,        // dia de hoje, quando o mês exibido é o atual
  status,             // { l, tone } quando o motor já sabe o estado
  moeda = fmtPadrao,
  Icone,              // componente de ícone da categoria
  onPagar,
  onAbrir,
  acoes,              // nó de ações secundárias (menu de editar/excluir)
}) {
  const receita = tipo === "income";
  const pagoReal = Math.max(0, Math.min(pago || 0, valor));
  const restante = Math.max(0, valor - pagoReal);
  const quitada = restante === 0;
  const pct = valor > 0 ? Math.min(100, Math.round((pagoReal / valor) * 100)) : 0;

  const accent = receita ? COLORS.income : COLORS.expense;
  const soft = receita ? COLORS.incomeSoft : COLORS.expenseSoft;
  const est = status || estadoDe({ receita, quitada, vencimentoDia, hoje });
  const estChip = chip(est.tone);
  const EstIcon = est.Icon || Calendar;

  // Janela recomendada: só existe enquanto houver valor em aberto. Quando já
  // passou, é o alerta vermelho do cartão.
  const janela = quitada || indicadaDia == null ? null
    : (hoje != null && indicadaDia < hoje ? { tone: "late", data: dataCurta(indicadaDia, mes), selo: "Passou" }
      : { tone: "ideal", data: dataCurta(indicadaDia, mes), selo: "Ideal" });

  // O "%" e o rótulo da barra vivem em posições calculadas: o número muda de
  // lado quando o preenchimento é estreito e o rótulo não é desenhado quando a
  // trilha acaba. Nada de texto cortado em nenhum percentual.
  const dentro = pct >= 20;
  const comRotulo = pct <= 52;

  const meta = [recorrencia, prioridade, pessoa].filter(Boolean).join(" · ");
  const cap = quitada ? "valor total" : receita ? "a receber" : "em aberto";

  return (
    <div
      data-od-id="bill-card"
      style={{
        position: "relative",
        background: COLORS.surface,
        border: "1px solid " + COLORS.border,
        borderRadius: RADIUS.card,
        padding: 16,
        boxShadow: quitada ? "-8px 8px 0 " + COLORS.border : "-8px 8px 0 " + accent + ", " + SHADOW.card,
      }}
    >
      <button
        onClick={onAbrir}
        style={{
          display: "block", width: "100%", textAlign: "left", background: "none", border: "none", padding: 0,
          color: "inherit", font: "inherit",
        }}
        aria-label={
          titulo + ", " + (quitada ? (receita ? "recebido " : "pago ") + moeda(valor)
            : moeda(restante) + " em aberto, " + est.l) + ". Abrir detalhes"
        }
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span style={{
            width: 40, height: 40, borderRadius: 14, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: soft, color: accent,
          }}>
            {Icone ? <Icone size={20} /> : null}
          </span>
          <span style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
            <span style={{
              display: "block", fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 800,
              letterSpacing: "-0.025em", color: COLORS.ink,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{titulo}</span>
            <span style={{ display: "block", fontSize: 11.5, lineHeight: 1.4, color: COLORS.muted, fontWeight: 500, marginTop: 3 }}>
              {meta}
            </span>
          </span>
          <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0, paddingLeft: 8 }}>
            <span className="num" style={{
              fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, letterSpacing: "-0.035em",
              color: quitada ? COLORS.muted : COLORS.ink, whiteSpace: "nowrap", lineHeight: 1.15,
            }}>{moeda(valor)}</span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: "4px 12px", marginTop: 15, flexWrap: "wrap", minWidth: 0 }}>
          <span style={{ display: "inline-flex", alignItems: "baseline", gap: 6, minWidth: 0 }}>
            <em style={{
              fontStyle: "normal", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.04em",
              textTransform: "uppercase", color: COLORS.muted, whiteSpace: "nowrap",
            }}>{receita ? "Recebido:" : "Pago:"}</em>
            <b className="num" style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 800, letterSpacing: "-0.02em", color: COLORS.ink, whiteSpace: "nowrap" }}>
              {moeda(pagoReal)}
            </b>
          </span>
          <span style={{ display: "inline-flex", alignItems: "baseline", gap: 6, minWidth: 0, marginLeft: "auto" }}>
            <em style={{
              fontStyle: "normal", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.04em",
              textTransform: "uppercase", color: COLORS.muted, whiteSpace: "nowrap",
            }}>Restante:</em>
            <b className="num" style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 800, letterSpacing: "-0.02em", color: COLORS.ink, whiteSpace: "nowrap" }}>
              {moeda(restante)}
            </b>
          </span>
        </div>

        <div style={{
          position: "relative", height: 24, borderRadius: 999, background: COLORS.surface2,
          overflow: "hidden", marginTop: 9,
        }}>
          <i style={{
            position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: 999,
            background: accent, width: pct + "%",
            transition: "width .5s cubic-bezier(.22,1,.36,1)",
          }} />
          <b className="num" style={{
            position: "absolute", top: 0, bottom: 0, display: "flex", alignItems: "center",
            fontFamily: "var(--font-display)", fontSize: 11.5, fontWeight: 800, letterSpacing: "-0.01em", whiteSpace: "nowrap",
            left: dentro ? (pct / 2) + "%" : "calc(" + pct + "% + 10px)",
            transform: dentro ? "translateX(-50%)" : "none",
            color: dentro ? "#fff" : COLORS.ink,
          }}>{pct}%</b>
          {comRotulo && (
            <u style={{
              position: "absolute", top: 0, bottom: 0, display: "flex", alignItems: "center",
              fontStyle: "normal", fontSize: 9.5, fontWeight: 800, letterSpacing: "0.06em",
              textTransform: "uppercase", color: COLORS.fg2, whiteSpace: "nowrap",
              left: "calc(" + pct + "% + " + (dentro ? 12 : 50) + "px)",
            }}>do valor total</u>
          )}
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: janela ? "1fr 1fr" : "1fr",
          gap: 8, marginTop: 14,
        }}>
          <span style={{ display: "block", minWidth: 0, borderRadius: 16, padding: "10px 11px", background: COLORS.surface2 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
              <i style={{
                width: 24, height: 24, borderRadius: 8, background: COLORS.surface, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.fg2,
              }}><Calendar size={15} /></i>
              <span style={{
                fontSize: 9, fontWeight: 800, letterSpacing: "0.02em", textTransform: "uppercase",
                color: COLORS.fg2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>Vencimento</span>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 7, flexWrap: "wrap" }}>
              <b className="num" style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, letterSpacing: "-0.025em", color: COLORS.ink, whiteSpace: "nowrap" }}>
                {vencimentoDia != null ? dataCurta(vencimentoDia, mes) : "—"}
              </b>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 3, padding: "3px 8px", borderRadius: 999,
                fontSize: 9.5, fontWeight: 800, whiteSpace: "nowrap", ...estChip,
              }}>
                <EstIcon size={10} /> {est.l}
              </span>
            </span>
          </span>

          {janela && (
            <span style={{ display: "block", minWidth: 0, borderRadius: 16, padding: "10px 11px", background: soft }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                <i style={{
                  width: 24, height: 24, borderRadius: 8, background: COLORS.surface, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center", color: accent,
                }}><Target size={15} /></i>
                <span style={{
                  fontSize: 9, fontWeight: 800, letterSpacing: "0.02em", textTransform: "uppercase",
                  color: COLORS.fg2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>Recomendada</span>
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 7, flexWrap: "wrap" }}>
                <b className="num" style={{
                  fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, letterSpacing: "-0.025em",
                  color: janela.tone === "late" ? COLORS.expense : COLORS.ink, whiteSpace: "nowrap",
                }}>{janela.data}</b>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 3, padding: "3px 8px", borderRadius: 999,
                  fontSize: 9.5, fontWeight: 800, whiteSpace: "nowrap",
                  background: COLORS.surface,
                  color: janela.tone === "late" ? COLORS.expense : accent,
                }}>
                  <Sparkle size={9} /> {janela.selo}
                </span>
              </span>
            </span>
          )}
        </div>
      </button>

      {quitada ? (
        <span style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", marginTop: 14,
          minHeight: 52, borderRadius: 20, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13.5,
          background: receita ? COLORS.incomeSoft : COLORS.surface2,
          color: receita ? COLORS.income : COLORS.fg2,
        }}>
          <Check size={16} /> {receita ? "Recebimento concluído" : "Pagamento concluído"}
        </span>
      ) : (
        <button
          onClick={onPagar}
          style={{
            width: "100%", marginTop: 14, minHeight: 52, borderRadius: 20, border: "none",
            background: accent, color: "#fff", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14.5,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
            boxShadow: "0 10px 22px -12px rgba(21,19,42,.5)",
          }}
        >
          {receita
            ? <><ArrowDownToLine size={17} /> Registrar recebimento</>
            : <><CreditCard size={17} /> Registrar pagamento</>}
        </button>
      )}

      {acoes}
    </div>
  );
}

export default BillCard;