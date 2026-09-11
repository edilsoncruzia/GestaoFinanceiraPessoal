// Agrupamento de despesas por forma de pagamento (tópico #23 — item 4).
//  - 'normal': entra na fila de priorização normalmente.
//  - 'debito_automatico' / 'pix_automatico': sai da fila (é pago sozinho) e vira
//    "pagamento agendado" no dia do vencimento.
//  - 'cartao': as despesas individuais somem da fila e viram UMA "Fatura <cartão>"
//    de rotativo (G4), vencendo no dia de vencimento do cartão.
//  - 'reserva': consome a Reserva Mínima (mesma ideia de "limite" do cartão), mas
//    CONTINUA na fila — é uma conta a pagar de verdade; o que ela faz é abater o
//    limite da reserva e derrubar a trava de liquidez dia a dia.

const pad2 = (n) => String(n).padStart(2, "0");

export function agruparDespesas(despesas, contasBancarias, selectedMonth) {
  const contas = [];
  const agendados = {};
  const autoDetalhes = [];
  const cartaoMap = {};

  (despesas || []).forEach((d) => {
    const forma = d.formaPagamento || d.forma_pagamento || "normal";
    if (forma === "debito_automatico" || forma === "pix_automatico") {
      const day = new Date((d.dueDate || d.due_date) + "T00:00:00").getDate();
      agendados[day] = (agendados[day] || 0) + (Number(d.amount) || 0);
      autoDetalhes.push({ id: d.id, description: d.description, amount: d.amount, dueDate: d.dueDate || d.due_date, forma });
    } else if (forma === "reserva") {
      // Uso da reserva mínima: segue na fila normalmente (o pagamento é real).
      contas.push(d);
    } else if (forma === "cartao") {
      const acc = (contasBancarias || []).find((a) => a.id === (d.accountId ?? d.account_id));
      if (acc && acc.type === "cartao") {
        if (!cartaoMap[acc.id]) cartaoMap[acc.id] = { acc, items: [], total: 0 };
        cartaoMap[acc.id].items.push(d);
        cartaoMap[acc.id].total += (Number(d.amount) || 0);
      } else {
        contas.push(d);
      }
    } else {
      contas.push(d);
    }
  });

  const cartaoFaturas = [];
  Object.values(cartaoMap).forEach(({ acc, items, total }) => {
    if (total <= 0) return;
    const dueDay = acc.dueDay || acc.due_day || 23;
    const fatura = {
      id: "fatura-" + acc.id,
      description: "Fatura " + (acc.name || "Cartão"),
      amount: total,
      dueDate: selectedMonth + "-" + pad2(dueDay),
      category: "outros",
      accountId: acc.id,
      memberId: items[0] && items[0].memberId != null ? items[0].memberId : items[0] && items[0].member_id,
      priority: "importante",
      formaPagamento: "cartao",
      taxa_juros_mensal: 12.0, // rotativo (G4)
      tipo_consequencia: "NEGATIVACAO_SPC_SERASA",
      dias_para_sancao: 30,
      dias_carencia: 0,
      aceita_pagamento_parcial: true,
      valor_minimo: 0,
      agrupadas: items.map((i) => i.description).join(", "),
      itens: items.map((i) => ({ occId: i.occId || i.id, plannedId: i.plannedId || i.id, description: i.description, amount: Number(i.amount) || 0, category: i.category, memberId: i.memberId, dueDate: i.dueDate || i.due_date })),
    };
    contas.push(fatura);
    cartaoFaturas.push(fatura);
  });

  return { contas, agendados, autoDetalhes, cartaoFaturas };
}
