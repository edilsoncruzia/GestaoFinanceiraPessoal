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
  fg2: "#4A5559",          // corpo secundário (antes tudo caía em "muted")
  muted: "#6E6A5C",

  // Linhas
  line: "#D9D1B8",
  lineSoft: "#E1DAC4",     // separador interno — era "line" em todo lugar

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
// inferior (mobile) e a barra lateral (desktop). "short" existe porque a barra
// inferior tem 5 colunas estreitas; "group" só é usado no desktop.

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
