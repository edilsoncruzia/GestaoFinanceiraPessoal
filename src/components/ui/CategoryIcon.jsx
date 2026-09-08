import React from 'react';
import { Tag } from 'lucide-react';
import { useCategories } from '../../context/CategoriesContext';

export function CategoryIcon({ cat, size = 18 }) {
  const categories = useCategories();
  const c = categories[cat];
  if (!c) return null;
  const Icon = c.icon || Tag;
  return (
    <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: c.color + "1E", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icon size={size} color={c.color} strokeWidth={2} />
    </div>
  );
}
