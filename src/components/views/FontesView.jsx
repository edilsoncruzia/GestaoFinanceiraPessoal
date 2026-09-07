import React, { useState } from 'react';
import { Users, Plus, Pencil, Trash2 } from 'lucide-react';
import { COLORS } from '../../constants/tokens';
import { SectionTitle } from '../ui/SectionTitle';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { BackRow } from './MaisMenuView';

const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid " + COLORS.line, background: COLORS.card, fontSize: 14, outline: "none" };

export function FontesView({ sources, onBack, onSave, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("");

  function openNew() { setEditing(null); setName(""); setType(""); setShowForm(true); }
  function openEdit(s) { setEditing(s); setName(s.name); setType(s.type || ""); setShowForm(true); }
  function submit() {
    if (!name.trim()) return;
    onSave({ id: editing ? editing.id : undefined, name: name.trim(), type });
    setShowForm(false); setEditing(null); setName(""); setType("");
  }

  return (
    <div>
      <BackRow onBack={onBack} />
      <SectionTitle title="Fontes" subtitle="Quem você paga / de quem você recebe" />
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {sources.map((s) => (
          <Card key={s.id}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: COLORS.green + "1E", display: "flex", alignItems: "center", justifyContent: "center" }}><Users size={17} color={COLORS.green} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{s.name}</p>
                {s.type && <div style={{ marginTop: 2 }}><Badge color={s.type === "income" ? COLORS.green : COLORS.rust}>{s.type === "income" ? "Receita" : "Despesa"}</Badge></div>}
              </div>
              <button onClick={() => openEdit(s)} aria-label="Editar" className="icon-btn" style={{ background: "none", border: "none", color: COLORS.muted, padding: 6 }}><Pencil size={16} /></button>
              <button onClick={() => onDelete(s.id)} aria-label="Excluir" className="icon-btn" style={{ background: "none", border: "none", color: COLORS.rust, padding: 6 }}><Trash2 size={16} /></button>
            </div>
          </Card>
        ))}
        {sources.length === 0 && <p style={{ fontSize: 13, color: COLORS.muted, textAlign: "center", padding: "12px 0" }}>Nenhuma fonte cadastrada ainda.</p>}
      </div>

      {!showForm && (
        <button onClick={openNew} style={{ width: "100%", padding: "12px 0", borderRadius: 10, border: "1px dashed " + COLORS.line, background: "transparent", color: COLORS.green, fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Plus size={16} /> Nova fonte</button>
      )}
      {showForm && (
        <Card>
          <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 12px" }}>{editing ? "Editar fonte" : "Nova fonte"}</p>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome (ex: Mercado A, Padaria, Cliente X)" style={{ ...inputStyle, marginBottom: 10 }} />
          <select value={type} onChange={(e) => setType(e.target.value)} style={{ ...inputStyle, marginBottom: 12 }}>
            <option value="">Sem tipo</option>
            <option value="income">Receita (de quem recebo)</option>
            <option value="expense">Despesa (para quem pago)</option>
          </select>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1px solid " + COLORS.line, background: "transparent", color: COLORS.muted, fontSize: 14 }}>Cancelar</button>
            <button onClick={submit} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: COLORS.green, color: "#fff", fontSize: 14, fontWeight: 500 }}>Salvar</button>
          </div>
        </Card>
      )}
    </div>
  );
}
