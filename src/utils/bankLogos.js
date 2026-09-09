// Mapeia o nome do banco (ou da conta) para o arquivo de logo em /public/banks.
// Fontes: https://github.com/matheuscuba/icones-bancos-brasileiros
//         https://github.com/Tgentil/Bancos-em-SVG
// A ordem importa: chaves mais específicas vêm primeiro.
const BANK_LOGO_FILES = [
  ["banco c6", "banco-c6-s-a"],
  ["c6 bank", "banco-c6-s-a"],
  ["c6 ", "banco-c6-s-a"],
  ["c6", "banco-c6-s-a"],
  ["nubank", "nubank"],
  ["nu pagamentos", "nubank"],
  ["banco nu", "nubank"],
  ["itau", "itau"],
  ["itú", "itau"],
  ["bradesco", "bradesco"],
  ["banco do brasil", "banco-brasil"],
  ["banco brasil", "banco-brasil"],
  ["bb", "banco-brasil"],
  ["caixa", "caixa"],
  ["santander", "santander"],
  ["sicoob", "sicoob"],
  ["sicredi", "sicredi"],
  ["inter", "inter"],
  ["safra", "safra"],
  ["banrisul", "banrisul"],
  ["banestes", "banestes"],
  ["banco da amazonia", "banco-amazonia"],
  ["amazonia", "banco-amazonia"],
  ["banco do nordeste", "banco-nordeste"],
  ["nordeste", "banco-nordeste"],
  ["original", "banco-original-s-a"],
  ["hsbc", "hsbc"],
  ["citi", "citi-bank"],
  ["bmg", "banco-bmg"],
  ["bm", "banco-bmg"],
  ["banco pan", "banco-pan"],
  ["pan", "banco-pan"],
  ["btg", "banco-btg-pacutal"],
  ["daycoval", "banco-daycoval"],
  ["sofisa", "banco-sofisa"],
  ["votorantim", "banco-votorantim"],
  ["topazio", "banco-topazio"],
  ["bs2", "banco-bs2-s-a"],
  ["ailos", "ailos"],
  ["banco do estado do espirito santo", "banco-do-estado-do-espirito-santo"],
  ["banco do estado do para", "banco-do-estado-do-para"],
  ["banco do estado do sergipe", "banco-do-estado-do-sergipe"],
  // PicPay (o usuário tem como "Pickpay")
  ["pickpay", "picpay"],
  ["picpay", "picpay"],
  // Mercado Pago
  ["mercado pago", "mercado-pago"],
  ["mercadopago", "mercado-pago"],
  // Neon
  ["neon", "neon"],
];

export function bankLogoFile(account) {
  if (!account) return null;
  const text = ((account.bank || "") + " " + (account.name || "")).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const [kw, file] of BANK_LOGO_FILES) {
    if (text.indexOf(kw) !== -1) return file;
  }
  return null;
}
