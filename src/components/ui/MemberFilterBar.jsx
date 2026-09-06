import React from 'react';
import { COLORS } from '../../constants/tokens';
import { MEMBERS } from '../../constants/seedData';

export function MemberFilterBar({ value, onChange }) {
  const options = [["todos", "Todos"], ...MEMBERS.map((m) => [m.id, m.name])];
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
      {options.map(([v, l]) => (
        <button key={v} onClick={() => onChange(v)} style={{ flex: 1, padding: "8px 0", borderRadius: 20, fontSize: 13, fontWeight: 500, border: "1px solid " + (value === v ? COLORS.green : COLORS.line), background: value === v ? COLORS.green : "transparent", color: value === v ? "#fff" : COLORS.muted }}>{l}</button>
      ))}
    </div>
  );
}
