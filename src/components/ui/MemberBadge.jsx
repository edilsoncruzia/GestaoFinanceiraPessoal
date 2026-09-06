import React from 'react';
import { memberLabel, memberColor } from '../../utils/formatters';

export function MemberBadge({ memberId }) {
  const color = memberColor(memberId);
  return (
    <span style={{ fontSize: 11, fontWeight: 500, color, display: "inline-flex", alignItems: "center", gap: 4 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
      {memberLabel(memberId)}
    </span>
  );
}
