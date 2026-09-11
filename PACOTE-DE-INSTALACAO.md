# Pacote de instalação — Gestão Financeira Pessoal

Cada bloco abaixo é um arquivo. Copie o conteúdo integral e salve no caminho
indicado. Depois aplique o patch do `App.jsx` (`aplicar-no-app.md`, passo 3).

Ordem recomendada: os 4 primeiros são seguros (1 é atualização, 3 são novos).
O `InicioView.jsx` é o maior e o que muda a tela — deixe para o fim, depois de
confirmar que o app abre com o shell novo.

| # | Arquivo | Ação |
|---|---|---|
| 1 | `src/index.css` | substituir |
| 2 | `src/hooks/useDevice.js` | criar (nova pasta) |
| 3 | `src/components/shell/AppShell.jsx` | criar (nova pasta) |
| 4 | `src/components/ui/ModalSheet.jsx` | substituir |
| 5 | `src/components/ui/MonthNav.jsx` | substituir |
| 6 | `src/components/ui/BottomNav.jsx` | substituir (ponte) |
| 7 | `src/constants/tokens.js` | substituir |
| 8 | `src/components/views/InicioView.jsx` | substituir |
| 9 | `src/App.jsx` | **editar** (3 pontos — ver `aplicar-no-app.md`) |

---

## 1. `src/index.css`

```css
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap');

/* ============================================================================
   FONTE DOS TOKENS: src/constants/tokens.js
   Os valores abaixo são o espelho em CSS do objeto COLORS. Se mudar um tema,
   mude lá e reflita aqui — os dois nomes são os mesmos de propósito.
   ========================================================================== */
:root {
  --color-ink: #1B2A2F;
  --color-paper: #F1EDDF;
  --color-card: #FBF9F1;
  --color-card-sunken: #F7F3E6;
  --color-card-raised: #EDE7D5;

  --color-fg2: #4A5559;
  --color-muted: #6E6A5C;

  --color-line: #D9D1B8;
  --color-line-soft: #E1DAC4;

  --color-green: #1F5D4C;
  --color-green-light: #3B8F6E;
  --color-green-soft: #E6EDE9;

  --color-amber: #8A5A1F;
  --color-rust: #A6432F;
  --color-info: #2E6B72;

  /* Geometria */
  --radius-card: 14px;
  --radius-control: 10px;

  /* Elevação — sussurro por padrão, nunca decoração */
  --shadow-card: 0 1px 2px rgba(27, 42, 47, 0.04);
  --shadow-raised: 0 10px 28px rgba(27, 42, 47, 0.14);

  /* Estrutura do shell — um só lugar define as alturas que a navegação usa */
  --topbar-height: 64px;
  --tabbar-height: 64px;
  --sidebar-width: 264px;
}

* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
  font-variant-numeric: tabular-nums;
}

html, body {
  margin: 0;
  padding: 0;
  /* 100dvh resolve a barra do navegador móvel; 100% é o fallback. */
  height: 100%;
}

body {
  background-color: var(--color-card-raised);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: var(--color-ink);
  font-size: 13.5px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  /* O body NÃO centraliza mais nem tem altura fixa: quem manda no tamanho é o
     shell. Era isso que cortava o topo/base em telas com menos de 700px. */
}

#root {
  height: 100%;
  min-height: 100dvh;
  /* Paisagem no celular: o app ocupa a tela toda, com rolagem vertical normal. */
  overflow-x: hidden;
}

.serif { font-family: 'Fraunces', Georgia, serif; }

button { font-family: inherit; cursor: pointer; color: inherit; }
input, select, textarea { font-family: inherit; }

button, .tx-card {
  transition: transform 0.12s ease, background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}
button:active { transform: scale(0.97); }
.fab-btn:active { transform: scale(0.92); }

/* Alvo de toque: 44px reais, sem margem negativa que roubava o alvo. */
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-control);
  flex-shrink: 0;
}
.icon-btn:active { background: rgba(27, 42, 47, 0.06); }

input:focus-visible, select:focus-visible, textarea:focus-visible, button:focus-visible, a:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-card), 0 0 0 4px var(--color-green);
}

/* ── Animações ────────────────────────────────────────────────────────────── */
@keyframes backdropIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes sheetUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

.modal-backdrop { animation: backdropIn 0.18s ease; }
.tab-content { animation: fadeIn 0.16s ease; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}

/* ============================================================================
   SHELL — mobile-first, três estados
   mobile  : < 560px    coluna única, barra inferior, FAB
   tablet  : 560–979px  duas colunas, barra inferior, FAB
   desktop : >= 980px   barra lateral fixa, topbar, sem barra inferior
   ========================================================================== */

.app-shell {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--color-paper);
  color: var(--color-ink);
  position: relative;
  width: 100%;
  min-height: 100dvh;
  padding-bottom: calc(var(--tabbar-height) + env(safe-area-inset-bottom, 0px));
}

/* Área rolável: agora é o documento inteiro, não uma caixa de altura fixa. */
.app-scroll {
  min-height: 100dvh;
}

.app-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

/* Faixa de cabeçalho dentro do conteúdo (ações contextuais da tela) */
.screen-head {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.screen-title {
  margin: 0;
  font-family: 'Fraunces', Georgia, serif;
  font-size: 21px;
  font-weight: 500;
  letter-spacing: -0.01em;
}

.eyebrow {
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-muted);
  margin: 0;
}

/* Conteúdo da aba: largura de leitura confortável no celular, sem teto de 720px
   espremido no meio de uma tela de 1600px (isso agora é papel do grid). */
.tab-content {
  padding: 16px 16px 32px;
  min-width: 0;
}

/* Visibilidade por dispositivo — evita duplicar estado. O MESMO componente de
   contexto (mês, pessoa) é montado no topo da tela no celular e na topbar no
   desktop; o que muda é só onde ele aparece. */
.only-phone { display: block; }
.only-desktop { display: none; }

/* ============================================================================
   NAVEGAÇÃO LATERAL (desktop)
   ========================================================================== */
.app-sidebar { display: none; }

/* ============================================================================
   TOPBAR (desktop): contexto global — mês e pessoa — em um só lugar
   ========================================================================== */
.app-topbar { display: none; }

/* ============================================================================
   BARRA INFERIOR (mobile e tablet)
   ========================================================================== */
.app-tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40;
  background: var(--color-card);
  border-top: 1px solid var(--color-line);
  padding: 6px 4px calc(6px + env(safe-area-inset-bottom, 0px));
}

.app-fab {
  position: fixed;
  right: 16px;
  bottom: calc(var(--tabbar-height) + 16px + env(safe-area-inset-bottom, 0px));
  z-index: 41;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: var(--color-green);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 18px rgba(31, 93, 76, 0.4);
}
.app-fab:hover { background: #1A5041; }

/* ============================================================================
   TABLET — 560px+
   ========================================================================== */
@media (min-width: 560px) {
  .tab-content { padding: 20px 24px 40px; }
  /* Grades de apoio passam a duas colunas antes de virar layout de desktop. */
  .grid-auto { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; align-items: start; }
}

/* ============================================================================
   DESKTOP — 980px+
   ========================================================================== */
@media (min-width: 980px) {
  .app-shell {
    display: grid;
    grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
    grid-template-rows: var(--topbar-height) minmax(0, 1fr);
    grid-template-areas:
      "sidebar topbar"
      "sidebar content";
    min-height: 100dvh;
    padding-bottom: 0;
  }

  .app-sidebar {
    grid-area: sidebar;
    display: flex;
    flex-direction: column;
    gap: 22px;
    position: sticky;
    top: 0;
    height: 100dvh;
    overflow-y: auto;
    background: var(--color-card);
    border-right: 1px solid var(--color-line);
    padding: 20px 14px;
  }

  .app-topbar {
    grid-area: topbar;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    position: sticky;
    top: 0;
    z-index: 30;
    background: rgba(251, 249, 241, 0.92);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid var(--color-line-soft);
    padding: 10px 32px;
  }

  .app-main {
    grid-area: content;
    min-width: 0;
  }

  .tab-content {
    padding: 24px 32px 48px;
    max-width: 1320px; /* teto de conforto; o grid é que organiza o resto */
  }

  /* Duas colunas: coluna de decisão + coluna de apoio. */
  .grid-auto {
    display: grid;
    grid-template-columns: minmax(0, 1.6fr) minmax(320px, 1fr);
    gap: 20px;
    align-items: start;
    max-width: none;
  }

  .app-tabbar, .app-fab { display: none; }

  .only-phone { display: none; }
  .only-desktop { display: block; }
}

/* Telas muito largas: três colunas de cartões de apoio. */
@media (min-width: 1440px) {
  .tab-content { max-width: 1480px; }
  .grid-auto { grid-template-columns: minmax(0, 1.7fr) minmax(340px, 1fr); gap: 24px; }
}
```

