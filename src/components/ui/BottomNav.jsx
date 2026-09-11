import { AppTabBar } from "../shell/AppShell";

// ============================================================================
// BottomNav — substituída pela AppTabBar
//
// A versão anterior era uma tab bar de celular presa dentro do shell
// (position:absolute bottom:0), com labels de 9.5px e um FAB de 54px que
// empurrava a barra para cima com marginTop negativo. Em telas grandes ela
// continuava sendo a navegação principal do sistema, o que não faz sentido.
//
// A navegação agora vive em src/components/shell/AppShell.jsx:
//   - a lista de abas vem de ROUTES/MAIN_TABS (tokens.js), junto com os itens
//     da barra lateral, para as duas nunca divergirem;
//   - labels em 11.5px, alvos de 44px;
//   - "activeRoute" substitui "tab", então a mesma barra serve para telas que
//     antes só existiam dentro de "Mais" (ex.: Priorização).
//
// Este arquivo permanece como ponte para não quebrar imports existentes.
// Pode ser removido quando nenhum arquivo importar "BottomNav".
// ============================================================================

export function BottomNav({ tab, setTab, onAdd }) {
  return <AppTabBar activeRoute={tab} onNavigate={setTab} onAdd={onAdd} />;
}

export default BottomNav;
