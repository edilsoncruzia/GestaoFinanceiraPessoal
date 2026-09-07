import React from 'react';
import { COLORS } from '../../constants/tokens';
import { ModalSheet } from '../ui/ModalSheet';

export function AccountScopeModal({ account, action, onConfirm, onClose }) {
  const isDelete = action === "delete";
  const title = isDelete ? ("Excluir " + account.name + "?") : ("Aplicar edição em " + account.name + "?");

  const opts = isDelete
    ? [
        { scope: "all", label: "Excluir tudo (conta + lançamentos)", desc: "Apaga a conta e todos os lançamentos vinculados a ela.", color: COLORS.rust },
        { scope: "future", label: "Manter lançamentos", desc: "Apaga só a conta; os lançamentos já feitos permanecem (ficam sem conta).", color: COLORS.green },
      ]
    : [
        { scope: "all", label: "Todos os lançamentos", desc: "A alteração vale para todos os registros já lançados.", color: COLORS.green },
        { scope: "future", label: "Somente futuros", desc: "Mantém o histórico como está e aplica a alteração daqui em diante.", color: COLORS.ink },
      ];

  return (
    <ModalSheet title={title} onClose={onClose}>
      <p style={{ fontSize: 13, color: COLORS.muted, margin: "0 0 14px" }}>Como você quer aplicar esta alteração?</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
        {opts.map((o) => (
          <button key={o.scope} onClick={() => onConfirm(o.scope)} style={{ textAlign: "left", padding: "12px 14px", borderRadius: 12, border: "1px solid " + COLORS.line, background: COLORS.card, cursor: "pointer" }}>
            <span style={{ display: "block", fontSize: 14, fontWeight: 500, color: o.color }}>{o.label}</span>
            <span style={{ display: "block", fontSize: 12, color: COLORS.muted, marginTop: 3 }}>{o.desc}</span>
          </button>
        ))}
      </div>
      <button onClick={onClose} style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "1px solid " + COLORS.line, background: "transparent", color: COLORS.muted, fontSize: 14 }}>Cancelar</button>
    </ModalSheet>
  );
}
