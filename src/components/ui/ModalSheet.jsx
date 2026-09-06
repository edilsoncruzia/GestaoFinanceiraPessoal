import React from 'react';
import { X } from 'lucide-react';
import { COLORS } from '../../constants/tokens';

export function ModalSheet({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" style={{ position: "absolute", inset: 0, background: "rgba(27,42,47,0.45)", display: "flex", alignItems: "flex-end", zIndex: 10 }}>
      <div className="modal-sheet" style={{ width: "100%", background: COLORS.paper, borderRadius: "20px 20px 0 0", padding: "18px 18px 24px", maxHeight: "88%", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <p className="serif" style={{ fontSize: 18, fontWeight: 500, margin: 0 }}>{title}</p>
          <button onClick={onClose} aria-label="Fechar" className="icon-btn" style={{ background: "none", border: "none", color: COLORS.ink }}><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
