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
  // "Mais" é a quinta aba da barra inferior (celular/tablet) — o menu que reúne
  // tudo o que já está na barra lateral. group: null de propósito: a barra
  // lateral filtra por NAV_GROUPS, então esta rota nunca aparece lá.
  mais:        { label: "Mais",                       short: "Mais",         icon: MoreHorizontal, group: null },
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