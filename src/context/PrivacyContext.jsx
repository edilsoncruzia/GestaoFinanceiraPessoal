import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { fmt, definirValoresOcultos, MASCARA_VALOR } from "../utils/formatters";

// ============================================================================
// PrivacyContext — o "olho" que esconde TODOS os valores do app
//
// Antes: `hideBalance` era um estado do App usado só no herói da Início. O
// Orçamento, as Transações, as Metas e os modais continuavam mostrando tudo —
// o botão mentia.
//
// Agora existe um estado só, no topo da árvore, e duas formas de consumir:
//
//   · `usePrivacy()` → { oculto, mascarar, alternar, definir }
//     para quem precisa do valor booleano (aria-pressed, rótulo do botão);
//
//   · `fmt()` de utils/formatters → já respeita o modo sozinho, em qualquer
//     arquivo, sem precisar de prop nem de contexto. O provider sincroniza a
//     variável de módulo ANTES de renderizar os filhos (inicializador do
//     useState), então o primeiro paint já sai mascarado.
//
// O padrão é OCULTO (true): quem abre o app num lugar público não expõe os
// números por descuido. A preferência fica no LocalStorage.
//
// `mascarar(v, alternativa)` é para o que não é dinheiro formatado por fmt():
// gráficos que recebem número cru, rótulos de eixo, valores em textos montados
// à mão. Sem alternativa, devolve a máscara completa.
// ============================================================================

const CHAVE = "gf_ocultar_valores";

function lerPreferencia() {
  try {
    const v = localStorage.getItem(CHAVE);
    // Só o "0" explícito revela; qualquer outra coisa (inclusive ausência)
    // mantém oculto. É o padrão seguro.
    return v === "0" ? false : true;
  } catch (e) {
    return true;
  }
}

const PrivacyContext = createContext({
  oculto: true,
  mascarar: () => MASCARA_VALOR,
  definir: () => {},
  alternar: () => {},
});

export function PrivacyProvider({ children }) {
  const [oculto, setOculto] = useState(() => {
    const inicial = lerPreferencia();
    // Sincroniza a variável de módulo JÁ no primeiro render: os filhos são
    // renderizados depois deste componente, então nenhum valor escapa.
    definirValoresOcultos(inicial);
    return inicial;
  });

  useEffect(() => {
    definirValoresOcultos(oculto);
    try { localStorage.setItem(CHAVE, oculto ? "1" : "0"); } catch (e) { /* modo privado */ }
  }, [oculto]);

  const mascarar = useCallback(
    (v, alternativa) => (oculto ? (alternativa === undefined ? MASCARA_VALOR : alternativa) : fmt(v)),
    [oculto]
  );

  const definir = useCallback((v) => setOculto(Boolean(v)), []);
  const alternar = useCallback(() => setOculto((v) => !v), []);

  return (
    <PrivacyContext.Provider value={{ oculto, mascarar, definir, alternar }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  return useContext(PrivacyContext);
}

export default PrivacyContext;
