# Pacote design v3 — os 9 arquivos, na integra

Se voce e um agente trabalhando na pasta do app: estes arquivos NAO estao
dentro de Trabajo\App GestaoFinanceira. Eles vivem no projeto do Open Design:

    C:\Users\edils\AppData\Roaming\Open Design\namespaces\release-stable-win\data\projects\fdc7c9d5-808c-49fe-a420-d403738bc2a0\

Tres formas de trazer, da melhor para a pior:

1. Copiar direto (nao precisa deste arquivo):
   & "C:\Users\edils\AppData\Roaming\Open Design\namespaces\release-stable-win\data\projects\fdc7c9d5-808c-49fe-a420-d403738bc2a0\aplicar-design.ps1" -SomenteNovos
   Se a politica de execucao bloquear:
   powershell -ExecutionPolicy Bypass -File "C:\Users\edils\AppData\Roaming\Open Design\namespaces\release-stable-win\data\projects\fdc7c9d5-808c-49fe-a420-d403738bc2a0\aplicar-design.ps1" -SomenteNovos
2. Descompactar pacote-design-v3.zip por cima da raiz do repositorio.
3. Ler este arquivo: cada secao abaixo e um arquivo COMPLETO, no caminho do titulo.

Os seis primeiros substituem arquivos que ja existem no app (so aplique se
souber que a versao do app nao evoluiu por la). Os tres ultimos sao NOVOS.
As edicoes de integracao estao em PATCH-01-AJUSTES-HERO.md e PATCH-02-INICIO.md.

---

## 1. `src\constants\tokens.js`

```js
// ============================================================================
// TOKENS — fonte única de verdade visual
//
// v3 — design definitivo, aprovado no protótipo `home-mobile-hero-v3.html`.
//
// A regra que organiza a paleta é a mesma do `design-system-v2.md`: a cor tem
// UM trabalho, não é enfeite.
//
//   violeta  → marca e AÇÃO (botão primário, aba ativa, destaque)
//   verde    → dinheiro que ENTRA
//   vermelho → dinheiro que SAI
//   âmbar    → atenção e prazo
//   azul     → informação
//   fundo    → cinza-azulado frio. Nunca bege.
//
// ── Como a migração foi feita sem quebrar nada ─────────────────────────────
// Os 15 nomes antigos continuam existindo, com valores novos, porque 65
// arquivos os usam. `green` passou a apontar para a AÇÃO (violeta), que é o
// que ele significava no app inteiro — botão primário, aba ativa, marca. Uma
// minoria dos usos de `green` significava "dinheiro que entra" (saldo
// positivo, barra positiva, linha do gráfico de saldo): esses pontos precisam
// virar `income`, e estão listados em APLICAR-DESIGN-DEFINITIVO.md.
//
// Nenhum nome mudou de forma. Só `green` mudou de família — de propósito, e
// com a lista de correções junto.
// ============================================================================

import {
  Home, FileText, ShoppingCart, Car, PartyPopper, HeartPulse,
  BookOpen, Repeat, MoreHorizontal, PiggyBank, Wallet, Briefcase, TrendingUp,
  ListChecks, PieChart, LayoutGrid, Layers, Target,
  Landmark, Tag, Users, Receipt, FileJson, Lightbulb,
} from "lucide-react";

// ── Núcleo da v3 ───────────────────────────────────────────────────────────
export const ACCENT = "#6D28D9";
export const PALETTE = {
  // Ação e marca
  accent: "#6D28D9",
  accentDeep: "#4C1D95",
  accentBright: "#7C3AED",
  accentSoft: "#EDE9FE",

  // Dinheiro
  income: "#047857",
  incomeSoft: "#E4F5EE",
  incomeBorder: "#CBEBDA",
  expense: "#B91C1C",
  expenseSoft: "#FCEAEA",
  expenseBorder: "#F7D2D2",

  // Atenção e informação
  warn: "#9C500A",
  warnSoft: "#FBF0E0",
  warnBorder: "#F1DFB2",
  info: "#1D4ED8",
  infoSoft: "#E7EFFE",
  infoBorder: "#CBDCFB",

  // Superfícies (fundo frio)
  canvas: "#F7F6FB",
  surface: "#FFFFFF",
  surface2: "#F1EFF8",
  page: "#EDEBF3",
  border: "#E9E6F2",
  borderSoft: "#EFEDF5",

  // Texto
  ink: "#15132A",
  fg2: "#4B5563",
  muted: "#6B7280",
};

export const COLORS = {
  // ── Nomes novos, para código novo ────────────────────────────────────────
  accent: PALETTE.accent,
  accentDeep: PALETTE.accentDeep,
  accentBright: PALETTE.accentBright,
  accentSoft: PALETTE.accentSoft,
  violet: PALETTE.accent,
  violetDeep: PALETTE.accentDeep,
  violetBright: PALETTE.accentBright,
  violetSoft: PALETTE.accentSoft,

  income: PALETTE.income,
  incomeSoft: PALETTE.incomeSoft,
  incomeBorder: PALETTE.incomeBorder,
  expense: PALETTE.expense,
  expenseSoft: PALETTE.expenseSoft,
  expenseBorder: PALETTE.expenseBorder,

  warn: PALETTE.warn,
  warnSoft: PALETTE.warnSoft,
  warnBorder: PALETTE.warnBorder,

  canvas: PALETTE.canvas,
  surface: PALETTE.surface,
  surface2: PALETTE.surface2,
  border: PALETTE.border,
  borderSoft: PALETTE.borderSoft,

  // ── Nomes antigos (v1), agora com os valores da v3 ───────────────────────
  // Mantidos para não tocar em 65 arquivos. Não use em código novo.
  ink: PALETTE.ink,
  paper: PALETTE.canvas,          // era o fundo bege #F1EDDF
  card: PALETTE.surface,
  cardSunken: PALETTE.surface2,
  cardRaised: PALETTE.page,
  fg2: PALETTE.fg2,
  muted: PALETTE.muted,
  line: PALETTE.border,
  lineSoft: PALETTE.borderSoft,
  green: PALETTE.accent,          // era "marca/ação" — continua sendo, agora violeta
  greenLight: PALETTE.accentBright,
  greenSoft: PALETTE.accentSoft,
  amber: PALETTE.warn,
  rust: PALETTE.expense,
  info: PALETTE.info,
};

// Geometria compartilhada: o CSS usa exatamente estes números.
export const RADIUS = { card: 18, control: 12, sheet: 24, pill: 999 };
export const TOUCH = { min: 44, control: 44 };

// Sombra da marca: uma só, e sempre a mesma. O sistema não usa profundidade
// para hierarquia — usa contraste de superfície.
export const SHADOW = {
  card: "0 1px 2px rgba(21,19,42,.04)",
  raised: "0 6px 20px -6px rgba(21,19,42,.10), 0 2px 6px rgba(21,19,42,.04)",
  hero: "0 18px 40px -14px rgba(76,29,149,.42)",
  nav: "0 10px 30px -12px rgba(21,19,42,.30)",
};

// ── Registro único de rotas ───────────────────────────────────────────────
// Uma lista só alimenta a barra inferior (celular) e a barra lateral
// (desktop). `short` existe porque a barra inferior tem colunas estreitas;
// `group` só é usado no desktop.
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

// ── Categorias ─────────────────────────────────────────────────────────────
// `color` é um identificador CATEGÓRICO (a lista precisa distinguir 14
// categorias de relance), não um código semântico: por isso as cores vêm de
// uma faixa fria própria, sem disputar com verde=entra / vermelho=sai.
// Nos cartões de conta o tinte é pelo SINAL (incomeSoft/expenseSoft), e a
// categoria aparece no glifo.
export const CATEGORIES = {
  moradia:      { label: "Aluguel",        color: "#6D28D9", icon: Home,            type: "expense" },
  contas:       { label: "Contas",         color: "#1D4ED8", icon: FileText,        type: "expense" },
  alimentacao:  { label: "Alimentação",    color: "#9C500A", icon: ShoppingCart,    type: "expense" },
  transporte:   { label: "Transporte",     color: "#4C1D95", icon: Car,             type: "expense" },
  lazer:        { label: "Lazer",          color: "#9333EA", icon: PartyPopper,     type: "expense" },
  saude:        { label: "Saúde",          color: "#B91C1C", icon: HeartPulse,      type: "expense" },
  educacao:     { label: "Educação",       color: "#0E7490", icon: BookOpen,        type: "expense" },
  assinaturas:  { label: "Assinaturas",    color: "#6B7280", icon: Repeat,          type: "expense" },
  outros:       { label: "Outros",         color: "#78716C", icon: MoreHorizontal,  type: "expense" },
  poupanca:     { label: "Poupança/Meta",  color: "#047857", icon: PiggyBank,       type: "expense" },
  salario:      { label: "Salário",        color: "#047857", icon: Wallet,          type: "income"  },
  freelance:    { label: "Freelance",      color: "#0E7490", icon: Briefcase,       type: "income"  },
  investimentos:{ label: "Investimentos",  color: "#1D4ED8", icon: TrendingUp,      type: "income"  },
  // Receita criada automaticamente ao fechar o mês: a sobra da Reserva Mínima
  // entra no mês seguinte como receita.
  reserva:      { label: "Reserva mínima", color: "#9C500A", icon: PiggyBank,       type: "income"  },
};

// Paleta de cores para novas categorias (gerenciamento + criação inline)
export const CATEGORY_PALETTE = [
  "#6D28D9", "#7C3AED", "#9333EA", "#4C1D95", "#1D4ED8",
  "#0E7490", "#047857", "#9C500A", "#B91C1C", "#6B7280",
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
  essencial:  { label: "Essencial",  rank: 0, color: PALETTE.expense },
  importante: { label: "Importante", rank: 1, color: PALETTE.warn },
  flexivel:   { label: "Flexível",   rank: 2, color: PALETTE.info },
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

## 2. `src\index.css`

```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

