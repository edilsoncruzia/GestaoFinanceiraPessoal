import React from 'react';
import { COLORS } from '../../constants/tokens';

export function SectionTitle({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p className="serif" style={{ fontSize: 22, fontWeight: 500, margin: "0 0 4px" }}>{title}</p>
      {subtitle && <p style={{ fontSize: 13, color: COLORS.muted, margin: 0 }}>{subtitle}</p>}
    </div>
  );
}
