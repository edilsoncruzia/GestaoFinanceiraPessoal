import React, { useState } from 'react';
import { CheckCircle2, PiggyBank, AlertTriangle } from 'lucide-react';
import { COLORS } from '../../constants/tokens';
import { fmt, monthLabelFull, addMonths } from '../../utils/formatters';
import { ModalSheet } from '../ui/ModalSheet';
import { Card } from '../ui/Card';
import { CategoryIcon } from '../ui/CategoryIcon';

const primaryBtn = { width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: COLORS.green, color: "#fff", fontSize: 15, fontWeight: 500 };

export function CloseMonthModal({ month, items, monthIncome, monthExpense, onMove, onClose, reserva }) {
  const pending = items.filter((i) => i.type === "expense" && (i.paid < i.amount));
  const [moved, setMoved] = useState({});
  const destino = addMonths(month, 1);
  const temSobra = Boolean(reserva && reserva.saldo > 0);

  return (
    <ModalSheet title={"Fechar " + monthLabelFull(month)} onClose={onClose}>
      <Card style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: COLORS.muted }}>Receita do mês</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.green }}>{fmt(monthIncome)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: COLORS.muted }}>Despesa do mês</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.rust }}>{fmt(monthExpense)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 6, borderTop: "1px solid " + COLORS.line }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>Saldo do mês</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: monthIncome - monthExpense >= 0 ? COLORS.green : COLORS.rust }}>{fmt(monthIncome - monthExpense)}</span>
        </div>
      </Card>

      {pending.length === 0 ? (
        <Card style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <CheckCircle2 size={18} color={COLORS.green} />
          <p style={{ fontSize: 13, margin: 0 }}>Tudo pago! Nenhuma pendência neste mês.</p>
        </Card>
      ) : (
        <>
          <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 8px" }}>Pendências deste mês</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }}>
            {pending.map((i) => (
              <Card key={i.occId} style={{ padding: "10px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <CategoryIcon cat={i.category} size={16} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>{i.description}</p>
                    <p style={{ fontSize: 11, color: COLORS.muted, margin: 0 }}>faltam {fmt(i.amount - i.paid)} · {i.recurrence === "unica" ? "única" : i.recurrence === "recorrente" ? "continua automático no próximo mês" : "parcela avança automático"}</p>
                  </div>
                  {i.recurrence === "unica" && (
                    moved[i.id]
                      ? <span style={{ fontSize: 11, color: COLORS.green, fontWeight: 500 }}>Movido</span>
                      : <button onClick={() => { onMove(i.id); setMoved((p) => ({ ...p, [i.id]: true })); }} style={{ fontSize: 11, padding: "5px 8px", borderRadius: 7, border: "1px solid " + COLORS.green, background: "transparent", color: COLORS.green, whiteSpace: "nowrap" }}>Mover p/ próx. mês</button>
                  )}
                </div>
              </Card>
            ))}
          </div>
          <p style={{ fontSize: 11, color: COLORS.muted, margin: "0 0 14px" }}>Itens recorrentes e parcelados já continuam sozinhos no mês seguinte — só os únicos precisam ser movidos manualmente.</p>
        </>
      )}

      {reserva && (
        <Card style={{ marginBottom: 14, padding: "14px 16px", borderLeft: "4px solid " + (reserva.estourou ? COLORS.rust : COLORS.amber), background: COLORS.amber + "0A" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <PiggyBank size={16} color={reserva.estourou ? COLORS.rust : COLORS.amber} />
            <p style={{ fontSize: 13.5, fontWeight: 700, margin: 0, color: COLORS.ink, flex: 1 }}>Reserva mínima do mês</p>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 13, color: COLORS.muted }}>Disponível no mês</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.ink }}>{fmt(reserva.totalMes)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 13, color: COLORS.muted }}>Aporte do mês (Receita)</span>
            <span style={{ fontSize: 13, color: COLORS.muted }}>+ {fmt(reserva.aporte)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 13, color: COLORS.muted }}>Usado neste mês (Despesa)</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.ink }}>− {fmt(reserva.usado)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 6, borderTop: "1px solid " + COLORS.line }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Saldo da reserva no mês</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: reserva.saldo < 0 ? COLORS.rust : reserva.saldo > 0 ? COLORS.green : COLORS.muted }}>{fmt(reserva.saldo)}</span>
          </div>

          {temSobra ? (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: 10 }}>
              <CheckCircle2 size={16} color={COLORS.green} style={{ marginTop: 1, flexShrink: 0 }} />
              <span style={{ fontSize: 12.5, color: COLORS.ink, lineHeight: 1.5 }}>
                Saldo positivo de <strong>{fmt(reserva.saldo)}</strong> — entra como <strong>Receita</strong> em {monthLabelFull(destino)}.
                A reserva não acumula: em {monthLabelFull(destino)} ela vale o aporte cheio.
              </span>
            </div>
          ) : reserva && reserva.saldo < 0 ? (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: 10 }}>
              <AlertTriangle size={16} color={COLORS.rust} style={{ marginTop: 1, flexShrink: 0 }} />
              <span style={{ fontSize: 12.5, color: COLORS.rust, lineHeight: 1.5 }}>
                Saldo negativo de <strong>{fmt(Math.abs(reserva.saldo))}</strong> — entra como <strong>Despesa</strong> em {monthLabelFull(destino)}.
              </span>
            </div>
          ) : (
            <p style={{ fontSize: 12.5, color: COLORS.muted, margin: "10px 0 0" }}>
              A reserva foi usada exatamente por completo — nada entra no mês seguinte.
            </p>
          )}
        </Card>
      )}

      <button onClick={onClose} style={primaryBtn}>Concluir revisão</button>
    </ModalSheet>
  );
}
