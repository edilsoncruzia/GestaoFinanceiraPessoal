import React from "react";
import { Calendar, Check, Sparkle, Target, ArrowDownToLine, CreditCard, AlertTriangle, Zap, Pencil, Trash2, Wallet, Clock, ArrowRight } from "lucide-react";
import { COLORS, RADIUS, SHADOW } from "../../constants/tokens";

// ============================================================================
// BillCard — o cartão de conta em aberto.
//
// Layout do modelo aprovado: bloco de calendário à esquerda (mês + dia),
// título com o ícone da categoria, a linha de recorrência/prioridade/pessoa,
// a linha do vencimento, a caixa do valor à direita, uma caixa interna com
// PAGO/RESTANTE e a barra, e a linha de ação (editar · registrar · excluir).
//
// O FUNDO É O SINAL: verde bem clarinho para receita, vermelho bem clarinho
// para despesa — a mesma leitura da faixa lateral, agora no cartão inteiro.
//
// É apresentacional: nada de regra de negócio aqui. Quem decide o que é pago,
// qual é a data recomendada e o que é grupo é o motor, do lado de fora.
// ============================================================================

const fmtPadrao = (v) =>
  (v < 0 ? "−" : "") + "R$ " + Math.abs(v).toLocaleString("pt-BR", { maximumFractionDigits: 0 });

const numeroPuro = (v) => Math.abs(Math.round(v)).toLocaleString("pt-BR", { maximumFractionDigits: 0 });

const dataCurta = (dia, mes) => String(dia).padStart(2, "0") + "/" + String(mes).padStart(2, "0");

const MESES = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

/* Estado pelo VENCIMENTO, que é a data que o mundo cobra. A data recomendada
   pelo motor é outra coisa e vive no bloco do calendário. */
function estadoDe({ receita, quitada, vencimentoDia, hoje }) {
  if (quitada) return receita
    ? { l: "Recebido", tone: "in", Icon: Check }
    : { l: "Pago", tone: "done", Icon: Check };
  if (vencimentoDia == null || hoje == null) return { l: "Em aberto", tone: "later", Icon: Clock };
  const d = vencimentoDia - hoje;
  if (d < 0) return { l: "Atrasada " + Math.abs(d) + "d", tone: "late", Icon: AlertTriangle };
  if (d === 0) return { l: "Hoje", tone: "today", Icon: Zap };
  return { l: "Em " + d + "d", tone: d <= 7 ? "soon" : "later", Icon: Clock };
}

