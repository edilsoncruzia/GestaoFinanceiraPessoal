import React from "react";
import {
  ArrowDownToLine,
  Calendar,
  Check,
  Clock,
  CreditCard,
  MoreVertical,
  Pencil,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { COLORS } from "../../constants/tokens";
import { valoresOcultos, MASCARA_VALOR, MASCARA_CURTA } from "../../utils/formatters";

const fmtPadrao = (v) =>
  valoresOcultos()
    ? MASCARA_VALOR
    : (v < 0 ? "-" : "") + "R$ " + Math.abs(v).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const numeroMoeda = (v) =>
  valoresOcultos()
    ? MASCARA_CURTA
    : "R$ " + Math.abs(v).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const MESES = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
const MESES_CURTOS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const DIAS_SEMANA = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];

function diaSemana(dia, mes) {
  if (dia == null) return "";
  const ano = new Date().getFullYear();
  const d = new Date(ano, (Number(mes) || 1) - 1, Number(dia));
  return Number.isFinite(d.getTime()) ? DIAS_SEMANA[d.getDay()] : "";
}

function estadoDe({ receita, quitada, vencimentoDia, hoje }) {
  if (quitada) return receita
    ? { l: "Recebido", tone: "done", Icon: Check }
    : { l: "Pago", tone: "done", Icon: Check };
  if (vencimentoDia == null || hoje == null) return { l: "Em aberto", tone: "later", Icon: Calendar };
  const d = vencimentoDia - hoje;
  if (d < 0) return { l: "Atrasada " + Math.abs(d) + " dias", tone: "late", Icon: AlertTriangle };
  if (d === 0) return { l: "Vence hoje", tone: "soon", Icon: Clock };
  return { l: "Vence em " + d + " dias", tone: d <= 7 ? "soon" : "later", Icon: Calendar };
}

const chipStyle = (tone, receita, soft, accent) => {
  if (tone === "late") return { background: soft, color: accent };
  if (tone === "soon") return { background: receita ? COLORS.incomeSoft : COLORS.warnSoft, color: receita ? COLORS.income : COLORS.warn };
  if (tone === "done") return { background: receita ? COLORS.incomeSoft : COLORS.surface2, color: receita ? COLORS.income : COLORS.fg2 };
  return { background: COLORS.surface2, color: COLORS.fg2 };
};

