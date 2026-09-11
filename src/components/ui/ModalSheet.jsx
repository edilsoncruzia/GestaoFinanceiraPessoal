import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { COLORS, RADIUS } from "../../constants/tokens";
import { useDevice } from "../../hooks/useDevice";

// ============================================================================
// ModalSheet — a gaveta que ficava gigante e achatada no desktop
//
// Antes: position:absolute dentro do shell, align-items:flex-end e
// border-radius 20px 20px 0 0. Em 960px de largura isso virava uma faixa enorme
// subindo de baixo, e nada podia escapar da caixa do shell.
//
// Agora o mesmo componente tem dois comportamentos, escolhidos pelo estado do
// dispositivo — não por um if espalhado em cada modal:
//   phone/tablet -> bottom sheet, arrastável pela tela, botão de fechar grande
//   desktop      -> diálogo centralizado, largura de leitura (620px), raio nos
//                   quatro cantos, fecha com ESC e com clique no fundo
//
// Também ganhou o que faltava para acessibilidade: foco preso dentro do modal,
// foco inicial no botão de fechar, devolução do foco ao elemento de origem e
// Escape para fechar. Antes o foco ficava solto atrás do backdrop.
// ============================================================================

export function ModalSheet({ title, onClose, children, width = 620 }) {
  const sheetRef = useRef(null);
  const { isDesktop } = useDevice();

  useEffect(() => {
    const opener = document.activeElement;
    const sheet = sheetRef.current;
    if (sheet) {
      const first = sheet.querySelector("[data-autofocus]") || sheet.querySelector("button, [href], input, select, textarea");
      if (first) first.focus();
    }

    function onKeyDown(e) {
      if (e.key === "Escape") { e.stopPropagation(); onClose(); return; }
      if (e.key !== "Tab" || !sheet) return;
      const focusables = sheet.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables.length) return;
      const firstEl = focusables[0];
      const lastEl = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) { e.preventDefault(); lastEl.focus(); }
      else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); firstEl.focus(); }
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (opener && typeof opener.focus === "function") opener.focus();
    };
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="presentation"
      style={{
        position: "fixed", inset: 0, zIndex: 60,
        background: "rgba(27,42,47,0.48)",
        display: "flex",
        alignItems: isDesktop ? "center" : "flex-end",
        justifyContent: "center",
        padding: isDesktop ? 24 : 0,
      }}
    >
      <div
        ref={sheetRef}
        className="modal-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: isDesktop ? width : 560,
          maxHeight: isDesktop ? "86dvh" : "88dvh",
          overflowY: "auto",
          background: COLORS.paper,
          border: "1px solid " + COLORS.line,
          borderRadius: isDesktop ? RADIUS.card : RADIUS.card + "px " + RADIUS.card + "px 0 0",
          padding: isDesktop ? "20px 22px 22px" : "16px 16px calc(20px + env(safe-area-inset-bottom, 0px))",
          boxShadow: isDesktop ? "0 18px 48px rgba(27,42,47,0.22)" : "0 -8px 26px rgba(27,42,47,0.16)",
          animation: isDesktop ? "fadeIn 0.16s ease" : "sheetUp 0.22s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {/* Alça visual só no formato gaveta. */}
        {!isDesktop && (
          <div aria-hidden="true" style={{ width: 40, height: 4, borderRadius: 4, background: COLORS.line, margin: "0 auto 12px" }} />
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <p className="serif" style={{ fontSize: 19, fontWeight: 500, margin: 0, flex: 1 }}>{title}</p>
          <button onClick={onClose} aria-label="Fechar" className="icon-btn" data-autofocus style={{ background: "none", border: "none", color: COLORS.ink }}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default ModalSheet;