const chip = (tone) => {
  if (tone === "late") return { background: COLORS.expense, color: "#fff" };
  if (tone === "today" || tone === "soon") return { background: COLORS.warnSoft, color: COLORS.warn };
  if (tone === "in") return { background: COLORS.incomeSoft, color: COLORS.income };
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
  onEditar,           // abre o formulário do lançamento
  onExcluir,          // pede a confirmação de exclusão
  acoes,              // nó de ações secundárias (avisos do motor)
}) {
  const receita = tipo === "income";
  const pagoReal = Math.max(0, Math.min(pago || 0, valor));
  const restante = Math.max(0, valor - pagoReal);
  const quitada = restante === 0;
  const pct = valor > 0 ? Math.min(100, Math.round((pagoReal / valor) * 100)) : 0;

  const accent = receita ? COLORS.income : COLORS.expense;
  const soft = receita ? COLORS.incomeSoft : COLORS.expenseSoft;
  const borderSoft = receita ? COLORS.incomeBorder : COLORS.expenseBorder;
  const gradBar = receita
    ? "linear-gradient(90deg, #10B981, #047857)"
    : "linear-gradient(90deg, #EF4444, #BE123C)";
  const gradBtn = receita
    ? "linear-gradient(158deg, #059669, #065F46)"
    : "linear-gradient(158deg, #E11D48, #9F1239)";

  const est = status || estadoDe({ receita, quitada, vencimentoDia, hoje });
  const estChip = chip(est.tone);
  const EstIcon = est.Icon || Clock;

  // O calendário mostra o dia RECOMENDADO (o que o motor sugere pagar); a
  // linha abaixo diz o vencimento real. Sem recomendação, cai no vencimento.
  const diaCalendario = indicadaDia != null ? indicadaDia : vencimentoDia;
  const mesRotulo = MESES[((Number(mes) || 1) - 1 + 12) % 12];

  const meta = [recorrencia, prioridade, pessoa].filter(Boolean).join(" · ");

  return (
    <div
      data-od-id="bill-card"
      style={{
        position: "relative",
        background: soft,                       // fundo bem clarinho: verde/vermelho
        border: "1px solid " + borderSoft,
        borderRadius: RADIUS.card,
        padding: 16,
        // A faixa colorida é SÓ na lateral esquerda (sem deslocamento vertical).
        boxShadow: quitada ? "-8px 0 0 " + COLORS.border : "-8px 0 0 " + accent + ", " + SHADOW.card,
      }}
    >
      <button
        type="button"
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
          {/* bloco calendário: mês no cabeçalho, dia grande embaixo */}
          <span style={{
            flexShrink: 0, width: 52, borderRadius: 14, overflow: "hidden",
            background: COLORS.surface, border: "1px solid " + borderSoft, textAlign: "center",
            boxShadow: "0 1px 2px rgba(21,19,42,.04)",
          }}>
            <span style={{
              display: "block", background: accent, color: "#fff", fontSize: 9.5, fontWeight: 800,
              letterSpacing: "0.06em", padding: "3px 0",
            }}>{mesRotulo}</span>
            <span className="num" style={{
              display: "block", fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800,
              letterSpacing: "-0.03em", color: COLORS.ink, padding: "4px 0 6px", lineHeight: 1,
            }}>{diaCalendario != null ? String(diaCalendario).padStart(2, "0") : "—"}</span>
          </span>

          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
              <span style={{
                fontFamily: "var(--font-display)", fontSize: 16.5, fontWeight: 800,
                letterSpacing: "-0.025em", color: COLORS.ink,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{titulo}</span>
              {Icone && (
                <span style={{
                  flexShrink: 0, width: 24, height: 24, borderRadius: 999, background: COLORS.surface,
                  color: accent, display: "flex", alignItems: "center", justifyContent: "center",
                }}><Icone size={13} /></span>
              )}
            </span>

            {meta && (
              <span style={{
                display: "block", fontSize: 11.5, lineHeight: 1.4, color: COLORS.muted,
                fontWeight: 500, marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{meta}</span>
            )}

            {vencimentoDia != null && (
              <span style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 7, flexWrap: "wrap" }}>
                <EstIcon size={13} color={est.tone === "late" ? COLORS.expense : COLORS.fg2} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 11.5, color: COLORS.fg2, whiteSpace: "nowrap" }}>
                  Vencimento <b style={{ color: COLORS.ink, fontWeight: 700 }}>real dia {vencimentoDia}</b>
                </span>
                {/* O selo de prazo vive aqui: o modelo trocou o quadro "Vencimento"
                    por esta linha, e sem ele o atraso perderia o sinal. */}
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 7px", borderRadius: 999,
                  fontSize: 9, fontWeight: 800, whiteSpace: "nowrap", ...estChip,
                }}>{est.l}</span>
              </span>
            )}
          </span>

          {/* caixa do valor: "R$" pequeno em cima, número grande embaixo */}
          <span style={{
            flexShrink: 0, textAlign: "right", background: COLORS.surface,
            border: "1px solid " + borderSoft, borderRadius: 14, padding: "7px 12px", minWidth: 82,
          }}>
            <span style={{ display: "block", fontSize: 10.5, fontWeight: 800, letterSpacing: "0.04em", color: COLORS.muted }}>R$</span>
            <span className="num" style={{
              display: "block", fontFamily: "var(--font-display)", fontSize: 21, fontWeight: 800,
              letterSpacing: "-0.035em", lineHeight: 1.1, color: quitada ? COLORS.muted : COLORS.ink,
              whiteSpace: "nowrap",
            }}>{numeroPuro(valor)}</span>
          </span>
        </div>

        {/* caixa interna: pago/recebido, restante e a barra */}
        <span style={{
          display: "block", marginTop: 14, background: COLORS.surface,
          border: "1px solid " + borderSoft, borderRadius: 16, padding: "12px 14px",
        }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7, minWidth: 0 }}>
              <i style={{
                width: 26, height: 26, borderRadius: 9, background: soft, color: accent, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center", fontStyle: "normal",
              }}><Wallet size={14} /></i>
              <span style={{ minWidth: 0 }}>
                <em style={{
                  display: "block", fontStyle: "normal", fontSize: 9.5, fontWeight: 800,
                  letterSpacing: "0.06em", textTransform: "uppercase", color: COLORS.muted,
                }}>{receita ? "Recebido:" : "Pago:"}</em>
                <b className="num" style={{
                  display: "block", fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 800,
                  letterSpacing: "-0.02em", color: COLORS.ink, whiteSpace: "nowrap",
                }}>{moeda(pagoReal)}</b>
              </span>
            </span>

            <span style={{ display: "inline-flex", alignItems: "center", gap: 7, minWidth: 0, marginLeft: "auto" }}>
              <i style={{
                width: 26, height: 26, borderRadius: 9, background: soft, color: accent, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center", fontStyle: "normal",
              }}><Clock size={14} /></i>
              <span style={{ minWidth: 0, textAlign: "right" }}>
                <em style={{
                  display: "block", fontStyle: "normal", fontSize: 9.5, fontWeight: 800,
                  letterSpacing: "0.06em", textTransform: "uppercase", color: COLORS.muted,
                }}>Restante:</em>
                <b className="num" style={{
                  display: "block", fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 800,
                  letterSpacing: "-0.02em", color: COLORS.ink, whiteSpace: "nowrap",
                }}>{moeda(restante)}</b>
              </span>
            </span>
          </span>

          {/* barra: o "%" fica centrado no próprio preenchimento */}
          <span style={{
            position: "relative", display: "block", height: 22, borderRadius: 999,
            background: COLORS.surface2, overflow: "hidden", marginTop: 10,
          }}>
            <i style={{
              position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: 999,
              background: gradBar, width: pct + "%",
              transition: "width .5s cubic-bezier(.22,1,.36,1)",
            }} />
            {/* Quando o preenchimento é estreito demais para caber o número, o
                "%" sai de dentro dele e vai para a trilha em cor escura — é o
                caso do cartão ainda sem nenhum pagamento (0%). */}
            {pct >= 15 ? (
              <b className="num" style={{
                position: "absolute", left: 0, top: 0, bottom: 0, width: pct + "%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-display)", fontSize: 11, fontWeight: 800,
                letterSpacing: "-0.01em", color: "#fff", whiteSpace: "nowrap",
              }}>{pct}%</b>
            ) : (
              <b className="num" style={{
                position: "absolute", left: "calc(" + pct + "% + 10px)", top: 0, bottom: 0,
                display: "flex", alignItems: "center",
                fontFamily: "var(--font-display)", fontSize: 11, fontWeight: 800,
                letterSpacing: "-0.01em", color: COLORS.ink, whiteSpace: "nowrap",
              }}>{pct}%</b>
            )}
          </span>
        </span>
      </button>

      {/* Linha de ação: editar (círculo) · registrar (pílula) · excluir (círculo) */}
      <div style={{ display: "flex", alignItems: "stretch", gap: 8, marginTop: 12 }}>
        {onEditar && (
          <button
            type="button"
            onClick={onEditar}
            aria-label={"Editar " + titulo}
            style={{
              flexShrink: 0, width: 52, minHeight: 52, borderRadius: "50%",
              border: "1px solid " + COLORS.border, background: COLORS.surface, color: COLORS.fg2,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Pencil size={18} />
          </button>
        )}

        {quitada ? (
          <span style={{
            flex: 1, minWidth: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            minHeight: 52, borderRadius: 999, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13.5,
            background: COLORS.surface, color: receita ? COLORS.income : COLORS.fg2,
          }}>
            <Check size={16} /> {receita ? "Recebimento concluído" : "Pagamento concluído"}
          </span>
        ) : (
          <button
            type="button"
            onClick={onPagar}
            style={{
              flex: 1, minWidth: 0, minHeight: 52, borderRadius: 999, border: "none",
              background: gradBtn, color: "#fff", fontFamily: "var(--font-display)",
              fontWeight: 800, fontSize: 14.5,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 10px 22px -12px rgba(21,19,42,.5)",
            }}
          >
            {receita
              ? <><ArrowDownToLine size={17} /> RECEBER</>
              : <><CreditCard size={17} /> PAGAR</>}
            <ArrowRight size={16} style={{ opacity: 0.9 }} />
          </button>
        )}

        {onExcluir && (
          <button
            type="button"
            onClick={onExcluir}
            aria-label={"Excluir " + titulo}
            style={{
              flexShrink: 0, width: 52, minHeight: 52, borderRadius: "50%",
              border: "1px solid " + COLORS.expenseBorder, background: COLORS.expenseSoft, color: COLORS.expense,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {acoes}
    </div>
  );
}

export default BillCard;
