import { BUDGETS, SEED_ACCOUNTS, SEED_GOALS, SEED_PLANNED, SEED_TRANSACTIONS } from '../constants/seedData';
import { DEFAULT_CATEGORY_ROWS } from '../constants/tokens';

const storageKey = 'gf_finance_data';
const requiredSections = ['accounts', 'transactions', 'planned', 'goals', 'categories', 'ideas'];
const optionalSections = ['budgets', 'sources'];

export function exampleFinanceData() {
  return {
    accounts: SEED_ACCOUNTS,
    transactions: SEED_TRANSACTIONS,
    planned: SEED_PLANNED,
    goals: SEED_GOALS,
    categories: DEFAULT_CATEGORY_ROWS,
    ideas: [],
    budgets: BUDGETS,
    sources: [],
    reserva: { limite: 0 },
  };
}

function readStored(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}

export function readLocalFinanceData() {
  const data = exampleFinanceData();
  const snapshot = readStored(storageKey);
  for (const section of [...requiredSections, ...optionalSections]) {
    const saved = snapshot?.[section] ?? readStored('gf_' + section);
    if (Array.isArray(saved)) data[section] = saved;
  }
  const reserva = snapshot?.reserva ?? readStored('gf_reserva');
  if (reserva && Number.isFinite(reserva.limite)) data.reserva = reserva;
  return data;
}

export function saveLocalFinanceData(data) {
  localStorage.setItem(storageKey, JSON.stringify(data));
}

const positiveId = (id) => Number.isSafeInteger(id) && id > 0;
const isNumber = (value) => typeof value === 'number' && Number.isFinite(value);
const entryTypes = ['income', 'expense', 'transferencia'];
const isDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T00:00:00Z');
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
};

const rowChecks = {
  accounts: (row) => positiveId(row.id) && typeof row.name === 'string' && ['conta', 'cartao'].includes(row.type),
  transactions: (row) => positiveId(row.id) && typeof row.description === 'string' &&
    entryTypes.includes(row.type) && isDate(row.date) && isNumber(row.amount),
  planned: (row) => positiveId(row.id) && typeof row.description === 'string' &&
    entryTypes.includes(row.type) && isDate(row.dueDate) && isNumber(row.amount) &&
    ['unica', 'recorrente', 'parcelada'].includes(row.recurrence),
  goals: (row) => positiveId(row.id) && typeof row.name === 'string' &&
    isNumber(row.target) && isNumber(row.saved ?? 0),
  categories: (row) => typeof row.key === 'string' && row.key.length > 0 &&
    !Object.hasOwn(Object.prototype, row.key) && typeof row.label === 'string' &&
    typeof row.color === 'string' && ['income', 'expense'].includes(row.type),
  ideas: (row) => positiveId(row.id) && typeof row.text === 'string',
  budgets: (row) => typeof row.category === 'string' && isNumber(row.limit),
  sources: (row) => positiveId(row.id) && typeof row.name === 'string',
};

export function parseFinanceBackup(text) {
  const data = JSON.parse(text);
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Arquivo inválido');
  const backup = {};
  for (const section of [...requiredSections, ...optionalSections]) {
    if (optionalSections.includes(section) && !(section in data)) continue;
    if (!Array.isArray(data[section]) || data[section].some((row) => !row || typeof row !== 'object' || Array.isArray(row))) {
      throw new Error('Seção inválida: ' + section);
    }
    const rows = data[section];
    if (!rows.every(rowChecks[section])) throw new Error('Registro inválido: ' + section);
    backup[section] = rows;
  }
  if ('reserva' in data) {
    if (!Number.isFinite(data.reserva?.limite) || data.reserva.limite < 0) throw new Error('Reserva inválida');
    backup.reserva = { limite: data.reserva.limite };
  }
  return backup;
}
