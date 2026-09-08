import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import { COLORS, CATEGORY_PALETTE } from '../../constants/tokens';
import { useCategories } from '../../context/CategoriesContext';
import { SectionTitle } from '../ui/SectionTitle';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { BackRow } from './MaisMenuView';

const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid " + COLORS.line, background: COLORS.card, fontSize: 14, outline: "none" };
const typeBtn = (active) => ({ flex: 1, padding: "9px 0", borderRadius: 10, fontSize: 13, fontWeight: 500, border: "1px solid " + (active ? COLORS.green : COLORS.line), background: active ? COLORS.green : "transparent", color: active ? "#fff" : COLORS.ink });

export function CategoriasView({ onBack, onSave, onDelete }) {
  const categories = useCategories();
  const [showForm, setShowForm] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("expense");
  const [color, setColor] = useState(CATEGORY_PALETTE[0]);
  const [confirming, setConfirming] = useState(null);

  const rows = Object.entries(categories).sort((a, b) => (
    a[1].type === b[1].type ? a[1].label.localeCompare(b[1].label) : (a[1].type === "income" ? 1 : -1)
  ));
  const incomes = rows.filter(([, c]) => c.type === "income");
  const expenses = rows.filter(([, c]) => c.type === "expense");

  function openNew() { setEditingKey(null); setName(""); setType("expense"); setColor(CATEGORY_PALETTE[0]); setShowForm(true); }
  function openEdit(key, c) { setEditingKey(key); setName(c.label); setType(c.type); setColor(c.color); setShowForm(true); }
  function submit() {
    const label = name.trim();
    if (!label) return;
    onSave({ key: editingKey || ("cat-" + Date.now().toString(36)), label, color, type });
    setShowForm(false); setEditingKey(null);
  }

  function renderGroup(title, list) {
    if (list.length === 0) return null;
    return (
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 0.4 }}>{title} ({list.length})</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {list.map(([key, c]) => (
            <Card key={key}>
              {confirming === key ? (
                <div>
                  <p style={{ fontSize: 13, margin: "0 0 10px" }}>Excluir "{c.label}"? Lançamentos já feitos passam a mostrar o nome da categoria como está salvo.</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setConfirming(null)} style={{ flex: 1, fontSize: 12, padding: "8px 0", borderRadius: 8, border: "1px solid " + COLORS.line, background: "transparent", color: COLORS.muted }}>Cancelar</button>
                    <button onClick={() => { onDelete(key); setConfirming(null); }} style={{ flex: 1, fontSize: 12, padding: "8px 0", borderRadius: 8, border: "none", background: COLORS.rust, color: "#fff", fontWeight: 500 }}>Excluir</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: c.color + "1E", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Tag size={17} color={c.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{c.label}</p>
                    <div style={{ marginTop: 2 }}><Badge color={c.type === "income" ? COLORS.green : COLORS.rust}>{c.type === "income" ? "Receita" : "Despesa"}</Badge></div>
                  </div>
                  <button onClick={() => openEdit(key, c)} aria-label="Editar" className="icon-btn" style={{ background: "none", border: "none", color: COLORS.muted, padding: 6 }}><Pencil size={16} /></button>
                  <button onClick={() => setConfirming(key)} aria-label="Excluir" className="icon-btn" style={{ background: "none", border: "none", color: COLORS.rust, padding: 6 }}><Trash2 size={16} /></button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <BackRow onBack={onBack} />
      <SectionTitle title="Categorias" subtitle="Crie e organize receitas e despesas do seu jeito" />

      {renderGroup("Receitas", incomes)}
      {renderGroup("Despesas", expenses)}
      {rows.length === 0 && <p style={{ fontSize: 13, color: COLORS.muted, textAlign: "center", padding: "12px 0" }}>Nenhuma categoria cadastrada ainda.</p>}

      {!showForm && (
        <button onClick={openNew} style={{ width: "100%", padding: "12px 0", borderRadius: 10, border: "1px dashed " + COLORS.line, background: "transparent", color: COLORS.green, fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Plus size={16} /> Nova categoria
        </button>
      )}

      {showForm && (
        <Card>
          <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 12px" }}>{editingKey ? "Editar categoria" : "Nova categoria"}</p>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome (ex: Pets, Presentes)" style={inputStyle} />
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button onClick={() => setType("expense")} style={typeBtn(type === "expense")}>Despesa</button>
            <button onClick={() => setType("income")} style={typeBtn(type === "income")}>Receita</button>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
            {CATEGORY_PALETTE.map((c) => (
              <button key={c} type="button" onClick={() => setColor(c)} aria-label="Cor" style={{ width: 26, height: 26, borderRadius: "50%", background: c, border: color === c ? "2px solid " + COLORS.ink : "2px solid transparent", cursor: "pointer" }} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1px solid " + COLORS.line, background: "transparent", color: COLORS.muted, fontSize: 14 }}>Cancelar</button>
            <button onClick={submit} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: COLORS.green, color: "#fff", fontSize: 14, fontWeight: 500 }}>Salvar</button>
          </div>
        </Card>
      )}
    </div>
  );
}
