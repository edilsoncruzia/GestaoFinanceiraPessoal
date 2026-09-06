import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { COLORS } from '../../constants/tokens';
import { fmt, monthLabelFull } from '../../utils/formatters';
import { ModalSheet } from '../ui/ModalSheet';
import { Card } from '../ui/Card';
import { CategoryIcon } from '../ui/CategoryIcon';

const primaryBtn = { width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: COLORS.green, color: "#fff", fontSize: 15, fontWeight: 500 };

export function CloseMonthModal({ month, items, monthIncome, monthExpense, onMove, onClose }) {
  const pending = items.filter((i) => i.type === "expense" && (i.paid < i.amount));
  const [moved, setMoved] = useState({});

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

      <button onClick={onClose} style={primaryBtn}>Concluir revisão</button>
    </ModalSheet>
  );
}
