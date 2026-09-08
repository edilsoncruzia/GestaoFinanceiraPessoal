import React, { createContext, useContext } from 'react';
import { CATEGORIES } from '../constants/tokens';

// Valor é o objeto de categorias em memória: { [key]: { label, color, type, icon? } }
export const CategoriesContext = createContext(CATEGORIES);

export function useCategories() {
  return useContext(CategoriesContext);
}