/* ============================================================================
   FONTE DOS TOKENS: src/constants/tokens.js
   Os valores abaixo são o espelho em CSS do objeto COLORS. Se mudar um tema,
   mude lá e reflita aqui — os dois nomes são os mesmos de propósito.

   v3 — design definitivo. O que mudou em relação à v1:
     · fundo frio (#F7F6FB) no lugar do bege (#F1EDDF);
     · Plus Jakarta Sans nos títulos e valores, Inter no corpo — a serifa
       saiu: número grande em serifa desalinha coluna de valores;
     · violeta como cor de AÇÃO, verde/vermelho como SINAL do dinheiro;
     · barra inferior flutuante, com ação central e recorte — o CSS dela
       está no fim deste arquivo.
   ========================================================================== */
:root {
  /* Ação e marca */
  --color-accent: #6D28D9;
  --color-accent-deep: #4C1D95;
  --color-accent-bright: #7C3AED;
  --color-accent-soft: #EDE9FE;

  /* Dinheiro */
  --color-income: #047857;
  --color-income-soft: #E4F5EE;
  --color-income-border: #CBEBDA;
  --color-expense: #B91C1C;
  --color-expense-soft: #FCEAEA;
  --color-expense-border: #F7D2D2;

  /* Atenção e informação */
  --color-warn: #9C500A;
  --color-warn-soft: #FBF0E0;
  --color-warn-border: #F1DFB2;
  --color-info: #1D4ED8;
  --color-info-soft: #E7EFFE;
  --color-info-border: #CBDCFB;

  /* Superfícies */
  --color-canvas: #F7F6FB;
  --color-surface: #FFFFFF;
  --color-surface-2: #F1EFF8;
  --color-page: #EDEBF3;
  --color-border: #E9E6F2;
  --color-border-soft: #EFEDF5;

  /* Texto */
  --color-ink: #15132A;
  --color-fg2: #4B5563;
  --color-muted: #6B7280;

  /* Nomes da v1, com os valores da v3 (ver o comentário em tokens.js):
     `green` era marca/ação e continua sendo — agora violeta. */
  --color-paper: var(--color-canvas);
  --color-card: var(--color-surface);
  --color-card-sunken: var(--color-surface-2);
  --color-card-raised: var(--color-page);
  --color-line: var(--color-border);
  --color-line-soft: var(--color-border-soft);
  --color-green: var(--color-accent);
  --color-green-light: var(--color-accent-bright);
  --color-green-soft: var(--color-accent-soft);
  --color-amber: var(--color-warn);
  --color-rust: var(--color-expense);

  /* Tipografia */
  --font-display: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  --font-body: 'Inter', system-ui, -apple-system, sans-serif;

  /* Geometria */
  --radius-card: 18px;
  --radius-control: 12px;
  --radius-sheet: 24px;

  /* Elevação — sussurro por padrão, nunca decoração */
  --shadow-card: 0 1px 2px rgba(21, 19, 42, 0.04);
  --shadow-raised: 0 6px 20px -6px rgba(21, 19, 42, 0.1), 0 2px 6px rgba(21, 19, 42, 0.04);
  --shadow-hero: 0 18px 40px -14px rgba(76, 29, 149, 0.42);
  --shadow-nav: 0 10px 30px -12px rgba(21, 19, 42, 0.3);

  /* Estrutura do shell.
     --tabbar-height é o que a navegação OCUPA de verdade: a pílula (68px) mais
     o que o botão central sobe acima dela (24px). Quem reserva espaço abaixo do
     conteúdo e quem posiciona o toast usam esta variável — mudar a barra aqui
     não deixa buraco nem sobreposição em nenhum dos dois. */
  --topbar-height: 64px;
  --tabbar-height: 92px;
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
  background-color: var(--color-page);
  font-family: var(--font-body);
  color: var(--color-ink);
  font-size: 13.5px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  /* O body NÃO centraliza nem tem altura fixa: quem manda no tamanho é o
     shell. Era isso que cortava o topo/base em telas com menos de 700px. */
}

#root {
  height: 100%;
  min-height: 100dvh;
  /* Paisagem no celular: o app ocupa a tela toda, com rolagem vertical normal. */
  overflow-x: hidden;
}

/* O app inteiro herda a fonte de títulos da v3. A classe continua com o nome
   antigo porque 65 arquivos a usam como "título" — o que mudou foi a fonte. */
.serif {
  font-family: var(--font-display);
  letter-spacing: -0.02em;
}

button { font-family: inherit; cursor: pointer; color: inherit; }
input, select, textarea { font-family: inherit; }

button, .tx-card {
  transition: transform 0.12s ease, background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}
button:active { transform: scale(0.97); }

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
.icon-btn:active { background: rgba(21, 19, 42, 0.06); }

input:focus-visible, select:focus-visible, textarea:focus-visible, button:focus-visible, a:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-surface), 0 0 0 4px var(--color-accent);
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
   mobile  : < 560px    coluna única, barra inferior flutuante, ação central
   tablet  : 560–979px  duas colunas, mesma barra
   desktop : >= 980px   barra lateral fixa, topbar, sem barra inferior
   ========================================================================== */