---

## 2. `src/hooks/useDevice.js` (nova pasta)

```jsx
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
```

---

## 3. `src/components/shell/AppShell.jsx` (nova pasta)

```jsx
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
```

---

## 4. `src/components/ui/ModalSheet.jsx`

```jsx
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
```

---

## 5. `src/components/ui/MonthNav.jsx`

```jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { COLORS, TOUCH } from '../../constants/tokens';
import { TODAY_MONTH } from '../../constants/seedData';
import { addMonths, monthDiff, monthLabelFull } from '../../utils/formatters';
import { useDevice } from '../../hooks/useDevice';
import { ModalSheet } from './ModalSheet';

// ============================================================================
// MonthNav — o seletor de contexto do app inteiro
//
// Mudanças desta rodada:
//  1. Alvos de toque de 36px -> 44px. Em um app usado no ônibus, 36px erra o
//     toque, e as duas setas são o controle mais usado da tela.
//  2. O dropdown usava el.scrollIntoView, que rola o container errado em
//     preview embutido. Trocado por scrollTop calculado — comportamento
//     idêntico (centraliza no mês atual ao abrir) sem o efeito colateral.
//  3. No desktop a lista vira um popover ancorado; no celular continua sendo
//     a gaveta, que é o padrão certo para a mão.
//  4. O estado do mês ("mês atual" / "mês projetado") estava em 11px solto
//     embaixo do título; agora é um selo com cor + texto.
// ============================================================================

const arrowStyle = {
  width: TOUCH.min,
  height: TOUCH.min,
  borderRadius: 10,
  border: "1px solid " + COLORS.line,
  background: COLORS.card,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: COLORS.ink,
  flexShrink: 0,
};

export function MonthNav({ month, onChange, compact }) {
  const [open, setOpen] = useState(false);
  const listRef = useRef(null);
  const { isDesktop } = useDevice();
  const isFuture = monthDiff(TODAY_MONTH, month) > 0;

  // Lista deslizável de meses (24 para trás, 60 para frente) — sempre mês/ano.
  const months = useMemo(() => Array.from({ length: 85 }, (_, i) => addMonths(TODAY_MONTH, i - 24)), []);

  // Centraliza a lista no MÊS ATUAL (não no selecionado) ao abrir — sem
  // scrollIntoView, para não arrastar a página junto.
  useEffect(() => {
    if (!open || !listRef.current) return;
    const list = listRef.current;
    const el = list.querySelector('[data-month="' + TODAY_MONTH + '"]');
    if (!el) return;
    list.scrollTop = el.offsetTop - list.clientHeight / 2 + el.clientHeight / 2;
  }, [open]);

  function pick(m) {
    onChange(m);
    setOpen(false);
  }

  const status = month === TODAY_MONTH
    ? { label: "mês atual", color: COLORS.muted, bg: COLORS.cardRaised }
    : isFuture
      ? { label: "mês projetado", color: COLORS.amber, bg: COLORS.amber + "1A" }
      : { label: "mês encerrado", color: COLORS.muted, bg: COLORS.cardRaised };

  const listContent = (
    <>
      <p style={{ fontSize: 12, color: COLORS.muted, margin: "0 0 10px" }}>Escolha o mês/ano que será o contexto de todas as telas.</p>
      <div ref={listRef} style={{ maxHeight: 340, overflowY: "auto", overflowX: "hidden", paddingRight: 4 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {months.map((m) => {
            const active = m === month;
            const isToday = m === TODAY_MONTH;
            return (
              <button
                key={m}
                data-month={m}
                onClick={() => pick(m)}
                aria-current={active ? "true" : undefined}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  width: "100%", minHeight: TOUCH.min, padding: "10px 14px", borderRadius: 10,
                  border: "1px solid " + (active ? COLORS.green : COLORS.line),
                  background: active ? COLORS.green : COLORS.card,
                  color: active ? "#fff" : COLORS.ink,
                  fontSize: 14, fontWeight: active ? 600 : 400, textTransform: "capitalize",
                }}
              >
                <span>{monthLabelFull(m)}</span>
                {isToday && (
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20,
                    background: active ? "rgba(255,255,255,0.22)" : COLORS.green + "1A",
                    color: active ? "#fff" : COLORS.green,
                  }}>atual</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
      <button onClick={() => onChange(addMonths(month, -1))} aria-label="Mês anterior" data-od-id="mes-anterior" style={arrowStyle}>
        <ChevronLeft size={17} />
      </button>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Selecionar mês"
        aria-haspopup="dialog"
        aria-expanded={open}
        data-od-id="seletor-de-mes"
        style={{
          display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2,
          minHeight: TOUCH.min, padding: "4px 12px", borderRadius: 10,
          background: "none", border: "none", textAlign: "left",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span className="serif" style={{ fontSize: 17, fontWeight: 500, textTransform: "capitalize", color: COLORS.ink }}>
            {monthLabelFull(month)}
          </span>
          <ChevronDown size={14} color={COLORS.muted} />
        </span>
        <span style={{
          fontSize: 11.5, fontWeight: 600, padding: "1px 8px", borderRadius: 20,
          background: status.bg, color: status.color,
        }}>{status.label}</span>
      </button>

      <button onClick={() => onChange(addMonths(month, 1))} aria-label="Próximo mês" data-od-id="proximo-mes" style={arrowStyle}>
        <ChevronRight size={17} />
      </button>

      {/* Desktop: popover ancorado, sem escurecer a tela inteira. */}
      {open && isDesktop && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 55 }} aria-hidden="true" />
          <div
            role="dialog"
            aria-label="Selecionar mês"
            style={{
              position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 56, width: 320,
              background: COLORS.card, border: "1px solid " + COLORS.line, borderRadius: 14,
              boxShadow: "0 18px 48px rgba(27,42,47,0.22)", padding: 14,
            }}
          >
            {listContent}
          </div>
        </>
      )}

      {/* Celular e tablet: gaveta. */}
      {open && !isDesktop && (
        <ModalSheet title="Selecionar mês" onClose={() => setOpen(false)}>{listContent}</ModalSheet>
      )}
    </div>
  );
}

export default MonthNav;
```

---

## 6. `src/components/ui/BottomNav.jsx`

```jsx
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
//   - `activeRoute` substitui `tab`, então a mesma barra serve para telas que
//     antes só existiam dentro de "Mais" (ex.: Priorização).
//
// Este arquivo permanece como ponte para não quebrar imports existentes.
// Pode ser removido quando nenhum arquivo importar `BottomNav`.
// ============================================================================

export function BottomNav({ tab, setTab, onAdd }) {
  return <AppTabBar activeRoute={tab} onNavigate={setTab} onAdd={onAdd} />;
}

export default BottomNav;
```

---

## 7. `src/constants/tokens.js`

Substitui o arquivo inteiro. Os **nomes** antigos (`COLORS.green`, `COLORS.card`,
`COLORS.muted`…) foram mantidos de propósito: há 270 usos deles em 25 arquivos.

