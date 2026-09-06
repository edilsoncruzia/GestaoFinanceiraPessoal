export const MEMBERS = [
  { id: 1, name: "Você", color: "#1F5D4C", email: "voce@gmail.com" },
  { id: 2, name: "Esposa", color: "#8A5B7A", email: "esposa@gmail.com" },
];

export const CONNECTED_MEMBER_ID = 1;

export const INITIAL_BALANCE = 6250;

export const SEED_ACCOUNTS = [
  { id: 1, name: "Conta conjunta", type: "conta", bank: "Banco Ipê", color: "#1F5D4C", memberId: null },
  { id: 2, name: "Cartão Visa", type: "cartao", bank: "Banco Ipê", color: "#3B6E8F", limit: 5000, memberId: 1, closingDay: 25, dueDay: 5 },
  { id: 3, name: "Cartão Nubank", type: "cartao", bank: "Nu", color: "#8A5B7A", limit: 3500, memberId: 2, closingDay: 20, dueDay: 28 },
];

export const SEED_TRANSACTIONS = [
  { id: 1,  date: "2026-04-01", type: "income",  category: "salario",     description: "Salário",              amount: 5200, accountId: 1, memberId: 1 },
  { id: 2,  date: "2026-04-02", type: "expense", category: "moradia",     description: "Aluguel",              amount: 1450, accountId: 1, memberId: null },
  { id: 3,  date: "2026-04-05", type: "expense", category: "contas",      description: "Luz e água",           amount: 210,  accountId: 1, memberId: null },
  { id: 4,  date: "2026-04-06", type: "expense", category: "alimentacao",description: "Supermercado",          amount: 480,  accountId: 1, memberId: null },
  { id: 5,  date: "2026-04-10", type: "expense", category: "transporte", description: "Combustível",           amount: 220,  accountId: 2, memberId: 1 },
  { id: 6,  date: "2026-04-14", type: "expense", category: "assinaturas",description: "Streaming",             amount: 65,   accountId: 1, memberId: null },
  { id: 7,  date: "2026-04-18", type: "expense", category: "lazer",      description: "Cinema",                amount: 90,   accountId: 2, memberId: 1 },
  { id: 8,  date: "2026-04-22", type: "expense", category: "saude",      description: "Farmácia",              amount: 130,  accountId: 1, memberId: null },
  { id: 9,  date: "2026-05-01", type: "income",  category: "salario",     description: "Salário",              amount: 5200, accountId: 1, memberId: 1 },
  { id: 10, date: "2026-05-03", type: "expense", category: "moradia",     description: "Aluguel",              amount: 1450, accountId: 1, memberId: null },
  { id: 11, date: "2026-05-05", type: "expense", category: "contas",      description: "Internet e celular",   amount: 190,  accountId: 1, memberId: null },
  { id: 12, date: "2026-05-08", type: "expense", category: "alimentacao",description: "Supermercado",          amount: 510,  accountId: 1, memberId: null },
  { id: 13, date: "2026-05-12", type: "income",  category: "freelance",   description: "Projeto freelance",    amount: 900,  accountId: 1, memberId: 1 },
  { id: 14, date: "2026-05-15", type: "expense", category: "transporte", description: "Uber",                  amount: 140,  accountId: 3, memberId: 2 },
  { id: 15, date: "2026-05-19", type: "expense", category: "lazer",      description: "Show",                  amount: 180,  accountId: 3, memberId: 2 },
  { id: 16, date: "2026-05-24", type: "expense", category: "saude",      description: "Academia",              amount: 120,  accountId: 2, memberId: 1 },
  { id: 17, date: "2026-06-01", type: "income",  category: "salario",     description: "Salário",              amount: 5200, accountId: 1, memberId: 1 },
  { id: 18, date: "2026-06-02", type: "expense", category: "moradia",     description: "Aluguel",              amount: 1450, accountId: 1, memberId: null },
  { id: 19, date: "2026-06-05", type: "expense", category: "contas",      description: "Luz e água",           amount: 205,  accountId: 1, memberId: null },
  { id: 20, date: "2026-06-09", type: "expense", category: "alimentacao",description: "Supermercado",          amount: 470,  accountId: 1, memberId: null },
  { id: 21, date: "2026-06-13", type: "expense", category: "educacao",   description: "Curso online",          amount: 250,  accountId: 3, memberId: 2 },
  { id: 22, date: "2026-06-17", type: "expense", category: "assinaturas",description: "Streaming",             amount: 65,   accountId: 1, memberId: null },
  { id: 23, date: "2026-06-21", type: "expense", category: "lazer",      description: "iFood",                 amount: 160,  accountId: 2, memberId: 1 },
  { id: 24, date: "2026-06-27", type: "expense", category: "transporte", description: "Combustível",           amount: 230,  accountId: 2, memberId: 1 },
  { id: 25, date: "2026-07-01", type: "income",  category: "salario",     description: "Salário",              amount: 5200, accountId: 1, memberId: 1 },
  { id: 26, date: "2026-07-02", type: "expense", category: "moradia",     description: "Aluguel",              amount: 1450, accountId: 1, memberId: null },
  { id: 27, date: "2026-07-04", type: "expense", category: "contas",      description: "Internet e celular",   amount: 190,  accountId: 1, memberId: null },
  { id: 28, date: "2026-07-09", type: "expense", category: "alimentacao",description: "Supermercado",          amount: 495,  accountId: 1, memberId: null },
  { id: 29, date: "2026-07-11", type: "income",  category: "investimentos",description: "Rendimento CDB",      amount: 210,  accountId: 1, memberId: 1 },
  { id: 30, date: "2026-07-15", type: "expense", category: "saude",      description: "Plano de saúde",        amount: 340,  accountId: 1, memberId: null },
  { id: 31, date: "2026-07-20", type: "expense", category: "lazer",      description: "Cinema",                amount: 95,   accountId: 3, memberId: 2 },
  { id: 32, date: "2026-07-26", type: "expense", category: "transporte", description: "Manutenção do carro",   amount: 380,  accountId: 2, memberId: 1 },
  { id: 33, date: "2026-08-01", type: "income",  category: "salario",     description: "Salário",              amount: 5200, accountId: 1, memberId: 1 },
  { id: 34, date: "2026-08-03", type: "expense", category: "moradia",     description: "Aluguel",              amount: 1450, accountId: 1, memberId: null },
  { id: 35, date: "2026-08-05", type: "expense", category: "contas",      description: "Luz e água",           amount: 215,  accountId: 1, memberId: null },
  { id: 36, date: "2026-08-08", type: "expense", category: "alimentacao",description: "Supermercado",          amount: 505,  accountId: 1, memberId: null },
  { id: 37, date: "2026-08-12", type: "income",  category: "freelance",   description: "Projeto freelance",    amount: 650,  accountId: 1, memberId: 1 },
  { id: 38, date: "2026-08-16", type: "expense", category: "assinaturas",description: "Streaming",             amount: 65,   accountId: 1, memberId: null },
  { id: 39, date: "2026-08-20", type: "expense", category: "lazer",      description: "Show",                  amount: 210,  accountId: 3, memberId: 2 },
  { id: 40, date: "2026-08-25", type: "expense", category: "saude",      description: "Academia",              amount: 120,  accountId: 2, memberId: 1 },
  { id: 41, date: "2026-08-28", type: "expense", category: "outros",     description: "Presente aniversário",  amount: 150,  accountId: 2, memberId: 1 },
  { id: 42, date: "2026-09-01", type: "income",  category: "salario",     description: "Salário",              amount: 5200, accountId: 1, memberId: 1, plannedId: 101 },
  { id: 43, date: "2026-09-01", type: "expense", category: "moradia",     description: "Aluguel",              amount: 1450, accountId: 1, memberId: null, plannedId: 102 },
  { id: 44, date: "2026-09-01", type: "expense", category: "contas",      description: "Internet e celular",   amount: 190,  accountId: 1, memberId: null, plannedId: 103 },
  { id: 45, date: "2026-09-01", type: "expense", category: "alimentacao",description: "Supermercado",          amount: 260,  accountId: 1, memberId: null, plannedId: 104 },
  { id: 46, date: "2026-09-01", type: "income",  category: "salario",     description: "Salário",              amount: 4100, accountId: 1, memberId: 2, plannedId: 109 },
];

