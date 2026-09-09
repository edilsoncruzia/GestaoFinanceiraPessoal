import React from 'react';
import { COLORS } from '../../constants/tokens';
import { accountBrandColor } from '../../utils/formatters';
import { bankLogoFile } from '../../utils/bankLogos';

// Mostra a logo real do banco quando disponível; senão usa a marca + ícone.
export function BankIcon({ account, size = 36 }) {
  const logo = bankLogoFile(account);
  const color = accountBrandColor(account);
  if (logo) {
    return (
      <div style={{ width: size, height: size, borderRadius: 10, background: "#FFFFFF", border: "1px solid " + COLORS.line, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
        <img src={"/banks/" + logo + ".svg"} alt="" style={{ width: size - 8, height: size - 8, objectFit: "contain" }} />
      </div>
    );
  }
  // Fallback para bancos sem logo no pacote (ex.: C6, Banco Ipê): marca + ícone.
  return (
    <div style={{ width: size, height: size, borderRadius: 10, background: color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ fontSize: size * 0.45, fontWeight: 700, color: "#fff" }}>{(account?.name || "?").slice(0, 1).toUpperCase()}</span>
    </div>
  );
}
