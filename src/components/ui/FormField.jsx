import React from 'react';
import { COLORS } from '../../constants/tokens';

export function FormField({ label, children, last }) {
  return (
    <div style={{ marginBottom: last ? 16 : 12 }}>
      <label style={{ fontSize: 12, color: COLORS.muted }}>{label}</label>
      <div style={{ marginTop: 6 }}>{children}</div>
    </div>
  );
}
