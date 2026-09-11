import React from "react";
import { ROUTES, MAIN_TABS, NAV_GROUPS } from "../../constants/tokens";
import { COLORS, TOUCH } from "../../constants/tokens";

// ============================================================================
// AppShell — a caixa que prendia nav e modais
//
// Antes (App.jsx):
//   <div class="app-shell">            -> 430px no celular, 960px no desktop
//     <div position:absolute inset:0 overflow-y:auto>      <- único scroller
//     <BottomNav position:absolute bottom:0>               <- presa no shell
//     modais position:absolute inset:0                     <- presos no shell
//
// Três problemas que vinham de uma decisão só:
//   1. height:700px fixo + overflow:hidden: em viewport < 700px o topo e a base
//      eram cortados em vez de o app ocupar a tela.
//   2. Tudo em position:absolute relativo ao shell: nada podia escapar da caixa.
//   3. A faixa 431–899px não era tratada.
//
// Agora o shell é um grid declarado no index.css (.app-shell), a rolagem é a do
// documento, e a navegação é escolhida pelo estado do dispositivo:
//   phone/tablet -> AppTabBar (fixa, respeitando safe-area) + FAB
//   desktop      -> AppSidebar (sticky, 100dvh) + AppTopbar
//
// Nenhuma funcionalidade mudou: as mesmas abas, os mesmos itens de "Mais",
// agora vindos de um registro único (ROUTES) em vez de duas listas soltas.
// ============================================================================

const labelStyle = { fontSize: 11.5, fontWeight: 500, lineHeight: 1.1 };

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
          borderRadius: 10, border: "none",
          background: active ? COLORS.greenSoft : "transparent",
          color: active ? COLORS.green : COLORS.fg2,
          fontWeight: active ? 600 : 500, fontSize: 13.5,
        }}
      >
        <Icon size={17} strokeWidth={active ? 2.1 : 1.9} />
        <span>{r.label}</span>
      </button>
    );
  };

  return (
    <nav className="app-sidebar" aria-label="Navegação principal">
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 6px 16px", borderBottom: "1px solid " + COLORS.lineSoft }}>
        <span style={{
          width: 34, height: 34, borderRadius: 10, background: COLORS.green, color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Fraunces', Georgia, serif", fontSize: 17, fontWeight: 600,
        }}>G</span>
        <div style={{ minWidth: 0 }}>
          <p className="serif" style={{ margin: 0, fontSize: 15.5, fontWeight: 600 }}>Gestão Financeira</p>
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
  // Cinco colunas: quatro abas + a ação principal. O FAB central antigo tinha
  // 54px e labels de 9.5px; agora a ação é uma coluna de altura confortável.
  const slots = [MAIN_TABS[0], MAIN_TABS[1], null, MAIN_TABS[2], MAIN_TABS[4]];
  return (
    <nav className="app-tabbar" aria-label="Navegação principal"
      style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", alignItems: "end" }}>
      {slots.map((key) => {
        if (key === null) {
          return (
            <button key="add" onClick={onAdd} aria-label="Novo previsto" data-od-id="tab-add"
              style={{ background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: 4, minHeight: TOUCH.min, color: COLORS.green }}>
              <span style={{
                width: 40, height: 40, borderRadius: "50%", background: COLORS.green, color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 6px 14px rgba(31,93,76,0.35)",
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
              <span style={labelStyle}>Novo</span>
            </button>
          );
        }
        const r = ROUTES[key];
        if (!r) return null; // rota ausente não derruba a navegação inteira
        const Icon = r.icon;
        const active = activeRoute === key;
        return (
          <button key={key} onClick={() => onNavigate(key)} aria-current={active ? "page" : undefined}
            data-od-id={"tab-" + key}
            style={{
              background: "none", border: "none", minHeight: TOUCH.min,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
              color: active ? COLORS.green : COLORS.muted,
            }}>
            <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
            <span style={{ ...labelStyle, fontWeight: active ? 600 : 500 }}>{r.short}</span>
          </button>
        );
      })}
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
      <button className="app-fab" onClick={onAdd} aria-label="Novo previsto" data-od-id="fab-novo-previsto">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  );
}

export default AppShell;
