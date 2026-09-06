import {
  Home, FileText, ShoppingCart, Car, PartyPopper, HeartPulse,
  BookOpen, Repeat, MoreHorizontal, PiggyBank, Wallet, Briefcase, TrendingUp
} from "lucide-react";

export const COLORS = {
  ink: "#1B2A2F",
  paper: "#F1EDDF",
  card: "#FBF9F1",
  line: "#E1DAC4",
  green: "#1F5D4C",
  greenLight: "#3B8F6E",
  amber: "#8A5A1F",
  rust: "#A6432F",
  muted: "#6E6A5C",
};

export const CATEGORIES = {
  moradia:      { label: "Aluguel",        color: "#1F5D4C", icon: Home,            type: "expense" },
  contas:       { label: "Contas",         color: "#2E6B72", icon: FileText,        type: "expense" },
  alimentacao:  { label: "Alimentação",    color: "#C98A3B", icon: ShoppingCart,    type: "expense" },
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
};

export const NECESSIDADES = ["moradia", "contas", "alimentacao", "transporte", "saude", "educacao"];
export const DESEJOS = ["lazer", "assinaturas", "outros"];

export const PRIORITY = {
  essencial:  { label: "Essencial",  rank: 0, color: "#A6432F" },
  importante: { label: "Importante", rank: 1, color: "#C98A3B" },
  flexivel:   { label: "Flexível",   rank: 2, color: "#8A8577" },
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
