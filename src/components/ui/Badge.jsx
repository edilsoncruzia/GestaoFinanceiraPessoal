import React from 'react';

export function Badge({ children, color }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 20, background: color + "1E", color, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}
