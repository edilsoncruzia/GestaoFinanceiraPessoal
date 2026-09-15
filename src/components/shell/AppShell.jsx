import React from "react";
import { Plus } from "lucide-react";
import { ROUTES, MAIN_TABS, NAV_GROUPS } from "../../constants/tokens";
import { COLORS, TOUCH, RADIUS, SHADOW } from "../../constants/tokens";

// ============================================================================
// AppShell — a caixa que prendia nav e modais
//
// Antes (App.jsx):
//   <div class="app-shell">            -> 430px no celular, 960px no desktop
//     <div position:absolute inset:0 overflow-y:auto>      <- único scroller
//     <BottomNav position:absolute bottom:0>               <- presa no shell
//     modais position:absolute inset:0                     <- presos no shell
//
// Agora o shell é um grid declarado no index.css (.app-shell), a rolagem é a do
// documento, e a navegação é escolhida pelo estado do dispositivo:
//   phone/tablet -> AppTabBar (pílula flutuante, ação central) 
//   desktop      -> AppSidebar (sticky, 100dvh) + AppTopbar
//
// v3 — o que mudou nesta rodada: a barra inferior virou a pílula flutuante do
// modelo aprovado, com a ação principal no meio (onde o polegar chega) e um
// recorte na máscara em volta dela. O FAB solto no canto inferior direito
// deixou de existir: duas ações primárias na mesma tela era uma a mais.
//
// Nenhuma funcionalidade mudou: as mesmas abas, os mesmos itens de "Mais",
// vindos do registro único (ROUTES) em vez de duas listas soltas.
// ============================================================================

const labelStyle = { fontSize: 11, fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.01em" };
const itemLabelStyle = { fontSize: 13.5, lineHeight: 1.2 };

export function AppSidebar({ activeRoute, onNavigate, userName }) {
  const Item = ({ routeKey }) => {
    const r = ROUTES[routeKey];
    if (!r) return null;
    const Icon = r.icon;
    const active = activeRoute === routeKey;
    return (
      <button
        onClick={() => onNavigate(routeKey)}
        aria-current={active ? "page" : undefined}
        data-od-id={"nav-" + routeKey}
        style={{
          display: "flex", alignItems: "center", gap: 10, width: "100%",
          minHeight: TOUCH.min, padding: "0 10px", textAlign: "left",
          borderRadius: RADIUS.control, border: "none",
          background: active ? COLORS.accentSoft : "transparent",
          color: active ? COLORS.accent : COLORS.fg2,
          fontFamily: "var(--font-body)",
          fontWeight: active ? 600 : 500,
          ...itemLabelStyle,
        }}
      >
        <Icon size={17} strokeWidth={active ? 2.1 : 1.9} />
        <span>{r.label}</span>
      </button>
    );
  };

  return (
    <nav className="app-sidebar" aria-label="Navegação principal">
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 6px 16px", borderBottom: "1px solid " + COLORS.borderSoft }}>
        <span style={{
          width: 34, height: 34, borderRadius: 11, color: "#fff",
          background: "linear-gradient(135deg," + COLORS.accentBright + "," + COLORS.accentDeep + ")",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 800,
          boxShadow: "0 4px 12px -3px rgba(109,40,217,.5)",
        }}>G</span>
        <div style={{ minWidth: 0 }}>
          <p className="serif" style={{ margin: 0, fontSize: 15.5, fontWeight: 800 }}>Finanças</p>
          <span style={{ fontSize: 11.5, color: COLORS.muted }}>{userName || "uso pessoal e do casal"}</span>
        </div>
      </div>

      {NAV_GROUPS.map((group) => {
        const items = Object.keys(ROUTES).filter((k) => ROUTES[k].group === group);
        if (!items.length) return null;
        return (
          <div key={group} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <h2 className="eyebrow" style={{ margin: "0 0 6px 10px" }}>{group}</h2>
            {items.map((k) => <Item key={k} routeKey={k} />)}
          </div>
        );
      })}
    </nav>
  );
}

export function AppTabBar({ activeRoute, onNavigate, onAdd }) {
  // Quatro abas + o vão da ação central. O vão existe como trilha do grid (e
  // não como padding) para que o rótulo de "Transações" nunca encoste no botão.
  const slots = [MAIN_TABS[0], MAIN_TABS[1], null, MAIN_TABS[2], MAIN_TABS[4]];
  return (
    <nav className="app-tabbar" aria-label="Navegação principal">
      <span className="app-tabbar-bg" aria-hidden="true" />
      {slots.map((key, i) => {
        const col = i < 2 ? i + 1 : i + 2; // pula a trilha do botão central
        if (key === null) return null;
        const r = ROUTES[key];
        const Icon = r.icon;
        const active = activeRoute === key;
        return (
          <button
            key={key}
            onClick={() => onNavigate(key)}
            aria-current={active ? "page" : undefined}
            data-od-id={"tab-" + key}
            style={{ gridColumn: col }}
          >
            <Icon size={22} strokeWidth={active ? 2.4 : 1.9} />
            <span style={labelStyle}>{r.short}</span>
          </button>
        );
      })}
      <button
        className="tab-fab"
        onClick={onAdd}
        aria-label="Novo lançamento"
        data-od-id="tab-add"
      >
        <Plus size={26} strokeWidth={2.3} aria-hidden="true" />
      </button>
    </nav>
  );
}

export function AppTopbar({ children }) {
  // Contexto global (mês + pessoa) e ação primária. No celular esse contexto fica
  // dentro de cada tela; no desktop ele é permanente e não compete com o conteúdo.
  return <header className="app-topbar">{children}</header>;
}

export function AppShell({ activeRoute, onNavigate, onAdd, topbar, userName, children }) {
  return (
    <div className="app-shell">
      <AppSidebar activeRoute={activeRoute} onNavigate={onNavigate} userName={userName} />
      <AppTopbar>{topbar}</AppTopbar>
      <div className="app-main">
        <div key={activeRoute} className="tab-content">
          {children}
        </div>
      </div>
      <AppTabBar activeRoute={activeRoute} onNavigate={onNavigate} onAdd={onAdd} />
    </div>
  );
}

export default AppShell;