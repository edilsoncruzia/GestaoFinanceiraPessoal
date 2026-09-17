import React from "react";
import { AlertTriangle, Clock, CheckCircle2, BellRing, Receipt } from "lucide-react";
import { COLORS } from "../../constants/tokens";
import { fmt } from "../../utils/formatters";
import { ModalSheet } from "./ModalSheet";

// ============================================================================
// AlertsModal — a lista de alertas de hoje
//
// Antes: um monte de <div> com triângulo e uma frase corrida. Tudo com o mesmo
// peso — "Supermercado está atrasado desde 15 de set." e "Streaming já está em
// 82% do limite" eram visualmente idênticos, e não havia como pagar dali.
//
// Agora cada alerta é uma LINHA com hierarquia e — quando é dinheiro a sair —
// o atalho "Pagar" na ponta direita, que é o motivo de a pessoa ter aberto a
// lista. Três leituras por linha, nesta ordem:
//
//   glifo   → o tipo (atraso/vencimento) e a severidade pela cor
//   texto   → nome em negrito + situação em seguida; detalhe na linha de baixo
//   ação    → "Pagar" com o valor restante, quando existe o que pagar
//
// Os alertas chegam ESTRUTURADOS do App (nivel, titulo, texto, detalhe, valor,
// pagavel, alvo). O valor é formatado aqui, na hora de desenhar — por isso o
// modo privacidade alcança a lista, o que não acontecia quando a frase já
// vinha pronta com o "R$" embutido.
//
// Props:
//   alerts  array de alertas
//   onPay   fn(alvo) — abre o pagamento do item
//   onClose fn
// ============================================================================

const TOM = {
  rust: {
    cor: COLORS.expense,
    fundo: COLORS.expenseSoft,
    borda: COLORS.expenseBorder,
    Icone: AlertTriangle,
  },
  amber: {
    cor: COLORS.warn,
    fundo: COLORS.warnSoft,
    borda: COLORS.warnBorder,
    Icone: Clock,
  },
};

function LinhaAlerta({ alerta, onPay }) {
  const tom = TOM[alerta.nivel] || TOM.amber;
  const Icone = tom.Icone;
  const temValor = typeof alerta.valor === "number" && alerta.valor > 0;

  return (
    <div
      style={{
        // Duas LINHAS, não duas colunas: o texto ocupa a largura inteira do
        // modal e o botão de pagar desce para baixo dele.
        //
        // Antes o botão ficava na mesma faixa do texto e, com o valor ao lado
        // ("Pagar · R$ 100,00"), ele comia ~45% da largura — o nome do
        // compromisso quebrava em cinco linhas ("Acordo / Cheque / Especial /
        // Caixa / está atrasado desde 01 de set."). Agora a leitura corre na
        // horizontal, que é como se lê, e a ação fica embaixo, com largura
        // inteira e alvo de dedo folgado.
        display: "flex", flexDirection: "column", gap: 10,
        background: tom.fundo, border: "1px solid " + tom.borda,
        borderRadius: 14, padding: "12px 13px",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          background: tom.cor + "1F", color: tom.cor,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icone size={20} strokeWidth={2.1} />
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.4 }}>
            <strong style={{ fontWeight: 700, color: COLORS.ink }}>{alerta.titulo}</strong>
            {alerta.texto ? <span style={{ color: COLORS.fg2, fontWeight: 500 }}> {alerta.texto}</span> : null}
          </p>
          {alerta.detalhe ? (
            <p style={{ margin: "3px 0 0", fontSize: 13, color: COLORS.muted, fontWeight: 500, lineHeight: 1.4 }}>
              {alerta.detalhe}
              {temValor && !alerta.pagavel ? " · " + fmt(alerta.valor) : ""}
            </p>
          ) : null}
        </div>
      </div>

      {alerta.pagavel && alerta.alvo && onPay ? (
        <button
          type="button"
          onClick={() => onPay(alerta.alvo)}
          style={{
            width: "100%", minHeight: 44, padding: "0 14px", borderRadius: 11,
            border: "1.5px solid " + tom.cor, background: COLORS.surface, color: tom.cor,
            fontFamily: "var(--font-display)", fontSize: 14.5, fontWeight: 700,
          }}
        >
          Pagar{temValor ? " · " + fmt(alerta.valor) : ""}
        </button>
      ) : null}
    </div>
  );
}

export function AlertsModal({ alerts = [], onPay, onClose }) {
  const atrasados = alerts.filter((a) => a.nivel === "rust").length;
  const projetados = alerts.length - atrasados;

  return (
    <ModalSheet
      title={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          <span style={{
            width: 38, height: 38, borderRadius: 12, background: COLORS.expenseSoft, color: COLORS.expense,
            display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <BellRing size={19} />
          </span>
          {alerts.length === 1 ? "1 alerta" : alerts.length + " alertas"}
        </span>
      }
      subtitulo={
        alerts.length === 0
          ? "Está tudo em dia"
          : atrasados + " em atraso" + (projetados > 0 ? " · " + projetados + " a vencer" : "")
      }
      onClose={onClose}
      posicao="topo"
      width={560}
    >
      {alerts.length === 0 ? (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 14px", borderRadius: 14, background: COLORS.incomeSoft, border: "1px solid " + COLORS.incomeBorder }}>
          <CheckCircle2 size={20} color={COLORS.income} />
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: COLORS.income }}>
            Nenhum alerta agora — nada atrasado e nada estourando o orçamento.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {alerts.map((a) => <LinhaAlerta key={a.id} alerta={a} onPay={onPay} />)}
        </div>
      )}

      {alerts.some((a) => a.pagavel) && (
        <p style={{ display: "flex", alignItems: "center", gap: 6, margin: "14px 0 0", fontSize: 13, color: COLORS.muted }}>
          <Receipt size={13} />Toque em "Pagar" para registrar o pagamento sem sair daqui.
        </p>
      )}
    </ModalSheet>
  );
}

export default AlertsModal;