export const BUDGETS = [
  { category: "moradia",     limit: 1450, memberId: null },
  { category: "contas",      limit: 250,  memberId: null },
  { category: "alimentacao", limit: 900,  memberId: null },
  { category: "transporte",  limit: 350,  memberId: null },
  { category: "saude",       limit: 350,  memberId: null },
  { category: "assinaturas", limit: 80,   memberId: null },
  { category: "lazer",       limit: 200,  memberId: 1 },
  { category: "lazer",       limit: 200,  memberId: 2 },
];

export const SEED_PLANNED = [
  { id: 101, type: "income",  category: "salario",     description: "Salário",             amount: 5200, recurrence: "recorrente", dueDate: "2026-09-01", accountId: 1, memberId: 1, priority: "essencial" },
  { id: 109, type: "income",  category: "salario",     description: "Salário",             amount: 4100, recurrence: "recorrente", dueDate: "2026-09-01", accountId: 1, memberId: 2, priority: "essencial" },
  { id: 102, type: "expense", category: "moradia",     description: "Aluguel",              amount: 1450, recurrence: "recorrente", dueDate: "2026-09-05", accountId: 1, memberId: null, priority: "essencial" },
  { id: 103, type: "expense", category: "contas",      description: "Internet e celular",   amount: 190,  recurrence: "recorrente", dueDate: "2026-09-08", accountId: 1, memberId: null, priority: "essencial" },
  { id: 104, type: "expense", category: "alimentacao", description: "Mercado do mês",       amount: 900,  recurrence: "recorrente", dueDate: "2026-09-28", accountId: 1, memberId: null, priority: "importante" },
  { id: 105, type: "expense", category: "educacao",    description: "Curso de inglês",      amount: 250,  recurrence: "parcelada", installmentCurrent: 3, installmentTotal: 12, dueDate: "2026-09-10", accountId: 3, memberId: 2, priority: "importante" },
  { id: 106, type: "expense", category: "outros",      description: "Notebook novo",        amount: 450,  recurrence: "parcelada", installmentCurrent: 4, installmentTotal: 10, dueDate: "2026-09-15", accountId: 2, memberId: 1, priority: "flexivel" },
  { id: 107, type: "income",  category: "freelance",   description: "Projeto site cliente", amount: 800,  recurrence: "unica", dueDate: "2026-09-20", accountId: 1, memberId: 1, priority: "flexivel" },
  { id: 108, type: "expense", category: "saude",       description: "Consulta dentista",    amount: 220,  recurrence: "unica", dueDate: "2026-09-22", accountId: 1, memberId: 2, priority: "essencial" },
];

export const SEED_GOALS = [
  { id: 1, name: "Reserva de emergência",  target: 15000, saved: 8200, memberId: null, accountId: 1 },
  { id: 2, name: "Viagem para o Nordeste", target: 6000,  saved: 2300, memberId: null, accountId: 1 },
  { id: 3, name: "Tênis novo",             target: 800,   saved: 800,  memberId: 2,    accountId: 1 },
];

export const TODAY_MONTH = "2026-09";
export const TODAY_DATE = "2026-09-12";
