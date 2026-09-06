import React from 'react';
import { COLORS } from '../../constants/tokens';

export function ProgressBar({ pct, color }) {
  return (
    <div style={{ height: 8, borderRadius: 6, background: COLORS.line, overflow: "hidden" }}>
      <div style={{ height: "100%", width: pct + "%", borderRadius: 6, background: color, transition: "width 0.4s ease" }} />
    </div>
  );
}
