import React from 'react';
import { COLORS } from '../../constants/tokens';

export function Card({ children, style }) {
  return (
    <div style={{ background: COLORS.card, border: "1px solid " + COLORS.line, borderRadius: 16, padding: "16px 18px", ...style }}>
      {children}
    </div>
  );
}