.app-shell {
  font-family: var(--font-body);
  background: var(--color-canvas);
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
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.eyebrow {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.1em;
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
   BARRA INFERIOR (mobile e tablet) — a pílula flutuante da v3
   Antes: faixa colada nas laterais, divisória em cima, cinco colunas iguais e
   um FAB solto no canto inferior direito. Agora: pílula solta (12px das
   laterais, 8px do fundo), sem divisória, com a ação principal no MEIO — que é
   onde o polegar chega — e um recorte na máscara em volta dela.
   ========================================================================== */
.app-tabbar {
  --fab-d: 62px;                     /* diâmetro da ação central */
  --fab-r: 34px;                     /* raio do recorte = fab-d/2 + 3px */
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: calc(8px + env(safe-area-inset-bottom, 0px));
  width: min(calc(100% - 24px), 496px);
  z-index: 40;
  display: grid;
  grid-template-columns: 1fr 1fr calc(var(--fab-d) + 6px) 1fr 1fr;
  padding: 8px 4px;
}

/* O fundo é um irmão, não o próprio <nav>: a máscara que abre o recorte
   cortaria a ação central se ela fosse filha dele. */
.app-tabbar-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(18px) saturate(1.3);
  -webkit-backdrop-filter: blur(18px) saturate(1.3);
  box-shadow: 0 -1px 0 rgba(21, 19, 42, 0.04), var(--shadow-nav);
  -webkit-mask: radial-gradient(circle var(--fab-r) at 50% 0, transparent calc(var(--fab-r) - 1px), #000 var(--fab-r));
  mask: radial-gradient(circle var(--fab-r) at 50% 0, transparent calc(var(--fab-r) - 1px), #000 var(--fab-r));
}

.app-tabbar button {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: 52px;
  min-width: 0;
  padding: 0;
  border: none;
  background: none;
  border-radius: 18px;
  color: var(--color-fg2);
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: -0.01em;
}
.app-tabbar button > span { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.app-tabbar button:hover { color: var(--color-accent-deep); background: var(--color-accent-soft); }
.app-tabbar button[aria-current="page"] { color: var(--color-accent); }
.app-tabbar button[aria-current="page"] svg { stroke-width: 2.4; }

/* Ação central: metade para fora da barra, dentro do recorte da máscara. */
.app-tabbar .tab-fab {
  position: absolute;
  left: 50%;
  top: calc(var(--fab-d) / -2);
  transform: translateX(-50%);
  width: var(--fab-d);
  height: var(--fab-d);
  min-height: 0;
  border-radius: 50%;
  gap: 0;
  background: linear-gradient(158deg, var(--color-accent-bright), var(--color-accent-deep));
  color: #fff;
  box-shadow: 0 10px 20px -6px rgba(76, 29, 149, 0.5), 0 3px 8px -2px rgba(21, 19, 42, 0.22);
}
.app-tabbar .tab-fab:hover {
  transform: translateX(-50%) scale(1.06);
  background: linear-gradient(158deg, var(--color-accent-bright), var(--color-accent-deep));
  color: #fff;
}
.app-tabbar .tab-fab:active { transform: translateX(-50%) scale(0.96); }
.app-tabbar .tab-fab:focus-visible {
  box-shadow: 0 10px 20px -6px rgba(76, 29, 149, 0.5), 0 0 0 3px #fff, 0 0 0 6px var(--color-accent);
}

/* Telas estreitas: a barra tem quatro colunas e um vão — sem encolher o
   botão e o rótulo juntos, "Transações" truncaria. */
@media (max-width: 359px) {
  .app-tabbar { --fab-d: 56px; --fab-r: 31px; }
  .app-tabbar button { font-size: 9.5px; }
}

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
    background: var(--color-surface);
    border-right: 1px solid var(--color-border);
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
    background: rgba(247, 246, 251, 0.92);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid var(--color-border-soft);
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

  /* No desktop a navegação é a barra lateral. O FAB solto do canto saiu: a
     ação primária vive na topbar, junto do contexto. */
  .app-tabbar { display: none; }

  .only-phone { display: none; }
  .only-desktop { display: block; }
}

/* Telas muito largas: três colunas de cartões de apoio. */
@media (min-width: 1440px) {
  .tab-content { max-width: 1480px; }
  .grid-auto { grid-template-columns: minmax(0, 1.7fr) minmax(340px, 1fr); gap: 24px; }
}
```

## 3. `src\components\shell\AppShell.jsx`

```jsx
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
```

## 4. `src\components\ui\BalanceHero.jsx`

```jsx
import React from "react";
import { Wallet, TrendingUp, Bell, Eye, EyeOff, Sparkle } from "lucide-react";
import { COLORS } from "../../constants/tokens";
import BalanceChart from "./BalanceChart";

// ============================================================================
// BalanceHero — o bloco de destaque do topo da Início, aprovado no protótipo.
//
// Antes a tela começava com um cartão branco de "saldo disponível" seguido de
// uma faixa de KPIs. Agora o topo é UM bloco: marca, contexto do mês, saldo,
// saldo previsto para o fim do mês e o gráfico dia a dia dentro dele.
//
// Por que um bloco só: o saldo é a informação que a pessoa abre o app para ver.
// Dividido em três cartões brancos iguais, nada era destaque. O degradê violeta
// é o único elemento sólido da tela — e é o que dá o "acima da dobra".
//
// As datas e a linha vêm do motor de fluxo de caixa (`dias`), não de uma cópia:
// o gráfico é o mesmo dado que o app já calculava, agora com eixo e leitura.
//
// Props (todas já formatadas fora, quando o caso):
//   disponivel      número — saldo disponível de hoje
//   previsto        número — saldo previsto para o fim do mês
//   escondido       bool — olho fechado (o mesmo estado que a tela já tinha)
//   onAlternarVisao fn
//   dias            [{ dia, saldo, reserva?, restrito? }]
//   hojeDia         dia de hoje, ou null quando o mês exibido não é o atual
//   mes             mês em exibição
//   saude           nota 0–100 do anel (opcional)
//   onAbrirSaude    fn
//   alertas         quantidade para o sino (opcional)
//   onAbrirAlertas  fn
//   onAbrirPrevisto fn
//   topo            nó opcional no lugar do filtro (ex.: MemberFilterBar)
//   contexto        nó opcional na linha do mês (ex.: MonthNav)
// ============================================================================

const FAIXAS = [
  { ate: 20, lvl: "Crítica", cor: "#FB7185" },
  { ate: 40, lvl: "Ruim", cor: "#FB923C" },
  { ate: 60, lvl: "Atenção", cor: "#FCD34D" },
  { ate: 80, lvl: "Boa", cor: "#4ADE80" },
  { ate: 100, lvl: "Excelente", cor: "#5EEAD4" },
];
const faixaDe = (n) => FAIXAS.find((f) => n <= f.ate) || FAIXAS[FAIXAS.length - 1];

const HERO_BG = [
  "radial-gradient(130% 70% at 88% -12%, rgba(56,189,248,.30), rgba(56,189,248,0) 60%)",
  "radial-gradient(110% 60% at 6% 112%, rgba(217,70,239,.26), rgba(217,70,239,0) 62%)",
  "radial-gradient(90% 55% at 50% 42%, rgba(124,58,237,.50), rgba(124,58,237,0) 72%)",
  "linear-gradient(180deg,#2A0A63 0%,#3B1483 26%,#4C1D95 52%,#5B21B6 78%,#6D28D9 100%)",
].join(",");

function AnelSaude({ score, onAbrir }) {
  const f = faixaDe(score);
  const R = 16.5, C = 2 * Math.PI * R;
  return (
    <button
      onClick={onAbrir}
      aria-label={"Saúde financeira " + score + " de 100, nível " + f.lvl + ". Toque para ver detalhes"}
      style={{
        position: "relative", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.22)", borderRadius: 14,
        color: "#fff", padding: 0,
      }}
    >
      <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true" style={{ position: "absolute", inset: 4, transform: "rotate(-90deg)" }}>
        {/* substrato escuro: sem ele as faixas crítica e ruim não passavam em
            3:1 na base do degradê; com ele a pior faixa vai a 4,96:1 */}
        <circle cx="18" cy="18" r={R} fill="rgba(15,23,42,.55)" />
        <circle cx="18" cy="18" r={R} fill="none" stroke="rgba(255,255,255,.30)" strokeWidth="3.4" />
        <circle cx="18" cy="18" r={R} fill="none" stroke={f.cor} strokeWidth="3.4" strokeLinecap="round"
          strokeDasharray={C.toFixed(1)} strokeDashoffset={(C * (1 - score / 100)).toFixed(1)} />
      </svg>
      <b className="num" style={{ position: "relative", fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 800, letterSpacing: "-0.04em" }}>
        {score}
      </b>
    </button>
  );
}

export function BalanceHero({
  disponivel = 0,
  previsto = 0,
  escondido = false,
  onAlternarVisao,
  dias = [],
  hojeDia = null,
  mes = 9,
  saude = null,
  onAbrirSaude,
  alertas = null,
  onAbrirAlertas,
  onAbrirPrevisto,
  topo,
  contexto,
  moeda,
  children,
}) {
  const fmt = moeda || ((v) =>
    (v < 0 ? "−" : "") + "R$ " + Math.abs(v).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  const mask = (v) => (escondido ? "R$ • • • • •" : fmt(v));

  return (
    <section
      data-od-id="hero-saldo"
      aria-label="Saldo disponível"
      style={{
        position: "relative",
        color: "#fff",
        borderRadius: "0 0 32px 32px",
        margin: "0 0 16px",
        padding: "12px 20px 20px",
        background: HERO_BG,
        boxShadow: "0 26px 50px -18px rgba(46,16,101,.55)",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, minHeight: 44 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginRight: "auto" }}>
            <span style={{
              width: 30, height: 30, borderRadius: 11, color: "#fff",
              background: "rgba(255,255,255,.18)", backdropFilter: "blur(6px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14,
            }}>G</span>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 14.5, fontWeight: 700, letterSpacing: "-0.01em" }}>
              Finanças
            </span>
          </div>
          {topo}
          {saude != null && <AnelSaude score={saude} onAbrir={onAbrirSaude} />}
          {alertas != null && (
            <button
              onClick={onAbrirAlertas}
              aria-label={alertas + " alertas"}
              className="icon-btn"
              style={{ background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.22)", color: "#fff", position: "relative" }}
            >
              <Bell size={20} />
              {alertas > 0 && (
                <span style={{
                  position: "absolute", top: 3, right: 3, minWidth: 17, height: 17, padding: "0 4px",
                  borderRadius: 999, background: "#FB7185", color: "#2A0A38", border: "2px solid #4C1D95",
                  fontSize: 10.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
                }}>{alertas}</span>
              )}
            </button>
          )}
        </div>

        {contexto && <div style={{ marginTop: 6 }}>{contexto}</div>}

        {/* saldo disponível: cartão translúcido. É o número que a pessoa abre o
            app para ver — por isso é o único em 38px na tela. */}
        <div
          data-od-id="card-saldo-disponivel"
          style={{
            marginTop: 16, display: "flex", alignItems: "center", gap: 12,
            background: "rgba(255,255,255,.10)", border: "1px solid rgba(255,255,255,.17)",
            borderRadius: 22, padding: "15px 17px",
            backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,.20), 0 14px 30px -14px rgba(10,4,30,.55)",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 600, color: "#DDD6FE", margin: 0 }}>
              <span style={{
                width: 26, height: 26, borderRadius: 9, background: "rgba(255,255,255,.14)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <Wallet size={13} />
              </span>
              Saldo disponível
            </p>
            <p className="num" style={{
              fontFamily: "var(--font-display)", fontSize: "clamp(31px,9.6vw,38px)", fontWeight: 800,
              letterSpacing: "-0.03em", lineHeight: 1.04, margin: "8px 0 0",
            }}>
              {mask(disponivel)}
            </p>
          </div>
          {onAlternarVisao && (
            <button
              onClick={onAlternarVisao}
              aria-label={escondido ? "Mostrar saldo" : "Ocultar saldo"}
              className="icon-btn"
              style={{ background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.2)", color: "#fff" }}
            >
              {escondido ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>

        <button
          onClick={onAbrirPrevisto}
          data-od-id="card-saldo-previsto"
          style={{
            width: "100%", marginTop: 10, display: "flex", alignItems: "center", gap: 12, textAlign: "left",
            color: "inherit", background: "rgba(255,255,255,.10)", border: "1px solid rgba(255,255,255,.17)",
            borderRadius: 18, padding: "12px 16px", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,.18), 0 12px 26px -14px rgba(10,4,30,.5)",
          }}
        >
          <span style={{
            flexShrink: 0, width: 34, height: 34, borderRadius: 11, background: "rgba(255,255,255,.15)",
            display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
          }}>
            <TrendingUp size={16} />
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#DDD6FE" }}>
              Saldo previsto no fim do mês
            </span>
            <b className="num" style={{
              display: "block", fontFamily: "var(--font-display)", fontSize: 21, fontWeight: 800,
              letterSpacing: "-0.02em", marginTop: 3, color: previsto >= 0 ? "#6EE7B7" : "#FCA5A5",
            }}>
              {previsto >= 0 ? "+ " : "− "}{fmt(Math.abs(previsto))}
            </b>
          </span>
          {previsto >= 0 && <Sparkle size={14} style={{ opacity: 0.7 }} aria-hidden="true" />}
        </button>

        <div style={{ marginTop: 14 }}>
          <BalanceChart dias={dias} hojeDia={hojeDia} mes={mes} moeda={fmt} tom="escuro" />
        </div>

        {children}
      </div>
    </section>
  );
}

export default BalanceHero;
```

## 5. `src\components\ui\BalanceChart.jsx`

```jsx
import React, { useState, useRef, useEffect } from "react";
import { COLORS } from "../../constants/tokens";

// ============================================================================
// BalanceChart — o gráfico de saldo dia a dia, aprovado no protótipo.
//
// O que ele entrega que o gráfico anterior (Recharts, eixo Y escondido) não
// entregava: o eixo de datas na base, os valores de referência na direita, o
// dia de hoje marcado com linha-guia, e a leitura do ponto sob o dedo/cursor.
//
// Por que SVG na mão em vez de Recharts: este gráfico é o único do app que
// precisa de leitura por toque em 30 pontos, com o número seguindo o dedo. Em
// Recharts isso vira um Tooltip customizado com posicionamento próprio — mais
// código e menos controle do que desenhar as 30 posições.
//
// `tom` resolve o fundo: o mesmo gráfico vive dentro do herói violeta
// ("escuro", com a linha ciano-verde do protótipo) e dentro de um cartão
// branco ("claro", com a linha violeta). Sem isso, um dos dois ficaria com
// texto escuro sobre fundo escuro.
//
// Props:
//   dias     [{ dia, saldo, reserva?, restrito? }]  — vem do motor de fluxo
//   hojeDia  número do dia de hoje, ou null quando o mês não é o atual
//   mes      mês em exibição (para as datas "dd/mm")
//   moeda    formatador (v: number) => string
//   tom      "claro" (padrão) | "escuro"
//
// Teclado: o gráfico é focável e as setas ← → percorrem os dias.
// ============================================================================

const W = 320;          // sistema de coordenadas do viewBox (escala com o CSS)
const PL = 10;          // respiro à esquerda
const PR = 56;          // coluna dos valores de referência (direita)
const PT = 14;          // topo
const PB = 28;          // faixa das datas + rótulo "HOJE"

const fmtPadrao = (v) =>
  (v < 0 ? "−" : "") + "R$ " + Math.abs(v).toLocaleString("pt-BR", { maximumFractionDigits: 0 });

const dataCurta = (dia, mes) => String(dia).padStart(2, "0") + "/" + String(mes).padStart(2, "0");

/* Caminho suave (Catmull-Rom convertido em bézier): é o que faz 30 pontos
   virarem uma linha legível em vez de um serrilhado. */
function smoothPath(pts) {
  if (!pts.length) return "";
  if (pts.length < 3) return "M" + pts.map((p) => p[0].toFixed(2) + " " + p[1].toFixed(2)).join(" L");
  let d = "M" + pts[0][0].toFixed(2) + " " + pts[0][1].toFixed(2);
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += " C" + c1x.toFixed(2) + " " + c1y.toFixed(2) + " " + c2x.toFixed(2) + " " + c2y.toFixed(2) + " " + p2[0].toFixed(2) + " " + p2[1].toFixed(2);
  }
  return d;
}

export function BalanceChart({ dias = [], hojeDia = null, mes = 9, moeda = fmtPadrao, tom = "claro" }) {
  const H = 132;
  const [idx, setIdx] = useState(null);
  const boxRef = useRef(null);
  const timer = useRef(null);

  // Paleta do gráfico por fundo. `escuro` é o herói violeta.
  const T = tom === "escuro"
    ? {
        rotulo: "#EDE9FE", destaque: "#FFFFFF", grade: "rgba(255,255,255,.22)",
        linhaA: "#22D3EE", linhaB: "#34D399", areaA: "#22D3EE", areaB: "#34D399",
        ponto: "#FFFFFF", anel: "#22D3EE", legenda: "rgba(237,233,254,.85)",
        trilhaPonto: "rgba(255,255,255,.5)",
      }
    : {
        rotulo: COLORS.fg2, destaque: COLORS.ink, grade: "rgba(21,19,42,.10)",
        linhaA: COLORS.accentDeep, linhaB: COLORS.accentBright, areaA: COLORS.accentBright, areaB: COLORS.accentBright,
        ponto: "#FFFFFF", anel: COLORS.accent, legenda: COLORS.muted,
        trilhaPonto: COLORS.accent,
      };

  const n = dias.length;
  const iw = W - PL - PR;
  const ih = H - PT - PB;

  const saldos = dias.map((d) => d.saldo);
  const reservas = dias.map((d) => (typeof d.reserva === "number" ? d.reserva : null)).filter((v) => v !== null);
  const restritos = dias.map((d) => (typeof d.restrito === "number" ? d.restrito : null)).filter((v) => v !== null);
  const todos = saldos.concat(reservas, restritos);
  const lo = todos.length ? Math.min(...todos) : 0;
  const hi = todos.length ? Math.max(...todos) : 1;
  const span = hi - lo || 1;

  const x = (i) => PL + (n < 2 ? 0 : (i / (n - 1)) * iw);
  const y = (v) => PT + ih - ((v - lo) / span) * ih;

  const pts = dias.map((d, i) => [x(i), y(d.saldo)]);
  const linha = smoothPath(pts);
  const area = linha
    ? linha + " L" + pts[n - 1][0].toFixed(2) + " " + (PT + ih) + " L" + pts[0][0].toFixed(2) + " " + (PT + ih) + " Z"
    : "";

  const iHoje = hojeDia != null ? dias.findIndex((d) => d.dia === hojeDia) : -1;
  const iMin = saldos.length ? saldos.indexOf(Math.min(...saldos)) : -1;

  // Quatro datas na base: primeira, dois terços e última do mês — funciona
  // para 28, 29, 30 ou 31 dias sem depender de números fixos.
  const iTicks = n ? [0, Math.round((n - 1) / 3), Math.round((2 * (n - 1)) / 3), n - 1] : [];

  const posDe = (clientX) => {
    if (!boxRef.current || n < 2) return 0;
    const r = boxRef.current.getBoundingClientRect();
    const rel = ((clientX - r.left) / r.width) * W;
    return Math.max(0, Math.min(n - 1, Math.round(((rel - PL) / iw) * (n - 1))));
  };
  const marcar = (clientX) => { clearTimeout(timer.current); setIdx(posDe(clientX)); };
  const soltar = (tipo) => {
    clearTimeout(timer.current);
    // No dedo a leitura fica um instante depois de levantar: sem isso o número
    // some antes de dar tempo de ler.
    if (tipo === "touch") timer.current = setTimeout(() => setIdx(null), 2600);
    else setIdx(null);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  const andar = (e) => {
    const passo = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!passo || !n) return;
    e.preventDefault();
    const base = idx == null ? (iHoje >= 0 ? iHoje : 0) : idx;
    setIdx(Math.max(0, Math.min(n - 1, base + passo)));
  };

  if (!n) {
    return (
      <p style={{ fontSize: 12.5, color: T.legenda, margin: "10px 0 2px" }}>
        Sem movimentação prevista para desenhar o saldo dia a dia.
      </p>
    );
  }

  const p = idx != null ? dias[idx] : null;
  const tipX = p ? (x(idx) / W) * 100 : 0;
  const tipY = p ? (y(p.saldo) / H) * 100 : 0;
  const tipAbaixo = tipY < 42;

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <div
        ref={boxRef}
        tabIndex={0}
        role="img"
        onKeyDown={andar}
        onBlur={() => setIdx(null)}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); marcar(e.clientX); }}
        onPointerMove={(e) => marcar(e.clientX)}
        onPointerUp={(e) => { if (e.pointerType === "touch") soltar("touch"); }}
        onPointerCancel={() => soltar("touch")}
        onPointerLeave={(e) => { if (e.pointerType !== "touch") soltar("mouse"); }}
        aria-label={
          "Saldo previsto dia a dia: menor valor " + moeda(lo) + " e maior valor " + moeda(hi) +
          ". Passe o dedo sobre o gráfico ou use as setas para ver um dia."
        }
        style={{ touchAction: "pan-y", userSelect: "none", cursor: "crosshair", borderRadius: 16 }}
      >
        <svg viewBox={"0 0 " + W + " " + H} width="100%" height={H} aria-hidden="true" style={{ display: "block" }}>
          <defs>
            <linearGradient id={"bcArea" + tom} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={T.areaA} stopOpacity="0.38" />
              <stop offset="55%" stopColor={T.areaB} stopOpacity="0.14" />
              <stop offset="100%" stopColor={T.areaB} stopOpacity="0" />
            </linearGradient>
            <linearGradient id={"bcLine" + tom} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={T.linhaA} />
              <stop offset="100%" stopColor={T.linhaB} />
            </linearGradient>
          </defs>

          {/* valores de referência: a grade diz de quanto é cada linha */}
          {[0, 0.5, 1].map((f, i) => (
            <g key={f}>
              <line x1={PL} x2={W - PR} y1={PT + ih * f} y2={PT + ih * f}
                stroke={T.grade} strokeWidth="1" strokeDasharray="3 6" />
              <text x={W - 2} y={PT + ih * f + 3.4} textAnchor="end"
                fontSize="9" fontWeight="600" fill={T.rotulo}>
                {moeda(i === 0 ? hi : i === 1 ? (hi + lo) / 2 : lo)}
              </text>
            </g>
          ))}

          {/* datas principais na base */}
          {iTicks.map((i, k) => (
            <text key={i} x={x(i)} y={H - 14}
              textAnchor={k === 0 ? "start" : k === iTicks.length - 1 ? "end" : "middle"}
              fontSize="9" fontWeight={iHoje === i ? 800 : 600}
              fill={iHoje === i ? T.destaque : T.rotulo}>
              {dataCurta(dias[i].dia, mes)}
            </text>
          ))}
          {iHoje >= 0 && (
            <text x={x(iHoje)} y={H - 4} textAnchor="middle" fontSize="8" fontWeight="800"
              letterSpacing=".1em" fill={T.destaque}>HOJE</text>
          )}

          {area && <path d={area} fill={"url(#bcArea" + tom + ")"} />}

          {/* reserva mínima disponível: linha de apoio, tracejada, para não
              competir com o saldo — a leitura principal é uma só */}
          {reservas.length === n && (
            <path d={smoothPath(dias.map((d, i) => [x(i), y(d.reserva)]))} fill="none"
              stroke={COLORS.warn} strokeWidth="1.6" strokeDasharray="4 4" opacity=".9" />
          )}
          {restritos.length === n && (
            <path d={smoothPath(dias.map((d, i) => [x(i), y(d.restrito)]))} fill="none"
              stroke={COLORS.warn} strokeWidth="1.4" strokeDasharray="2 4" opacity=".6" />
          )}

          <path d={linha} fill="none" stroke={"url(#bcLine" + tom + ")"} strokeWidth="2.6" strokeLinecap="round" />

          {/* dia de hoje: linha-guia até a base + ponto */}
          {iHoje >= 0 && (
            <>
              <line x1={x(iHoje)} x2={x(iHoje)} y1={y(dias[iHoje].saldo) + 6} y2={PT + ih}
                stroke={T.anel} strokeWidth="1" strokeDasharray="2 4" opacity=".6" />
              <circle cx={x(iHoje)} cy={y(dias[iHoje].saldo)} r="8" fill={T.anel} opacity=".22" />
              <circle cx={x(iHoje)} cy={y(dias[iHoje].saldo)} r="4.2" fill={T.ponto} stroke={T.anel} strokeWidth="2.4" />
            </>
          )}

          {/* menor saldo do mês — o momento crítico */}
          {iMin >= 0 && iMin !== iHoje && (
            <>
              <circle cx={x(iMin)} cy={y(dias[iMin].saldo)} r="7.5" fill={COLORS.warn} opacity=".18" />
              <circle cx={x(iMin)} cy={y(dias[iMin].saldo)} r="3.6" fill={COLORS.warn} />
            </>
          )}

          {/* ponto sob o cursor/dedo */}
          {p && (
            <>
              <line x1={x(idx)} x2={x(idx)} y1={PT - 6} y2={PT + ih}
                stroke={T.trilhaPonto} strokeWidth="1" strokeDasharray="3 3" opacity=".55" />
              <circle cx={x(idx)} cy={y(p.saldo)} r="7.5" fill={T.ponto} opacity=".35" />
              <circle cx={x(idx)} cy={y(p.saldo)} r="4.2" fill={T.ponto} stroke={T.anel} strokeWidth="2.4" />
            </>
          )}
        </svg>

        {/* leitura do ponto: acompanha o dedo e é presa dentro do cartão pelo
            clamp — nas pontas do mês encosta na borda em vez de vazar */}
        {p && (
          <div
            style={{
              position: "absolute", zIndex: 3, pointerEvents: "none", whiteSpace: "nowrap",
              display: "flex", flexDirection: "column", gap: 1, padding: "7px 11px",
              borderRadius: 12, background: "#15132A", border: "1px solid rgba(255,255,255,.18)",
              boxShadow: "0 12px 26px -10px rgba(6,2,26,.7)",
              left: "clamp(58px, " + tipX + "%, calc(100% - 58px))",
              top: tipY + "%",
              transform: tipAbaixo ? "translate(-50%, 12px)" : "translate(-50%, calc(-100% - 12px))",
            }}
          >
            <span style={{ fontSize: 10.5, fontWeight: 700, color: "#DDD6FE" }}>
              {dataCurta(dias[idx].dia, mes)}{idx === iHoje ? " · hoje" : ""}
            </span>
            <b className="num" style={{ fontFamily: "var(--font-display)", fontSize: 13.5, fontWeight: 800, color: "#fff" }}>
              {moeda(p.saldo)}
            </b>
            {typeof p.reserva === "number" && (
              <span style={{ fontSize: 10.5, fontWeight: 600, color: "#D9D5EC" }}>reserva {moeda(p.reserva)}</span>
            )}
            {typeof p.restrito === "number" && (
              <span style={{ fontSize: 10.5, fontWeight: 600, color: "#D9D5EC" }}>alimentação {moeda(p.restrito)}</span>
            )}
          </div>
        )}
      </div>

      {/* legenda nomeada com amostra de traço — só aparece o que existe */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 8, fontSize: 11.5, color: T.legenda }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 14, height: 2.5, borderRadius: 2, background: T.linhaB }} />saldo previsto
        </span>
        {reservas.length === n && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 14, height: 2, borderRadius: 2, background: COLORS.warn }} />reserva mínima disponível
          </span>
        )}
        {restritos.length === n && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 14, height: 2, borderRadius: 2, background: COLORS.warn, opacity: 0.6 }} />cartão alimentação
          </span>
        )}
      </div>
    </div>
  );
}

