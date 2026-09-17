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

export function ModalSheet({ title, onClose, children, width = 620, posicao = "auto", subtitulo = null, acao = null }) {
  const sheetRef = useRef(null);
  const { isDesktop } = useDevice();

  // Onde a gaveta nasce no celular.
  //   "auto"  → sobe de baixo (padrão para quem é aberto por um botão do rodapé
  //             ou do meio da tela)
  //   "topo"  → desce do topo, logo abaixo do cabeçalho. É o certo quando o
  //             gatilho vive no TOPO da tela (o filtro de pessoa, o seletor de
  //             mês): sem isso o diálogo nasce longe do dedo e do olho, e a
  //             ação fica no fim de um movimento de tela inteira.
  //   "centro" → centralizado, como no desktop.
  // No desktop os três viram diálogo centralizado.
  const noTopo = !isDesktop && posicao === "topo";
  const centralizado = isDesktop || posicao === "centro";

  const alinhamento = centralizado ? "center" : noTopo ? "flex-start" : "flex-end";
  const raio = centralizado || noTopo ? RADIUS.card : RADIUS.card + "px " + RADIUS.card + "px 0 0";
  const padding = centralizado
    ? "20px 22px 22px"
    : noTopo
      ? "16px 16px 20px"
      : "16px 16px calc(20px + env(safe-area-inset-bottom, 0px))";
  const animacao = centralizado ? "fadeIn 0.16s ease" : noTopo ? "sheetDown 0.22s cubic-bezier(0.22,1,0.36,1)" : "sheetUp 0.22s cubic-bezier(0.22,1,0.36,1)";

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
        alignItems: alinhamento,
        justifyContent: "center",
        padding: isDesktop ? 24 : noTopo ? "calc(env(safe-area-inset-top, 0px) + 12px) 12px 12px" : 0,
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
          maxHeight: isDesktop ? "86dvh" : noTopo ? "82dvh" : "88dvh",
          overflowY: "auto",
          background: COLORS.paper,
          // Cor de texto explícita: o diálogo pode nascer DENTRO do herói (o
          // filtro de pessoa mora lá) e herdava o branco de .herofull — o
          // título "Ver dados de" ficava invisível sobre o papel claro.
          color: COLORS.ink,
          border: "1px solid " + COLORS.line,
          borderRadius: raio,
          padding,
          boxShadow: isDesktop ? "0 18px 48px rgba(27,42,47,0.22)" : noTopo ? "0 12px 30px rgba(27,42,47,0.2)" : "0 -8px 26px rgba(27,42,47,0.16)",
          animation: animacao,
        }}
      >
        {/* Alça visual só na gaveta que sobe de baixo — no topo ela não faz
            sentido, porque não há nada acima para arrastar. */}
        {!isDesktop && !noTopo && (
          <div aria-hidden="true" style={{ width: 40, height: 4, borderRadius: 4, background: COLORS.line, margin: "0 auto 12px" }} />
        )}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: subtitulo ? 10 : 16 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="serif" style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>{title}</p>
            {subtitulo && (
              <p style={{ fontSize: 14, color: COLORS.muted, margin: "3px 0 0", fontWeight: 500 }}>{subtitulo}</p>
            )}
          </div>
          {acao}
          <button onClick={onClose} aria-label="Fechar" className="icon-btn" data-autofocus style={{ background: "none", border: "none", color: COLORS.ink, marginTop: -6, marginRight: -8 }}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default ModalSheet;
