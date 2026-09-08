import React, { useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { COLORS } from '../../constants/tokens';
import { fmtDate } from '../../utils/formatters';
import { SectionTitle } from '../ui/SectionTitle';
import { Card } from '../ui/Card';
import { BackRow } from './MaisMenuView';

const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid " + COLORS.line, background: COLORS.card, fontSize: 14, outline: "none", fontFamily: "inherit" };

export function IdeiasView({ ideas, onBack, onSave, onDelete, onToggle, onUpdate }) {
  const [text, setText] = useState("");
  const [confirming, setConfirming] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const sorted = [...ideas].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return b.id - a.id;
  });

  function submit() {
    const t = text.trim();
    if (!t) return;
    onSave(t);
    setText("");
  }

  function startEdit(idea) { setEditingId(idea.id); setEditText(idea.text); }
  function saveEdit() {
    const t = editText.trim();
    if (!t) return;
    onUpdate(editingId, t);
    setEditingId(null);
    setEditText("");
  }

  return (
    <div>
      <BackRow onBack={onBack} />
      <SectionTitle title="Ajustes e Melhorias" subtitle="Registre ideias para implementar depois" />

      <Card style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 8px" }}>Nova ideia</p>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Ex: gráfico de gastos por fonte, alerta de conta a vencer..." rows={3} style={{ ...inputStyle, resize: "none" }} />
        <button onClick={submit} disabled={!text.trim()} style={{ width: "100%", marginTop: 10, padding: "10px 0", borderRadius: 10, border: "none", background: text.trim() ? COLORS.green : COLORS.line, color: text.trim() ? "#fff" : COLORS.muted, fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Plus size={15} /> Adicionar ideia
        </button>
      </Card>

      {sorted.length === 0 && <p style={{ fontSize: 13, color: COLORS.muted, textAlign: "center", padding: "24px 0" }}>Nenhuma ideia ainda. Vá usando o app e registre o que quiser melhorar.</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sorted.map((idea) => (
          <Card key={idea.id}>
            {confirming === idea.id ? (
              <div>
                <p style={{ fontSize: 13, margin: "0 0 10px" }}>Remover esta ideia?</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setConfirming(null)} style={{ flex: 1, fontSize: 12, padding: "8px 0", borderRadius: 8, border: "1px solid " + COLORS.line, background: "transparent", color: COLORS.muted }}>Cancelar</button>
                  <button onClick={() => { onDelete(idea.id); setConfirming(null); }} style={{ flex: 1, fontSize: 12, padding: "8px 0", borderRadius: 8, border: "none", background: COLORS.rust, color: "#fff", fontWeight: 500 }}>Remover</button>
                </div>
              </div>
            ) : editingId === idea.id ? (
              <div>
                <textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={3} style={{ ...inputStyle, resize: "none" }} />
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button onClick={() => setEditingId(null)} style={{ flex: 1, fontSize: 12, padding: "8px 0", borderRadius: 8, border: "1px solid " + COLORS.line, background: "transparent", color: COLORS.muted }}>Cancelar</button>
                  <button onClick={saveEdit} style={{ flex: 1, fontSize: 12, padding: "8px 0", borderRadius: 8, border: "none", background: COLORS.green, color: "#fff", fontWeight: 500 }}>Salvar</button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <button onClick={() => onToggle(idea.id)} aria-label="Marcar como feito" style={{ background: "none", border: "none", padding: 2, marginTop: 1, cursor: "pointer", flexShrink: 0 }}>
                  <span style={{ display: "block", width: 20, height: 20, borderRadius: 6, border: "2px solid " + (idea.done ? COLORS.green : COLORS.line), background: idea.done ? COLORS.green : "transparent", color: "#fff", fontSize: 12, lineHeight: "18px", textAlign: "center" }}>{idea.done ? "✓" : ""}</span>
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, margin: 0, color: idea.done ? COLORS.muted : COLORS.ink, textDecoration: idea.done ? "line-through" : "none", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{idea.text}</p>
                  {idea.date && <p style={{ fontSize: 11, color: COLORS.muted, margin: "4px 0 0" }}>{fmtDate(idea.date)}</p>}
                </div>
                <button onClick={() => startEdit(idea)} aria-label="Editar" className="icon-btn" style={{ background: "none", border: "none", color: COLORS.muted, padding: 6, flexShrink: 0 }}><Pencil size={15} /></button>
                <button onClick={() => setConfirming(idea.id)} aria-label="Excluir" className="icon-btn" style={{ background: "none", border: "none", color: COLORS.muted, padding: 6, flexShrink: 0 }}><Trash2 size={16} /></button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