export default BalanceChart;
```

## 6. `src\components\ui\BillCard.jsx`

```jsx
import React from "react";
import { Calendar, Check, Sparkle, Target, ArrowDownToLine, CreditCard, AlertTriangle, Zap } from "lucide-react";
import { COLORS, RADIUS, SHADOW } from "../../constants/tokens";

// ============================================================================
// BillCard — o cartão de conta em aberto aprovado no protótipo.
//
// É um componente APRESENTACIONAL: recebe valores prontos e devolve o cartão.
// Nada de regra de negócio aqui — o motor de priorização, os lançamentos
// agrupados, o salário com descontos e o menu de editar/excluir continuam onde
// estão. É isso que permite trocar o visual do card sem tocar em nenhuma
// decisão do app.
//
// O que o cartão mostra, na ordem:
//   ícone da categoria + título + valor cheio
//   linha "pago/recebido : restante"
//   barra com o % dentro do preenchimento
//   dois quadros: vencimento (com o selo de prazo) e data recomendada
//   ação sólida na cor do dinheiro
//
// A cor é o SINAL: verde para receita, vermelho para despesa. A urgência tem
// cor própria no selo de prazo, e a ação é sempre o violeta da marca.
// ============================================================================

const fmtPadrao = (v) =>
  (v < 0 ? "−" : "") + "R$ " + Math.abs(v).toLocaleString("pt-BR", { maximumFractionDigits: 0 });

