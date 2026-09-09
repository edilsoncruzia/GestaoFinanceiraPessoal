import React, { useState } from 'react';
import { COLORS } from '../../constants/tokens';
import { useCategories } from '../../context/CategoriesContext';
import { fmt, fmtDate, accountBalance } from '../../utils/formatters';
import { BankIcon } from '../ui/BankIcon';
import { Card } from '../ui/Card';
import { ImageViewer } from '../ui/ImageViewer';
import { BackRow } from './MaisMenuView';

export function ExtratoView({ account, transactions, sources, onBack }) {
  const [preview, setPreview] = useState(null);
  const categories = useCategories();
  const rows = transactions
    .filter((t) => t.accountId === account.id || t.fromAccountId === account.id || t.toAccountId === account.id)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.id - a.id));
  const saldo = accountBalance(account, transactions);

  return (
    <div>
      <BackRow onBack={onBack} />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
        <BankIcon account={account} size={40} />
        <p className="serif" style={{ fontSize: 20, fontWeight: 600, margin: 0, color: COLORS.ink }}>{account.name}</p>
      </div>
      <p style={{ fontSize: 12, color: COLORS.muted, margin: "0 0 14px" }}>
        Saldo atual: <strong style={{ color: saldo >= 0 ? COLORS.green : COLORS.rust }}>{fmt(saldo)}</strong> · {account.type === "cartao" ? "Cartão" : "Conta"}
        {account.type === "cartao" && account.limit ? " · limite " + fmt(account.limit) : ""}
        {account.type === "conta" && account.countInAvailable === false ? " · Reserva (fora do disponível)" : ""}
      </p>
      {rows.length === 0 && <p style={{ fontSize: 13, color: COLORS.muted, textAlign: "center", padding: "24px 0" }}>Nenhum lançamento nesta conta.</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {rows.map((t) => {
          const fonte = t.fonteId ? (sources || []).find((s) => s.id === t.fonteId) : null;
          const isImage = t.attachment && t.attachment.startsWith("data:image");
          return (
            <Card key={t.id} style={{ padding: "10px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{t.description}</p>
                  <p style={{ fontSize: 12, color: COLORS.muted, margin: "0 0 2px" }}>{categories[t.category]?.label || t.category} · {fmtDate(t.date)}</p>
                  {t.deductedInPayroll && <p style={{ fontSize: 11, color: COLORS.green, margin: "0 0 2px" }}>Descontado em folha</p>}
                  {fonte && <p style={{ fontSize: 12, color: COLORS.green, margin: "0 0 2px" }}>Fonte: {fonte.name}</p>}
                  {t.attachment && !isImage && <p style={{ fontSize: 11, color: COLORS.muted, margin: 0 }}>📎 {t.attachment}</p>}
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: t.type === "income" ? COLORS.green : (t.type === "transferencia" ? "#3B6E8F" : COLORS.rust), whiteSpace: "nowrap" }}>{t.type === "income" ? "+" : t.type === "expense" ? "−" : ""}{fmt(t.amount)}</p>
              </div>
              {isImage && (
                <button onClick={() => setPreview(t.attachment)} style={{ background: "none", border: "none", padding: 0, marginTop: 8, display: "block", cursor: "zoom-in" }}>
                  <img src={t.attachment} alt="Comprovante" style={{ maxWidth: 90, borderRadius: 8, border: "1px solid " + COLORS.line }} />
                </button>
              )}
            </Card>
          );
        })}
      </div>
      <ImageViewer src={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