export function BillCard({
  titulo,
  valor,
  pago = 0,
  tipo = "expense",
  categoria,
  prioridade,
  pessoa,
  recorrencia,
  vencimentoDia,
  indicadaDia,
  mes = 9,
  hoje = null,
  status,
  moeda = fmtPadrao,
  Icone,
  onPagar,
  onAbrir,
  onEditar,
  onExcluir,
  acoes,
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
    ? "linear-gradient(90deg, #059669, #047857)"
    : "linear-gradient(90deg, #FB7185, #EF4444)";
  const gradBtn = receita
    ? "linear-gradient(135deg, #059669, #047857)"
    : "linear-gradient(135deg, #EF233C, #C70024)";

  const est = status || estadoDe({ receita, quitada, vencimentoDia, hoje });
  const EstIcon = est.Icon || Calendar;
  const diaCalendario = indicadaDia != null ? indicadaDia : vencimentoDia;
  const mesIndex = ((Number(mes) || 1) - 1 + 12) % 12;
  const meta = [recorrencia, pessoa || categoria].filter(Boolean).join("  •  ");
  const vencimentoTexto = vencimentoDia != null
    ? (est.tone === "late"
      ? "Vencimento real dia " + vencimentoDia + " de " + MESES_CURTOS[mesIndex]
      : "Vence em " + Math.max(0, (vencimentoDia || 0) - (hoje || vencimentoDia || 0)) + " dias")
    : "Sem vencimento";

  return (
    <div
      data-od-id="bill-card"
      style={{
        position: "relative",
        overflow: "hidden",
        background: COLORS.surface,
        border: "1px solid " + COLORS.borderSoft,
        borderRadius: 24,
        padding: "18px 18px 18px 26px",
        boxShadow: "0 18px 34px -26px rgba(21,19,42,.36), 0 2px 8px rgba(21,19,42,.04)",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 8,
          background: accent,
        }}
      />

      <button
        type="button"
        onClick={onAbrir}
        aria-label={
          titulo + ", " + (quitada ? (receita ? "recebido " : "pago ") + moeda(valor) : moeda(restante) + " em aberto, " + est.l)
        }
        style={{ display: "block", width: "100%", textAlign: "left", border: 0, padding: 0, background: "transparent", color: "inherit", font: "inherit" }}
      >
        <div className="bill-card-main" style={{ position: "relative", display: "grid", gridTemplateColumns: "104px minmax(0, 1fr) auto 28px", gap: 18, alignItems: "start" }}>
          <span
            style={{
              width: 80,
              borderRadius: 14,
              overflow: "hidden",
              background: COLORS.surface,
              border: "1px solid " + COLORS.border,
              textAlign: "center",
              boxShadow: "0 8px 18px -14px rgba(21,19,42,.45)",
            }}
          >
            <span style={{ display: "block", background: accent, color: "#fff", fontSize: 15, fontWeight: 800, padding: "8px 0 7px" }}>
              {MESES[mesIndex]}
            </span>
            <span className="num" style={{ display: "block", fontFamily: "var(--font-display)", fontSize: 34, lineHeight: 1, fontWeight: 800, color: COLORS.ink, paddingTop: 12 }}>
              {diaCalendario != null ? String(diaCalendario).padStart(2, "0") : "--"}
            </span>
            <span style={{ display: "block", color: COLORS.fg2, fontSize: 16, fontWeight: 700, padding: "5px 0 10px" }}>
              {diaSemana(diaCalendario, mes)}
            </span>
          </span>

          <span style={{ minWidth: 0, display: "grid", gridTemplateColumns: "86px minmax(0, 1fr)", gap: 18, alignItems: "start" }}>
            <span
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: soft,
                color: accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {Icone ? <Icone size={35} strokeWidth={2.4} /> : <CreditCard size={35} strokeWidth={2.4} />}
            </span>

            <span style={{ minWidth: 0 }}>
              <span
                style={{
                  display: "block",
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(20px, 5vw, 28px)",
                  fontWeight: 800,
                  lineHeight: 1.1,
                  color: COLORS.ink,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {titulo}
              </span>
              {meta && (
                <span style={{ display: "block", marginTop: 4, fontSize: "clamp(15px, 4vw, 22px)", color: COLORS.fg2, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {meta}
                </span>
              )}
              <span style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, minWidth: 0, color: est.tone === "late" ? accent : COLORS.fg2 }}>
                <EstIcon size={22} strokeWidth={2.3} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: "clamp(14px, 3.8vw, 20px)", fontWeight: est.tone === "late" ? 600 : 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {vencimentoTexto}
                </span>
              </span>
              <span
                style={{
                  display: "inline-flex",
                  marginTop: 8,
                  padding: "4px 16px",
                  borderRadius: 999,
                  fontSize: "clamp(13px, 3.6vw, 18px)",
                  lineHeight: 1.15,
                  fontWeight: 800,
                  ...chipStyle(est.tone, receita, soft, accent),
                }}
              >
                {est.l}
              </span>
            </span>
          </span>

          <span className="num bill-card-value" style={{ color: accent, fontFamily: "var(--font-display)", fontSize: "clamp(24px, 6vw, 34px)", fontWeight: 800, lineHeight: 1.05, whiteSpace: "nowrap" }}>
            {numeroMoeda(valor)}
          </span>

          <span className="bill-card-menu" style={{ color: COLORS.fg2, display: "flex", justifyContent: "flex-end" }}>
            <MoreVertical size={24} strokeWidth={2.6} />
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 16, alignItems: "center", marginTop: 24 }}>
          <span style={{ minWidth: 0 }}>
            <span style={{ position: "relative", display: "block", height: 20, borderRadius: 999, background: COLORS.surface2, overflow: "hidden" }}>
              <i style={{ display: "block", width: pct + "%", height: "100%", borderRadius: 999, background: gradBar, transition: "width .5s cubic-bezier(.22,1,.36,1)" }} />
            </span>
            <span style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 5, color: COLORS.fg2, fontSize: "clamp(14px, 3.7vw, 19px)" }}>
              <span>{receita ? "Recebido:" : "Pago:"} <b className="num" style={{ color: COLORS.fg2, fontWeight: 700 }}>{moeda(pagoReal)}</b></span>
              <span>Restante: <b className="num" style={{ color: COLORS.fg2, fontWeight: 700 }}>{moeda(restante)}</b></span>
            </span>
          </span>
          <span className="num" style={{ color: COLORS.fg2, fontSize: "clamp(17px, 4.2vw, 24px)", fontWeight: 600 }}>
            {pct}%
          </span>
        </div>
      </button>

      <div className="bill-card-actions" style={{ display: "grid", gridTemplateColumns: "minmax(112px, .65fr) minmax(150px, 1.35fr) 72px", gap: 16, alignItems: "center", marginTop: 14 }}>
        {onEditar && (
          <button
            type="button"
            onClick={onEditar}
            aria-label={"Editar " + titulo}
            style={{
              minHeight: 58,
              borderRadius: 999,
              border: "1px solid " + COLORS.border,
              background: "linear-gradient(180deg, #fff, " + COLORS.surface2 + ")",
              color: COLORS.ink,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              fontSize: "clamp(15px, 3.8vw, 20px)",
              fontWeight: 600,
            }}
          >
            <Pencil size={24} /> Editar
          </button>
        )}

        {quitada ? (
          <span
            style={{
              minHeight: 58,
              borderRadius: 999,
              background: COLORS.surface2,
              color: receita ? COLORS.income : COLORS.fg2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              fontFamily: "var(--font-display)",
              fontSize: "clamp(15px, 3.8vw, 20px)",
              fontWeight: 800,
            }}
          >
            <Check size={22} /> {receita ? "RECEBIDO" : "PAGO"}
          </span>
        ) : (
          <button
            type="button"
            onClick={onPagar}
            style={{
              minHeight: 58,
              borderRadius: 999,
              border: "none",
              background: gradBtn,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              fontFamily: "var(--font-display)",
              fontSize: "clamp(16px, 4vw, 22px)",
              fontWeight: 800,
              boxShadow: "0 14px 22px -16px rgba(21,19,42,.55)",
            }}
          >
            {receita ? <ArrowDownToLine size={25} /> : <CreditCard size={25} />}
            {receita ? "RECEBER" : "PAGAR"}
          </button>
        )}

        {onExcluir && (
          <button
            type="button"
            onClick={onExcluir}
            aria-label={"Excluir " + titulo}
            style={{
              width: 62,
              height: 62,
              borderRadius: "50%",
              border: "1px solid " + COLORS.expenseBorder,
              background: COLORS.expenseSoft,
              color: COLORS.expense,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              justifySelf: "end",
            }}
          >
            <Trash2 size={26} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {acoes}
    </div>
  );
}

export default BillCard;
