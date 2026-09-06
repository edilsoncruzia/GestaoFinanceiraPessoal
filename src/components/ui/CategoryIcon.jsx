import React from 'react';
import { CATEGORIES } from '../../constants/tokens';

export function CategoryIcon({ cat, size = 18 }) {
  const c = CATEGORIES[cat];
  if (!c) return null;
  const Icon = c.icon;
  return (
    <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: c.color + "1E", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icon size={size} color={c.color} strokeWidth={2} />
    </div>
  );
}