const dataCurta = (dia, mes) => String(dia).padStart(2, "0") + "/" + String(mes).padStart(2, "0");

/* Estado pelo VENCIMENTO, que é a data que o mundo cobra. A data recomendada
   pelo motor é outra coisa e vive no quadro ao lado. */
function estadoDe({ receita, quitada, vencimentoDia, hoje }) {
  if (quitada) return receita
    ? { l: "Recebido", tone: "in", Icon: Check }
    : { l: "Pago", tone: "done", Icon: Check };
  if (vencimentoDia == null || hoje == null) return { l: "Em aberto", tone: "later", Icon: Calendar };
  const d = vencimentoDia - hoje;
  if (d < 0) return { l: "Atrasada " + Math.abs(d) + "d", tone: "late", Icon: AlertTriangle };
  if (d === 0) return { l: "Hoje", tone: "today", Icon: Zap };
  return { l: "Em " + d + "d", tone: d <= 7 ? "soon" : "later", Icon: Calendar };
}

const chip = (tone) => {
  if (tone === "late") return { background: COLORS.expenseSoft, color: COLORS.expense };
  if (tone === "today" || tone === "soon") return { background: COLORS.warnSoft, color: COLORS.warn };
  if (tone === "in") return { background: COLORS.incomeSoft, color: COLORS.income };
  if (tone === "done") return { background: COLORS.surface2, color: COLORS.fg2 };
  return { background: COLORS.surface2, color: COLORS.fg2 };
};