```jsx
// ============================================================================
// TOKENS — fonte única de verdade visual
//
// Antes: COLORS (aqui) repetia os --color-* de src/index.css em dois lugares.
// Agora: os nomes são os MESMOS nos dois arquivos, e o index.css traz um
// comentário apontando para cá. Mudar um tema deixou de ter dois lugares:
// este arquivo é a fonte; o CSS apenas espelha os valores em custom properties.
//
// Nenhum nome existente mudou de significado — só foram adicionados tokens que
// o produto já usava como hex solto (#3B6E8F, #B0762F, #F7F3E6, #EDE7D5).
// ============================================================================

import {
  Home, FileText, ShoppingCart, Car, PartyPopper, HeartPulse,
  BookOpen, Repeat, MoreHorizontal, PiggyBank, Wallet, Briefcase, TrendingUp,
  ListChecks, PieChart, LayoutGrid, Layers, Target,
  Landmark, Tag, Users, Receipt, FileJson, Lightbulb,
} from "lucide-react";

export const COLORS = {
  // Superfícies
  ink: "#1B2A2F",
  paper: "#F1EDDF",
  card: "#FBF9F1",
  cardSunken: "#F7F3E6",   // poço, trilha de progresso, cabeçalho de lista
  cardRaised: "#EDE7D5",   // hover de superfície e divisória preenchida

  // Texto
  fg2: "#4A5559",          // corpo secundário (antes tudo caía em `muted`)
  muted: "#6E6A5C",

  // Linhas
  line: "#D9D1B8",
  lineSoft: "#E1DAC4",     // separador interno — era `line` em todo lugar

  // Acento único
  green: "#1F5D4C",
  greenLight: "#3B8F6E",
  greenSoft: "#E6EDE9",

  // Estados
  amber: "#8A5A1F",
  rust: "#A6432F",
  info: "#2E6B72",         // projeção, transferência, informação sem urgência
};

// Geometria compartilhada: o CSS usa exatamente estes números.
export const RADIUS = { card: 14, control: 10, sheet: 14 };
export const TOUCH = { min: 44, control: 36 };

// ── Registro único de rotas ───────────────────────────────────────────────
// Antes: BottomNav.jsx listava 5 abas e MaisMenuView.jsx listava 12 itens, sem
// relação declarada entre as duas listas. Agora uma lista só alimenta a barra
// inferior (mobile) e a barra lateral (desktop). `short` existe porque a barra
// inferior tem 5 colunas estreitas; `group` só é usado no desktop.

export const ROUTES = {
  inicio:      { label: "Início",                     short: "Início",       icon: Home,        group: "Painel" },
  transacoes:  { label: "Transações",                 short: "Transações",   icon: ListChecks,  group: "Painel" },
  orcamento:   { label: "Orçamento",                  short: "Orçamento",    icon: PieChart,    group: "Painel" },
  priorizacao: { label: "Priorização de contas",      short: "Prioridades",  icon: Layers,      group: "Painel" },
  contas:      { label: "Contas e cartões",           short: "Contas",       icon: Landmark,    group: "Organizar" },
  reserva:     { label: "Reserva mínima",             short: "Reserva",      icon: PiggyBank,   group: "Organizar" },
  categorias:  { label: "Categorias",                 short: "Categorias",   icon: Tag,         group: "Organizar" },
  fontes:      { label: "Fontes (quem recebe/paga)",  short: "Fontes",       icon: Users,       group: "Organizar" },
  projecao:    { label: "Projeção de meses futuros",  short: "Projeção",     icon: TrendingUp,  group: "Planejar" },
  regra:       { label: "Regra 50/30/20",             short: "Regra 50/30/20", icon: LayoutGrid, group: "Planejar" },
  metas:       { label: "Metas",                      short: "Metas",        icon: Target,      group: "Planejar" },
  relatorios:  { label: "Relatórios",                 short: "Relatórios",   icon: PieChart,    group: "Analisar" },
  declaracao:  { label: "Declaração de IR",           short: "IR",           icon: Receipt,     group: "Analisar" },
  dados:       { label: "Exportar / importar dados",  short: "Dados",        icon: FileJson,    group: "Manter" },
  ajustes:     { label: "Ajustes e Melhorias",        short: "Ajustes",      icon: Lightbulb,   group: "Manter" },
};

// Abas principais do celular — a ordem define a barra inferior.
export const MAIN_TABS = ["inicio", "transacoes", "orcamento", "priorizacao", "mais"];

// Ordem dos grupos na barra lateral do desktop.
export const NAV_GROUPS = ["Painel", "Organizar", "Planejar", "Analisar", "Manter"];

export const CATEGORIES = {
  moradia:      { label: "Aluguel",        color: "#1F5D4C", icon: Home,            type: "expense" },
  contas:       { label: "Contas",         color: "#2E6B72", icon: FileText,        type: "expense" },
  alimentacao:  { label: "Alimentação",    color: "#B0762F", icon: ShoppingCart,    type: "expense" },
  transporte:   { label: "Transporte",     color: "#3B6E8F", icon: Car,             type: "expense" },
  lazer:        { label: "Lazer",          color: "#8A5B7A", icon: PartyPopper,     type: "expense" },
  saude:        { label: "Saúde",          color: "#A6432F", icon: HeartPulse,      type: "expense" },
  educacao:     { label: "Educação",       color: "#5C7A3F", icon: BookOpen,        type: "expense" },
  assinaturas:  { label: "Assinaturas",    color: "#6B6558", icon: Repeat,          type: "expense" },
  outros:       { label: "Outros",         color: "#9C8F6B", icon: MoreHorizontal,  type: "expense" },
  poupanca:     { label: "Poupança/Meta",  color: "#2E6B72", icon: PiggyBank,       type: "expense" },
  salario:      { label: "Salário",        color: "#1F5D4C", icon: Wallet,          type: "income"  },
  freelance:    { label: "Freelance",      color: "#3B8F6E", icon: Briefcase,       type: "income"  },
  investimentos:{ label: "Investimentos",  color: "#2E6B72", icon: TrendingUp,      type: "income"  },
  // Receita criada automaticamente ao fechar o mês: a sobra da Reserva Mínima
  // entra no mês seguinte como receita.
  reserva:      { label: "Reserva mínima", color: "#8A5A1F", icon: PiggyBank,       type: "income"  },
};

// Paleta de cores para novas categorias (gerenciamento + criação inline)
export const CATEGORY_PALETTE = [
  "#1F5D4C", "#3B8F6E", "#2E6B72", "#3B6E8F", "#8A5B7A",
  "#B0762F", "#8A5A1F", "#A6432F", "#5C7A3F", "#6B6558",
];

// Versão "só dados" das categorias padrão (sem componentes de ícone) para seed/persistência
export const DEFAULT_CATEGORY_ROWS = Object.entries(CATEGORIES).map(([key, c]) => ({
  key,
  label: c.label,
  color: c.color,
  type: c.type,
}));

// Reconstrói o objeto de categorias em memória a partir de linhas persistidas,
// recuperando o ícone dos built-ins pela chave (categorias custom ficam sem ícone -> fallback).
export function buildCategoriesObject(rows) {
  const out = {};
  (rows || []).forEach((r) => {
    const builtIn = CATEGORIES[r.key];
    out[r.key] = { label: r.label, color: r.color, type: r.type, icon: builtIn ? builtIn.icon : undefined };
  });
  return out;
}

// Serializa o objeto de categorias em linhas persistíveis (sem componentes de ícone).
export function categoriesToRows(obj) {
  return Object.entries(obj || {}).map(([key, c]) => ({ key, label: c.label, color: c.color, type: c.type }));
}

export const NECESSIDADES = ["moradia", "contas", "alimentacao", "transporte", "saude", "educacao"];
export const DESEJOS = ["lazer", "assinaturas", "outros"];

export const PRIORITY = {
  essencial:  { label: "Essencial",  rank: 0, color: "#A6432F" },
  importante: { label: "Importante", rank: 1, color: "#8A5A1F" },
  flexivel:   { label: "Flexível",   rank: 2, color: "#6B6558" },
};

export const DEFAULT_PRIORITY = {
  moradia: "essencial",
  contas: "essencial",
  saude: "essencial",
  alimentacao: "importante",
  transporte: "importante",
  educacao: "importante",
  assinaturas: "flexivel",
  lazer: "flexivel",
  outros: "flexivel",
  poupanca: "flexivel"
};
```

