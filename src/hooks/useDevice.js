import { useEffect, useState } from "react";

// ============================================================================
// useDevice — a peça que faltava
//
// Antes existia UM breakpoint (@media min-width:900px) e NENHUM matchMedia no
// código. Resultado: a faixa de 431px a 899px recebia o shell de 430px flutuando
// num fundo vazio, e o desktop só esticava a mesma coluna.
//
// Agora o JS sabe em qual dos três estados está — não para duplicar o CSS, mas
// para decidir o que só faz sentido em um deles: modal centralizado x bottom
// sheet, popover x tela cheia, barra lateral x barra inferior.
//
// 560px  → deixa de ser um celular apertado (alvo de toque já é 44px)
// 980px  → cabe navegação lateral sem espremer o conteúdo
// ============================================================================

export const BREAKPOINTS = { tablet: 560, desktop: 980 };

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    setMatches(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

export function useDevice() {
  const isTabletUp = useMediaQuery(`(min-width: ${BREAKPOINTS.tablet}px)`);
  const isDesktop = useMediaQuery(`(min-width: ${BREAKPOINTS.desktop}px)`);

  return {
    isPhone: !isTabletUp,
    isTablet: isTabletUp && !isDesktop,
    isDesktop,
    /** Nome do estado atual — útil para telemetria e para testar regras. */
    device: isDesktop ? "desktop" : isTabletUp ? "tablet" : "phone",
    /** Largura real da janela, para gráficos que precisam de mais pontos. */
    width: typeof window !== "undefined" ? window.innerWidth : 1024,
  };
}

export default useDevice;