export function BillCard({
  titulo,
  valor,
  pago = 0,
  tipo = "expense",
  categoria,          // rótulo da categoria, ex.: "Educação"
  prioridade,         // "Essencial" | "Importante" | "Flexível"
  pessoa,             // "Você" | "Esposa" | "Casal"
  recorrencia,        // "Parcela 3/12" | "Recorrente" | "Única"
  vencimentoDia,
  indicadaDia,        // data recomendada pelo motor de fluxo de caixa
  mes = 9,
  hoje = null,        // dia de hoje, quando o mês exibido é o atual
  status,             // { l, tone } quando o motor já sabe o estado
  moeda = fmtPadrao,
  Icone,              // componente de ícone da categoria
  onPagar,
  onAbrir,
  acoes,              // nó de ações secundárias (menu de editar/excluir)
}) {
  const receita = tipo === "income";
  const pagoReal = Math.max(0, Math.min(pago || 0, valor));
  const restante = Math.max(0, valor - pagoReal);
  const quitada = restante === 0;
  const pct = valor > 0 ? Math.min(100, Math.round((pagoReal / valor) * 100)) : 0;

  const accent = receita ? COLORS.income : COLORS.expense;
  const soft = receita ? COLORS.incomeSoft : COLORS.expenseSoft;
  const est = status || estadoDe({ receita, quitada, vencimentoDia, hoje });
  const estChip = chip(est.tone);
  const EstIcon = est.Icon || Calendar;

  // Janela recomendada: só existe enquanto houver valor em aberto. Quando já
  // passou, é o alerta vermelho do cartão.
  const janela = quitada || indicadaDia == null ? null
    : (hoje != null && indicadaDia < hoje ? { tone: "late", data: dataCurta(indicadaDia, mes), selo: "Passou" }
      : { tone: "ideal", data: dataCurta(indicadaDia, mes), selo: "Ideal" });

  // O "%" e o rótulo da barra vivem em posições calculadas: o número muda de
  // lado quando o preenchimento é estreito e o rótulo não é desenhado quando a
  // trilha acaba. Nada de texto cortado em nenhum percentual.
  const dentro = pct >= 20;
  const comRotulo = pct <= 52;

  const meta = [recorrencia, prioridade, pessoa].filter(Boolean).join(" · ");
  const cap = quitada ? "valor total" : receita ? "a receber" : "em aberto";

  return (
    <div
      data-od-id="bill-card"
      style={{
        position: "relative",
        background: COLORS.surface,
        border: "1px solid " + COLORS.border,
        borderRadius: RADIUS.card,
        padding: 16,
        boxShadow: quitada ? "-8px 8px 0 " + COLORS.border : "-8px 8px 0 " + accent + ", " + SHADOW.card,
      }}
    >
      <button
        onClick={onAbrir}
        style={{
          display: "block", width: "100%", textAlign: "left", background: "none", border: "none", padding: 0,
          color: "inherit", font: "inherit",
        }}
        aria-label={
          titulo + ", " + (quitada ? (receita ? "recebido " : "pago ") + moeda(valor)
            : moeda(restante) + " em aberto, " + est.l) + ". Abrir detalhes"
        }
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span style={{
            width: 40, height: 40, borderRadius: 14, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: soft, color: accent,
          }}>
            {Icone ? <Icone size={20} /> : null}
          </span>
          <span style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
            <span style={{
              display: "block", fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 800,
              letterSpacing: "-0.025em", color: COLORS.ink,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{titulo}</span>
            <span style={{ display: "block", fontSize: 11.5, lineHeight: 1.4, color: COLORS.muted, fontWeight: 500, marginTop: 3 }}>
              {meta}
            </span>
          </span>
          <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0, paddingLeft: 8 }}>
            <span className="num" style={{
              fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, letterSpacing: "-0.035em",
              color: quitada ? COLORS.muted : COLORS.ink, whiteSpace: "nowrap", lineHeight: 1.15,
            }}>{moeda(valor)}</span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: "4px 12px", marginTop: 15, flexWrap: "wrap", minWidth: 0 }}>
          <span style={{ display: "inline-flex", alignItems: "baseline", gap: 6, minWidth: 0 }}>
            <em style={{
              fontStyle: "normal", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.04em",
              textTransform: "uppercase", color: COLORS.muted, whiteSpace: "nowrap",
            }}>{receita ? "Recebido:" : "Pago:"}</em>
            <b className="num" style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 800, letterSpacing: "-0.02em", color: COLORS.ink, whiteSpace: "nowrap" }}>
              {moeda(pagoReal)}
            </b>
          </span>
          <span style={{ display: "inline-flex", alignItems: "baseline", gap: 6, minWidth: 0, marginLeft: "auto" }}>
            <em style={{
              fontStyle: "normal", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.04em",
              textTransform: "uppercase", color: COLORS.muted, whiteSpace: "nowrap",
            }}>Restante:</em>
            <b className="num" style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 800, letterSpacing: "-0.02em", color: COLORS.ink, whiteSpace: "nowrap" }}>
              {moeda(restante)}
            </b>
          </span>
        </div>

        <div style={{
          position: "relative", height: 24, borderRadius: 999, background: COLORS.surface2,
          overflow: "hidden", marginTop: 9,
        }}>
          <i style={{
            position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: 999,
            background: accent, width: pct + "%",
            transition: "width .5s cubic-bezier(.22,1,.36,1)",
          }} />
          <b className="num" style={{
            position: "absolute", top: 0, bottom: 0, display: "flex", alignItems: "center",
            fontFamily: "var(--font-display)", fontSize: 11.5, fontWeight: 800, letterSpacing: "-0.01em", whiteSpace: "nowrap",
            left: dentro ? (pct / 2) + "%" : "calc(" + pct + "% + 10px)",
            transform: dentro ? "translateX(-50%)" : "none",
            color: dentro ? "#fff" : COLORS.ink,
          }}>{pct}%</b>
          {comRotulo && (
            <u style={{
              position: "absolute", top: 0, bottom: 0, display: "flex", alignItems: "center",
              fontStyle: "normal", fontSize: 9.5, fontWeight: 800, letterSpacing: "0.06em",
              textTransform: "uppercase", color: COLORS.fg2, whiteSpace: "nowrap",
              left: "calc(" + pct + "% + " + (dentro ? 12 : 50) + "px)",
            }}>do valor total</u>
          )}
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: janela ? "1fr 1fr" : "1fr",
          gap: 8, marginTop: 14,
        }}>
          <span style={{ display: "block", minWidth: 0, borderRadius: 16, padding: "10px 11px", background: COLORS.surface2 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
              <i style={{
                width: 24, height: 24, borderRadius: 8, background: COLORS.surface, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.fg2,
              }}><Calendar size={15} /></i>
              <span style={{
                fontSize: 9, fontWeight: 800, letterSpacing: "0.02em", textTransform: "uppercase",
                color: COLORS.fg2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>Vencimento</span>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 7, flexWrap: "wrap" }}>
              <b className="num" style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, letterSpacing: "-0.025em", color: COLORS.ink, whiteSpace: "nowrap" }}>
                {vencimentoDia != null ? dataCurta(vencimentoDia, mes) : "—"}
              </b>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 3, padding: "3px 8px", borderRadius: 999,
                fontSize: 9.5, fontWeight: 800, whiteSpace: "nowrap", ...estChip,
              }}>
                <EstIcon size={10} /> {est.l}
              </span>
            </span>
          </span>

          {janela && (
            <span style={{ display: "block", minWidth: 0, borderRadius: 16, padding: "10px 11px", background: soft }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                <i style={{
                  width: 24, height: 24, borderRadius: 8, background: COLORS.surface, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center", color: accent,
                }}><Target size={15} /></i>
                <span style={{
                  fontSize: 9, fontWeight: 800, letterSpacing: "0.02em", textTransform: "uppercase",
                  color: COLORS.fg2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>Recomendada</span>
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 7, flexWrap: "wrap" }}>
                <b className="num" style={{
                  fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, letterSpacing: "-0.025em",
                  color: janela.tone === "late" ? COLORS.expense : COLORS.ink, whiteSpace: "nowrap",
                }}>{janela.data}</b>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 3, padding: "3px 8px", borderRadius: 999,
                  fontSize: 9.5, fontWeight: 800, whiteSpace: "nowrap",
                  background: COLORS.surface,
                  color: janela.tone === "late" ? COLORS.expense : accent,
                }}>
                  <Sparkle size={9} /> {janela.selo}
                </span>
              </span>
            </span>
          )}
        </div>
      </button>

      {quitada ? (
        <span style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", marginTop: 14,
          minHeight: 52, borderRadius: 20, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13.5,
          background: receita ? COLORS.incomeSoft : COLORS.surface2,
          color: receita ? COLORS.income : COLORS.fg2,
        }}>
          <Check size={16} /> {receita ? "Recebimento concluído" : "Pagamento concluído"}
        </span>
      ) : (
        <button
          onClick={onPagar}
          style={{
            width: "100%", marginTop: 14, minHeight: 52, borderRadius: 20, border: "none",
            background: accent, color: "#fff", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14.5,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
            boxShadow: "0 10px 22px -12px rgba(21,19,42,.5)",
          }}
        >
          {receita
            ? <><ArrowDownToLine size={17} /> Registrar recebimento</>
            : <><CreditCard size={17} /> Registrar pagamento</>}
        </button>
      )}

      {acoes}
    </div>
  );
}