---

## 8. `src/components/views/InicioView.jsx`

**Este é o único arquivo em que vale conferir antes de salvar.** Ele foi
comparado com a sua versão em disco nesta rodada: mesmo tamanho de estrutura,
mesmas props, nada de novo para reconciliar. Ainda assim, faça uma cópia de
segurança do seu antes de substituir.

```jsx
import React, { useState, useRef } from 'react';
import {
  Wallet, EyeOff, Eye, Coins, CalendarClock, Info, ArrowUpRight, ArrowDownLeft, ChevronRight,
  HeartPulse, Bell, AlertTriangle, TrendingUp, TrendingDown, Calendar,
  Plus, CheckCircle2, MoreVertical, Pencil, Trash2, CreditCard, Download, Users, User, PiggyBank, ShoppingCart, CalendarDays, BarChart3
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, LabelList, CartesianGrid, XAxis, YAxis, Tooltip, Cell, ReferenceLine, LineChart, Line } from 'recharts';
import { COLORS, PRIORITY, DEFAULT_PRIORITY } from '../../constants/tokens';
import { useCategories } from '../../context/CategoriesContext';
import { TODAY_DATE } from '../../constants/seedData';
import { fmt, fmtDate, round2, inScope, displayStatus, recurrenceIcon, recurrenceLabel, memberLabel, plannedStatus, monthLabelFull } from '../../utils/formatters';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { CategoryIcon } from '../ui/CategoryIcon';
import { ModalSheet } from '../ui/ModalSheet';

// ============================================================================
// INÍCIO — o que mudou e por quê
//
// ANTES, na ordem em que aparecia na tela (13 blocos, ~6 valores grandes):
//   1. saudação
//   2. Saldo disponível              (34px)
//   3. Reserva mínima disponível     (28px)
//   4. Cartão alimentação            (22px)
//   5. Saldo projetado mês           (26px)
//   6. Saúde financeira              (24px)
//   7. A receber / A pagar           (18px, e os MESMOS valores repetidos
//                                     por extenso dentro do card 5)
//   8. Pacing semanal                "Envelope da semana ... teto diário ..."
//   9. Alertas de hoje
//  10. Gráfico saldo fim do mês (12 barras, rótulo rotacionado −90°)
//  11. Gráfico extrato de saldo dia a dia
//  12. Contas em aberto (lista) + faixa de totais + 2 botões de ordenação
//  13. Postergadas
//
// Três problemas de hierarquia decorriam disso:
//   a) CINCO números competindo pelo mesmo peso visual. O usuário não sabia
//      onde olhar primeiro (regra "one glance").
//   b) REDUNDÂNCIA: "a receber / a pagar" aparecia em card próprio E na
//      descrição do card de saldo projetado. "em aberto" aparecia no card de
//      projeção, na faixa de totais e na lista.
//   c) A lista de trabalho — o motivo de abrir o app — ficava depois de dois
//      gráficos, em ~2.000px de rolagem no celular.
//
// DEPOIS (mesmos dados, mesma lógica, mesma API de props):
//   Coluna de decisão   → 1 saldo + 3 KPI de apoio na mesma faixa, alerta,
//                         e a lista de contas em aberto logo em seguida.
//   Coluna de apoio     → saúde, reserva, cartão alimentação.
//   Análise do mês      → os dois gráficos e o pacing, atrás de um disclosure.
// ============================================================================

const fmtPlain = (v) => {
  if (v == null) return "";
  const n = Math.abs(v).toLocaleString("pt-BR", { maximumFractionDigits: 0, minimumFractionDigits: 0 });
  return (v < 0 ? "-" : "") + n;
};

// Rótulo de cada barra do gráfico mensal. Antes era rotacionado −90° sobre a
// barra (ilegível e sempre cortado no topo); agora é o valor curto acima dela.
const renderBarLabel = (props) => {
  const { x, y, width, value } = props;
  if (value == null) return null;
  const cx = x + width / 2;
  return (
    <text x={cx} y={y - 6} textAnchor="middle" fill={value < 0 ? COLORS.rust : COLORS.green}
      fontSize={11} fontWeight={600} style={{ fontVariantNumeric: "tabular-nums" }}>
      {fmtPlain(value)}
    </text>
  );
};

const monthBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ fontSize: 12, borderRadius: 10, border: "1px solid " + COLORS.line, background: COLORS.card, padding: "8px 12px", boxShadow: "0 4px 14px rgba(0,0,0,0.10)" }}>
      <p style={{ fontSize: 12.5, fontWeight: 600, margin: "0 0 4px", color: COLORS.ink, textTransform: "capitalize" }}>{label}</p>
      <p style={{ margin: 0, fontWeight: 600, color: d.saldo < 0 ? COLORS.rust : COLORS.green }}>Saldo no fim do mês: {fmt(d.saldo)}</p>
      {d.projected && <p style={{ margin: "4px 0 0", fontSize: 11.5, color: COLORS.muted }}>projeção</p>}
    </div>
  );
};

const ehDespesaItem = (i) => i.type === "expense" || i.type === "transferencia";
const pad = (n) => String(n).padStart(2, "0");
const dataCurta = (iso) => {
  if (!iso) return "--/--";
  const d = new Date(iso + "T00:00:00");
  return Number.isFinite(d.getTime()) ? pad(d.getDate()) + "/" + pad(d.getMonth() + 1) : "--/--";
};

/* ── Card de item em aberto ────────────────────────────────────────────────
   Antes: borda esquerda de 4px colorida por categoria + fundo tingido pelo
   tipo + selo + faixa de prioridade + chip DV/DI + "G 7.3 · atraso 12d · S 4".
   Cinco sinais competindo no mesmo card.

   Agora: o estado vem primeiro (selo com texto), o valor é o segundo olhar,
   e os detalhes técnicos do motor (G, S, DV/DI) ficam em uma linha só de
   11.5px, com rótulo — antes eram siglas soltas sem explicação na própria
   tela. A barra lateral colorida foi trocada por um marcador de categoria ao
   lado do título, que não rouba a leitura da borda do card. */
export function PlannedCard({ item, selectedMonth, onPay, onEdit, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const categories = useCategories();
  const st = displayStatus(item);
  const RecIcon = recurrenceIcon(item);
  const pct = Math.min(100, (item.paid / item.amount) * 100);
  const catColor = categories[item.category]?.color || COLORS.green;
  const prio = PRIORITY[item.priority] || PRIORITY.importante;
  const isCouple = item.memberId == null;
  const MemberIcon = isCouple ? Users : User;

  const diaIndicado = item.dataIndicada != null
    ? item.dataIndicada
    : (item.diaVencimento != null ? item.diaVencimento : null);
  const temDataIndicada = ehDespesaItem(item) && Boolean(selectedMonth) && diaIndicado != null;
  const dataIndicadaISO = selectedMonth + "-" + pad(diaIndicado || 1);

  const salaryDeductions = item.category === "salario" ? (item.salaryDeductions || []) : [];
  const deductionTotal = salaryDeductions.reduce((s, d) => s + (Number(d.amount) || 0), 0);
  const isSalary = item.category === "salario" && deductionTotal > 0;
  const netAmount = round2(item.amount - deductionTotal);
  const valorMostrado = isSalary ? netAmount : item.amount;

  if (confirming) {
    return (
      <Card style={{ padding: "12px 14px", borderColor: COLORS.rust }}>
        <p style={{ fontSize: 13, margin: "0 0 10px", color: COLORS.rust }}>Excluir "{item.description}"?</p>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setConfirming(false)} style={{ flex: 1, minHeight: 44, fontSize: 12.5, borderRadius: 10, border: "1px solid " + COLORS.line, background: "transparent", color: COLORS.fg2 }}>Cancelar</button>
          <button onClick={() => { onDelete(item, "current"); setConfirming(false); }} style={{ flex: 1, minHeight: 44, fontSize: 12.5, borderRadius: 10, border: "1px solid " + COLORS.green, background: "transparent", color: COLORS.green, fontWeight: 600 }}>Apenas este mês</button>
          <button onClick={() => { onDelete(item, "all"); setConfirming(false); }} style={{ flex: 1, minHeight: 44, fontSize: 12.5, borderRadius: 10, border: "none", background: COLORS.rust, color: "#fff", fontWeight: 600 }}>Todos os futuros</button>
        </div>
      </Card>
    );
  }

  return (
    <Card style={{ position: "relative", padding: "14px 16px" }} data-od-id={"conta-" + item.occId}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span style={{
          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
          background: catColor + "1F", color: catColor,
          display: "flex", alignItems: "center", justifyContent: "center",
        }} aria-hidden="true">
          <span style={{ width: 10, height: 10, borderRadius: 3, background: "currentColor" }} />
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
            <p className="serif" style={{ fontSize: 15.5, fontWeight: 600, margin: 0, color: COLORS.ink }}>{item.description}</p>
            <Badge color={st.color}>{st.label}</Badge>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 5, fontSize: 12, color: COLORS.muted }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <MemberIcon size={12} />{memberLabel(item.memberId)}
            </span>
            <span style={{ color: COLORS.line }}>|</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <RecIcon size={12} />{recurrenceLabel(item)}
            </span>
            <span style={{ color: COLORS.line }}>|</span>
            <span style={{ fontWeight: 600, color: prio.color }}>{prio.label}</span>
            {(item.formaPagamento || "normal") === "reserva" && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 600, color: COLORS.amber }}>
                <PiggyBank size={11} />sai da reserva
              </span>
            )}
          </div>

          {item.paid > 0 && (
            <div style={{ marginTop: 8 }}>
              <ProgressBar pct={pct} color={st.color} />
              <p style={{ fontSize: 11.5, color: COLORS.muted, margin: "5px 0 0" }}>
                {fmt(item.paid)} de {fmt(valorMostrado)}{isSalary ? " (líquido)" : ""}
              </p>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
          <p className="serif" style={{ fontSize: 19, fontWeight: 600, margin: 0, color: COLORS.ink, whiteSpace: "nowrap" }}>
            {fmt(valorMostrado)}
          </p>
          <button onClick={() => setMenuOpen((v) => !v)} aria-label="Mais opções" className="icon-btn" style={{ background: "none", border: "none", color: COLORS.muted }}>
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      {/* Uma linha de rodapé: quando o motor indica pagar, quando vence, e a
          leitura técnica. Antes eram três linhas de chips e siglas. */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 10, paddingTop: 10, borderTop: "1px solid " + COLORS.lineSoft }}>
        {temDataIndicada ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: COLORS.muted }}>
            <CalendarDays size={13} />
            pagar em <strong style={{ color: item.dataIndicada != null && item.dataIndicada !== item.diaVencimento ? COLORS.amber : COLORS.ink, fontWeight: 600 }}>{dataCurta(dataIndicadaISO)}</strong>
            <span style={{ color: COLORS.line }}>·</span>
            vence {dataCurta(item.dueDate)}
          </span>
        ) : (
          <span style={{ fontSize: 12, color: COLORS.muted }}>vence {fmtDate(item.dueDate)}</span>
        )}

        {item.motorG != null && (
          <span style={{ fontSize: 11.5, color: COLORS.muted }} title="G = gravidade · S = score do motor de priorização">
            gravidade {item.motorG.toFixed(1)}{item.vencida ? " · atraso " + item.diasEmAtraso + "d" : ""}
          </span>
        )}

        {item.agrupadas && <span style={{ fontSize: 11.5, color: COLORS.muted }}>inclui {item.agrupadas}</span>}

        <div style={{ marginLeft: "auto" }}>
          {st.state !== "pago" && st.state !== "excedido" && (
            <button
              onClick={() => onPay(item)}
              data-od-id={"pagar-" + item.occId}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6, minHeight: 36, padding: "0 14px",
                borderRadius: 10, fontSize: 12.5, fontWeight: 600,
                border: "1px solid " + COLORS.green, background: COLORS.green + "12", color: COLORS.green,
              }}>
              {item.type === "income" ? <><Download size={13} />Registrar recebimento</> : <><CreditCard size={13} />Registrar pagamento</>}
            </button>
          )}
        </div>
      </div>

      {item.motorStatus === "atencao_necessaria" && (
        <p style={{ fontSize: 11.5, color: COLORS.rust, margin: "8px 0 0", fontWeight: 600 }}>
          O motor indica atenção: {item.motorStatusLabel || "o caixa não cobre este valor no mês"}.
        </p>
      )}

      {menuOpen && (
        <div style={{ position: "absolute", top: 40, right: 14, background: COLORS.card, border: "1px solid " + COLORS.line, borderRadius: 10, boxShadow: "0 6px 18px rgba(0,0,0,0.12)", zIndex: 3, overflow: "hidden" }}>
          <button onClick={() => { setMenuOpen(false); onEdit(item); }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", minHeight: 44, padding: "0 14px", background: "none", border: "none", fontSize: 13, color: COLORS.ink, whiteSpace: "nowrap" }}><Pencil size={14} />Editar</button>
          <button onClick={() => { setMenuOpen(false); setConfirming(true); }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", minHeight: 44, padding: "0 14px", background: "none", border: "none", borderTop: "1px solid " + COLORS.line, fontSize: 13, color: COLORS.rust, whiteSpace: "nowrap" }}><Trash2 size={14} />Excluir</button>
        </div>
      )}
    </Card>
  );
}

function Kpi({ icon: Icon, color, label, value, hint }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 12, background: COLORS.cardSunken, border: "1px solid " + COLORS.lineSoft, minWidth: 0 }}>
      <Icon size={16} color={color} style={{ flexShrink: 0 }} />
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 16.5, fontWeight: 600, margin: 0, color }}>{value}</p>
        <p style={{ fontSize: 11.5, color: COLORS.muted, margin: 0 }}>{label}{hint ? " · " + hint : ""}</p>
      </div>
    </div>
  );
}

function SupportCard({ icon: Icon, color, title, subtitle, children, action }) {
  return (
    <Card data-od-id={"apoio-" + title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span style={{ width: 34, height: 34, borderRadius: 10, background: color + "1E", color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={16} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: COLORS.ink }}>{title}</p>
          {subtitle && <p style={{ fontSize: 11.5, color: COLORS.muted, margin: "1px 0 0" }}>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}

export function InicioView({ balance, availableBalance, reservedAmount, availableNow, monthProjection, isCurrentMonth, health, alerts, monthIncome, monthExpense, projectedBalance, onSelectMonth, openItems: allOpenItems, memberFilter, hideBalance, onToggleHide, onSeeAll, onPay, onEditPlanned, onDeletePlanned, onNewPlanned, onCloseMonth, postergadas, pacing, dias, reservaMinima, reservaUsada, reservaDisponivel, reservaConfigurada, reservaAporte, reservaReceita, reservaDespesa, reservaSobra, reservaDeficit, beneficio, carryRestrito, selectedMonth, onOpenReserva, autoDetalhes }) {
  const [sortBy, setSortBy] = useState("indicada");
  const [showHealthInfo, setShowHealthInfo] = useState(false);
  const lastTapRef = useRef({ month: null, time: 0 });
  const categories = useCategories();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const firstNegative = projectedBalance.find((t) => t.negative);
  const hasAnyMovement = projectedBalance.some((d) => (d.receitas || 0) > 0 || (d.despesas || 0) > 0);
  const mask = (v) => (hideBalance ? "R$ • • • • •" : fmt(v));

  function handleBarTap(data) {
    const month = (data && (data.payload || data).month) || null;
    if (!month) return;
    const now = Date.now();
    if (lastTapRef.current.month === month && now - lastTapRef.current.time < 400) {
      lastTapRef.current = { month: null, time: 0 };
      if (onSelectMonth) onSelectMonth(month);
    } else {
      lastTapRef.current = { month, time: now };
    }
  }

  const pad2 = (n) => String(n).padStart(2, "0");
  const ehDespesa = (i) => i.type === "expense" || i.type === "transferencia";

  const diaDoVencimento = (i) => {
    const d = i.diaVencimento != null
      ? Number(i.diaVencimento)
      : new Date((i.dueDate || "") + "T00:00:00").getDate();
    return Number.isFinite(d) && d > 0 ? d : 1;
  };
  const chaveData = (i) => {
    if (!ehDespesa(i)) return i.dueDate || "";
    const dia = i.dataIndicada != null ? i.dataIndicada : diaDoVencimento(i);
    return selectedMonth + "-" + pad2(dia);
  };
  const criticidade = (a, b) => (a.motorRank ?? 999) - (b.motorRank ?? 999);

  const baseItems = allOpenItems
    .filter((i) => inScope(i.memberId, memberFilter))
    .map((i) => ({ ...i, priority: i.priority || DEFAULT_PRIORITY[i.category] || "importante" }));

  const despesas = baseItems.filter(ehDespesa);
  const receitas = baseItems.filter((i) => !ehDespesa(i));

  const despesasOrdenadas = sortBy === "indicada"
    ? [...despesas].sort((a, b) => {
        const ka = chaveData(a), kb = chaveData(b);
        if (ka !== kb) return ka < kb ? -1 : 1;
        return criticidade(a, b);
      })
    : [...despesas].sort((a, b) => (a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0));

  const openItems = (() => {
    const lista = [...despesasOrdenadas];
    [...receitas]
      .sort((a, b) => (a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0))
      .forEach((r) => {
        const kr = r.dueDate || "";
        const idx = lista.findIndex((d) => chaveData(d) >= kr);
        lista.splice(idx < 0 ? lista.length : idx, 0, r);
      });
    return lista;
  })();

  const diasBeneficio = beneficio && beneficio.porDia
    ? Object.keys(beneficio.porDia).map(Number).sort((a, b) => a - b).join(", ")
    : "";
  const categoriasBeneficio = beneficio && beneficio.itens && beneficio.itens.length
    ? [...new Set(beneficio.itens.map((i) => i.category))].map((k) => (categories[k]?.label || k).toLowerCase()).join(", ")
    : "mercado";
  const temRestrito = Boolean(beneficio && beneficio.total > 0) || (dias || []).some((d) => (d.restrito || 0) > 0);

  const endPositive = monthProjection.endBalance >= 0;
  const openTotal = openItems.reduce((s, i) => s + (i.amount - i.paid), 0);
  const dueThisWeek = openItems.filter((i) => {
    const diff = Math.round((new Date(i.dueDate + "T00:00:00") - new Date(TODAY_DATE + "T00:00:00")) / 86400000);
    return diff >= 0 && diff <= 7;
  }).length;

  // Quanto do orçamento do mês já foi usado — o dado que dá sentido ao número
  // de saúde financeira, que antes aparecia sem contexto nenhum.
  const usoDaRenda = monthIncome > 0 ? Math.round((monthExpense / monthIncome) * 100) : 0;
  const temReserva = reservaMinima > 0 || reservaConfigurada;

  return (
    <div className="grid-auto">
      {/* ─────────────── coluna de decisão ─────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
        <p style={{ fontSize: 13.5, color: COLORS.muted, margin: 0 }}>{greeting}. Aqui está o mês em uma olhada.</p>

        {/* 1. SALDO — o único número grande da tela. */}
        <Card data-od-id="card-saldo-disponivel">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ width: 34, height: 34, borderRadius: 10, background: COLORS.greenSoft, color: COLORS.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Wallet size={17} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: COLORS.ink }}>Saldo disponível</p>
              <p style={{ fontSize: 11.5, color: COLORS.muted, margin: 0 }}>
                não considera a reserva mínima{reservedAmount > 0 ? " (" + mask(reservedAmount) + " reservados)" : ""}
              </p>
            </div>
            <button onClick={onToggleHide} aria-label={hideBalance ? "Mostrar saldo" : "Ocultar saldo"} className="icon-btn" style={{ background: "none", border: "none", color: COLORS.muted }}>
              {hideBalance ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          <p className="serif" style={{ fontSize: 38, fontWeight: 600, margin: 0, letterSpacing: "-0.02em", color: availableBalance >= 0 ? COLORS.green : COLORS.rust }}>
            {mask(availableBalance)}
          </p>

          {/* 2. Faixa única de apoio. Antes: card "saldo projetado mês" +
                 card "a receber/a pagar" + a mesma informação escrita por
                 extenso dentro do primeiro. Agora é uma faixa de três. */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8, marginTop: 14 }}>
            <Kpi icon={CalendarClock} color={COLORS.info} value={mask(monthProjection.endBalance)} label="saldo no fim do mês" />
            <Kpi icon={ArrowDownLeft} color={COLORS.green} value={mask(monthProjection.pendingIncome)} label="a receber" hint={dueThisWeek ? "vencem " + dueThisWeek + " esta semana" : undefined} />
            <Kpi icon={ArrowUpRight} color={COLORS.rust} value={mask(monthProjection.pendingExpense)} label="a pagar" />
          </div>
          {!endPositive && (
            <p style={{ fontSize: 12.5, color: COLORS.rust, margin: "10px 0 0", fontWeight: 600 }}>
              No ritmo atual, o mês fecha negativo. Veja o que pode ser postergado em Priorização.
            </p>
          )}
        </Card>

        {/* 3. ALERTAS — só o que exige decisão, com o valor à vista. */}
        {alerts.length > 0 && (
          <Card style={{ background: COLORS.amber + "0D", borderColor: COLORS.amber + "44" }} data-od-id="card-alertas">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ width: 34, height: 34, borderRadius: 10, background: COLORS.amber + "1E", color: COLORS.amber, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Bell size={16} />
              </span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: COLORS.ink }}>
                  {alerts.length === 1 ? "1 alerta de hoje" : alerts.length + " alertas de hoje"}
                </p>
                <p style={{ fontSize: 11.5, color: COLORS.muted, margin: 0 }}>o que precisa da sua atenção antes de seguir</p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {alerts.map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <AlertTriangle size={14} color={a.level === "rust" ? COLORS.rust : COLORS.amber} style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: COLORS.ink, lineHeight: 1.45 }}>{a.text}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* 4. LISTA DE TRABALHO — promovida para logo depois do saldo. */}
        <section aria-labelledby="titulo-contas-abertas" style={{ marginTop: 4 }}>
          <div className="screen-head" style={{ marginBottom: 10 }}>
            <h2 id="titulo-contas-abertas" className="serif" style={{ fontSize: 21, fontWeight: 500, margin: 0 }}>
              Contas em aberto
            </h2>
            {openItems.length > 0 && (
              <span style={{ fontSize: 12.5, fontWeight: 700, color: COLORS.green, background: COLORS.green + "1E", borderRadius: 20, padding: "2px 10px" }}>
                {openItems.length}
              </span>
            )}
            {openItems.length > 0 && (
              <span style={{ fontSize: 12.5, color: COLORS.muted }}>
                {mask(openTotal)} em aberto{dueThisWeek > 0 ? " · " + dueThisWeek + " vencem esta semana" : ""}
              </span>
            )}
            <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
              {[["indicada", "Data indicada"], ["vencimento", "Vencimento"]].map(([v, l]) => (
                <button key={v} onClick={() => setSortBy(v)} aria-pressed={sortBy === v}
                  style={{
                    minHeight: 36, padding: "0 12px", borderRadius: 10, fontSize: 12.5, fontWeight: 600,
                    border: "1px solid " + (sortBy === v ? COLORS.green : COLORS.line),
                    background: sortBy === v ? COLORS.green : COLORS.card,
                    color: sortBy === v ? "#fff" : COLORS.fg2,
                  }}>{l}</button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {openItems.length === 0 && (
              <Card style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <CheckCircle2 size={18} color={COLORS.green} />
                <p style={{ fontSize: 13.5, margin: 0 }}>Tudo em dia por aqui — nada pendente.</p>
              </Card>
            )}
            {openItems.map((item) => (
              <PlannedCard key={item.occId} item={item} selectedMonth={selectedMonth} onPay={onPay} onEdit={onEditPlanned} onDelete={onDeletePlanned} />
            ))}

            {postergadas.length > 0 && (
              <Card>
                <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 8px", display: "flex", alignItems: "center", gap: 6 }}>
                  <TrendingDown size={14} color={COLORS.amber} />
                  Postergadas para o próximo mês
                </p>
                {postergadas.map((p) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, padding: "6px 0", borderTop: "1px solid " + COLORS.lineSoft }}>
                    <span style={{ flex: 1, color: COLORS.ink, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.descricao}</span>
                    <span style={{ color: COLORS.ink }}>{fmt(p.valor)}</span>
                    {p.jurosEstimados > 0 && <span style={{ color: COLORS.rust }}>+{fmt(p.jurosEstimados)} de juros</span>}
                  </div>
                ))}
              </Card>
            )}

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={onNewPlanned} style={{ minHeight: 44, padding: "0 16px", borderRadius: 10, border: "1px solid " + COLORS.green, background: "transparent", color: COLORS.green, fontWeight: 600, fontSize: 13 }}>
                <Plus size={15} style={{ verticalAlign: -2, marginRight: 6 }} />Novo previsto
              </button>
              {/* "Fechar mês" era um ícone solto sem rótulo entre dois filtros. */}
              <button onClick={onCloseMonth} style={{ minHeight: 44, padding: "0 16px", borderRadius: 10, border: "1px solid " + COLORS.line, background: COLORS.card, color: COLORS.fg2, fontWeight: 600, fontSize: 13 }}>
                <CheckCircle2 size={15} style={{ verticalAlign: -2, marginRight: 6 }} />Fechar o mês
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ─────────────── coluna de apoio ─────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
        {/* Saúde financeira agora diz de onde vem a nota. */}
        <SupportCard
          icon={HeartPulse}
          color={COLORS.info}
          title="Saúde financeira"
          subtitle={isCurrentMonth ? "como o mês está se comportando" : "mês encerrado"}
          action={
            <button onClick={() => setShowHealthInfo(true)} aria-label="Como a nota é calculada" className="icon-btn" style={{ background: "none", border: "none", color: COLORS.muted }}>
              <Info size={16} />
            </button>
          }
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <p className="serif" style={{ fontSize: 30, fontWeight: 600, margin: 0, color: health.color }}>{health.score}</p>
            <div style={{ flex: 1 }}>
              <div style={{ height: 8, borderRadius: 6, background: COLORS.cardRaised, overflow: "hidden" }}>
                <div style={{ height: "100%", width: Math.max(0, Math.min(100, health.score)) + "%", background: health.color, borderRadius: 6 }} />
              </div>
              <p style={{ fontSize: 11.5, color: COLORS.muted, margin: "6px 0 0" }}>
                <strong style={{ color: COLORS.ink }}>{health.shortLabel}</strong> · {usoDaRenda}% da renda do mês já usada
              </p>
            </div>
          </div>
          {health.factors.length > 0 && (
            <p style={{ fontSize: 11.5, color: COLORS.muted, margin: "10px 0 0" }}>
              {health.factors.length === 1 ? "1 fator está descontando pontos" : health.factors.length + " fatores estão descontando pontos"} — toque no ⓘ para ver.
            </p>
          )}
        </SupportCard>

        {temReserva && (
          <SupportCard
            icon={PiggyBank}
            color={COLORS.amber}
            title="Reserva mínima"
            subtitle={reservaConfigurada ? "aporte mensal configurado" : "15% do salário líquido"}
            action={
              <button onClick={onOpenReserva} aria-label="Configurar reserva mínima" className="icon-btn" style={{ background: "none", border: "none", color: COLORS.muted }}>
                <Pencil size={15} />
              </button>
            }
          >
            <p className="serif" style={{ fontSize: 26, fontWeight: 600, margin: "0 0 8px", color: reservaDisponivel >= 0 ? COLORS.ink : COLORS.rust }}>
              {mask(reservaDisponivel)}
            </p>
            <ProgressBar pct={reservaMinima > 0 ? Math.min(100, (reservaUsada / reservaMinima) * 100) : 0} color={reservaDisponivel < 0 ? COLORS.rust : COLORS.amber} />
            <p style={{ fontSize: 12, color: COLORS.muted, margin: "9px 0 0", lineHeight: 1.5 }}>
              Usado {mask(reservaUsada)} de {mask(reservaMinima)} · aporte do mês {mask(reservaAporte)}.
              {" "}{reservaDeficit > 0
                ? "Fecha negativa em " + mask(reservaDeficit) + ", que entra como despesa no mês seguinte."
                : "Sobra " + mask(reservaSobra) + ", que entra como receita no mês seguinte."}
              {" "}A reserva não acumula.
            </p>
          </SupportCard>
        )}

        {temRestrito && (
          <SupportCard
            icon={ShoppingCart}
            color={COLORS.amber}
            title="Cartão alimentação"
            subtitle={"entra " + (diasBeneficio ? "nos dias " + diasBeneficio : "no mês") + " · só " + categoriasBeneficio}
          >
            <p className="serif" style={{ fontSize: 24, fontWeight: 600, margin: "0 0 6px", color: COLORS.ink }}>{mask(beneficio.total)}</p>
            <p style={{ fontSize: 12, color: COLORS.muted, margin: 0, lineHeight: 1.5 }}>
              Fora do saldo disponível — este valor não pode pagar as outras contas.
              {carryRestrito > 0 ? " Inclui " + mask(carryRestrito) + " que sobrou do mês anterior." : ""}
            </p>
          </SupportCard>
        )}

        {/* 5. DETALHE SOB DEMANDA — os gráficos e o pacing. */}
        <Card data-od-id="card-analise-do-mes">
          <details>
            <summary style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", listStyle: "none", minHeight: 44 }}>
              <span style={{ width: 34, height: 34, borderRadius: 10, background: COLORS.info + "1E", color: COLORS.info, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <BarChart3 size={16} />
              </span>
              <span style={{ flex: 1 }}>
                <span style={{ display: "block", fontSize: 14, fontWeight: 600, color: COLORS.ink }}>Análise do mês</span>
                <span style={{ display: "block", fontSize: 11.5, color: COLORS.muted }}>saldo mês a mês, dia a dia e ritmo de gasto</span>
              </span>
              <ChevronRight size={16} color={COLORS.muted} />
            </summary>

            <div style={{ marginTop: 14 }}>
              <p className="eyebrow" style={{ marginBottom: 6 }}>Saldo no fim do mês — próximos 12 meses</p>
              <div style={{ width: "100%", height: 175 }}>
                <ResponsiveContainer>
                  <BarChart data={projectedBalance} barGap={2} margin={{ top: 18, right: 4, left: 4, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke={COLORS.lineSoft} />
                    <XAxis dataKey="label" tick={{ fontSize: 10.5, fill: COLORS.muted }} axisLine={false} tickLine={false} interval={0} />
                    <YAxis hide />
                    <Tooltip content={monthBarTooltip} />
                    <ReferenceLine y={0} stroke={COLORS.ink} strokeOpacity={0.5} strokeDasharray="3 3" />
                    <Bar dataKey="saldo" name="Saldo no fim do mês" radius={[4, 4, 4, 4]} onClick={handleBarTap} maxBarSize={22}>
                      {projectedBalance.map((d, i) => (
                        <Cell key={i} fill={d.saldo < 0 ? COLORS.rust : COLORS.green} fillOpacity={d.projected ? 0.55 : 1} />
                      ))}
                      <LabelList dataKey="saldo" content={renderBarLabel} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p style={{ fontSize: 11.5, color: COLORS.muted, margin: "6px 0 0" }}>
                Barras mais claras são previsão. Toque duas vezes em uma barra para abrir o mês.
              </p>
              {!hasAnyMovement ? (
                <p style={{ fontSize: 12.5, color: COLORS.muted, margin: "6px 0 0" }}>Cadastre receitas, despesas ou compromissos no Previsto para ver o saldo de cada mês.</p>
              ) : firstNegative ? (
                <p style={{ fontSize: 12.5, color: COLORS.rust, margin: "6px 0 0" }}>
                  Atenção: o saldo fica negativo no fim de <strong>{monthLabelFull(firstNegative.month)}</strong> ({fmt(firstNegative.saldo)}).
                </p>
              ) : (
                <p style={{ fontSize: 12.5, color: COLORS.green, margin: "6px 0 0" }}>Em todos os meses o saldo fecha positivo.</p>
              )}

              {pacing && (
                <>
                  <p className="eyebrow" style={{ margin: "18px 0 6px" }}>Ritmo de gasto do mercado</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8 }}>
                    <Kpi icon={Coins} color={COLORS.info} value={fmt(pacing.envelopeSemanal)} label="envelope da semana" />
                    <Kpi icon={TrendingUp} color={pacing.saldoSemanalRestante < 0 ? COLORS.rust : COLORS.green} value={fmt(pacing.saldoSemanalRestante)} label="disponível na semana" />
                    <Kpi icon={Calendar} color={COLORS.muted} value={fmt(pacing.tetoDiario)} label="teto por dia" />
                  </div>
                </>
              )}

              {dias.length > 0 && (
                <>
                  <p className="eyebrow" style={{ margin: "18px 0 6px" }}>Saldo previsto — dia a dia</p>
                  <div style={{ width: "100%", height: 150 }}>
                    <ResponsiveContainer>
                      <LineChart data={dias} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid vertical={false} stroke={COLORS.lineSoft} />
                        <XAxis dataKey="dia" tick={{ fontSize: 10.5, fill: COLORS.muted }} axisLine={false} tickLine={false} interval={4} />
                        <YAxis hide />
                        <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid " + COLORS.line }} />
                        <Line type="monotone" dataKey="saldo" stroke={COLORS.green} strokeWidth={2.5} dot={false} name="Saldo previsto" />
                        <Line type="stepAfter" dataKey="reserva" stroke={COLORS.amber} strokeWidth={2} strokeDasharray="4 4" dot={false} name="Reserva mínima disponível" />
                        {temRestrito && (
                          <Line type="stepAfter" dataKey="restrito" stroke={COLORS.amber} strokeWidth={1.5} strokeDasharray="2 3" dot={false} name="Cartão alimentação" />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Legenda nomeada: antes era um parágrafo que explicava as
                      linhas em texto corrido. */}
                  <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 8, fontSize: 11.5, color: COLORS.muted }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 14, height: 2, background: COLORS.green, borderRadius: 2 }} />saldo previsto
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 14, height: 2, background: COLORS.amber, borderRadius: 2 }} />reserva mínima disponível
                    </span>
                    {temRestrito && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <span style={{ width: 14, height: 2, background: COLORS.amber, borderRadius: 2, opacity: 0.6 }} />cartão alimentação
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 11.5, color: COLORS.muted, margin: "6px 0 0" }}>
                    A reserva começa em {fmt(reservaMinima)} e desce conforme é usada
                    {reservaUsada > 0 ? " — " + fmt(reservaUsada) + " usados, restam " + fmt(reservaDisponivel) : ""}.
                  </p>
                </>
              )}
            </div>
          </details>
        </Card>

        <button onClick={onSeeAll} style={{ minHeight: 44, padding: "0 16px", borderRadius: 10, border: "1px solid " + COLORS.line, background: COLORS.card, color: COLORS.fg2, fontWeight: 600, fontSize: 13 }}>
          Ver todas as transações
        </button>
      </div>

      {showHealthInfo && (
        <ModalSheet title="Saúde financeira — como é calculada" onClose={() => setShowHealthInfo(false)}>
          <p style={{ fontSize: 13, color: COLORS.fg2, margin: "0 0 12px" }}>
            A pontuação vai de <strong>0 a 100</strong> e começa em 100. Cada situação abaixo desconta pontos:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {[
              ["Orçamentos estourados", "−15 por orçamento acima do limite · −5 no limite"],
              ["Despesas acima da receita", "−25 quando o mês fechou no vermelho"],
              ["Poupança insuficiente", "−20 se gastou além da renda · −8 se guarda menos de 15%"],
            ].map(([t, d]) => (
              <div key={t} style={{ padding: "10px 12px", borderRadius: 12, background: COLORS.cardSunken, border: "1px solid " + COLORS.lineSoft }}>
                <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 2px", color: COLORS.ink }}>{t}</p>
                <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}>{d}</p>
              </div>
            ))}
          </div>

          <p className="eyebrow" style={{ color: COLORS.green, marginBottom: 8 }}>Neste mês</p>
          {health.factors.length === 0 ? (
            <p style={{ fontSize: 13, color: COLORS.green, margin: 0 }}>Nenhum desconto aplicado — pontuação máxima.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {health.factors.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ minWidth: 34, fontSize: 13, fontWeight: 700, color: COLORS.rust, flexShrink: 0 }}>{f.impact}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, margin: 0, color: COLORS.ink }}>{f.label}</p>
                    <p style={{ fontSize: 11.5, color: COLORS.muted, margin: 0 }}>{f.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ModalSheet>
      )}
    </div>
  );
}

export default InicioView;
```

