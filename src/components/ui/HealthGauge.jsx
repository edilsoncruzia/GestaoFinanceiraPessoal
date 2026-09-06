import React from 'react';
import { COLORS } from '../../constants/tokens';

export function HealthGauge({ score }) {
  const cx = 110, cy = 108, r = 78;
  const angleFor = (v) => Math.PI - (Math.max(0, Math.min(100, v)) / 100) * Math.PI;
  const pointAt = (v, radius) => {
    const a = angleFor(v);
    return [cx + radius * Math.cos(a), cy - radius * Math.sin(a)];
  };
  const [nx, ny] = pointAt(score, r - 6);
  const [x0, y0] = pointAt(0, r);
  const [x100, y100] = pointAt(100, r);
  const ticks = [0, 25, 50, 75, 100];
  return (
    <svg viewBox="0 0 220 130" width="100%" style={{ display: "block", maxWidth: 220, margin: "0 auto" }}>
      <defs>
        <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={COLORS.rust} />
          <stop offset="48%" stopColor="#C98A3B" />
          <stop offset="100%" stopColor={COLORS.green} />
        </linearGradient>
      </defs>
      <path d={"M " + x0 + " " + y0 + " A " + r + " " + r + " 0 0 1 " + x100 + " " + y100} fill="none" stroke="url(#gaugeGrad)" strokeWidth="15" strokeLinecap="round" />
      {ticks.map((t) => {
        const [lx, ly] = pointAt(t, r + 20);
        return <text key={t} x={lx} y={ly} fontSize="11" fontFamily="Inter, sans-serif" fill={COLORS.muted} textAnchor="middle" dominantBaseline="middle">{t}</text>;
      })}
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={COLORS.ink} strokeWidth="4" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="6.5" fill={COLORS.ink} />
    </svg>
  );
}
