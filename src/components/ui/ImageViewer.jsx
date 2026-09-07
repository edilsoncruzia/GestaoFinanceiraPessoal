import React from 'react';
import { X } from 'lucide-react';

export function ImageViewer({ src, onClose }) {
  if (!src) return null;
  return (
    <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(20,26,28,0.92)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out" }}>
      <button onClick={onClose} aria-label="Fechar imagem" style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 61 }}>
        <X size={18} />
      </button>
      <img src={src} alt="Comprovante" style={{ maxWidth: "90%", maxHeight: "90%", borderRadius: 10, objectFit: "contain" }} onClick={(e) => e.stopPropagation()} />
    </div>
  );
}