---

## 9. `src/App.jsx` — edição de 3 pontos

Não cole por cima: o arquivo tem 804 linhas de estado do app. O patch está
detalhado em `aplicar-no-app.md`. Resumo:

1. **Import:** `BottomNav` → `AppShell, AppTopbar` de `./components/shell/AppShell`.
2. **Rota ativa:** 1 linha antes do `return` —
   `const activeRoute = tab === "mais" && moreView ? moreView : tab;`
3. **Shell:** trocar o bloco `return` (linhas ~822–877) e **mover os modais para
   fora** do shell, já que agora usam `position: fixed`.

---

## Checklist depois de salvar

1. `pnpm dev` — o app abre sem erro de import.
2. Em 390×844: lista de contas em aberto visível sem rolagem longa, barra
   inferior respeitando a safe-area do iPhone.
3. Redimensionando para ~700px: sem telefone de 430px flutuando; duas colunas
   e barra inferior mantida.
4. Acima de 980px: barra lateral com os cinco grupos, topbar com mês e pessoa,
   uma única ação primária. Abrir um modal: diálogo centralizado, ESC fecha.
5. Janela de 900×600: app ocupa a tela toda, sem corte no topo ou na base.

## Se algo quebrar

- Erro de import em `tokens.js`: confirme que `lucide-react` exporta
  `ListChecks`, `PieChart`, `LayoutGrid`, `Layers`, `Target`, `Landmark`,
  `Receipt`, `FileJson`, `Lightbulb` na versão 0.439 (exporta).
- Erro `COLORS.fg2 is not defined`: o `tokens.js` antigo ainda está no lugar —
  o item 7 não foi aplicado.
- Modal aparecendo dentro da caixa: os modais ainda estão dentro do
  `AppShell` no `App.jsx` (passo 3 do patch).