export default BillCard;
```

## 7. `src\components\ui\MemberFilterIcon.jsx`

```jsx
import React, { useState } from "react";
import { SlidersHorizontal, Check } from "lucide-react";
import { COLORS, TOUCH } from "../../constants/tokens";
import { MEMBERS } from "../../constants/seedData";
import { ModalSheet } from "./ModalSheet";

// ============================================================================
// MemberFilterIcon — o filtro de pessoa como ÍCONE, no topo do herói.
//
// Antes: uma barra de três pílulas (Todos · Você · Esposa) ocupando a largura
// inteira ACIMA do bloco violeta. Era a primeira coisa da tela e não é a
// primeira decisão da pessoa — além de empurrar o saldo para baixo.
//
// Agora: o mesmo estado (`memberFilter`), montado como ícone na linha da marca,
// ao lado do anel de saúde e do sino, como no protótipo. Com filtro ativo, o
// ícone ganha um ponto — dá para ver que a tela está recortada sem abrir nada.
//
// Não muda nada de dado: `value` e `onChange` são exatamente os que o
// MemberFilterBar recebia do App.
// ============================================================================

export function MemberFilterIcon({ value = "todos", onChange, escuro = true }) {
  const [aberto, setAberto] = useState(false);
  const ativo = value !== "todos";
  const nomeAtivo = ativo ? (MEMBERS.find((m) => String(m.id) === String(value))?.name || "pessoa") : null;

  const opcoes = [
    { v: "todos", n: "Todos", d: "Você e " + (MEMBERS.map((m) => m.name).join(" e ") || "as outras pessoas") + " juntos" },
    ...MEMBERS.map((m) => ({ v: String(m.id), n: m.name, d: "Somente lançamentos de " + m.name })),
  ];

  const visual = escuro
    ? { background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.22)", color: "#fff" }
    : { background: COLORS.surface, border: "1px solid " + COLORS.border, color: COLORS.ink };

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        aria-label={ativo ? "Filtrando por " + nomeAtivo + ". Trocar filtro" : "Filtrar por pessoa"}
        data-od-id="filtro-pessoa"
        className="icon-btn"
        style={{ position: "relative", width: TOUCH.min, height: TOUCH.min, ...visual }}
      >
        <SlidersHorizontal size={19} />
        {ativo && (
          <span aria-hidden="true" style={{
            position: "absolute", top: 8, right: 8, width: 7, height: 7, borderRadius: "50%",
            background: "#DDD6FE", border: "1.5px solid #4C1D95",
          }} />
        )}
      </button>

      {aberto && (
        <ModalSheet title="Ver dados de" onClose={() => setAberto(false)}>
          <p style={{ fontSize: 12.5, color: COLORS.muted, margin: "0 0 14px" }}>
            O filtro vale para todas as telas.
          </p>
          {opcoes.map((o) => {
            const marcado = String(value) === o.v;
            return (
              <button
                key={o.v}
                onClick={() => { onChange(o.v); setAberto(false); }}
                aria-pressed={marcado}
                style={{
                  display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
                  minHeight: TOUCH.min, padding: "12px 14px", marginBottom: 8, borderRadius: 14,
                  border: "1px solid " + (marcado ? COLORS.accent : COLORS.border),
                  background: marcado ? COLORS.accentSoft : COLORS.surface,
                }}
              >
                <span style={{
                  width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                  border: "1.5px solid " + (marcado ? COLORS.accent : COLORS.border),
                  background: marcado ? COLORS.accent : "transparent",
                  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {marcado && <Check size={13} />}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <b style={{ display: "block", fontSize: 14, fontWeight: 600, color: COLORS.ink }}>{o.n}</b>
                  <span style={{ display: "block", fontSize: 11.5, color: COLORS.muted, marginTop: 2 }}>{o.d}</span>
                </span>
              </button>
            );
          })}
        </ModalSheet>
      )}
    </>
  );
}

export default MemberFilterIcon;
```

## 8. `src\components\ui\ResumoCards.jsx`

```jsx
import React from "react";
import { PiggyBank, ShoppingCart } from "lucide-react";
import { COLORS, RADIUS } from "../../constants/tokens";

// ============================================================================
// ResumoCards — reserva mínima e mercado, lado a lado, logo abaixo do herói.
//
// Onde isso vivia antes:
//   · a reserva era um SupportCard grande no FIM da coluna de apoio — a última
//     coisa da tela, depois da saúde financeira;
//   · o mercado era a seção "Ritmo de gasto do mercado", escondida dentro do
//     bloco recolhível "Análise do mês", com três números e dois parágrafos.
//
// Agora são os dois quadros pequenos do protótipo: o número grande é o que
// ainda dá para usar, a barra é o quanto do total já foi, e a legenda traz o
// total. Uma linha de leitura por card, sem frase explicativa.
//
// Clickable só quando existe destino: um card que parece botão e não leva a
// lugar nenhum é pior do que um número parado.
// ============================================================================

function MiniCard({ Icone, cor, fundo, nome, valor, total, pct, unidade, onAbrir }) {
  const Tag = onAbrir ? "button" : "div";
  return (
    <Tag
      onClick={onAbrir}
      data-od-id={"resumo-" + nome.toLowerCase().normalize("NFD").replace(/[^a-z]/g, "")}
      style={{
        display: "block", textAlign: "left", minWidth: 0, width: "100%",
        minHeight: onAbrir ? 44 : undefined,
        background: COLORS.surface, border: "1px solid " + COLORS.border,
        borderRadius: RADIUS.card, padding: 14, boxShadow: "0 1px 2px rgba(21,19,42,.04)",
        color: "inherit", font: "inherit", cursor: onAbrir ? "pointer" : "default",
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
        <i style={{
          width: 26, height: 26, borderRadius: 8, flexShrink: 0, fontStyle: "normal",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: fundo, color: cor,
        }}>
          <Icone size={14} />
        </i>
        <span style={{
          fontSize: 11.5, fontWeight: 600, color: COLORS.fg2, minWidth: 0,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{nome}</span>
      </span>

      <b className="num" style={{
        display: "block", fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 800,
        letterSpacing: "-0.02em", color: COLORS.ink, margin: "10px 0 9px",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>{valor}</b>

      <span style={{ display: "block", height: 6, borderRadius: 999, background: COLORS.surface2, overflow: "hidden" }}>
        <i style={{
          display: "block", height: "100%", borderRadius: 999, background: cor,
          width: Math.max(0, Math.min(100, pct)) + "%",
          transition: "width .5s cubic-bezier(.22,1,.36,1)",
        }} />
      </span>

      <u className="num" style={{
        display: "block", marginTop: 7, fontSize: 11, fontWeight: 700, fontStyle: "normal",
        color: cor, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>{unidade}</u>
    </Tag>
  );
}

export function ResumoCards({ reserva, mercado, moeda = (v) => "R$ " + v }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {reserva && (
        <MiniCard
          Icone={PiggyBank}
          cor={COLORS.income}
          fundo={COLORS.incomeSoft}
          nome="Reserva mínima"
          valor={moeda(reserva.disponivel)}
          pct={reserva.total > 0 ? (reserva.usado / reserva.total) * 100 : 0}
          unidade={"de " + moeda(reserva.total)}
          onAbrir={reserva.onAbrir}
        />
      )}
      {mercado && (
        <MiniCard
          Icone={ShoppingCart}
          cor={COLORS.warn}
          fundo={COLORS.warnSoft}
          nome="Mercado"
          valor={moeda(mercado.restante)}
          pct={mercado.total > 0 ? ((mercado.total - mercado.restante) / mercado.total) * 100 : 0}
          unidade={"de " + moeda(mercado.total)}
          onAbrir={mercado.onAbrir}
        />
      )}
    </div>
  );
}

export default ResumoCards;
```

## 9. `src\components\ui\MonthAnalysis.jsx`

```jsx
import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { COLORS, RADIUS } from "../../constants/tokens";

// ============================================================================
// MonthAnalysis — "Análise do mês": a tendência dos próximos 12 meses.
//
// Antes era um bloco recolhível (<details>) com um BarChart do Recharts, um
// parágrafo explicando as barras claras, mais três parágrafos condicionais
// ("cadastre receitas…", "atenção: o saldo fica negativo…", "em todos os meses
// o saldo fecha positivo"), mais os três KPIs do ritmo de gasto do mercado.
//
// Agora é o painel do protótipo: doze barras, mês atual mais escuro, projeção
// mais clara, negativo em vermelho, uma legenda de três itens e UMA linha de
// leitura. O ritmo de gasto do mercado saiu daqui — virou o card "Mercado" ao
// lado da reserva, logo abaixo do gráfico, que é onde ele é consultado.
//
// O toque na barra saiu junto: eram 12 alvos de ~22px, abaixo dos 44px que o
// dedo precisa. Quem manda no mês é o seletor de mês do topo.
//
// Props:
//   meses  [{ month, label, saldo, projected?, negative? }]  — 12 itens
//   moeda  formatador
// ============================================================================

export function MonthAnalysis({ meses = [], moeda = (v) => "R$ " + v }) {
  if (!meses.length) return null;

  const saldos = meses.map((m) => Number(m.saldo) || 0);
  const lo = Math.min(0, ...saldos);
  const hi = Math.max(0, ...saldos);
  const span = hi - lo || 1;
  const alturaPct = (v) => 14 + ((v - lo) / span) * 86;   // 14%..100% da caixa
  const zeroPct = ((0 - lo) / span) * 100;                // onde fica a linha do zero
  const temNegativo = lo < 0;

  const pior = meses.reduce((a, m) => (Number(m.saldo) < Number(a.saldo) ? m : a), meses[0]);
  const negativo = temNegativo && Number(pior.saldo) < 0;

  const rotulos = [0, Math.floor((meses.length - 1) / 2), meses.length - 1];

  return (
    <section
      data-od-id="card-analise-do-mes"
      aria-labelledby="titulo-analise"
      style={{
        background: COLORS.surface, border: "1px solid " + COLORS.border,
        borderRadius: RADIUS.card, padding: "16px 16px 14px",
        boxShadow: "0 1px 2px rgba(21,19,42,.04)",
      }}
    >
      <h2 id="titulo-analise" style={{
        margin: 0, fontFamily: "var(--font-display)", fontSize: 15.5, fontWeight: 800,
        letterSpacing: "-0.025em", color: COLORS.ink,
      }}>
        Saldo nos próximos 12 meses
      </h2>
      <p style={{ margin: "3px 0 0", fontSize: 12, color: COLORS.muted, fontWeight: 500 }}>
        Tendência com as recorrências já cadastradas
      </p>

      <div style={{ position: "relative", display: "flex", alignItems: "flex-end", gap: 5, height: 84, marginTop: 16 }}>
        {temNegativo && (
          <span aria-hidden="true" style={{
            position: "absolute", left: 0, right: 0, bottom: zeroPct + "%",
            borderTop: "1px dashed " + COLORS.borderSoft,
          }} />
        )}
        {meses.map((m, i) => {
          const v = Number(m.saldo) || 0;
          const cor = v < 0 ? COLORS.expense : m.projected ? "#C4B5FD" : COLORS.accent;
          return (
            <span
              key={m.month || i}
              title={(m.label || "") + " · " + moeda(v)}
              style={{
                flex: 1, minWidth: 0, height: alturaPct(v) + "%",
                borderRadius: "6px 6px 3px 3px", background: cor,
              }}
            />
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: COLORS.muted, fontWeight: 600 }}>
        {rotulos.map((i) => <span key={i}>{meses[i].label}</span>)}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginTop: 12, fontSize: 11.5, color: COLORS.muted }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <i style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.accent }} />mês atual
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <i style={{ width: 8, height: 8, borderRadius: "50%", background: "#C4B5FD" }} />projeção
        </span>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5, marginLeft: "auto",
          fontWeight: 700, color: negativo ? COLORS.expense : COLORS.income,
        }}>
          {negativo ? <TrendingDown size={13} /> : <TrendingUp size={13} />}
          {negativo
            ? "Fecha negativo em " + pior.label + " (" + moeda(pior.saldo) + ")"
            : "Nenhum mês fecha negativo"}
        </span>
      </div>
    </section>
  );
}

export default MonthAnalysis;
```

---

Aplicado isto: pnpm dev e siga a secao 5 de APLICAR-DESIGN-DEFINITIVO.md.
